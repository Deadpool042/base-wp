#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# project/project.env.sh
# Génération env/.env.dev & env/.env.prod + regen depuis meta.
# Zéro variable globale au "source" (compatible set -u).
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# deps
# shellcheck source=/dev/null
source "$SCRIPT_DIR/project.context.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/project.meta.sh"

project_stack_name() {
  printf "%s__%s__%s" "${1:-}" "${2:-}" "${3:-}"
}

project_write_env_dev() {
  local proj_dir="${1:-}"
  local project_ref="${2:-}"
  local project_slug="${3:-}"
  local local_domain="${4:-}"
  local locale="${5:-fr_FR}"
  local wp_admin_password="${6:-admin}"

  project_ref="$(str_strip_newlines "$(str_trim "$project_ref")")"
  project_slug="$(str_strip_newlines "$(str_trim "$project_slug")")"
  local_domain="$(str_strip_newlines "$(str_trim "$local_domain")")"
  locale="$(str_strip_newlines "$(str_trim "$locale")")"
  wp_admin_password="$(str_strip_newlines "$(str_trim "$wp_admin_password")")"

  local prefix stack
  prefix="$(project_stack_prefix)"
  stack="$(project_stack_name "$prefix" "$project_slug" "dev")"

  fs_mkdir "$proj_dir/env"
  cat > "$proj_dir/env/.env.dev" <<EOF
# AUTO-GENERATED (basewp project) — DEV
PROFILE=ovh-vps
TZ=Europe/Paris

STACK_PREFIX=${prefix}
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

project_write_env_prod() {
  local proj_dir="${1:-}"
  local project_ref="${2:-}"
  local project_slug="${3:-}"
  local prod_domain="${4:-}"
  local prod_www="${5:-}"
  local email="${6:-}"
  local locale="${7:-fr_FR}"
  local wp_admin_password="${8:-CHANGE_ME_STRONG}"
  local db_password="${9:-CHANGE_ME_STRONG_DB}"
  local db_root_password="${10:-CHANGE_ME_STRONG_ROOT}"

  project_ref="$(str_strip_newlines "$(str_trim "$project_ref")")"
  project_slug="$(str_strip_newlines "$(str_trim "$project_slug")")"
  prod_domain="$(str_strip_newlines "$(str_trim "$prod_domain")")"
  prod_www="$(str_strip_newlines "$(str_trim "$prod_www")")"
  email="$(str_strip_newlines "$(str_trim "$email")")"
  locale="$(str_strip_newlines "$(str_trim "$locale")")"
  wp_admin_password="$(str_strip_newlines "$(str_trim "$wp_admin_password")")"
  db_password="$(str_strip_newlines "$(str_trim "$db_password")")"
  db_root_password="$(str_strip_newlines "$(str_trim "$db_root_password")")"

  local prefix stack
  prefix="$(project_stack_prefix)"
  stack="$(project_stack_name "$prefix" "$project_slug" "prod")"

  fs_mkdir "$proj_dir/env"
  cat > "$proj_dir/env/.env.prod" <<EOF
# AUTO-GENERATED (basewp project) — PROD
PROFILE=ovh-vps
TZ=Europe/Paris

STACK_PREFIX=${prefix}
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

project_regen_envs_from_meta() {
  project_need_jq

  local proj_dir="${1:-}"
  local project_ref="${2:-}"
  local meta="$proj_dir/meta.json"

  [[ -n "$proj_dir" && -f "$meta" ]] || die "project_regen_envs_from_meta: meta.json manquant: $meta"

  local project_slug local_domain prod_domain prod_www email locale
  project_slug="$(project_slug_from_meta "$meta")"
  local_domain="$(project_meta_get "$meta" '.domains.local')"
  prod_domain="$(project_meta_get "$meta" '.domains.prod')"
  prod_www="$(project_meta_get "$meta" '.domains.prod_www')"
  email="$(project_meta_get "$meta" '.traefik.email')"
  locale="$(project_meta_get "$meta" '.wp.locale')"

  [[ -n "$local_domain" ]] || local_domain="${project_slug}.local"
  [[ -n "$prod_domain" ]]  || prod_domain="example.com"
  [[ -n "$prod_www" ]]     || prod_www="www.${prod_domain}"
  [[ -n "$email" ]]        || email="admin@${prod_domain}"
  [[ -n "$locale" ]]       || locale="fr_FR"

  local dev_pw prod_pw prod_db prod_db_root
  dev_pw="$(env_file_get "WP_ADMIN_PASSWORD" "$proj_dir/env/.env.dev")"
  prod_pw="$(env_file_get "WP_ADMIN_PASSWORD" "$proj_dir/env/.env.prod")"
  prod_db="$(env_file_get "DB_PASSWORD" "$proj_dir/env/.env.prod")"
  prod_db_root="$(env_file_get "DB_ROOT_PASSWORD" "$proj_dir/env/.env.prod")"

  [[ -n "$dev_pw" ]]       || dev_pw="admin"
  [[ -n "$prod_pw" ]]      || prod_pw="CHANGE_ME_STRONG"
  [[ -n "$prod_db" ]]      || prod_db="CHANGE_ME_STRONG_DB"
  [[ -n "$prod_db_root" ]] || prod_db_root="CHANGE_ME_STRONG_ROOT"

  project_write_env_dev  "$proj_dir" "$project_ref" "$project_slug" "$local_domain" "$locale" "$dev_pw"
  project_write_env_prod "$proj_dir" "$project_ref" "$project_slug" "$prod_domain" "$prod_www" "$email" "$locale" "$prod_pw" "$prod_db" "$prod_db_root"
}