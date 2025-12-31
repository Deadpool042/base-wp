#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

HOSTS_FILE="/etc/hosts"

sanitize_tag_slug() {
  # slug peut contenir des '/' (projects/client/site). On le rend safe pour /etc/hosts tags.
  local s="${1:-}"
  s="${s//\//--}"
  s="${s// /-}"
  echo "$s"
}

begin_line_for_tag() { echo "# basewp:begin $1"; }
end_line_for_tag() { echo "# basewp:end $1"; }

usage() {
  cat <<EOF
Usage: host.sh {add|remove|status} [--project <slug>] [--all]

Ex:
  host.sh add
  host.sh remove --project dupont-biere
  host.sh remove --all
  host.sh status
EOF
}

is_local_domain() {
  local d="${1:-}"
  [[ -n "$d" && "$d" == *.local ]]
}

require_hosts_file() {
  [[ -f "$HOSTS_FILE" ]] || die "Hosts file introuvable: $HOSTS_FILE"
}

mktemp_file() {
  # mktemp portable macOS/Linux
  mktemp 2>/dev/null || mktemp -t basewp-hosts
}

write_hosts_file() {
  # Écrit atomiquement dans /etc/hosts en conservant des perms correctes.
  # On utilise `install` si dispo, sinon fallback `cp`.
  local src="$1"

  if command -v install >/dev/null 2>&1; then
    sudo install -m 644 "$src" "$HOSTS_FILE"
  else
    sudo cp "$src" "$HOSTS_FILE"
  fi
}

# --- args -------------------------------------------------------------------

CMD="${1:-status}"
shift || true

TARGET_PROJECT=""
REMOVE_ALL="0"

while [[ "${1:-}" != "" ]]; do
  case "$1" in
    --project)
      TARGET_PROJECT="${2:-}"
      shift 2
      ;;
    --all)
      REMOVE_ALL="1"
      shift 1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Arg inconnu: $1"
      ;;
  esac
done

if [[ -n "$TARGET_PROJECT" ]]; then
  set_current_project "$TARGET_PROJECT"
fi

slug="$(get_current_project)"

# --- core helpers -----------------------------------------------------------

hosts_remove_block_by_tag() {
  local tag="$1"
  require_hosts_file

  local tmp
  tmp="$(mktemp_file)"

  local begin end
  begin="$(begin_line_for_tag "$tag")"
  end="$(end_line_for_tag "$tag")"

  # Suppression exacte (pas de regex) : portable macOS/Linux
  awk -v begin="$begin" -v end="$end" '
    $0 == begin { inblock=1; next }
    $0 == end   { inblock=0; next }
    inblock != 1 { print }
  ' "$HOSTS_FILE" > "$tmp"

  write_hosts_file "$tmp"
  rm -f "$tmp"
}

hosts_remove_all_basewp_blocks() {
  require_hosts_file

  local tmp
  tmp="$(mktemp_file)"

  awk '
    index($0, "# basewp:begin basewp:") == 1 { inblock=1; next }
    index($0, "# basewp:end basewp:")   == 1 { inblock=0; next }
    inblock != 1 { print }
  ' "$HOSTS_FILE" > "$tmp"

  write_hosts_file "$tmp"
  rm -f "$tmp"
}

hosts_apply_project() {
  local tag="$1"
  local d1="$2"
  local d2="${3:-}"

  require_hosts_file

  # Idempotent
  hosts_remove_block_by_tag "$tag"

  local tmp
  tmp="$(mktemp_file)"

  {
    cat "$HOSTS_FILE" 2>/dev/null || true
    # Assure une fin de fichier propre
    printf "\n"
    echo "$(begin_line_for_tag "$tag")"
    echo "127.0.0.1 $d1"
    [[ -n "$d2" ]] && echo "127.0.0.1 $d2"
    echo "$(end_line_for_tag "$tag")"
    printf "\n"
  } > "$tmp"

  write_hosts_file "$tmp"
  rm -f "$tmp"
}

status() {
  profile_info
  echo
  info "Hosts: $HOSTS_FILE"
  echo

  if [[ ! -f "$HOSTS_FILE" ]]; then
    warn "Aucun fichier hosts trouvé."
    return 0
  fi

  # Affiche tous les blocs basewp
  awk '
    index($0, "# basewp:begin basewp:") == 1 { show=1 }
    show==1 { print }
    index($0, "# basewp:end basewp:")   == 1 { show=0 }
  ' "$HOSTS_FILE" || true
}

# --- commands ---------------------------------------------------------------

case "$CMD" in
  status)
    status
    ;;

  add)
    [[ -n "$slug" ]] || die "Aucun projet courant. Fais: make project -> select current (ou --project <slug>)"
    load_env

    local_domain="${SITE_DOMAIN:-}"
    www_domain="${SITE_DOMAIN_WWW:-}"

    [[ -n "$local_domain" ]] || die "SITE_DOMAIN manquant dans l'env ($ENV_FILE)"
    is_local_domain "$local_domain" || { info "Pas un *.local => pas de modification /etc/hosts"; exit 0; }

    safe_slug="$(sanitize_tag_slug "$slug")"
    tag="basewp:${safe_slug}"

    # www: uniquement si *.local
    d2=""
    if [[ -n "${www_domain:-}" ]] && is_local_domain "$www_domain"; then
      d2="$www_domain"
    fi

    info "Ajout /etc/hosts ($tag): $local_domain${d2:+ $d2}"
    hosts_apply_project "$tag" "$local_domain" "$d2"
    ok "Hosts OK."
    ;;

  remove|rm)
    if [[ "$REMOVE_ALL" == "1" ]]; then
      info "Suppression de tous les blocs basewp:* dans /etc/hosts"
      hosts_remove_all_basewp_blocks
      ok "Hosts nettoyés (all)."
      exit 0
    fi

    [[ -n "$slug" ]] || die "Aucun projet courant. Utilise --project <slug> ou --all"

    safe_slug="$(sanitize_tag_slug "$slug")"
    tag="basewp:${safe_slug}"
    info "Suppression bloc /etc/hosts ($tag)"
    hosts_remove_block_by_tag "$tag"
    ok "Hosts nettoyé."
    ;;

  *)
    usage
    exit 1
    ;;
esac