#!/usr/bin/env bash
: << DOC
down.sh

Résumé :
Arrête l'infrastructure Docker Compose du projet et supprime les conteneurs orphelins.

Arguments :
aucun

Retour :
0 si succès, code d'erreur sinon (la gestion des erreurs est assurée par set -euo pipefail).

Effets de bord :
- Source le fichier _lib.sh et appelle la fonction profile_info.
- Exécute la commande 'dc down --remove-orphans' : arrête les services et supprime les conteneurs orphelins.
- Écrit des messages d'état sur la sortie standard.
- Nécessite l'accès Docker/Compose approprié pour s'exécuter correctement.

Exemple :
./down.sh
DOC
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

profile_info
echo "🛑 Arrêt infra…"
dc down --remove-orphans
echo "✅ OK"