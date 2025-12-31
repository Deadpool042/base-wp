#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

need_mkcert() {
  command -v mkcert >/dev/null 2>&1 || {
    die "mkcert manquant. Installe: brew install mkcert && mkcert -install"
  }
}

is_local_domain() {
  [[ "$1" == *.local ]]
}

usage() {
  cat <<EOF
Usage: certs.sh {ensure|clean|status} [--project <slug>]

Ex:
  certs.sh ensure
  certs.sh clean --project dupont-biere
EOF
}

# --- args
CMD="${1:-ensure}"
shift || true

TARGET_PROJECT=""
while [[ "${1:-}" != "" ]]; do
  case "$1" in
    --project) TARGET_PROJECT="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) die "Arg inconnu: $1" ;;
  esac
done

if [[ -n "$TARGET_PROJECT" ]]; then
  set_current_project "$TARGET_PROJECT"
fi

# charge env du projet courant (via _lib.sh)
load_env

domain="${SITE_DOMAIN:-}"
www="${SITE_DOMAIN_WWW:-}"

[[ -n "$domain" ]] || die "SITE_DOMAIN manquant dans l'env ($ENV_FILE)"

# Certs partagés par profil (montés dans traefik)
CERTS_DIR="$COMPOSE_DIR/traefik/certs"
mkdir -p "$CERTS_DIR"

pem="$CERTS_DIR/${domain}.pem"
key="$CERTS_DIR/${domain}-key.pem"

case "$CMD" in
  status)
    profile_info
    echo
    info "Certs dir: $CERTS_DIR"
    info "Domain:    $domain"
    info "WWW:       ${www:-<none>}"
    echo
    ls -l "$CERTS_DIR" | sed -n '1,200p' || true
    ;;
  ensure)
    need_mkcert

    if ! is_local_domain "$domain"; then
      info "Domaine non *.local ($domain) => pas de mkcert (prod = Let's Encrypt)"
      exit 0
    fi

    if [[ -f "$pem" && -f "$key" ]]; then
      ok "Cert déjà présent: $pem"
      exit 0
    fi

    info "Génération mkcert: $domain ${www:-}"
    (
      cd "$CERTS_DIR"
      if [[ -n "${www:-}" ]]; then
        mkcert -cert-file "$(basename "$pem")" -key-file "$(basename "$key")" "$domain" "$www"
      else
        mkcert -cert-file "$(basename "$pem")" -key-file "$(basename "$key")" "$domain"
      fi
    )

    chmod 600 "$key" || true
    ok "Cert généré: $pem"
    ;;
  clean)
    info "Suppression certs: $pem $key"
    rm -f "$pem" "$key"
    ok "Certs supprimés."
    ;;
  *)
    usage
    exit 1
    ;;
esac