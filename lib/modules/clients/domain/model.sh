#!/usr/bin/env bash
#/lib/modules/clinents/domain/model.sh
set -euo pipefail

# clients_domain_validate_slug
# Summary: Valide qu'un slug est non vide et respecte le format attendu.
# Args:
#   $1: slug à valider
# Returns: 0 si valide, 1 sinon
# Side effects: none
# Example: clients_domain_validate_slug "mon-slug"
clients_domain_validate_slug() {
  local slug="${1:-}"
  require_nonempty "$slug" || return 1
  require_slug "$slug" || return 1
}

# clients_domain_normalize_slug
# Summary: Normalise une chaîne en slug via la fonction slug_normalize.
# Args:
#   $1: chaîne à normaliser
# Returns: écrit le slug normalisé sur la sortie standard
# Side effects: none
# Example: clients_domain_normalize_slug "Mon Nom"
clients_domain_normalize_slug() {
  slug_normalize "${1:-}"
}

clients_domain_defaults_json() {
  # args: id slug name ts
  local id="$1" slug="$2" name="$3" ts="$4"

  jq -n \
    --arg id "$id" \
    --arg slug "$slug" \
    --arg name "$name" \
    --arg ts "$ts" \
    '{
      version: 1,
      id: $id,
      slug: $slug,
      name: $name,

      contact: {
        email: null,
        phone: null
      },

      meta: {
        status: "active",
        tags: [],
        notes: null
      },

      createdAt: $ts,
      updatedAt: $ts
    }'
}
