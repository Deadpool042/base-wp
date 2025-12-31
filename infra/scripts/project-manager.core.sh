#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC2034
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

# ------------------------------------------------------------------------------
# BaseWP — Project Manager (CORE / business)
# - AUCUN I/O ici (pas de read/select/fzf direct)
# - CRUD projets + meta/env/hosts/certs
# - Toute UI/prompt doit être dans project-manager.prompts.sh (ou le wrapper)
# ------------------------------------------------------------------------------

PROJECTS_DIR="${PROJECTS_DIR:-$ROOT_DIR/projects}"
HOSTS_FILE="${HOSTS_FILE:-/etc/hosts}"
STACK_PREFIX_DEFAULT="${STACK_PREFIX_DEFAULT:-basewp}"

# ------------------------------------------------------------------------------
# Dépendances attendues (injectées par _lib.sh) :
# - die/info/ok/warn
# - env_get
# - dc (si utilisé dans delete)
# - get_current_project / set_current_project
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Sync helpers
# ------------------------------------------------------------------------------

: <<'DOC'
pm_sync_after_change

Résumé :
Synchronise env + /etc/hosts + certificats locaux après une modification du meta d'un projet.

Arguments :
$1: proj_dir (chemin absolu du répertoire du projet)
$2: project_ref (référence du projet relative sous projects/, ex: client/site)

Retour :
aucun

Effets de bord :
- Régénère $proj_dir/env/.env.dev et $proj_dir/env/.env.prod
- Modifie /etc/hosts (via sudo) pour le domaine .local
- Crée/assure les certificats mkcert dans $COMPOSE_DIR/traefik/certs

Exemple :
pm_sync_after_change "/path/projects/client/site" "client/site"
DOC
pm_sync_after_change() {
  local proj_dir="${1:-}"
  local project_ref="${2:-}"
  [[ -n "$proj_dir" && -n "$project_ref" ]] || die "pm_sync_after_change: usage: <proj_dir> <project_ref>"

  local meta="$proj_dir/meta.json"
  pm_regen_envs_from_meta "$proj_dir" "$project_ref"

  local p_slug local_domain
  p_slug="$(pm_project_slug_from_meta "$meta")"
  local_domain="$(pm_meta_get "$meta" '.domains.local')"
  [[ -n "$local_domain" ]] || local_domain="${p_slug}.local"

  pm_hosts_apply_project "$p_slug" "$local_domain" "www.${local_domain}"
  pm_ensure_local_certs_from_meta "$proj_dir"
}

# ------------------------------------------------------------------------------
# Deps
# ------------------------------------------------------------------------------

: <<'DOC'
pm_need_jq

Résumé :
Vérifie la présence de jq (requis pour lire/écrire meta.json).

Arguments :
aucun

Retour :
aucun

Effets de bord :
Quitte le script via die() si jq est absent.
DOC
pm_need_jq() {
  command -v jq >/dev/null 2>&1 || die "jq est requis. macOS: brew install jq"
}

: <<'DOC'
pm_need_mkcert

Résumé :
Vérifie la présence de mkcert (pour les certs locaux .local).

Arguments :
aucun

Retour :
aucun

Effets de bord :
Quitte le script via die() si mkcert est absent.
DOC
pm_need_mkcert() {
  command -v mkcert >/dev/null 2>&1 || die "mkcert manquant. macOS: brew install mkcert && mkcert -install"
}

: <<'DOC'
pm_ensure_projects_dir

Résumé :
Crée le répertoire des projets s'il n'existe pas.

Arguments :
aucun

Retour :
aucun

Effets de bord :
Crée le dossier PROJECTS_DIR (mkdir -p).
DOC
pm_ensure_projects_dir() { mkdir -p "$PROJECTS_DIR"; }

# ------------------------------------------------------------------------------
# Utils
# ------------------------------------------------------------------------------

: <<'DOC'
pm_is_fqdn

Résumé :
Vérifie si une chaîne ressemble à un nom de domaine (très simple).

Arguments :
$1: domaine à vérifier

Retour :
0 si OK, 1 sinon
DOC
pm_is_fqdn() {
  local d="${1:-}"
  [[ -n "$d" ]] || return 1
  [[ "$d" == *.* ]] || return 1
  [[ "$d" != *" "* ]] || return 1
  [[ "$d" != */* ]] || return 1
  return 0
}

: <<'DOC'
pm_is_local_domain

Résumé :
Vérifie si le domaine se termine par .local

Arguments :
$1: domaine à vérifier

Retour :
0 si *.local, 1 sinon
DOC
pm_is_local_domain() {
  local d="${1:-}"
  [[ -n "$d" && "$d" == *.local ]]
}

: <<'DOC'
pm_slugify

Résumé :
Transforme une chaîne en slug (minuscules, tirets, chars sûrs).

Arguments :
$1: texte d'entrée

Retour :
slug sur stdout
DOC
pm_slugify() {
  local s="${1:-}"
  s="$(printf "%s" "$s" | tr '[:upper:]' '[:lower:]')"
  s="$(printf "%s" "$s" | sed -E 's/[ _]+/-/g; s/[^a-z0-9-]+/-/g; s/-+/-/g; s/^-|-$//g')"
  printf "%s" "$s"
}

# ------------------------------------------------------------------------------
# Project list
# ------------------------------------------------------------------------------

: <<'DOC'
pm_list_projects

Résumé :
Liste les projets disponibles sous PROJECTS_DIR.

Arguments :
aucun

Retour :
Une ref par ligne :
- legacy : "slug"
- nested : "client/site"

Effets de bord :
Crée PROJECTS_DIR si nécessaire.
DOC
pm_list_projects() {
  pm_ensure_projects_dir

  local p c s

  # legacy flat: projects/<slug>/meta.json
  for p in "$PROJECTS_DIR"/*; do
    [[ -d "$p" ]] || continue
    [[ -f "$p/meta.json" ]] || continue
    basename "$p"
  done

  # nested: projects/<client>/<site>/meta.json
  for c in "$PROJECTS_DIR"/*; do
    [[ -d "$c" ]] || continue
    [[ -f "$c/meta.json" ]] && continue
    for s in "$c"/*; do
      [[ -d "$s" ]] || continue
      [[ -f "$s/meta.json" ]] || continue
      echo "$(basename "$c")/$(basename "$s")"
    done
  done
}

# ------------------------------------------------------------------------------
# Paths / meta
# ------------------------------------------------------------------------------

: <<'DOC'
pm_project_ref_to_dir

Résumé :
Convertit une ref projet (client/site) en chemin absolu.

Arguments :
$1: project_ref

Retour :
chemin absolu sur stdout
DOC
pm_project_ref_to_dir() {
  local ref="${1:-}"
  [[ -n "$ref" ]] || { echo ""; return 0; }
  echo "$PROJECTS_DIR/$ref"
}

pm_project_meta_file() { echo "$(pm_project_ref_to_dir "${1:-}")/meta.json"; }

: <<'DOC'
pm_meta_get

Résumé :
Lit une valeur depuis meta.json via jq.

Arguments :
$1: chemin meta.json
$2: clé jq (ex: .slug)

Retour :
valeur (stdout) ou vide
DOC
pm_meta_get() {
  pm_need_jq
  local file="${1:-}"
  local key="${2:-}"
  [[ -n "$file" && -n "$key" ]] || die "pm_meta_get: usage: pm_meta_get <file> <jq_key>"
  jq -r "$key // empty" "$file"
}

: <<'DOC'
pm_meta_set

Résumé :
Écrit une valeur dans meta.json via jq.

Arguments :
$1: chemin meta.json
$2: clé jq (ex: .slug)
$3: valeur

Retour :
aucun

Effets de bord :
Modifie le fichier meta.json.
DOC
pm_meta_set() {
  pm_need_jq
  local file="${1:-}"
  local key="${2:-}"
  local value="${3-}" # volontaire: peut être vide
  [[ -n "$file" && -n "$key" ]] || die "pm_meta_set: usage: pm_meta_set <file> <jq_key> <value>"
  local tmp
  tmp="$(mktemp)"
  jq --arg v "$value" "$key = \$v" "$file" > "$tmp"
  mv "$tmp" "$file"
}

: <<'DOC'
pm_project_slug_from_meta

Résumé :
Retourne .slug depuis meta.json ou construit un slug fallback basé sur le chemin.

Arguments :
$1: chemin meta.json

Retour :
slug sur stdout
DOC
pm_project_slug_from_meta() {
  local meta="${1:-}"
  [[ -n "$meta" ]] || die "pm_project_slug_from_meta: meta manquant"

  local s
  s="$(pm_meta_get "$meta" '.slug')"
  if [[ -n "$s" && "$s" != "null" ]]; then
    echo "$s"
    return 0
  fi

  local dir
  dir="$(dirname "$meta")"
  dir="${dir#"$PROJECTS_DIR/"}"
  echo "${dir//\//--}"
}

# ------------------------------------------------------------------------------
# Hosts
# ------------------------------------------------------------------------------

pm_hosts_tag() { echo "basewp:${1:-}"; }

pm_hosts_remove_project() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || die "pm_hosts_remove_project: slug manquant"

  local tag
  tag="$(pm_hosts_tag "$slug")"
  [[ -f "$HOSTS_FILE" ]] || return 0

  sudo awk -v tag="$tag" '
    $0 == "# basewp:begin " tag {inside=1; next}
    $0 == "# basewp:end "   tag {inside=0; next}
    inside!=1 {print}
  ' "$HOSTS_FILE" > "/tmp/hosts.$$" \
    && sudo cp "/tmp/hosts.$$" "$HOSTS_FILE" \
    && rm -f "/tmp/hosts.$$"
}

pm_hosts_apply_project() {
  local slug="${1:-}"
  local local_domain="${2:-}"
  local www_domain="${3:-}"
  [[ -n "$slug" && -n "$local_domain" ]] || die "pm_hosts_apply_project: usage: <slug> <local_domain> [www_domain]"

  pm_is_local_domain "$local_domain" || { info "Domaine non *.local => pas de /etc/hosts ($local_domain)"; return 0; }

  pm_hosts_remove_project "$slug"

  local tag
  local lines=()
  tag="$(pm_hosts_tag "$slug")"

  lines+=("# basewp:begin $tag")
  lines+=("127.0.0.1 ${local_domain}")
  [[ -n "$www_domain" ]] && lines+=("127.0.0.1 ${www_domain}")
  lines+=("# basewp:end $tag")

  printf "%s\n" "${lines[@]}" | sudo tee -a "$HOSTS_FILE" >/dev/null
}
# ==============================================================================
# Env generation
# ==============================================================================

pm_stack_name() { echo "${1}__${2}__${3}"; }

pm_write_env_dev() {
  local proj_dir="$1" project_ref="$2" project_slug="$3" local_domain="$4"
  local locale="${5:-fr_FR}" wp_admin_password="${6:-admin}"

  local stack_prefix="${STACK_PREFIX:-$STACK_PREFIX_DEFAULT}"
  local stack
  stack="$(pm_stack_name "$stack_prefix" "$project_slug" "dev")"

  mkdir -p "$proj_dir/env"
  cat > "$proj_dir/env/.env.dev" <<EOF
# AUTO-GENERATED (project-manager) — DEV
PROFILE=ovh-vps
TZ=Europe/Paris

STACK_PREFIX=${stack_prefix}
PROJECT_REF=${project_ref}
PROJECT_SLUG=${project_slug}
STACK_ENV=dev
STACK_NAME=${stack}
COMPOSE_PROJECT_NAME=${stack}

SITE_DOMAIN=${local_domain}
SITE_DOMAIN_WWW=www.${local_domain}
TRAEFIK_EMAIL=dev@local.test

WP_SITE_URL=https://${local_domain}
WP_LOCALE=${locale}
WP_TABLE_PREFIX=wp_
WP_ADMIN_PASSWORD=${wp_admin_password}

WP_DEBUG=1
WP_DEBUG_LOG=1
WP_DEBUG_DISPLAY=0

DB_IMAGE=mysql:8.0
DB_HOST=db
DB_NAME=wordpress
DB_USER=wp
DB_PASSWORD=wp
DB_ROOT_PASSWORD=root

TRAEFIK_TLS_RESOLVER=
EOF
}


pm_write_env_prod() {
  local proj_dir="$1" project_ref="$2" project_slug="$3" prod_domain="$4"
  local prod_www="$5" email="$6" locale="${7:-fr_FR}"
  local wp_admin_password="${8:-CHANGE_ME_STRONG}"
  local db_password="${9:-CHANGE_ME_STRONG_DB}"
  local db_root_password="${10:-CHANGE_ME_STRONG_ROOT}"

  local stack_prefix="${STACK_PREFIX:-$STACK_PREFIX_DEFAULT}"
  local stack
  stack="$(pm_stack_name "$stack_prefix" "$project_slug" "prod")"

  mkdir -p "$proj_dir/env"
  cat > "$proj_dir/env/.env.prod" <<EOF
# AUTO-GENERATED (project-manager) — PROD
PROFILE=ovh-vps
TZ=Europe/Paris

STACK_PREFIX=${stack_prefix}
PROJECT_REF=${project_ref}
PROJECT_SLUG=${project_slug}
STACK_ENV=prod
STACK_NAME=${stack}
COMPOSE_PROJECT_NAME=${stack}

SITE_DOMAIN=${prod_domain}
SITE_DOMAIN_WWW=${prod_www}
TRAEFIK_EMAIL=${email}

WP_SITE_URL=https://${prod_domain}
WP_LOCALE=${locale}
WP_TABLE_PREFIX=wp_
WP_ADMIN_PASSWORD=${wp_admin_password}

WP_DEBUG=0
WP_DEBUG_LOG=0
WP_DEBUG_DISPLAY=0

DB_IMAGE=mysql:8.0
DB_HOST=db
DB_NAME=wordpress
DB_USER=wp
DB_PASSWORD=${db_password}
DB_ROOT_PASSWORD=${db_root_password}

TRAEFIK_TLS_RESOLVER=letsencrypt
EOF
}


pm_regen_envs_from_meta() {
  pm_need_jq
  local proj_dir="$1" project_ref="$2" meta="$proj_dir/meta.json"

  local project_slug local_domain prod_domain prod_www email locale
  project_slug="$(pm_project_slug_from_meta "$meta")"
  local_domain="$(pm_meta_get "$meta" '.domains.local')"
  prod_domain="$(pm_meta_get "$meta" '.domains.prod')"
  prod_www="$(pm_meta_get "$meta" '.domains.prod_www')"
  email="$(pm_meta_get "$meta" '.traefik.email')"
  locale="$(pm_meta_get "$meta" '.wp.locale')"

  [[ -n "$local_domain" ]] || local_domain="${project_slug}.local"
  [[ -n "$prod_domain" ]] || prod_domain="example.com"
  [[ -n "$prod_www" ]] || prod_www="www.${prod_domain}"
  [[ -n "$email" ]] || email="admin@${prod_domain}"
  [[ -n "$locale" ]] || locale="fr_FR"

  local dev_pw prod_pw prod_db prod_db_root
  dev_pw="$(env_get "WP_ADMIN_PASSWORD" "$proj_dir/env/.env.dev")"
  prod_pw="$(env_get "WP_ADMIN_PASSWORD" "$proj_dir/env/.env.prod")"
  prod_db="$(env_get "DB_PASSWORD" "$proj_dir/env/.env.prod")"
  prod_db_root="$(env_get "DB_ROOT_PASSWORD" "$proj_dir/env/.env.prod")"

  [[ -n "$dev_pw" ]] || dev_pw="admin"
  [[ -n "$prod_pw" ]] || prod_pw="CHANGE_ME_STRONG"
  [[ -n "$prod_db" ]] || prod_db="CHANGE_ME_STRONG_DB"
  [[ -n "$prod_db_root" ]] || prod_db_root="CHANGE_ME_STRONG_ROOT"

  pm_write_env_dev  "$proj_dir" "$project_ref" "$project_slug" "$local_domain" "$locale" "$dev_pw"
  pm_write_env_prod "$proj_dir" "$project_ref" "$project_slug" "$prod_domain" "$prod_www" "$email" "$locale" "$prod_pw" "$prod_db" "$prod_db_root"
}

# ==============================================================================
# Certs
# ==============================================================================


pm_clean_local_certs_from_meta() {
  pm_need_jq
  local proj_dir="$1" meta="$proj_dir/meta.json"

  local local_domain
  local_domain="$(pm_meta_get "$meta" '.domains.local')"
  [[ -n "$local_domain" ]] || return 0
  pm_is_local_domain "$local_domain" || return 0

  local certs_dir="$COMPOSE_DIR/traefik/certs"
  rm -f "$certs_dir/${local_domain}.pem" "$certs_dir/${local_domain}-key.pem" || true
}


pm_ensure_local_certs_from_meta() {
  pm_need_jq
  pm_need_mkcert
  local proj_dir="$1" meta="$proj_dir/meta.json"

  local local_domain www_domain
  local_domain="$(pm_meta_get "$meta" '.domains.local')"
  [[ -n "$local_domain" ]] || local_domain="$(basename "$proj_dir").local"
  www_domain="www.${local_domain}"

  pm_is_local_domain "$local_domain" || {
    info "Domaine local non *.local => pas de mkcert ($local_domain)"
    return 0
  }

  local certs_dir="$COMPOSE_DIR/traefik/certs"
  mkdir -p "$certs_dir"

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

# ==============================================================================
# CRUD
# ==============================================================================


pm_create_project() {
  pm_need_jq
  pm_ensure_projects_dir

  local client site client_slug site_slug project_ref project_slug
  local local_domain prod_domain prod_tld prod_www email locale
  local wp_admin_user wp_admin_email
  local dev_admin_password prod_admin_password
  local prod_db_password prod_db_root_password

  client="$(pm_prompt_value "Nom du client" "")"
  site="$(pm_prompt_value "Nom du site" "")"

  client_slug="$(pm_slugify "$client")"
  site_slug="$(pm_slugify "$site")"
  [[ -n "$client_slug" ]] || die "client vide"
  [[ -n "$site_slug" ]] || die "site vide"

  project_ref="${client_slug}/${site_slug}"
  project_ref="$(pm_prompt_value "Chemin projet (client/site)" "$project_ref")"

  if [[ "$project_ref" == */* ]]; then
    local a b
    a="$(pm_slugify "${project_ref%%/*}")"
    b="$(pm_slugify "${project_ref#*/}")"
    project_ref="${a}/${b}"
    client_slug="$a"
    site_slug="$b"
  else
    project_ref="$(pm_slugify "$project_ref")"
    site_slug="$project_ref"
  fi

  project_slug="$(pm_prompt_value "Slug unique (hosts/meta)" "${client_slug}-${site_slug}")"
  project_slug="$(pm_slugify "$project_slug")"
  [[ -n "$project_slug" ]] || die "slug vide"

  local proj_dir
  proj_dir="$(pm_project_ref_to_dir "$project_ref")"
  [[ ! -d "$proj_dir" ]] || die "Le projet existe déjà: $project_ref"

  local_domain="$(pm_prompt_value "Domaine local (*.local)" "${project_slug}.local")"

  prod_domain="$(pm_prompt_prod_domain "")"
  if [[ -z "$prod_domain" ]]; then
    prod_tld="$(pm_prompt_value "TLD prod par défaut" "fr")"
    prod_tld="${prod_tld#.}"
    prod_domain="${site_slug}.${prod_tld}"
    info "Domaine prod auto: $prod_domain"
  fi

  prod_www="www.${prod_domain}"
  email="$(pm_prompt_value "Email Traefik/Let’s Encrypt" "admin@${prod_domain}")"
  locale="$(pm_choose_locale "fr_FR")"

  wp_admin_user="$(pm_prompt_value "WP admin user (meta)" "admin")"
  wp_admin_email="$(pm_prompt_value "WP admin email (meta)" "admin@${prod_domain}")"

  dev_admin_password="$(pm_prompt_value "WP_ADMIN_PASSWORD (dev env)" "admin")"
  prod_admin_password="$(pm_prompt_value "WP_ADMIN_PASSWORD (prod env)" "CHANGE_ME_STRONG")"
  prod_db_password="$(pm_prompt_value "DB_PASSWORD (prod env)" "CHANGE_ME_STRONG_DB")"
  prod_db_root_password="$(pm_prompt_value "DB_ROOT_PASSWORD (prod env)" "CHANGE_ME_STRONG_ROOT")"

  mkdir -p "$proj_dir"

  jq -n \
    --arg client_name "$client" \
    --arg site_name "$site" \
    --arg client_slug "$client_slug" \
    --arg site_slug "$site_slug" \
    --arg slug "$project_slug" \
    --arg local_domain "$local_domain" \
    --arg prod_domain "$prod_domain" \
    --arg prod_www "$prod_www" \
    --arg email "$email" \
    --arg locale "$locale" \
    --arg admin_user "$wp_admin_user" \
    --arg admin_email "$wp_admin_email" \
    '{
      client: { name: $client_name, slug: $client_slug },
      site:   { name: $site_name,   slug: $site_slug },
      slug: $slug,
      domains: { local: $local_domain, prod: $prod_domain, prod_www: $prod_www },
      traefik: { email: $email },
      wp: { locale: $locale, admin_user: $admin_user, admin_email: $admin_email }
    }' > "$proj_dir/meta.json"

  mkdir -p "$proj_dir/env"
  pm_write_env_dev  "$proj_dir" "$project_ref" "$project_slug" "$local_domain" "$locale" "$dev_admin_password"
  pm_write_env_prod "$proj_dir" "$project_ref" "$project_slug" "$prod_domain" "$prod_www" "$email" "$locale" "$prod_admin_password" "$prod_db_password" "$prod_db_root_password"

  pm_hosts_apply_project "$project_slug" "$local_domain" "www.${local_domain}"
  pm_ensure_local_certs_from_meta "$proj_dir"

  set_current_project "$project_ref"
  ok "Projet créé: $project_ref"
}

# ==============================================================================
# EDIT
# ==============================================================================


pm_edit_project() {
  pm_need_jq
  need_fzf

  local ref proj_dir meta
  ref="$(pm_pick_project)"
  [[ -n "$ref" ]] || return 0

  proj_dir="$(pm_project_ref_to_dir "$ref")"
  meta="$(pm_project_meta_file "$ref")"
  [[ -f "$meta" ]] || die "meta.json manquant: $meta"

  local actions choice
  actions=$(
    cat <<'EOF'
Edit client name
Edit site name
Edit slug (rename project folder)
Edit local domain (.local)
Edit prod domain
Edit WP locale
Sync hosts from meta
Regen env files from meta
Ensure local certs (mkcert)
Open project folder
EOF
  )

  choice="$(printf "%s\n" "$actions" | pick "Edit project")"
  [[ -n "$choice" ]] || return 0

  local p_slug
  p_slug="$(pm_project_slug_from_meta "$meta")"

  case "$choice" in
    "Edit client name")
      local v
      v="$(pm_prompt_value "Client name" "$(pm_meta_get "$meta" '.client.name')")"
      [[ -n "$v" ]] && pm_meta_set "$meta" '.client.name' "$v"
      pm_sync_after_change "$proj_dir" "$ref"
      ;;

    "Edit site name")
      local v
      v="$(pm_prompt_value "Site name" "$(pm_meta_get "$meta" '.site.name')")"
      [[ -n "$v" ]] && pm_meta_set "$meta" '.site.name' "$v"
      pm_sync_after_change "$proj_dir" "$ref"
      ;;

    "Edit slug (rename project folder)")
      if [[ "$ref" == */* ]]; then
        warn "Renommer le slug supporté uniquement pour legacy root (pas pour $ref)."
        return 0
      fi

      warn "Renommer le slug renomme le dossier + impacte /etc/hosts."
      local new_slug cur_local old_ref
      old_ref="$ref"

      new_slug="$(pm_prompt_value "New slug (ex: dupont-beer)" "$ref")"
      new_slug="$(pm_slugify "$new_slug")"
      [[ -n "$new_slug" ]] || return 0

      [[ -d "$PROJECTS_DIR/$new_slug" ]] && die "Le slug existe déjà: $new_slug"

      pm_hosts_remove_project "$p_slug"

      mv "$proj_dir" "$PROJECTS_DIR/$new_slug"
      ref="$new_slug"
      proj_dir="$PROJECTS_DIR/$ref"
      meta="$proj_dir/meta.json"

      pm_meta_set "$meta" '.slug' "$new_slug"

      cur_local="$(pm_meta_get "$meta" '.domains.local')"
      [[ -n "$cur_local" ]] || pm_meta_set "$meta" '.domains.local' "${new_slug}.local"

      if [[ "$(get_current_project)" == "$old_ref" ]]; then
        set_current_project "$ref"
      fi

      pm_sync_after_change "$proj_dir" "$ref"
      ok "Slug renommé: $ref"
      ;;

    "Edit local domain (.local)")
      local v
      v="$(pm_prompt_value "Local domain" "$(pm_meta_get "$meta" '.domains.local')")"
      [[ -n "$v" ]] && pm_meta_set "$meta" '.domains.local' "$v"
      pm_sync_after_change "$proj_dir" "$ref"
      ;;

    "Edit prod domain")
      local d e
      d="$(pm_prompt_prod_domain "$(pm_meta_get "$meta" '.domains.prod')")"
      pm_meta_set "$meta" '.domains.prod' "$d"

      if [[ -n "$d" ]]; then
        pm_meta_set "$meta" '.domains.prod_www' "www.${d}"
        e="$(pm_prompt_value "Traefik email" "$(pm_meta_get "$meta" '.traefik.email')")"
        [[ -n "$e" ]] || e="admin@${d}"
        pm_meta_set "$meta" '.traefik.email' "$e"
      else
        pm_meta_set "$meta" '.domains.prod_www' ""
        pm_meta_set "$meta" '.traefik.email' "dev@local.test"
      fi

      pm_sync_after_change "$proj_dir" "$ref"
      ;;

    "Edit WP locale")
      local loc
      loc="$(pm_choose_locale "$(pm_meta_get "$meta" '.wp.locale')")"
      [[ -n "$loc" ]] && pm_meta_set "$meta" '.wp.locale' "$loc"
      pm_sync_after_change "$proj_dir" "$ref"
      ;;

    "Sync hosts from meta")
      local local_domain
      local_domain="$(pm_meta_get "$meta" '.domains.local')"
      [[ -n "$local_domain" ]] || local_domain="${p_slug}.local"
      pm_hosts_apply_project "$p_slug" "$local_domain" "www.${local_domain}"
      ok "/etc/hosts mis à jour pour $local_domain"
      return 0
      ;;

    "Regen env files from meta")
      pm_regen_envs_from_meta "$proj_dir" "$ref"
      ok "env régénérés."
      return 0
      ;;

    "Ensure local certs (mkcert)")
      pm_ensure_local_certs_from_meta "$proj_dir"
      return 0
      ;;

    "Open project folder")
      if command -v code >/dev/null 2>&1; then
        code "$proj_dir"
      elif command -v open >/dev/null 2>&1; then
        open "$proj_dir"
      else
        echo "$proj_dir"
      fi
      return 0
      ;;

    *)
      return 0
      ;;
  esac

  ok "Edit terminé."
}

# ==============================================================================
# DELETE
# ==============================================================================

pm_delete_project() {
  local ref="${1:-}"
  [[ -n "$ref" ]] || ref="$(pm_pick_project)"
  [[ -n "$ref" ]] || { info "Annulé."; return 0; }

  local proj_dir meta p_slug
  proj_dir="$(pm_project_ref_to_dir "$ref")"
  [[ -d "$proj_dir" ]] || die "Projet introuvable: $proj_dir"

  meta="$(pm_project_meta_file "$ref")"
  [[ -f "$meta" ]] || die "meta.json introuvable: $meta"

  p_slug="$(pm_project_slug_from_meta "$meta")"

  warn "Suppression projet: $ref"
  echo "   Dossier: $proj_dir"

  if ! confirm "Confirmer suppression (hosts + dossier) ?"; then
    info "Annulé."
    return 0
  fi

  set_current_project "$ref"

  info "Stop containers (dc down)…"
  dc down --remove-orphans || true

  info "Nettoyage /etc/hosts…"
  pm_hosts_remove_project "$p_slug" || true

  info "Nettoyage certs…"
  pm_clean_local_certs_from_meta "$proj_dir" || true

  info "Suppression dossier…"
  rm -rf "$proj_dir"

  ok "Projet supprimé: $ref"
}