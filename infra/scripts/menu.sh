#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

load_env() {
  require_file "$ENV_FILE"
  # shellcheck disable=SC1090
  source "$ENV_FILE"
}

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url"
  else
    echo "$url"
  fi
}

# Modes rapides (appelés depuis make)
if [[ "${1:-}" == "open" ]]; then
  load_env
  open_url "${WP_SITE_URL:-http://localhost:8000}"
  exit 0
fi
if [[ "${1:-}" == "mailpit" ]]; then
  load_env
  open_url "http://localhost:${MAILPIT_HTTP_PORT:-8025}"
  exit 0
fi

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

choice="$(printf "%s\n" "$items" | pick "Infra")"

case "$choice" in
  "Up (start infra)") dc up -d ;;
  "Down (stop infra)") dc down ;;
  "Restart infra") dc down && dc up -d ;;
  "PS (status)") dc ps ;;
  "Logs (pick service)") container_logs "$(service_pick)" ;;
  "WP-CLI (menu)") "$(dirname "$0")/wp.sh" ;;
  "Install WP") "$(dirname "$0")/wp.sh" install ;;
  "Open WP in browser")
    load_env
    open_url "${WP_SITE_URL:-http://localhost:8000}"
    ;;
  "Open Mailpit in browser")
    load_env
    open_url "http://localhost:${MAILPIT_HTTP_PORT:-8025}"
    ;;
  "Reset (⚠️ delete volumes)") "$(dirname "$0")/reset.sh" ;;
  *) echo "⏭️ Annulé." ;;
esac