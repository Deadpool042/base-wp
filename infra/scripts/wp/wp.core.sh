#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# wp/wp.core.sh
# Commandes WP-CLI (business). Zéro UI ici.
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/wp.context.sh"

wp_init() { stack_init; }

wp_cli() {
  # Exécute wp-cli dans le service wpcli.
  # Usage: wp_cli <args...>
  wp_init

  local svc path
  svc="$(wp_service_name)"
  path="$(wp_path)"

  stack_dc exec -T "$svc" wp --path="$path" "$@"
}

wp_cli_interactive() {
  # Version interactive (utile si wp demande un prompt)
  wp_init

  local svc path
  svc="$(wp_service_name)"
  path="$(wp_path)"

  stack_dc exec "$svc" wp --path="$path" "$@"
}

# --- Actions “ready-to-use” ---

wp_info() {
  wp_cli --info
  wp_cli core version || true
}

wp_plugins_list() { wp_cli plugin list; }
wp_themes_list()  { wp_cli theme list; }

wp_cache_flush() { wp_cli cache flush; }

wp_db_export() {
  # Usage: wp_db_export <filename.sql>
  local filename="${1:-}"
  [[ -n "$filename" ]] || filename="db-$(date +%Y%m%d-%H%M%S).sql"
  wp_cli db export "$filename"
  echo "$filename"
}

wp_search_replace() {
  # Usage: wp_search_replace <old> <new> [--dry-run]
  local old="${1:-}" new="${2:-}" dry="${3:-}"
  [[ -n "$old" && -n "$new" ]] || die "Usage: wp_search_replace <old> <new> [--dry-run]"
  if [[ "${dry:-}" == "--dry-run" ]]; then
    wp_cli search-replace "$old" "$new" --dry-run
  else
    wp_cli search-replace "$old" "$new"
  fi
}