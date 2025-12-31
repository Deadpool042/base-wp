#!/usr/bin/env bash
set -euo pipefail
: << DOC
preflight_checks

Résumé :
Vérifie que Docker est installé, que le démon Docker répond et qu'une implémentation de Docker Compose est disponible.

Arguments :
aucun

Retour :
aucun

Effets de bord :
Peut provoquer la sortie du script si Docker ou Docker Compose sont absents ou si le démon Docker n'est pas démarré.

Exemple :
preflight_checks
DOC
preflight_checks() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker introuvable. Veuillez installer Docker." >&2
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "❌ Le démon Docker ne répond pas. Démarrez Docker." >&2
    exit 1
  fi

  # Vérifie la présence de Docker Compose (plugin moderne ou binaire legacy)
  if ! docker compose version >/dev/null 2>&1; then
    if ! command -v docker-compose >/dev/null 2>&1; then
      echo "❌ Docker Compose introuvable (ni 'docker compose' ni 'docker-compose')." >&2
      exit 1
    fi
  fi
}

preflight_checks
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

profile_info
echo "🚀 Démarrage infra…"
dc up -d --remove-orphans
echo "✅ OK"