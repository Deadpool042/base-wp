#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url"
  else
    echo "$url"
  fi
}

# Modes rapides (appelés depuis make)
case "${1:-}" in
  open)
    load_env
    open_url "${WP_SITE_URL:-http://localhost:8000}"
    exit 0
    ;;
  mailpit)
    load_env
    open_url "http://localhost:${MAILPIT_HTTP_PORT:-8025}"
    exit 0
    ;;
esac

items=$(
  cat <<'EOF'
Up (start infra)
Down (stop infra)
Restart infra
PS (status)
Logs (pick service)
WP-CLI (menu)
Install WP
Open WP in browser
Open Mailpit in browser
Reset (⚠️ delete volumes)
EOF
)

# Menu interactif uniquement si fzf est présent
if ! has_fzf; then
  echo "⚠️ fzf non détecté. Installe-le pour activer le menu interactif:"
  echo "   brew install fzf"
  echo
  echo "Actions disponibles:"
  echo "$items"
  exit 0
fi

choice="$(printf "%s\n" "$items" | pick "Infra")"

case "$choice" in
  "Up (start infra)")
    dc up -d
    ;;
  "Down (stop infra)")
    dc down
    ;;
  "Restart infra")
    dc down
    dc up -d
    ;;
  "PS (status)")
    dc ps
    ;;
  "Logs (pick service)")
    container_logs "$(service_pick)"
    ;;
  "WP-CLI (menu)")
    "$SCRIPT_DIR/wp.sh"
    ;;
  "Install WP")
    "$SCRIPT_DIR/wp.sh" install
    ;;
  "Open WP in browser")
    load_env
    open_url "${WP_SITE_URL:-http://localhost:8000}"
    ;;
  "Open Mailpit in browser")
    load_env
    open_url "http://localhost:${MAILPIT_HTTP_PORT:-8025}"
    ;;
  "Reset (⚠️ delete volumes)")
    "$SCRIPT_DIR/reset.sh"
    ;;
  *)
    echo "⏭️ Annulé."
    ;;
esac