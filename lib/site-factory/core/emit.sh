#!/usr/bin/env bash
set -euo pipefail

# Emit one NDJSON event line. Values are stringified.
emit() {
  local type="$1"; shift
  local json="{\"type\":\"$type\""

  for kv in "$@"; do
    local k="${kv%%=*}"
    local v="${kv#*=}"

    # minimal escaping (OK si tes slugs sont normalisés)
    v="${v//\\/\\\\}"
    v="${v//\"/\\\"}"
    v="${v//$'\n'/ }"

    json+=",\"$k\":\"$v\""
  done

  json+="}"
  printf '%s\n' "$json"
}