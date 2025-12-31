#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# project/project.hosts.sh
# Gestion /etc/hosts pour domaines *.local (tagués basewp:<slug>)
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/project.context.sh"

# shared helpers
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/validate.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/fs.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/strings.sh"

project_hosts_tag() { printf "basewp:%s" "${1:-}"; }

project_hosts_remove() {
  local slug="${1:-}"
  slug="$(str_trim "$slug")"
  [[ -n "$slug" ]] || return 0

  local hosts; hosts="$(project_hosts_file)"
  fs_file_exists "$hosts" || return 0

  local tag; tag="$(project_hosts_tag "$slug")"
  local tmp; tmp="$(mktemp)"

  # Retire le bloc tagué (si présent)
  sudo awk -v tag="$tag" '
    $0 == "# basewp:begin " tag {inside=1; next}
    $0 == "# basewp:end "   tag {inside=0; next}
    inside!=1 {print}
  ' "$hosts" > "$tmp"

  sudo cp "$tmp" "$hosts"
  rm -f "$tmp"
}

project_hosts_apply() {
  local slug="${1:-}"
  local local_domain="${2:-}"
  local www_domain="${3:-}"

  slug="$(str_trim "$slug")"
  local_domain="$(str_trim "$local_domain")"
  www_domain="$(str_trim "$www_domain")"

  [[ -n "$slug" && -n "$local_domain" ]] || return 0

  is_local_domain "$local_domain" || {
    info "Domaine local non *.local => pas de /etc/hosts ($local_domain)"
    return 0
  }

  # On remplace proprement (idempotent)
  project_hosts_remove "$slug"

  local tag; tag="$(project_hosts_tag "$slug")"
  local hosts; hosts="$(project_hosts_file)"

  # (Optionnel) sanity : le fichier doit exister sur la machine
  fs_file_exists "$hosts" || {
    warn "Hosts file introuvable: $hosts"
    return 0
  }

  {
    echo "# basewp:begin $tag"
    echo "127.0.0.1 ${local_domain}"
    [[ -n "$www_domain" ]] && echo "127.0.0.1 ${www_domain}"
    echo "# basewp:end $tag"
  } | sudo tee -a "$hosts" >/dev/null
}