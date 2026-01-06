#!/usr/bin/env bash
#/lib/modules/clients/domain/client_domain.sh
set -euo pipefail

# clients_require_slug — Valide qu'un slug client est non-vide et valide
# Args:
#   $1: slug à valider
# Returns:
#   0 si valide ; 1 sinon
# Side effects: none
# Example:
#   clients_require_slug "mon-client"
clients_require_slug() {
  local slug="${1:-}"
  require_nonempty "$slug" || return 1
  require_slug "$slug" || return 1
}

# clients_require_name — Valide qu'un nom de client est non-vide
# Args:
#   $1: nom à valider
# Returns:
#   0 si non-vide ; 1 sinon
# Side effects: none
# Example:
#   clients_require_name "Mon Client"
clients_require_name() {
  local name="${1:-}"
  require_nonempty "$name" || return 1
}


# clients_patch_json — Applique un patch minimal sur un objet JSON client (stdin)
# Args:
#   $1: new_slug (vide pour conserver)
#   $2: new_name (vide pour conserver)
#   $3: updatedAt (ISO8601)
# Returns:
#   0 si succès ; 127 si jq manquant
# Side effects:
#   - Émet le JSON patchéé sur stdout
#   - Lit depuis stdin
# Example:
#   cat client.json | clients_patch_json "nouveau-slug" "Nouveau nom" "2026-01-03T..."
clients_patch_json() {
  # patch minimal: name + (optional) slug
  # stdin: existing json
  # args: new_slug (or empty), new_name (or empty), updatedAt
  local new_slug="${1:-}" new_name="${2:-}" updatedAt="${3:-}"

  require_jq >/dev/null 2>&1 || return 127

  jq \
    --arg newSlug "$new_slug" \
    --arg newName "$new_name" \
    --arg updatedAt "$updatedAt" \
    '
    .updatedAt = $updatedAt
    | (if ($newName|length) > 0 then .name = $newName else . end)
    | (if ($newSlug|length) > 0 then .slug = $newSlug else . end)
    '
}
