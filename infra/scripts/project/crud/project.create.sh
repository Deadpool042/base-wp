  #!/usr/bin/env bash
set -euo pipefail

# Toujours partir du fichier actuel (crud/*)
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$THIS_DIR/.." && pwd)"  # infra/scripts/project

# shellcheck source=/dev/null
source "$PROJECT_DIR/project.context.sh"

# shared
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/ui.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/fs.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/strings.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/validate.sh"

# project modules (chemins absolus => zero surprise)
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.meta.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.env.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.hosts.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.certs.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.list.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.prompts.sh"

project_crud_create() {
  project_need_jq
  # → tu peux soit réutiliser ton wizard “étapes”, soit la version payload
  # Le plus clean : réutiliser ton wizard/payload qui renvoie key=value.
  local payload
  payload="$(project_prompt_create_payload || true)"
  [[ -n "${payload:-}" ]] || return 0

  # parse key=value
  local client_name site_name ref slug local_domain prod_domain prod_www email locale
  local wp_admin_user wp_admin_email dev_pw prod_pw prod_db prod_db_root

  # shellcheck disable=SC2162
  while IFS='=' read -r k v; do
    v="$(str_strip_newlines "$(str_trim "${v:-}")")"
    case "$k" in
      client_name) client_name="$v" ;;
      site_name) site_name="$v" ;;
      ref) ref="$v" ;;
      slug) slug="$v" ;;
      local_domain) local_domain="$v" ;;
      prod_domain) prod_domain="$v" ;;
      prod_www) prod_www="$v" ;;
      email) email="$v" ;;
      locale) locale="$v" ;;
      wp_admin_user) wp_admin_user="$v" ;;
      wp_admin_email) wp_admin_email="$v" ;;
      dev_pw) dev_pw="$v" ;;
      prod_pw) prod_pw="$v" ;;
      prod_db) prod_db="$v" ;;
      prod_db_root) prod_db_root="$v" ;;
    esac
  done <<< "$payload"

  ref="$(project_ref_normalize_nested "$ref")"
  slug="$(str_slugify "$slug")"

  local proj_dir
  proj_dir="$(project_ref_to_dir "$ref")"
  [[ ! -d "$proj_dir" ]] || die "Le projet existe déjà: $ref"

  fs_mkdir "$proj_dir"
  fs_mkdir "$proj_dir/env"

  jq -n \
    --arg client_name "$client_name" \
    --arg site_name "$site_name" \
    --arg client_slug "${ref%%/*}" \
    --arg site_slug "${ref#*/}" \
    --arg slug "$slug" \
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

  project_write_env_dev  "$proj_dir" "$ref" "$slug" "$local_domain" "$locale" "$dev_pw"
  project_write_env_prod "$proj_dir" "$ref" "$slug" "$prod_domain" "$prod_www" "$email" "$locale" "$prod_pw" "$prod_db" "$prod_db_root"

  project_hosts_apply "$slug" "$local_domain" "www.${local_domain}"
  project_ensure_local_certs "$proj_dir"

  ctx_set_current_project_ref "$ref"
  ok "Projet créé: $ref"
  ui_ok
}