#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# wp/wp.prompts.sh
# UI WP (fzf/select) via shared/ui.sh
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/ui.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/wp.core.sh"

wp_prompt_action() {
  local actions=$(
    cat <<'EOF'
ℹ️  WP info
🔌 Plugins list
🎨 Themes list
🧹 Cache flush
💾 DB export
🔁 Search-replace (dry-run)
🔁 Search-replace (apply)
EOF
  )
  ui_menu "WP (wp-cli)" "$actions"
}

wp_prompt_db_export_filename() {
  local v=""
  read -r -p "Nom du fichier export (vide=auto): " v
  echo "$v"
}

wp_prompt_search_replace_old() {
  local v=""
  read -r -p "Old (ex: http://old.local): " v
  echo "$v"
}

wp_prompt_search_replace_new() {
  local v=""
  read -r -p "New (ex: https://new.tld): " v
  echo "$v"
}