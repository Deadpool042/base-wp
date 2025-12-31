#!/usr/bin/env bash
set -euo pipefail
: << DOC
ps.sh

Résumé :
Affiche les conteneurs/services Docker Compose du projet et propose des actions si aucun service actif.

Arguments :
$1: (optionnel) argument passé à dc ps (ex. -a)
$2: (optionnel) argument passé à dc ps

Retour :
0 en cas de succès

Effets de bord :
- Source le fichier _lib.sh depuis le même répertoire que le script.
- Appelle profile_info et info pour afficher des messages.
- Peut terminer le script avec exit 0 si aucun service Docker trouvé.
- N'effectue aucune modification persistante des fichiers ou de l'environnement.

Exemple :
./ps.sh
./ps.sh -a
DOC

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

profile_info 
echo

# Récupère la liste des services connus (si compose OK)
services="$(dc ps --services 2>/dev/null || true)"

# Si docker/compose KO ou aucun service trouvé
if [[ -z "${services:-}" ]]; then
  info "Aucun service Docker en cours pour ce projet (ou compose non démarré)."
  echo
  info "Actions possibles :"
  echo "  • make up        → démarrer l'infra"
  echo "  • make project   → changer de projet"
  echo "  • make doctor    → diagnostic"
  exit 0
fi

# Affichage normal
if [[ $# -gt 0 ]]; then
  dc ps "$@"
else
  dc ps
fi