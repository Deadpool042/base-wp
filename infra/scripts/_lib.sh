#!/usr/bin/env bash
set -euo pipefail

# Racine du repo (2 niveaux au-dessus de infra/scripts)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/docker/compose.yml"
ENV_FILE="$ROOT_DIR/infra/docker/env/.env"

require_file() {
  local f="$1"
  if [[ ! -f "$f" ]]; then
    echo "❌ Fichier manquant: $f"
    return 1
  fi
}

dc() {
  require_file "$COMPOSE_FILE" || {
    echo "➡️  Attendu: $COMPOSE_FILE"
    exit 1
  }
  require_file "$ENV_FILE" || {
    echo "➡️  Astuce: cp infra/docker/env/.env.example infra/docker/env/.env"
    exit 1
  }
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

has_fzf() {
  command -v fzf >/dev/null 2>&1
}

pick() {
  local prompt="${1:-Select}"
  if has_fzf; then
    fzf --prompt "$prompt > " --height 40% --border --ansi
  else
    echo ""
  fi
}

confirm() {
  local msg="${1:-Continuer ?}"
  if has_fzf; then
    printf "no\nyes\n" | fzf --prompt "$msg > " --height 10% --border --reverse | grep -q "^yes$"
  else
    read -r -p "$msg [y/N] " ans
    [[ "${ans:-}" =~ ^[Yy]$ ]]
  fi
}

service_pick() {
  dc ps --services | pick "Service"
}

container_logs() {
  local svc="${1:-}"
  if [[ -z "$svc" ]]; then svc="$(service_pick)"; fi
  echo "📜 Logs: $svc (Ctrl+C pour quitter)"
  dc logs -f --tail 200 "$svc"
}

load_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Fichier manquant: $ENV_FILE"
    echo "➡️  cp infra/docker/env/.env.example infra/docker/env/.env"
    exit 1
  fi
  # shellcheck disable=SC1090
  source "$ENV_FILE"
}

need_fzf() {
  if ! has_fzf; then
    echo "⚠️ fzf non détecté. Installe-le pour activer le menu interactif :"
    echo "   brew install fzf"
    exit 0
  fi
}