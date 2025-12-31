#!/usr/bin/env bash
set -euo pipefail

mkdirp() { mkdir -p "$1"; }

atomic_write() {
  # atomic_write <dest> <content>
  local dest="$1"
  local content="$2"
  local dir tmp
  dir="$(dirname "$dest")"
  mkdir -p "$dir"
  tmp="$(mktemp)"
  printf '%s' "$content" > "$tmp"
  mv "$tmp" "$dest"
}