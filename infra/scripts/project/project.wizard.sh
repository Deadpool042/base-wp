#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$PROJECT_DIR/.." && pwd)"

# shared
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/ui.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/context.sh"

# CRUD entrypoints
CREATE="$PROJECT_DIR/crud/project.create.sh"
EDIT="$PROJECT_DIR/crud/project.edit.sh"
DELETE="$PROJECT_DIR/crud/project.delete.sh"

project_menu_actions() {
  cat <<'EOF'
➕ Créer un projet
✏️  Éditer un projet
🗑️  Supprimer un projet
EOF
}

project_menu() {
  while true; do
    local picked
    picked="$(ui_menu "Projets" "$(project_menu_actions)")"
    echo

    case "$picked" in
      "__back__") exit 0 ;;
      "__quit__") exit 99 ;;
      "➕ Créer un projet")  exec "$CREATE" ;;
      "✏️  Éditer un projet") exec "$EDIT" ;;
      "🗑️  Supprimer un projet") exec "$DELETE" ;;
      *) warn "Choix inconnu: $picked" ;;
    esac
  done
}

project_menu