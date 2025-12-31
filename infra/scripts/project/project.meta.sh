#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# project/project.meta.sh
# Lecture/écriture meta.json + helpers.
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/project.context.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/project.list.sh"

project_meta_file() {
  local ref="${1:-}"
  printf "%s/meta.json" "$(project_ref_to_dir "$ref")"
}

project_meta_get() {
  local file="${1:-}" key="${2:-}"
  [[ -n "$file" && -n "$key" ]] || die "project_meta_get: usage: <file> <jq_key>"
  jq -r "$key // empty" "$file"
}

project_meta_set() {
  local file="${1:-}" key="${2:-}" value="${3:-}"
  [[ -n "$file" && -n "$key" ]] || die "project_meta_set: usage: <file> <jq_key> <value>"
  local tmp
  tmp="$(mktemp)"
  jq --arg v "$value" "$key = \$v" "$file" > "$tmp"
  mv "$tmp" "$file"
}

project_slug_from_meta() {
  local meta="${1:-}"
  local s=""
  s="$(project_meta_get "$meta" '.slug')"
  if [[ -n "$s" && "$s" != "null" ]]; then
    printf "%s" "$s"
    return 0
  fi

  # fallback stable slug from ref folder path
  local base dir
  base="$(project_projects_dir)"
  dir="$(dirname "$meta")"
  dir="${dir#"$base/"}"
  printf "%s" "${dir//\//--}"
}

project_meta_client_slug() { project_meta_get "$1" '.client.slug'; }
project_meta_site_slug()   { project_meta_get "$1" '.site.slug'; }
project_meta_local_domain(){ project_meta_get "$1" '.domains.local'; }