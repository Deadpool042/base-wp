#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# project/project.context.sh
# Contexte PROJECT : chemins + dépendances shared (+ stack optionnel).
# ------------------------------------------------------------------------------

# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../shared/context.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# shared
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/strings.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/fs.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/env.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/validate.sh"

# stack (optionnel)
STACK_CORE="$SCRIPTS_DIR/stack/stack.core.sh"
if [[ -f "$STACK_CORE" ]]; then
  # shellcheck source=/dev/null
  source "$STACK_CORE"
fi

# defaults
PROJECTS_DIR_DEFAULT="${PROJECTS_DIR_DEFAULT:-$ROOT_DIR/projects}"
HOSTS_FILE_DEFAULT="${HOSTS_FILE_DEFAULT:-/etc/hosts}"
STACK_PREFIX_DEFAULT="${STACK_PREFIX_DEFAULT:-basewp}"

# API
project_projects_dir()  { printf "%s" "${PROJECTS_DIR:-$PROJECTS_DIR_DEFAULT}"; }
project_hosts_file()    { printf "%s" "${HOSTS_FILE:-$HOSTS_FILE_DEFAULT}"; }
project_stack_prefix()  { printf "%s" "${STACK_PREFIX:-$STACK_PREFIX_DEFAULT}"; }

project_ensure_projects_dir() { fs_mkdir "$(project_projects_dir)"; }

project_need_jq() {
  command -v jq >/dev/null 2>&1 || die "jq requis. macOS: brew install jq"
}

project_need_mkcert() {
  command -v mkcert >/dev/null 2>&1 || die "mkcert requis. macOS: brew install mkcert && mkcert -install"
}