#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# deps
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../project.context.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/ui.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"

# business
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../project.list.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../project.meta.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../project.hosts.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../project.certs.sh"

project_crud_delete() {
  project_need_jq

  local ref
  ref="$(project_pick)"
  [[ -n "$ref" ]] || return 0

  local dir meta slug
  dir="$(project_ref_to_dir "$ref")"
  meta="$dir/meta.json"
  [[ -f "$meta" ]] || die "meta.json introuvable: $meta"
  slug="$(project_slug_from_meta "$meta")"

  warn "Suppression: $ref"
  ui_confirm "Confirmer suppression (hosts + dossier) ?" || { info "Annulé."; return 0; }

  ctx_set_current_project_ref "$ref"

  project_hosts_remove "$slug" || true
  project_clean_local_certs "$dir" || true

  rm -rf "$dir"
  ok "Projet supprimé: $ref"
  ui_ok
}