#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# project/project.certs.sh
# Certs mkcert stockés DANS le projet: projects/<client>/<site>/certs/
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)" # infra/scripts

# shared deps (robuste, quel que soit l'ordre de source)
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/fs.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/strings.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/validate.sh"

# project context (paths)
# shellcheck source=/dev/null
source "$SCRIPT_DIR/project.context.sh"

project_need_mkcert() {
  command -v mkcert >/dev/null 2>&1 || die "mkcert requis. macOS: brew install mkcert && mkcert -install"
}

project_certs_dir() {
  local proj_dir="${1:-}"
  [[ -n "$proj_dir" ]] || { echo ""; return 0; }
  echo "$proj_dir/certs"
}

project_clean_local_certs() {
  local proj_dir="${1:-}"
  local domain="${2:-}"
  domain="$(str_strip_newlines "$(str_trim "$domain")")"

  [[ -n "$proj_dir" && -n "$domain" ]] || return 0

  local dir; dir="$(project_certs_dir "$proj_dir")"
  rm -f "$dir/${domain}.pem" "$dir/${domain}-key.pem" || true
}

project_ensure_local_certs() {
  project_need_mkcert

  local proj_dir="${1:-}"
  local local_domain="${2:-}"
  local_domain="$(str_strip_newlines "$(str_trim "$local_domain")")"

  [[ -n "$proj_dir" && -n "$local_domain" ]] || return 0

  is_local_domain "$local_domain" || {
    info "Domaine local non *.local => pas de mkcert ($local_domain)"
    return 0
  }

  local www_domain="www.${local_domain}"
  local certs_dir; certs_dir="$(project_certs_dir "$proj_dir")"
  fs_mkdir "$certs_dir"

  local pem="$certs_dir/${local_domain}.pem"
  local key="$certs_dir/${local_domain}-key.pem"

  if [[ -f "$pem" && -f "$key" ]]; then
    ok "Cert déjà présent: $pem"
    return 0
  fi

  info "Génération mkcert: $local_domain $www_domain"
  (cd "$certs_dir" && mkcert -cert-file "$(basename "$pem")" -key-file "$(basename "$key")" "$local_domain" "$www_domain")
  chmod 600 "$key" || true
}