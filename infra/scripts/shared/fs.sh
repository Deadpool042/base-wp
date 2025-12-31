#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# shared/fs.sh
# Helpers filesystem simples.
# ------------------------------------------------------------------------------

# Guard
if [[ "${__BASEWP_FS_LOADED:-0}" == "1" ]]; then return 0; fi
__BASEWP_FS_LOADED="1"

# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/log.sh"
# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/strings.sh"

# project_ref_normalize_nested <input>
# - force "client/site" (slugs)
# - refuse legacy (sans slash)
project_ref_normalize_nested() {
  local ref_in="${1:-}"
  ref_in="$(str_strip_newlines "$(str_trim "$ref_in")")"

  [[ "$ref_in" == */* ]] || die "Chemin projet invalide: '${ref_in}'. Format attendu: client/site"

  local client_part site_part
  client_part="$(str_strip_newlines "$(str_trim "${ref_in%%/*}")")"
  site_part="$(str_strip_newlines "$(str_trim "${ref_in#*/}")")"

  client_part="$(str_slugify "$client_part")"
  site_part="$(str_slugify "$site_part")"

  [[ -n "$client_part" && -n "$site_part" ]] || die "Chemin projet invalide: client/site requis"
  printf "%s/%s" "$client_part" "$site_part"
}

fs_mkdir() {
  local dir_path="${1:-}"
  [[ -n "$dir_path" ]] || die "fs_mkdir: dir_path vide"
  mkdir -p "$dir_path"
}

fs_file_exists() {
  local file_path="${1:-}"
  [[ -n "$file_path" && -f "$file_path" ]]
}

fs_dir_exists() {
  local dir_path="${1:-}"
  [[ -n "$dir_path" && -d "$dir_path" ]]
}

fs_read_file() {
  local file_path="${1:-}"
  [[ -n "$file_path" && -f "$file_path" ]] || { echo ""; return 0; }
  cat "$file_path"
}

fs_write_file() {
  local file_path="${1:-}" content="${2:-}"
  [[ -n "$file_path" ]] || die "fs_write_file: file_path vide"
  printf "%s" "$content" > "$file_path"
}