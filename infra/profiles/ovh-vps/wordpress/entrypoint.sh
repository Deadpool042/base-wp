#!/usr/bin/env bash
set -euo pipefail

WP_PATH="${WP_PATH:-/var/www/html}"
UPLOADS_DIR="$WP_PATH/wp-content/uploads"

echo "[base-wp] fixing wp-content permissions…"

# Crée les dossiers si absent (volumes neufs)
mkdir -p "$UPLOADS_DIR"

# Perms “dev safe” (écriture pour www-data)
chown -R www-data:www-data "$WP_PATH/wp-content" || true
chmod -R 775 "$WP_PATH/wp-content" || true

# Appelle l’entrypoint officiel WordPress
exec /usr/local/bin/docker-entrypoint.sh "$@"