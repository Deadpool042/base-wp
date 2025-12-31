#!/usr/bin/env bash
set -euo pipefail

# env_file_get <KEY> <FILE>
# Lit KEY=VALUE dans un fichier .env (ignore commentaires, prend la dernière occurrence).
env_file_get() {
  local key="${1:-}"
  local file="${2:-}"
  [[ -n "$key" && -n "$file" && -f "$file" ]] || { echo ""; return 0; }

  awk -F= -v k="$key" '
    $0 ~ /^[[:space:]]*#/ {next}
    $0 ~ /^[[:space:]]*$/ {next}
    $1 == k {
      v=$0
      sub(/^[^=]+=/, "", v)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", v)
      gsub(/^"|"$/, "", v)
    }
    END { print v }
  ' "$file"
}