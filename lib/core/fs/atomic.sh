#!/usr/bin/env bash
set -euo pipefail

# atomic_write — Écrit atomiquement du contenu dans un fichier
# Args:
#   $1: path (chemin absolu du fichier à créer/modifier)
#   $2: content (contenu à écrire)
# Returns:
#   0 si succès ; 1 si path vide
# Side effects:
#   - Crée les répertoires parents si nécessaire
#   - Écrit via un fichier temporaire puis mv pour l'atomicité
#   - Écrase le fichier s'il existe
# Example:
#   atomic_write "/path/to/file.json" '{"key":"value"}'
atomic_write() {
  local path="${1:-}"
  local content="${2:-}"
  [[ -n "$path" ]] || return 1

  local dir
  dir="$(dirname "$path")"
  mkdir -p "$dir"

  local tmp
  tmp="$(mktemp "${TMP_DIR%/}/sf.XXXXXX")"
  printf '%s' "$content" > "$tmp"
  mv "$tmp" "$path"
}
