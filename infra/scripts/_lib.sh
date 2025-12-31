#!/usr/bin/env bash
set -euo pipefail

# Fix ctrl+H / backspace + restore
OLD_STTY="$(stty -g 2>/dev/null || true)"
trap '[[ -n "${OLD_STTY:-}" ]] && stty "$OLD_STTY" 2>/dev/null || true' EXIT

# Root = 2 niveaux au-dessus de infra/scripts
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# --- UI helpers -------------------------------------------------------------

log()  { printf "%s\n" "$*"; }
info() { printf "ℹ️  %s\n" "$*"; }
ok()   { printf "✅ %s\n" "$*"; }
warn() { printf "⚠️  %s\n" "$*"; }
die()  { printf "❌ %s\n" "$*" >&2; exit 1; }

has_fzf() { command -v fzf >/dev/null 2>&1; }

pick() {
  local prompt="${1:-Select}"
  if has_fzf; then
    fzf --prompt "${prompt} > " --height 40% --border --ansi || true
  else
    echo ""
  fi
}

confirm() {
  local msg="${1:-Continuer ?}"
  if has_fzf; then
    local out=""
    out="$(printf "no\nyes\n" | fzf --prompt "${msg} > " --height 10% --border --reverse || true)"
    [[ "$out" == "yes" ]]
  else
    read -r -p "${msg} [y/N] " ans
    [[ "${ans:-}" =~ ^[Yy]$ ]]
  fi
}

need_fzf() {
  if ! has_fzf; then
    warn "fzf non détecté. Installe-le: brew install fzf"
    exit 0
  fi
}

is_interactive() { [[ -t 0 && -t 1 ]]; }

# --- Project context --------------------------------------------------------

STATE_DIR="$ROOT_DIR/.basewp"
CURRENT_PROJECT_FILE="$STATE_DIR/current-project"
PROJECTS_DIR="$ROOT_DIR/projects"

ensure_state_dir() { mkdir -p "$STATE_DIR"; }

# slug = chemin relatif dans projects, ex: "client-1/site-vitrine-cat-1"
get_current_project() {
  if [[ -n "${PROJECT_SLUG:-}" ]]; then
    printf "%s" "$PROJECT_SLUG" | tr -d '\n'
    return 0
  fi
  if [[ -f "$CURRENT_PROJECT_FILE" ]]; then
    tr -d '\n' < "$CURRENT_PROJECT_FILE"
    return 0
  fi
  echo ""
}

set_current_project() {
  ensure_state_dir
  printf "%s\n" "$1" > "$CURRENT_PROJECT_FILE"
}

clear_current_project() {
  ensure_state_dir
  : > "$CURRENT_PROJECT_FILE"
}

require_current_project() {
  local slug
  slug="$(get_current_project)"
  [[ -n "$slug" ]] || die "Aucun projet courant. Fais: make project -> select current"
  echo "$slug"
}

project_dir() {
  local slug="$1"
  [[ -n "$slug" ]] || { echo ""; return 0; }
  echo "$PROJECTS_DIR/$slug"
}


# --- Profile/env context ----------------------------------------------------

PROFILE="${PROFILE:-}"
ENV_NAME="${ENV_NAME:-}"   # dev|prod|"" (default)
ENV_FILE="${ENV_FILE:-}"   # override path

COMPOSE_DIR=""
COMPOSE_FILES=()
ENV_EXAMPLE_FILE=""
ENV_EXAMPLE_FILE_NAMED=""

list_profiles() {
  local dir="$ROOT_DIR/infra/profiles"
  [[ -d "$dir" ]] || return 0
  for d in "$dir"/*; do
    [[ -d "$d" ]] || continue
    basename "$d"
  done
}

choose_profile() {
  local current="${PROFILE:-}"
  local profiles
  profiles="$(list_profiles)"
  [[ -n "$profiles" ]] || { echo ""; return 0; }

  if has_fzf; then
    if [[ -n "$current" ]]; then
      printf "%s\n" "$current" "$profiles" | awk '!seen[$0]++' | pick "Profile"
    else
      printf "%s\n" "$profiles" | pick "Profile"
    fi
    return 0
  fi

  echo "Choisir un profile infra:"
  select opt in $profiles; do echo "${opt:-}"; return 0; done
}

choose_env_name() {
  local current="${ENV_NAME:-default}"
  local items="default dev prod"
  if has_fzf; then
    printf "%s\n" "$current" $items | awk '!seen[$0]++' | pick "ENV"
    return 0
  fi
  echo "Choisir un env:"
  select opt in $items; do
    [[ "${opt:-}" == "default" ]] && echo "" || echo "${opt:-}"
    return 0
  done
}

# Read KEY=value from ENV_FILE without sourcing it
env_get() {
  local key="$1" file="$2"
  [[ -f "$file" ]] || return 0

  # prend la DERNIÈRE occurrence valide KEY=...
  awk -F= -v k="$key" '
    $0 ~ "^[[:space:]]*"k"[[:space:]]*=" {
      sub("^[[:space:]]*"k"[[:space:]]*=[[:space:]]*", "", $0)
      gsub(/[[:space:]]*$/, "", $0)
      # strip quotes
      if ($0 ~ /^".*"$/) { sub(/^"/, "", $0); sub(/"$/, "", $0) }
      if ($0 ~ /^'\''.*'\''$/) { sub(/^'\''/, "", $0); sub(/'\''$/, "", $0) }
      val=$0
    }
    END { if (val!="") print val }
  ' "$file"
}

sanitize_compose_name() {
  # docker compose -p : lowercase + [a-z0-9_-] conseillé
  local s="$1"
  s="$(printf "%s" "$s" | tr '[:upper:]' '[:lower:]')"
  s="$(printf "%s" "$s" | tr '/ ' '__')"
  s="$(printf "%s" "$s" | sed -E 's/[^a-z0-9_-]+/_/g; s/_+/_/g; s/^_|_$//g')"
  printf "%s" "$s"
}

compose_project_name() {
  # ⚠️ ENV_FILE doit être résolu avant d'appeler ça
  local v=""

  v="$(env_get "COMPOSE_PROJECT_NAME" "$ENV_FILE")"
  [[ -n "$v" ]] && { sanitize_compose_name "$v"; return 0; }

  v="$(env_get "STACK_NAME" "$ENV_FILE")"
  [[ -n "$v" ]] && { sanitize_compose_name "$v"; return 0; }

  local prefix slug env
  prefix="$(env_get "STACK_PREFIX" "$ENV_FILE")"
  [[ -n "$prefix" ]] || prefix="basewp"

  # slug côté env (idéal)
  slug="$(env_get "PROJECT_SLUG" "$ENV_FILE")"

  # sinon slug courant (client/site) -> client__site
  if [[ -z "$slug" ]]; then
    slug="$(get_current_project)"
    slug="$(sanitize_compose_name "$slug")"
  else
    slug="$(sanitize_compose_name "$slug")"
  fi

  env="${ENV_NAME:-default}"
  env="$(sanitize_compose_name "$env")"

  sanitize_compose_name "${prefix}__${slug}__${env}"
}

# Résout ENV_FILE dans cet ordre :
# 1) ENV_FILE explicit
# 2) si projet courant => projects/<slug>/env/.env.<env>
# 3) fallback profile => infra/profiles/<profile>/env/.env.<env>
resolve_env_file() {
  local env="${ENV_NAME:-}"
  local slug proj

  if [[ -n "${ENV_FILE:-}" ]]; then
    [[ "$ENV_FILE" = /* ]] && { echo "$ENV_FILE"; return 0; }
    echo "$ROOT_DIR/$ENV_FILE"
    return 0
  fi

  slug="$(get_current_project)"
  if [[ -n "$slug" ]]; then
    proj="$(project_dir "$slug")"
    if [[ -d "$proj" ]]; then
      case "$env" in
        ""|default) echo "$proj/env/.env" ;;
        *)          echo "$proj/env/.env.$env" ;;
      esac
      return 0
    fi
  fi

  case "$env" in
    ""|default) echo "$COMPOSE_DIR/env/.env" ;;
    *)          echo "$COMPOSE_DIR/env/.env.$env" ;;
  esac
}

compute_paths() {
  PROFILE="${PROFILE:-ovh-vps}"
  COMPOSE_DIR="$ROOT_DIR/infra/profiles/$PROFILE"

  COMPOSE_FILES=("$COMPOSE_DIR/compose.yml")

  # overrides par env (si présents)
  if [[ "${ENV_NAME:-}" == "dev" && -f "$COMPOSE_DIR/compose.local.yml" ]]; then
    COMPOSE_FILES+=("$COMPOSE_DIR/compose.local.yml")
  fi
  if [[ "${ENV_NAME:-}" == "prod" && -f "$COMPOSE_DIR/compose.prod.yml" ]]; then
    COMPOSE_FILES+=("$COMPOSE_DIR/compose.prod.yml")
  fi

  ENV_FILE="$(resolve_env_file)"

  ENV_EXAMPLE_FILE="$COMPOSE_DIR/env/.env.example"
  if [[ -n "${ENV_NAME:-}" && "${ENV_NAME:-}" != "default" ]]; then
    ENV_EXAMPLE_FILE_NAMED="$COMPOSE_DIR/env/.env.${ENV_NAME}.example"
  else
    ENV_EXAMPLE_FILE_NAMED=""
  fi
}

init_context() {
  if [[ "${BASEWP_NO_PROMPT:-0}" == "1" ]]; then
    compute_paths
    return 0
  fi

  if is_interactive && [[ -z "${PROFILE:-}" ]]; then
    local p=""
    p="$(choose_profile)"
    PROFILE="${p:-ovh-vps}"
  fi

  if is_interactive && [[ -z "${ENV_FILE:-}" && -z "${ENV_NAME:-}" ]]; then
    local e=""
    e="$(choose_env_name)"
    [[ "$e" == "default" ]] && ENV_NAME="" || ENV_NAME="${e:-}"
  fi

  compute_paths
}

require_file() { [[ -f "$1" ]] || return 1; }

print_env_hint() {
  if [[ -n "${ENV_EXAMPLE_FILE_NAMED:-}" && -f "$ENV_EXAMPLE_FILE_NAMED" ]]; then
    info "Astuce: cp \"$ENV_EXAMPLE_FILE_NAMED\" \"$ENV_FILE\""
  else
    info "Astuce: cp \"$ENV_EXAMPLE_FILE\" \"$ENV_FILE\""
  fi
  info "Profil: $PROFILE | ENV_NAME=${ENV_NAME:-default} | Project=$(get_current_project)"
}

dc() {
  for f in "${COMPOSE_FILES[@]}"; do
    require_file "$f" || die "Compose manquant: $f"
  done
  require_file "$ENV_FILE" || { print_env_hint; die "Env manquant: $ENV_FILE"; }

  local args=()
  for f in "${COMPOSE_FILES[@]}"; do args+=(-f "$f"); done

  local project
  project="$(compose_project_name)"

  docker compose -p "$project" --env-file "$ENV_FILE" "${args[@]}" "$@"
}

service_pick() { dc ps --services | pick "Service"; }

container_logs() {
  local svc="${1:-}"
  if [[ -z "$svc" ]]; then svc="$(service_pick)"; fi
  if [[ -z "$svc" ]]; then
    warn "Aucun service sélectionné."
    return 0
  fi
  info "Logs: $svc (Ctrl+C pour quitter)"
  dc logs -f --tail 200 "$svc"
}

load_env() {
  require_file "$ENV_FILE" || { print_env_hint; die "Env manquant: $ENV_FILE"; }
  # shellcheck disable=SC1090
  source "$ENV_FILE"
}

profile_info() {
  echo "🧩 Profil: $PROFILE"
  echo "🏷️  ENV_NAME: ${ENV_NAME:-default}"
  echo "📦 Project:  $(get_current_project)"
  echo "🧱 Compose project: $(compose_project_name)"
  echo "🔐 Env:     $ENV_FILE"
  echo "📄 Compose:"
  for f in "${COMPOSE_FILES[@]}"; do echo "   - $f"; done
}

# init auto
init_context