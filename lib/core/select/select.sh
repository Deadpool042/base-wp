#!/usr/bin/env bash
set -euo pipefail

# select_from_list — Sélecteur interactif depuis stdin (id<TAB>label)
# Args:
#   $1: prompt affiché avant les options
# Returns:
#   0 et affiche l'id ; 1 si aucune ligne ou sélection invalide
# Side effects:
#   - Lit depuis stdin
#   - Affiche numéros et labels sur stdout
#   - Attend une entrée utilisateur via read
# Example:
#   grep "^[a-f0-9-]*\t" index | select_from_list "Choose:"
select_from_list() {
  local prompt="${1:-Select:}"
  shift || true

  local lines=()
  while IFS= read -r line; do
    [[ -n "$line" ]] && lines+=("$line")
  done

  [[ ${#lines[@]} -gt 0 ]] || return 1

  echo "$prompt"
  local i=1
  for line in "${lines[@]}"; do
    local label="${line#*$'\t'}"
    printf "  %d) %s\n" "$i" "$label"
    i=$((i+1))
  done

  printf "> "
  local choice
  read -r choice

  [[ "$choice" =~ ^[0-9]+$ ]] || return 1
  (( choice >= 1 && choice <= ${#lines[@]} )) || return 1

  local picked="${lines[$((choice-1))]}"
  printf '%s' "${picked%%$'\t'*}"
}
