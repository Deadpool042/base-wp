#!/usr/bin/env bash
set -euo pipefail

# clients_validate_json — Valide le contrat JSON "client v1"
# Lit depuis stdin. Retourne 0 si OK, 1 si KO, 127 si jq manquant.
clients_validate_json() {
  require_jq >/dev/null 2>&1 || return 127

  jq -e '
    (.version == 1)
    and (.id | type == "string" and length > 0)
    and (.slug | type == "string" and length > 0)
    and (.name | type == "string" and length > 0)

    and (.contact | type == "object")
    and ((.contact.email == null) or (.contact.email | type == "string"))
    and ((.contact.phone == null) or (.contact.phone | type == "string"))

    and (.meta | type == "object")
    and (.meta.status | type == "string")
    and (.meta.tags | type == "array")
    and ((.meta.notes == null) or (.meta.notes | type == "string"))

    and (.createdAt | type == "string")
    and (.updatedAt | type == "string")
  ' >/dev/null
}