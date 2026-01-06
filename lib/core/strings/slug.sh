#!/usr/bin/env bash
set -euo pipefail

# slug_normalize — Normalise une chaîne en slug valide (kebab-case)
# Args:
#   $1: chaîne à normaliser
# Returns:
#   0 toujours
# Side effects:
#   - Affiche le slug normalisé sur stdout
# Example:
#   slug_normalize "My Project Name" => "my-project-name"
slug_normalize() {
  # lower + spaces->- + keep [a-z0-9-]
  local s="${1:-}"
  s="$(printf '%s' "$s" | tr '[:upper:]' '[:lower:]')"
  s="$(printf '%s' "$s" | tr ' ' '-' | sed -E 's/[^a-z0-9-]+/-/g; s/^-+|-+$//g; s/-+/-/g')"
  printf '%s' "$s"
}

# slug_require — Valide qu'une chaîne est un slug correct [a-z0-9-]+
# Args:
#   $1: slug à valider
# Returns:
#   0 si valide ; 1 sinon
# Side effects: none
# Example:
#   slug_require "my-project" && echo "Valid"
slug_require() {
  local s="${1:-}"
  [[ "$s" =~ ^[a-z0-9-]+$ ]]
}

# email_normalize - Normalise une chaine en email valide
# Args:
#   $1: chaîne à normaliser

# email_normalize(){

# }

