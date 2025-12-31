#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_bootstrap.sh"
# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/project.rename_client.sh"

edit_actions() {
  cat <<'EOF'
✏️  Renommer le client (déplace le dossier + regen)
EOF
}

main() {
  local picked
  picked="$(ui_menu "Éditer un projet" "$(edit_actions)")"
  echo

  case "$picked" in
    "__back__"|"__noop__") exit 0 ;;
    "__quit__") exit 99 ;;
    "✏️  Renommer le client (déplace le dossier + regen)")
      project_rename_client
      ui_ok
      ;;
    *) warn "Choix inconnu: $picked" ;;
  esac
}

main