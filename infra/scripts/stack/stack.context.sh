#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# stack/stack.context.sh
# Contexte Docker Compose (profiles/env/compose files).
# Ne gère pas les projets. Peut lire le projet courant via shared/context.sh.
# ------------------------------------------------------------------------------

STACK_THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$STACK_THIS_DIR/.." && pwd)"

# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/context.sh"

# ------------------------------------------------------------------------------
# Root / projects (robuste set -u)
# ------------------------------------------------------------------------------

# shared/context.sh doit définir ROOT_DIR (avec fallback). On l'utilise comme vérité.
BASEWP_ROOT_DIR="${BASEWP_ROOT_DIR:-${ROOT_DIR:-}}"
if [[ -z "$BASEWP_ROOT_DIR" ]]; then
  die "BASEWP_ROOT_DIR/ROOT_DIR introuvable (context.sh)."
fi
export BASEWP_ROOT_DIR

BASEWP_PROJECTS_DIR="${BASEWP_PROJECTS_DIR:-$BASEWP_ROOT_DIR/projects}"
export BASEWP_PROJECTS_DIR

# ------------------------------------------------------------------------------
# Variables d'entrée (optionnelles)
# ------------------------------------------------------------------------------
#   BASEWP_PROFILE : ex "ovh-vps"
#   BASEWP_ENV_NAME: "", "dev", "prod"
#   BASEWP_ENV_FILE: chemin absolu/relatif override
BASEWP_PROFILE="${BASEWP_PROFILE:-}"
BASEWP_ENV_NAME="${BASEWP_ENV_NAME:-}"
BASEWP_ENV_FILE="${BASEWP_ENV_FILE:-}"

# ------------------------------------------------------------------------------
# Variables calculées
# ------------------------------------------------------------------------------
STACK_COMPOSE_DIR=""
STACK_COMPOSE_FILES=()
STACK_ENV_FILE=""
STACK_ENV_EXAMPLE_FILE=""
STACK_ENV_EXAMPLE_FILE_NAMED=""

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

stack_list_profiles() {
  local profiles_dir="$BASEWP_ROOT_DIR/infra/profiles"
  [[ -d "$profiles_dir" ]] || return 0

  local item
  for item in "$profiles_dir"/*; do
    [[ -d "$item" ]] || continue
    basename "$item"
  done
}

stack_sanitize_compose_name() {
  local name="${1:-}"
  name="$(printf "%s" "$name" | tr '[:upper:]' '[:lower:]')"
  name="$(printf "%s" "$name" | tr '/ ' '__')"
  name="$(printf "%s" "$name" | sed -E 's/[^a-z0-9_-]+/_/g; s/_+/_/g; s/^_|_$//g')"
  printf "%s" "$name"
}

# Lit KEY=value depuis un .env sans le sourcer (dernière occurrence).
stack_env_get() {
  local key="${1:-}"
  local file="${2:-}"
  [[ -n "$key" && -n "$file" && -f "$file" ]] || { echo ""; return 0; }

  awk -F= -v k="$key" '
    $0 ~ /^[[:space:]]*#/ {next}
    $0 ~ /^[[:space:]]*$/ {next}
    $1 == k {
      v=$0
      sub(/^[^=]+=/, "", v)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", v)
      gsub(/^"|"$/, "", v)
      gsub(/^'\''|'\''$/, "", v)
      val=v
    }
    END { print val }
  ' "$file"
}

stack_require_file() { [[ -f "$1" ]] || die "Fichier manquant: $1"; }

# ------------------------------------------------------------------------------
# Env resolution
# ------------------------------------------------------------------------------

stack_resolve_env_file() {
  local env_name="${BASEWP_ENV_NAME:-}"
  local current_ref
  current_ref="$(ctx_get_current_project_ref 2>/dev/null || true)"

  # 1) override explicite
  if [[ -n "${BASEWP_ENV_FILE:-}" ]]; then
    if [[ "$BASEWP_ENV_FILE" = /* ]]; then
      echo "$BASEWP_ENV_FILE"
    else
      echo "$BASEWP_ROOT_DIR/$BASEWP_ENV_FILE"
    fi
    return 0
  fi

  # 2) projet courant => projects/<ref>/env/.env(.dev/.prod)
  if [[ -n "${current_ref:-}" ]]; then
    local proj_dir="$BASEWP_PROJECTS_DIR/$current_ref"
    if [[ -d "$proj_dir" ]]; then
      case "${env_name:-}" in
        ""|default) echo "$proj_dir/env/.env" ;;
        *)          echo "$proj_dir/env/.env.${env_name}" ;;
      esac
      return 0
    fi
  fi

  # 3) fallback profile => infra/profiles/<profile>/env/.env(.dev/.prod)
  case "${env_name:-}" in
    ""|default) echo "$STACK_COMPOSE_DIR/env/.env" ;;
    *)          echo "$STACK_COMPOSE_DIR/env/.env.${env_name}" ;;
  esac
}

stack_compute_paths() {
  local profile="${BASEWP_PROFILE:-ovh-vps}"

  STACK_COMPOSE_DIR="$BASEWP_ROOT_DIR/infra/profiles/$profile"
  STACK_COMPOSE_FILES=("$STACK_COMPOSE_DIR/compose.yml")

  if [[ "${BASEWP_ENV_NAME:-}" == "dev" && -f "$STACK_COMPOSE_DIR/compose.local.yml" ]]; then
    STACK_COMPOSE_FILES+=("$STACK_COMPOSE_DIR/compose.local.yml")
  fi
  if [[ "${BASEWP_ENV_NAME:-}" == "prod" && -f "$STACK_COMPOSE_DIR/compose.prod.yml" ]]; then
    STACK_COMPOSE_FILES+=("$STACK_COMPOSE_DIR/compose.prod.yml")
  fi

  STACK_ENV_FILE="$(stack_resolve_env_file)"

  STACK_ENV_EXAMPLE_FILE="$STACK_COMPOSE_DIR/env/.env.example"
  if [[ -n "${BASEWP_ENV_NAME:-}" && "${BASEWP_ENV_NAME:-}" != "default" ]]; then
    STACK_ENV_EXAMPLE_FILE_NAMED="$STACK_COMPOSE_DIR/env/.env.${BASEWP_ENV_NAME}.example"
  else
    STACK_ENV_EXAMPLE_FILE_NAMED=""
  fi
}

stack_compose_project_name() {
  local env_file="$STACK_ENV_FILE"
  local value=""

  value="$(stack_env_get "COMPOSE_PROJECT_NAME" "$env_file")"
  [[ -n "${value:-}" ]] && { stack_sanitize_compose_name "$value"; return 0; }

  value="$(stack_env_get "STACK_NAME" "$env_file")"
  [[ -n "${value:-}" ]] && { stack_sanitize_compose_name "$value"; return 0; }

  local prefix slug env_name
  prefix="$(stack_env_get "STACK_PREFIX" "$env_file")"
  [[ -n "${prefix:-}" ]] || prefix="basewp"

  slug="$(stack_env_get "PROJECT_SLUG" "$env_file")"
  if [[ -z "${slug:-}" ]]; then
    slug="$(ctx_get_current_project_ref 2>/dev/null || true)"
  fi
  slug="$(stack_sanitize_compose_name "$slug")"

  env_name="${BASEWP_ENV_NAME:-default}"
  env_name="$(stack_sanitize_compose_name "$env_name")"

  stack_sanitize_compose_name "${prefix}__${slug}__${env_name}"
}

stack_print_env_hint() {
  if [[ -n "${STACK_ENV_EXAMPLE_FILE_NAMED:-}" && -f "$STACK_ENV_EXAMPLE_FILE_NAMED" ]]; then
    info "Astuce: cp \"$STACK_ENV_EXAMPLE_FILE_NAMED\" \"$STACK_ENV_FILE\""
  else
    info "Astuce: cp \"$STACK_ENV_EXAMPLE_FILE\" \"$STACK_ENV_FILE\""
  fi
  info "Profil: ${BASEWP_PROFILE:-ovh-vps} | ENV_NAME=${BASEWP_ENV_NAME:-default} | Project=$(ctx_get_current_project_ref 2>/dev/null || true)"
}