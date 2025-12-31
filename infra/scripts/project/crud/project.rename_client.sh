#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_bootstrap.sh"

project_need_jq() {
  command -v jq >/dev/null 2>&1 || die "jq requis. macOS: brew install jq"
}

# Recalcule une slug projet à partir des slugs meta (client/site)
project_compute_project_slug() {
  local client_slug="$1" site_slug="$2"
  printf "%s-%s" "$(str_slugify "$client_slug")" "$(str_slugify "$site_slug")"
}

project_rename_client() {
  project_need_jq

  local ref="${1:-}"
  [[ -n "$ref" ]] || ref="$(project_pick)"
  [[ -n "$ref" ]] || return 0

  [[ "$ref" == */* ]] || die "Ref invalide: $ref (attendu client/site)"

  local old_client="${ref%%/*}"
  local site="${ref#*/}"

  local old_ref="$ref"
  local old_dir; old_dir="$(project_ref_to_dir "$old_ref")"
  local old_meta="$old_dir/meta.json"
  [[ -f "$old_meta" ]] || die "meta.json manquant: $old_meta"

  local old_project_slug old_local_domain
  old_project_slug="$(project_meta_get "$old_meta" '.slug')"
  old_local_domain="$(project_meta_get "$old_meta" '.domains.local')"

  local old_site_slug
  old_site_slug="$(project_meta_get "$old_meta" '.site.slug')"
  [[ -n "$old_site_slug" ]] || old_site_slug="$site"

  local old_client_name
  old_client_name="$(project_meta_get "$old_meta" '.client.name')"
  [[ -n "$old_client_name" ]] || old_client_name="$old_client"

  # --- prompt
  local new_client_name
  new_client_name="$(project_prompt_value "Nouveau nom client" "$old_client_name" "true")"
  new_client_name="$(str_strip_newlines "$(str_trim "$new_client_name")")"
  [[ -n "$new_client_name" ]] || { info "Annulé."; return 0; }

  local new_client_slug
  new_client_slug="$(str_slugify "$new_client_name")"
  [[ -n "$new_client_slug" ]] || die "Slug client invalide."

  # new ref
  local new_ref="${new_client_slug}/${site}"
  local new_dir; new_dir="$(project_ref_to_dir "$new_ref")"
  [[ ! -d "$new_dir" ]] || die "Le projet cible existe déjà: $new_ref"

  # --- compute new derived values
  local new_project_slug
  new_project_slug="$(project_compute_project_slug "$new_client_slug" "$old_site_slug")"

  local new_local_domain="${new_project_slug}.local"

  # --- confirm
  echo
  info "Rename client:"
  info "  Ref:  $old_ref  ->  $new_ref"
  info "  Slug: $old_project_slug -> $new_project_slug"
  info "  Local: $old_local_domain -> $new_local_domain"
  echo
  ui_confirm "Confirmer rename client (dossier + meta + env + hosts + certs) ?" || { info "Annulé."; return 0; }

  # --- stop stack if available (optional)
  if declare -F stack_dc >/dev/null 2>&1; then
    info "Stop containers du projet (stack down)…"
    stack_dc down --remove-orphans || true
  fi

  # --- hosts: remove old tag (uses old project slug)
  project_hosts_remove "$old_project_slug" || true

  # --- certs: remove old cert files (project local cert dir)
  if [[ -n "$old_local_domain" ]]; then
    project_clean_local_certs "$old_dir" "$old_local_domain" || true
  fi

  # --- move folder: ensure parent exists
  fs_mkdir "$(dirname "$new_dir")"
  mv "$old_dir" "$new_dir"

  # --- update meta in new location
  local meta="$new_dir/meta.json"
  [[ -f "$meta" ]] || die "meta.json manquant après move: $meta"

  project_meta_set "$meta" '.client.name' "$new_client_name"
  project_meta_set "$meta" '.client.slug' "$new_client_slug"

  # force recompute slug + local domain as requested
  project_meta_set "$meta" '.slug' "$new_project_slug"
  project_meta_set "$meta" '.domains.local' "$new_local_domain"

  # --- regen env from meta (keeps passwords from existing env)
  project_regen_envs_from_meta "$new_dir" "$new_ref"

  # --- apply new hosts + new certs
  project_hosts_apply "$new_project_slug" "$new_local_domain" "www.${new_local_domain}"
  project_ensure_local_certs "$new_dir" "$new_local_domain"

  # --- set current ref
  ctx_set_current_project_ref "$new_ref"

  ok "Client renommé: $new_ref"
}