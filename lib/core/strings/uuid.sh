#!/usr/bin/env bash
set -euo pipefail

# uuid_v4 — Génère un UUID v4 (randomisé)
# Args: none
# Returns:
#   0 si succès ; 127 si ni uuidgen ni python3 disponible
# Side effects:
#   - Affiche le UUID sur stdout
# Example:
#   id="$(uuid_v4)"
uuid_v4() {
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen | tr '[:upper:]' '[:lower:]'
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import uuid
print(str(uuid.uuid4()))
PY
    return 0
  fi
  echo "uuid_v4: missing uuidgen or python3" >&2
  return 127
}

# is_uuid — Valide qu'une chaîne est un UUID v4 valide
# Args:
#   $1: chaîne à valider
# Returns:
#   0 si UUID valide ; 1 sinon
# Side effects: none
# Example:
#   is_uuid "550e8400-e29b-41d4-a716-446655440000" && echo "Valid"
is_uuid() {
  [[ "${1:-}" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]
}
