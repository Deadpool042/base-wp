#!/usr/bin/env bash
set -euo pipefail

require_nonempty() {
  local v="${1:-}"
  [[ -n "$v" ]] || return 1
}

require_file() {
  local p="${1:-}"
  [[ -f "$p" ]] || return 1
}

require_uuid() {
  local v="${1:-}"
  is_uuid "$v" || return 1
}

require_slug() {
  local v="${1:-}"
  slug_require "$v" || return 1
}