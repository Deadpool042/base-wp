---
name: docsh-folder
description: Documenter en # tous les fichiers .sh d’un dossier (récursif), sans changer la logique
---

MODE: AGENT (multi-fichiers). Très low-token. Pas de blabla.

OBJECTIF
- Ajouter/mettre à jour une documentation en commentaires `#` pour CHAQUE fonction Bash
- Sur TOUS les fichiers `*.sh` (et `*.bash`, `*.zsh` si présents) dans le dossier suivant (récursif) :
  <PASTE_FOLDER_PATH_HERE>

CONTRAINTES STRICTES
- Doc en FRANÇAIS.
- Utiliser UNIQUEMENT des commentaires `#` (pas de heredoc, pas de JSDoc).
- Ne pas modifier la logique (aucun changement de commandes, variables, conditions).
- Ne pas renommer les fonctions.
- Ne pas déplacer les fonctions.
- Pas de suppression de code.
- Si une doc existe déjà au bon endroit, la mettre à jour plutôt que la dupliquer.

FORMAT OBLIGATOIRE (juste au-dessus de chaque fonction)
# <NomFonction> — <résumé 1 ligne>
# Args:
#   $1: ...
#   $2: ...
# Returns:
#   0 si ... ; sinon code != 0
# Side effects:
#   - ...
# Example:
#   <NomFonction> "arg1" "arg2"

RÈGLES D’INSERTION
- La doc doit être IMMÉDIATEMENT au-dessus de la ligne `nom_fonction() {`
- Laisser une ligne vide entre la doc et la fonction (optionnel, mais cohérent partout).
- Si une fonction n’a pas d’arguments : mettre `# Args: none`
- Si aucun effet de bord : `# Side effects: none`

SCOPE
- Traiter uniquement les fichiers du dossier donné.
- Ne pas toucher aux fichiers hors dossier.
- Documenter TOUTES les fonctions trouvées dans chaque fichier.

DELIVERABLE
- Appliquer les modifications sur les fichiers.
- Résumer en 5 lignes max : nombre de fichiers modifiés + éventuels cas particuliers.