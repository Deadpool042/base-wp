#!/usr/bin/env bash
set -euo pipefail

# clients_list — Liste tous les clients (format humain ou JSON envelope)
# Args:
#   --json <0|1>: si 1, renvoie un JSON stable ; sinon format tabulaire (défaut: 0)
# Returns:
#   0 si succès ; 127 si jq manquant
clients_list() {
  require_jq || return 127

  local as_json="0"
  args_parse_kv "$@" --json as_json

  if [[ "${as_json:-0}" == "1" ]]; then
    local items
    items="$(clients_list_json_array)"
    sf_json_ok "{\"items\":$items}" "{\"count\":$(printf '%s' "$items" | jq 'length')}"
    return 0
  fi

  printf "%-36s  %-20s  %s\n" "ID" "SLUG" "NAME"
  while IFS=$'\t' read -r slug id name; do
    [[ -n "$id" ]] || continue
    printf "%-36s  %-20s  %s\n" "$id" "$slug" "$name"
  done < <(clients_repo_list_lines)
}

# clients_list_json_array — Construit un tableau JSON de tous les clients (JSON complets)
# Returns:
#   - écrit sur stdout un array JSON: [ {...}, {...} ]
clients_list_json_array() {
  local arr="[]"

  # itère sur les slugs (stockage slug-based)
  while IFS= read -r slug; do
    local j
    j="$(clients_repo_read_by_slug "$slug" || true)"
    [[ -n "$j" ]] || continue
    arr="$(jq -n --argjson arr "$arr" --argjson item "$j" '$arr + [$item]')"
  done < <(clients_repo_list_slugs)

  printf '%s' "$arr"
}