#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

WPCLI_SVC="${WPCLI_SVC:-wpcli}"
wp() { dc run --rm "$WPCLI_SVC" "$@"; }

need_jq() { command -v jq >/dev/null 2>&1 || die "jq requis (brew install jq)"; }

meta_get() {
  local meta="$1" key="$2"
  jq -r "$key // empty" "$meta"
}

is_placeholder_secret() {
  local v="${1:-}"
  [[ -z "$v" ]] && return 0
  [[ "$v" == "CHANGE_ME_STRONG"* ]] && return 0
  [[ "$v" == "CHANGE_ME"* ]] && return 0
  return 1
}

select_project() {
  local items ref cur
  cur="$(get_current_project)"

  # Non-interactif / zéro-prompt: on utilise le projet courant (ou PROJECT_SLUG)
  if [[ "${BASEWP_NO_PROMPT:-0}" == "1" || ! -t 0 || ! -t 1 ]]; then
    [[ -n "$cur" ]] || die "Aucun projet courant. Définis PROJECT_SLUG=<ref> ou sélectionne un projet via: make project"
    ref="$cur"
    set_current_project "$ref"
    ok "Projet courant: $ref"
    init_context
    return 0
  fi

  need_fzf

  items="$("$SCRIPT_DIR/project-manager.sh" list 2>/dev/null || true)"
  [[ -n "$items" ]] || die "Aucun projet dans projects/. Crée-en un via: make project → create"

  if [[ -n "$cur" ]]; then
    ref="$(printf "%s\n%s\n" "$cur" "$items" | awk '!seen[$0]++' | pick "Projet à installer")"
  else
    ref="$(printf "%s\n" "$items" | pick "Projet à installer")"
  fi

  [[ -n "$ref" ]] || die "Aucun projet sélectionné."
  set_current_project "$ref"
  ok "Projet sélectionné: $ref"

  # Recalcule ENV_FILE / COMPOSE_FILES selon projet + ENV_NAME (dev/prod)
  init_context
}

install_from_meta() {
  need_jq
  select_project
  load_env
  profile_info
  echo

  local ref proj_dir meta
  ref="$(get_current_project)"
  proj_dir="$ROOT_DIR/projects/$ref"
  meta="$proj_dir/meta.json"
  [[ -f "$meta" ]] || die "meta.json introuvable: $meta"

  # ---- PROD guard (optionnel en dev)
  if [[ "${ENV_NAME:-}" == "prod" ]]; then
    # 0 prompt si BASEWP_NO_PROMPT=1
    if [[ "${BASEWP_NO_PROMPT:-0}" != "1" ]]; then
      warn "ENV_NAME=prod — opération sensible"
      confirm "Confirmer installation WP en prod ?" || { echo "⏭️ Annulé."; return 0; }
    fi

    if is_placeholder_secret "${WP_ADMIN_PASSWORD:-}"; then
      die "WP_ADMIN_PASSWORD est manquant/placeholder. Renseigne-le dans: $ENV_FILE"
    fi
    # (optionnel) garde-fou DB
    if is_placeholder_secret "${DB_PASSWORD:-}"; then
      warn "DB_PASSWORD semble placeholder (ENV_FILE=$ENV_FILE)."
    fi
    if is_placeholder_secret "${DB_ROOT_PASSWORD:-}"; then
      warn "DB_ROOT_PASSWORD semble placeholder (ENV_FILE=$ENV_FILE)."
    fi
  fi

  if wp core is-installed --quiet >/dev/null 2>&1; then
    warn "WordPress déjà installé (env: ${ENV_NAME:-default}, projet: $ref)."
    return 0
  fi

  # ---- META (non sensible)
  local site_name locale admin_user admin_email
  site_name="$(meta_get "$meta" '.site.name')"
  locale="$(meta_get "$meta" '.wp.locale')"

  # tes clés meta.json actuelles => wp.admin_user / wp.admin_email
  admin_user="$(meta_get "$meta" '.wp.admin_user')"
  admin_email="$(meta_get "$meta" '.wp.admin_email')"

  [[ -n "$site_name" ]] || site_name="${WP_TITLE:-Base WP}"
  [[ -n "$locale" ]] || locale="${WP_LOCALE:-fr_FR}"
  [[ -n "$admin_user" ]] || admin_user="${WP_ADMIN_USER:-admin}"

  # ---- ENV (sensible + URL)
  local url url_domain admin_password
  url="${WP_SITE_URL:-}"
  if [[ -z "$url" ]]; then
    # fallback (dev): construit à partir de SITE_DOMAIN
    if [[ -n "${SITE_DOMAIN:-}" ]]; then
      url="https://${SITE_DOMAIN}"
    else
      url="http://localhost"
    fi
  fi

  # domaine pour email default si besoin
  url_domain="$url"
  url_domain="${url_domain#http://}"
  url_domain="${url_domain#https://}"
  url_domain="${url_domain%%/*}"

  [[ -n "$admin_email" ]] || admin_email="${WP_ADMIN_EMAIL:-admin@${url_domain}}"

  # Password admin UNIQUEMENT depuis env (jamais depuis meta.json)
  admin_password="${WP_ADMIN_PASSWORD:-}"
  if is_placeholder_secret "$admin_password"; then
    die "WP_ADMIN_PASSWORD est manquant/placeholder. Mets-le dans: $ENV_FILE"
  fi

  info "Env utilisé: $ENV_FILE"
  info "Install WP via meta.json + env"
  info "  URL:    $url"
  info "  Title:  $site_name"
  info "  Admin:  $admin_user"
  info "  Email:  $admin_email"
  info "  Locale: $locale"
  echo

  wp core install \
    --url="$url" \
    --title="$site_name" \
    --admin_user="$admin_user" \
    --admin_password="$admin_password" \
    --admin_email="$admin_email" \
    --skip-email

  if [[ -n "$locale" && "$locale" != "en_US" ]]; then
    info "Langue: $locale"
    wp language core install "$locale" >/dev/null 2>&1 || true
    wp site switch-language "$locale" >/dev/null 2>&1 || true
  fi

  ok "Installation terminée."
}

install_from_meta