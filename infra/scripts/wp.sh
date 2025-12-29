#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

WPCLI_SVC="wpcli"

wp() {
  # ex: wp core is-installed
  dc run --rm "$WPCLI_SVC" "$@"
}

load_env() {
  require_file "$ENV_FILE"
  # shellcheck disable=SC1090
  source "$ENV_FILE"
}

wp_install_if_needed() {
  load_env

  if wp core is-installed --quiet >/dev/null 2>&1; then
    echo "✅ WordPress déjà installé."
    return 0
  fi

  echo "🧱 Installation WordPress…"
  wp core install \
    --url="${WP_SITE_URL:-http://localhost:8000}" \
    --title="${WP_TITLE:-Base WP}" \
    --admin_user="${WP_ADMIN_USER:-admin}" \
    --admin_password="${WP_ADMIN_PASSWORD:-admin}" \
    --admin_email="${WP_ADMIN_EMAIL:-admin@example.local}" \
    --skip-email

  echo "✅ Installation terminée."
}

# Mode direct: `infra/scripts/wp.sh install`
if [[ "${1:-}" == "install" ]]; then
  wp_install_if_needed
  exit 0
fi

# Menu interactif
actions=$(
  cat <<'EOF'
Install WordPress (core install)
WP-CLI: status (wp --info)
WP-CLI: list plugins
WP-CLI: list themes
WP-CLI: list users
WP-CLI: admin url
WP-CLI: search-replace (dry-run)
WP-CLI: open shell (interactive)
EOF
)

choice="$(printf "%s\n" "$actions" | pick "WP")"

case "$choice" in
  "Install WordPress (core install)")
    wp_install_if_needed
    ;;
  "WP-CLI: status (wp --info)")
    wp --info
    ;;
  "WP-CLI: list plugins")
    wp plugin list
    ;;
  "WP-CLI: list themes")
    wp theme list
    ;;
  "WP-CLI: list users")
    wp user list
    ;;
  "WP-CLI: admin url")
    wp option get siteurl | sed 's|$|/wp-admin/|'
    ;;
  "WP-CLI: search-replace (dry-run)")
    echo "⚠️ Dry-run. Exemple: http://old -> http://new"
    old="$(printf "" | pick "Old URL (tape puis Enter)" || true)"
    new="$(printf "" | pick "New URL (tape puis Enter)" || true)"
    if [[ -z "${old:-}" || -z "${new:-}" ]]; then
      echo "⏭️ Annulé (old/new manquant)."
      exit 0
    fi
    wp search-replace "$old" "$new" --all-tables --dry-run
    ;;
  "WP-CLI: open shell (interactive)")
    echo "💡 Shell WP-CLI. Tape 'exit' pour quitter."
    dc run --rm -it "$WPCLI_SVC" /bin/sh
    ;;
  *)
    echo "⏭️ Annulé."
    ;;
esac