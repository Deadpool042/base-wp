#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

WPCLI_SVC="${WPCLI_SVC:-wpcli}"
wp() { dc run --rm "$WPCLI_SVC" "$@"; }

doctor() {
  profile_info
  echo
  load_env
  info "SITE_DOMAIN=${SITE_DOMAIN:-}"
  info "WP_SITE_URL=${WP_SITE_URL:-}"
  info "TRAEFIK_TLS_RESOLVER=${TRAEFIK_TLS_RESOLVER:-}"
  echo
  dc version || true
  echo
  dc ps || true
}

build_image() { dc build wordpress; }
rebuild_image() { dc build --no-cache wordpress && dc up -d --force-recreate wordpress; }

# direct modes
case "${1:-}" in
  install) "$SCRIPT_DIR/wp-install.sh"; exit 0 ;;   # <- délègue
  doctor) doctor; exit 0 ;;
  build-image) build_image; exit 0 ;;
  rebuild-image) rebuild_image; exit 0 ;;
esac

# menu
need_fzf
choice="$(printf "%s\n" \
  "Install WordPress (project)" \
  "Doctor (diag)" \
  "Build WP image" \
  "Rebuild WP image (no-cache)" \
  "List plugins" \
  "List themes" \
  "List users" \
  "Admin URL" \
| pick "WP")"

case "$choice" in
  "Install WordPress (project)") "$SCRIPT_DIR/wp-install.sh" ;;
  "Doctor (diag)") doctor ;;
  "Build WP image") build_image ;;
  "Rebuild WP image (no-cache)") rebuild_image ;;
  "List plugins") wp plugin list ;;
  "List themes") wp theme list ;;
  "List users") wp user list ;;
  "Admin URL") wp option get siteurl | sed 's|$|/wp-admin/|' ;;
  *) echo "⏭️ Annulé." ;;
esac