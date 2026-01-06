#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------------------------
# Storage:
#   data/clients/<slug>/client_identity.json
#
# Indexes:
#   indexes/clients/by-slug/<slug> -> <id>
#   indexes/clients/by-id/<id>     -> <slug>
# -------------------------------------------------------------------

# --- Paths ----------------------------------------------------------

clients_repo_dir() { echo "$DATA_DIR/clients"; }

clients_repo_client_dir_by_slug() {
  local slug="${1:-}"
  echo "$(clients_repo_dir)/$slug"
}

clients_repo_identity_file_by_slug() {
  local slug="${1:-}"
  echo "$(clients_repo_client_dir_by_slug "$slug")/client_identity.json"
}

clients_index_dir_by_slug() { echo "$INDEX_DIR/clients/by-slug"; }
clients_index_file_by_slug() { echo "$(clients_index_dir_by_slug)/$1"; }

clients_index_dir_by_id() { echo "$INDEX_DIR/clients/by-id"; }
clients_index_file_by_id() { echo "$(clients_index_dir_by_id)/$1"; }

# --- Init -----------------------------------------------------------

clients_repo_init() {
  mkdir -p \
    "$(clients_repo_dir)" \
    "$(clients_index_dir_by_slug)" \
    "$(clients_index_dir_by_id)"
}

# --- Repo API (slug-based) -----------------------------------------

clients_repo_exists_slug() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || return 1
  [[ -f "$(clients_repo_identity_file_by_slug "$slug")" ]]
}

clients_repo_read_by_slug() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || return 1
  local f
  f="$(clients_repo_identity_file_by_slug "$slug")"
  [[ -f "$f" ]] || return 1
  cat "$f"
}

clients_repo_write_by_slug() {
  # args: slug json
  local slug="${1:-}" json="${2:-}"
  [[ -n "$slug" && -n "$json" ]] || return 1
  clients_repo_init
  mkdir -p "$(clients_repo_client_dir_by_slug "$slug")"
  atomic_write "$(clients_repo_identity_file_by_slug "$slug")" "$json"
}

clients_repo_delete_by_slug() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || return 1
  rm -f "$(clients_repo_identity_file_by_slug "$slug")"
  rmdir "$(clients_repo_client_dir_by_slug "$slug")" 2>/dev/null || true
}

clients_repo_list_slugs() {
  clients_repo_init
  local d
  for d in "$(clients_repo_dir)"/*; do
    [[ -d "$d" ]] || continue
    [[ -f "$d/client_identity.json" ]] || continue
    basename "$d"
  done
}

clients_repo_list_lines() {
  # output: slug<TAB>id<TAB>name
  clients_repo_init
  local slug f id name
  for slug in $(clients_repo_list_slugs); do
    f="$(clients_repo_identity_file_by_slug "$slug")"
    id="$(jq -r '.id // empty' "$f" 2>/dev/null || true)"
    name="$(jq -r '.name // empty' "$f" 2>/dev/null || true)"
    printf '%s\t%s\t%s\n' "$slug" "$id" "$name"
  done
}

clients_repo_list_select_lines() {
  # slug<TAB>name
  clients_repo_list_lines | awk -F'\t' '{print $1 "\t" $3}'
}

# --- Index API (slug -> id) ----------------------------------------

clients_index_get_id_by_slug() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || return 1
  local f
  f="$(clients_index_file_by_slug "$slug")"
  [[ -f "$f" ]] || return 1
  cat "$f"
}

clients_index_set_slug() {
  # args: slug id
  local slug="${1:-}" id="${2:-}"
  [[ -n "$slug" && -n "$id" ]] || return 1
  clients_repo_init
  atomic_write "$(clients_index_file_by_slug "$slug")" "$id"
}

clients_index_delete_slug() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || return 1
  rm -f "$(clients_index_file_by_slug "$slug")"
}

clients_index_slug_exists() {
  local slug="${1:-}"
  [[ -n "$slug" ]] || return 1
  [[ -f "$(clients_index_file_by_slug "$slug")" ]]
}

# --- Index API (id -> slug) ----------------------------------------

clients_index_get_slug_by_id() {
  local id="${1:-}"
  [[ -n "$id" ]] || return 1
  local f
  f="$(clients_index_file_by_id "$id")"
  [[ -f "$f" ]] || return 1
  cat "$f"
}

clients_index_set_id() {
  # args: id slug
  local id="${1:-}" slug="${2:-}"
  [[ -n "$id" && -n "$slug" ]] || return 1
  clients_repo_init
  atomic_write "$(clients_index_file_by_id "$id")" "$slug"
}

clients_index_delete_id() {
  local id="${1:-}"
  [[ -n "$id" ]] || return 1
  rm -f "$(clients_index_file_by_id "$id")"
}