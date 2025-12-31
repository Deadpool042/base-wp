#!/usr/bin/env bash
set -euo pipefail

normalize_slug() {
  local s="${1:-}"
  s="$(echo "$s" | tr '[:upper:]' '[:lower:]')"
  s="$(echo "$s" | sed -E 's/[ _]+/-/g')"
  s="$(echo "$s" | sed -E 's/[^a-z0-9-]+/-/g')"
  s="$(echo "$s" | sed -E 's/-+/-/g; s/^-+//; s/-+$//')"
  echo "$s"
}

require_safe_slug() {
  local raw="$1"
  local slug
  slug="$(normalize_slug "$raw")"
  [[ -n "$slug" ]] || return 1
  [[ "$slug" != "." && "$slug" != ".." ]] || return 1
  [[ "$slug" != *"/"* ]] || return 1
  echo "$slug"
}