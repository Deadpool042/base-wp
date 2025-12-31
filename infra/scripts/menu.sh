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

site_url() {
  load_env
  if [[ -n "${WP_SITE_URL:-}" ]]; then
    echo "$WP_SITE_URL"
    return 0
  fi
  if [[ -n "${SITE_DOMAIN:-}" ]]; then
    echo "https://${SITE_DOMAIN}"
    return 0
  fi
  echo "http://localhost"
}

print_actions_help() {
  cat <<EOF
🧩 Profil: $PROFILE | ENV_NAME=${ENV_NAME:-default}

Commandes:
  make up / down / ps / logs
  make wp / install
  make open
  make reset
  make clean

Projets:
  make project          # menu projets
  make project-list     # liste projets
  make project-edit     # édition meta/env/hosts
  make project-create   # créer un projet
  make project-delete   # supprimer un projet

Astuce:
  ENV_NAME=dev  make up
  ENV_NAME=prod make up
EOF
}

# --- Quick modes (called from Makefile) ---
case "${1:-}" in
  open)
    open_url "$(site_url)"
    exit 0
    ;;
  mailpit)
    load_env
    if [[ "${ENV_NAME:-}" != "dev" ]]; then
      echo "⚠️ Mailpit est dev-only. Utilise ENV_NAME=dev."
      exit 0
    fi
    open_url "http://localhost:${MAILPIT_HTTP_PORT:-8025}"
    exit 0
    ;;

  # Project shortcuts
  project)
    "$SCRIPT_DIR/project.sh"
    exit 0
    ;;
  project-list)
    "$SCRIPT_DIR/project.sh" list
    exit 0
    ;;
  project-edit)
    "$SCRIPT_DIR/project.sh" edit
    exit 0
    ;;
  project-create)
    "$SCRIPT_DIR/project.sh" create
    exit 0
    ;;
  project-delete)
    "$SCRIPT_DIR/project.sh" delete
    exit 0
    ;;
esac

# --- Menu items ---
MENU_ITEMS=$(
  cat <<'EOF'
Up (start infra)
Down (stop infra)
Restart infra
PS (status)
Logs (pick service)
WP-CLI (menu)
Install WP
Build WP image
Rebuild WP image (no-cache)
Doctor (versions/diag)
---
Project: menu
Project: list
Project: edit
Project: create
Project: delete
---
Open site in browser
Open Mailpit (dev-only)
Clean (docker prune)
Reset (⚠️ delete volumes)
EOF
)

# Non-interactive fallback
if ! has_fzf; then
  echo "⚠️ fzf non détecté: brew install fzf"
  echo
  print_actions_help
  echo
  echo "Actions (menu) :"
  echo "$MENU_ITEMS" | sed '/^---$/d'
  exit 0
fi

profile_info

# Hide dev-only items
if [[ "${ENV_NAME:-}" != "dev" ]]; then
  MENU_ITEMS="$(printf "%s\n" "$MENU_ITEMS" | grep -v "^Open Mailpit")"
fi

choice="$(printf "%s\n" "$MENU_ITEMS" | grep -v '^---$' | pick "Infra")"

# Handle selection
case "$choice" in
  "Up (start infra)") dc up -d --remove-orphans ;;
  "Down (stop infra)") dc down --remove-orphans ;;
  "Restart infra") dc down --remove-orphans && dc up -d --remove-orphans ;;
  "PS (status)") dc ps ;;
  "Logs (pick service)") container_logs "$(service_pick)" ;;

  "WP-CLI (menu)") "$SCRIPT_DIR/wp.sh" ;;
  "Install WP") "$SCRIPT_DIR/wp.sh" install ;;
  "Build WP image") "$SCRIPT_DIR/wp.sh" build-image ;;
  "Rebuild WP image (no-cache)") "$SCRIPT_DIR/wp.sh" rebuild-image ;;
  "Doctor (versions/diag)") "$SCRIPT_DIR/wp.sh" doctor ;;

  "Project: menu") "$SCRIPT_DIR/project.sh" ;;
  "Project: list") "$SCRIPT_DIR/project.sh" list ;;
  "Project: edit") "$SCRIPT_DIR/project.sh" edit ;;
  "Project: create") "$SCRIPT_DIR/project.sh" create ;;
  "Project: delete") "$SCRIPT_DIR/project.sh" delete ;;

  "Open site in browser") open_url "$(site_url)" ;;
  "Open Mailpit (dev-only)")
    load_env
    open_url "http://localhost:${MAILPIT_HTTP_PORT:-8025}"
    ;;
  "Clean (docker prune)") "$SCRIPT_DIR/clean.sh" ;;
  "Reset (⚠️ delete volumes)") "$SCRIPT_DIR/reset.sh" ;;
  ""|*) echo "⏭️ Annulé." ;;
esac
