#!/usr/bin/env bash
set -euo pipefail

# ids.sh = predicates "purs" (pas de dépendance sur slug_require)

is_uuid() {
  local v="${1:-}"
  [[ "$v" =~ ^[a-f0-9-]{36}$ ]]
}

is_slug() {
  local v="${1:-}"
  [[ "$v" =~ ^[a-z0-9-]+$ ]]
}