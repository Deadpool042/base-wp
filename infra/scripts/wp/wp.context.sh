#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# wp/wp.context.sh
# Contexte WP : définit le service wpcli par défaut et charge stack.
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# shared
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"

# stack (wp dépend de stack)
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/stack/stack.context.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/stack/stack.core.sh"

WPCLI_SERVICE_DEFAULT="${WPCLI_SERVICE_DEFAULT:-wpcli}"
WP_PATH_DEFAULT="${WP_PATH_DEFAULT:-/var/www/html}"

wp_service_name() { echo "${WPCLI_SERVICE:-$WPCLI_SERVICE_DEFAULT}"; }
wp_path() { echo "${WP_PATH:-$WP_PATH_DEFAULT}"; }