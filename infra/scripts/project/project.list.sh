#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# project/project.list.sh
# Listing projets (legacy + nested).
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/project.context.sh"

project_list() {
  project_ensure_projects_dir
  local base p c s
  base="$(project_projects_dir)"

  # legacy: projects/<slug>/meta.json
  for p in "$base"/*; do
    [[ -d "$p" ]] || continue
    [[ -f "$p/meta.json" ]] || continue
    basename "$p"
  done

  # nested: projects/<client>/<site>/meta.json
  for c in "$base"/*; do
    [[ -d "$c" ]] || continue
    [[ -f "$c/meta.json" ]] && continue
    for s in "$c"/*; do
      [[ -d "$s" ]] || continue
      [[ -f "$s/meta.json" ]] || continue
      printf "%s/%s\n" "$(basename "$c")" "$(basename "$s")"
    done
  done
}

project_ref_to_dir() {
  local ref="${1:-}"
  [[ -n "$ref" ]] || { echo ""; return 0; }
  printf "%s/%s" "$(project_projects_dir)" "$ref"
}