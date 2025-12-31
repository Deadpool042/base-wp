#!/usr/bin/env bash
set -euo pipefail

# Guard
if [[ "${__BASEWP_VALIDATE_LOADED:-0}" == "1" ]]; then return 0; fi
__BASEWP_VALIDATE_LOADED="1"

is_nonempty() { [[ -n "${1:-}" ]]; }

is_fqdn() {
  local d="${1:-}"
  [[ -n "$d" ]] || return 1
  [[ "$d" == *.* ]] || return 1
  [[ "$d" != *" "* ]] || return 1
  [[ "$d" != */* ]] || return 1
  return 0
}

is_local_domain() {
  local d="${1:-}"
  [[ -n "$d" && "$d" == *.local ]]
}

is_int() { [[ "${1:-}" =~ ^[0-9]+$ ]]; }

is_yes() { [[ "${1:-}" =~ ^([Yy]|[Yy][Ee][Ss]|[Oo][Uu][Ii])$ ]]; }
is_no()  { [[ "${1:-}" =~ ^([Nn]|[Nn][Oo][Nn])$ ]]; }