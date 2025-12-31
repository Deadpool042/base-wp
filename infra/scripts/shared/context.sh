#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# shared/context.sh
# Contexte global BaseWP : profile / env / projet courant
# Objectif : aucune variable "unbound" avec set -u
# ------------------------------------------------------------------------------

# Guard anti double-source (AVANT tout le reste)
if [[ "${__BASEWP_CONTEXT_LOADED:-0}" == "1" ]]; then
  return 0
fi
__BASEWP_CONTEXT_LOADED="1"

# ------------------------------------------------------------------------------
# Résolution des chemins (safe avant imports)
# context.sh est dans infra/scripts/shared/
# ------------------------------------------------------------------------------

__CTX_THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__CTX_SCRIPTS_DIR="$(cd "$__CTX_THIS_DIR/.." && pwd)"     # infra/scripts
__CTX_INFRA_DIR="$(cd "$__CTX_SCRIPTS_DIR/.." && pwd)"    # infra
__CTX_ROOT_DEFAULT="$(cd "$__CTX_INFRA_DIR/.." && pwd)"   # repo root

ROOT_DIR="${ROOT_DIR:-$__CTX_ROOT_DEFAULT}"
export ROOT_DIR

STATE_DIR="${STATE_DIR:-$ROOT_DIR/.basewp}"
CURRENT_PROJECT_FILE="${CURRENT_PROJECT_FILE:-$STATE_DIR/current-project}"
PROFILE_FILE="${PROFILE_FILE:-$STATE_DIR/profile}"
ENV_FILE_NAME_FILE="${ENV_FILE_NAME_FILE:-$STATE_DIR/env-name}"

ctx_ensure_state_dir() { mkdir -p "$STATE_DIR"; }

# ------------------------------------------------------------------------------
# Imports
# ------------------------------------------------------------------------------

# shellcheck source=/dev/null
source "$__CTX_THIS_DIR/env.sh"
# shellcheck source=/dev/null
source "$__CTX_THIS_DIR/strings.sh"

# ------------------------------------------------------------------------------
# Internal sanitize (one-line safe)
# ------------------------------------------------------------------------------

ctx_sanitize() {
  local s="${1:-}"
  s="$(str_trim "$s")"
  s="$(str_strip_newlines "$s")"
  printf "%s" "$s"
}

# ------------------------------------------------------------------------------
# Current project
# ------------------------------------------------------------------------------

ctx_get_current_project_ref() {
  local v=""

  if [[ -n "${PROJECT_REF:-}" ]]; then
    v="$PROJECT_REF"
  elif [[ -f "$CURRENT_PROJECT_FILE" ]]; then
    v="$(cat "$CURRENT_PROJECT_FILE" 2>/dev/null || true)"
  fi

  v="$(ctx_sanitize "$v")"
  printf "%s" "$v"
}

ctx_set_current_project_ref() {
  ctx_ensure_state_dir
  local v
  v="$(ctx_sanitize "${1:-}")"
  printf "%s\n" "$v" > "$CURRENT_PROJECT_FILE"
}

ctx_clear_current_project_ref() {
  ctx_ensure_state_dir
  : > "$CURRENT_PROJECT_FILE"
}

# ------------------------------------------------------------------------------
# Helpers : .env du projet courant
# ------------------------------------------------------------------------------

ctx_get_project_dir() {
  local ref
  ref="$(ctx_get_current_project_ref)"
  [[ -n "$ref" ]] || { echo ""; return 0; }
  echo "$ROOT_DIR/projects/$ref"
}

ctx_get_project_env_file() {
  local env_name proj_dir
  proj_dir="$(ctx_get_project_dir)"
  [[ -n "$proj_dir" ]] || { echo ""; return 0; }

  env_name="$(ctx_get_env_name)"
  env_name="$(ctx_sanitize "$env_name")"
  [[ -n "$env_name" ]] || env_name="dev"

  echo "$proj_dir/env/.env.${env_name}"
}

# ------------------------------------------------------------------------------
# Profile
# Priorité:
# 1) env runtime (PROFILE)
# 2) .env du projet courant (PROFILE=...)
# 3) state file (~/.basewp/profile)
# ------------------------------------------------------------------------------

ctx_get_profile() {
  local v=""

  if [[ -n "${PROFILE:-}" ]]; then
    v="$PROFILE"
  else
    local env_file
    env_file="$(ctx_get_project_env_file)"
    v="$(env_file_get "PROFILE" "$env_file")"
    if [[ -z "$(ctx_sanitize "$v")" && -f "$PROFILE_FILE" ]]; then
      v="$(cat "$PROFILE_FILE" 2>/dev/null || true)"
    fi
  fi

  v="$(ctx_sanitize "$v")"
  printf "%s" "$v"
}

ctx_set_profile() {
  ctx_ensure_state_dir
  local v
  v="$(ctx_sanitize "${1:-}")"
  printf "%s\n" "$v" > "$PROFILE_FILE"
}

# ------------------------------------------------------------------------------
# ENV name (dev / prod / staging / etc.)
#
# Priorité :
# 1) Variable runtime ENV_NAME
# 2) Fichier d'état global ~/.basewp/env-name
# 3) .env du projet courant (STACK_ENV ou ENV_NAME)
# 4) Fallback : "dev"
# ------------------------------------------------------------------------------

ctx_get_env_name() {
  local v=""

  # 1) Override explicite via l'environnement
  if [[ -n "${ENV_NAME:-}" ]]; then
    v="$ENV_NAME"
    v="$(ctx_sanitize "$v")"
    printf "%s" "${v:-dev}"
    return 0
  fi

  # 2) State global
  if [[ -f "$ENV_FILE_NAME_FILE" ]]; then
    v="$(cat "$ENV_FILE_NAME_FILE" 2>/dev/null || true)"
    v="$(ctx_sanitize "$v")"
    [[ -n "$v" ]] && { printf "%s" "$v"; return 0; }
  fi

  # 3) Lecture depuis le projet courant
  local proj_dir env_file
  proj_dir="$(ctx_get_project_dir)"
  if [[ -n "$proj_dir" ]]; then
    env_file="$proj_dir/env/.env.dev"
    if [[ -f "$env_file" ]]; then
      v="$(env_file_get "ENV_NAME" "$env_file")"
      v="$(ctx_sanitize "$v")"
      if [[ -z "$v" ]]; then
        v="$(env_file_get "STACK_ENV" "$env_file")"
        v="$(ctx_sanitize "$v")"
      fi
      [[ -n "$v" ]] && { printf "%s" "$v"; return 0; }
    fi
  fi

  # 4) Fallback explicite
  printf "dev"
}

ctx_set_env_name() {
  ctx_ensure_state_dir
  local v
  v="$(ctx_sanitize "${1:-}")"
  printf "%s\n" "$v" > "$ENV_FILE_NAME_FILE"
}