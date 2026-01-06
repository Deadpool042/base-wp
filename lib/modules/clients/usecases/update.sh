#!/usr/bin/env bash
set -euo pipefail

clients_update() {
  require_jq || return 127

  local input="${1:-}"
  shift || true

  local as_json="0"
  args_parse_kv "$@" --json as_json || true

  require_nonempty "$input" || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "VALIDATION" "id or slug required"
    else
      emit error code=VALIDATION message="id or slug required"
    fi
    return 2
  }

  # Résolution client existant
  local old_slug id json
  old_slug="$(clients_resolve_slug "$input" || true)"
  [[ -n "$old_slug" ]] || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"input\":\"$input\"}"
    else
      emit error code=NOT_FOUND message="client not found" input="$input"
    fi
    return 2
  }

  id="$(clients_index_get_id_by_slug "$old_slug" || true)"
  [[ -n "$id" ]] || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"slug\":\"$old_slug\"}"
    else
      emit error code=NOT_FOUND message="client not found" slug="$old_slug"
    fi
    return 2
  }

  json="$(clients_repo_read_by_slug "$old_slug" || true)"
  [[ -n "$json" ]] || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"slug\":\"$old_slug\"}"
    else
      emit error code=NOT_FOUND message="client not found" slug="$old_slug"
    fi
    return 2
  }

  # Version check (contract)
  local version
  version="$(printf '%s' "$json" | jq -r '.version // empty')"
  if [[ "$version" != "1" ]]; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "UNSUPPORTED_VERSION" "unsupported client version" "{\"version\":\"$version\"}"
    else
      emit error code=UNSUPPORTED_VERSION message="unsupported client version" version="$version"
    fi
    return 1
  fi

  # (Optionnel mais conseillé) schema check
  if ! printf '%s' "$json" | clients_validate_json; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "INVALID_DATA" "invalid client json" "{\"slug\":\"$old_slug\"}"
    else
      emit error code=INVALID_DATA message="invalid client json" slug="$old_slug"
    fi
    return 1
  fi

  # Args update
  local new_slug="" new_name="" new_email="" new_phone=""
  args_parse_kv "$@" \
    --slug new_slug \
    --name new_name \
    --email new_email \
    --phone new_phone

  # slug: normaliser/valider + collision
  if [[ -n "$new_slug" ]]; then
    new_slug="$(clients_domain_normalize_slug "$new_slug")"
    clients_domain_validate_slug "$new_slug" || {
      if [[ "${as_json:-0}" == "1" ]]; then
        sf_json_err "VALIDATION" "invalid slug" "{\"slug\":\"$new_slug\"}"
      else
        emit error code=VALIDATION message="invalid slug" slug="$new_slug"
      fi
      return 2
    }

    if [[ "$new_slug" != "$old_slug" ]] && clients_index_slug_exists "$new_slug"; then
      if [[ "${as_json:-0}" == "1" ]]; then
        sf_json_err "ALREADY_EXISTS" "slug already exists" "{\"slug\":\"$new_slug\"}"
      else
        emit error code=ALREADY_EXISTS message="slug already exists" slug="$new_slug"
      fi
      return 1
    fi
  fi

  # Patch JSON
  local ts
  ts="$(now_utc)"

  if [[ -n "$new_name" ]]; then
    json="$(printf '%s' "$json" | jq --arg name "$new_name" '.name=$name')"
  fi

  if [[ -n "$new_email" ]]; then
    json="$(printf '%s' "$json" | jq --arg email "$new_email" '.contact.email=$email')"
  fi

  if [[ -n "$new_phone" ]]; then
    json="$(printf '%s' "$json" | jq --arg phone "$new_phone" '.contact.phone=$phone')"
  fi

  local final_slug="$old_slug"
  if [[ -n "$new_slug" && "$new_slug" != "$old_slug" ]]; then
    final_slug="$new_slug"
    json="$(printf '%s' "$json" | jq --arg slug "$final_slug" '.slug=$slug')"
  fi

  json="$(printf '%s' "$json" | jq --arg ts "$ts" '.updatedAt=$ts')"

  # Persist + index updates
  if [[ "$final_slug" != "$old_slug" ]]; then
    clients_repo_write_by_slug "$final_slug" "$json"
    clients_repo_delete_by_slug "$old_slug"

    clients_index_delete_slug "$old_slug"
    clients_index_set_slug "$final_slug" "$id"

    clients_index_set_id "$id" "$final_slug"
  else
    clients_repo_write_by_slug "$old_slug" "$json"
  fi

  if [[ "${as_json:-0}" == "1" ]]; then
    sf_json_ok "{\"id\":\"$id\",\"slug\":\"$final_slug\"}"
  else
    emit updated type=client id="$id" slug="$final_slug"
  fi
}