#!/usr/bin/env bash
set -euo pipefail

# clients_resolve_id — Résout un ID existant depuis UUID ou slug
clients_resolve_id() {
  local input="${1:-}"
  require_nonempty "$input" || return 1

  # UUID -> s'assurer que ça pointe vers un client connu (via index by-id)
  if is_uuid "$input"; then
    local slug
    slug="$(clients_index_get_slug_by_id "$input" || true)"
    [[ -n "$slug" ]] || return 1
    echo "$input"
    return 0
  fi

  # slug -> normaliser + valider + index by-slug
  local slug id
  slug="$(clients_domain_normalize_slug "$input")"
  clients_domain_validate_slug "$slug" || return 1

  id="$(clients_index_get_id_by_slug "$slug" || true)"
  [[ -n "$id" ]] || return 1
  echo "$id"
}

# clients_resolve_slug — Résout un slug existant depuis UUID ou slug
clients_resolve_slug() {
  local input="${1:-}"
  require_nonempty "$input" || return 1

  # UUID -> index by-id
  if is_uuid "$input"; then
    local slug
    slug="$(clients_index_get_slug_by_id "$input" || true)"
    [[ -n "$slug" ]] || return 1
    echo "$slug"
    return 0
  fi

  # slug -> normaliser + valider + s'assurer qu'il existe (via index by-slug)
  local slug id
  slug="$(clients_domain_normalize_slug "$input")"
  clients_domain_validate_slug "$slug" || return 1

  id="$(clients_index_get_id_by_slug "$slug" || true)"
  [[ -n "$id" ]] || return 1

  echo "$slug"
}