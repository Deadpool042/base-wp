---
name: docsh-update
description: Mettre à jour la documentation Bash existante en français (sans toucher à la logique)
---

Analyse le code Bash sélectionné et MET À JOUR la documentation existante si nécessaire.

Règles obligatoires :

- Toute la documentation doit être rédigée en FRANÇAIS.
- Chaque fonction doit être documentée individuellement à son emplacement c'est à dire avec chaque fonction.
- Chaque documentation doit suivre le format spécifié ci-dessous.
- NE JAMAIS utiliser de commentaires JSDoc (`/** */`) en Bash.
- NE PAS utiliser de commentaires `#` pour la documentation.
- Utiliser UNIQUEMENT des blocs heredoc Bash inactifs (`: << DOC … DOC`).
- Ne pas modifier la logique métier du code.
- Ne pas renommer les fonctions.
- Ne pas supprimer de fonctions existantes.
- Ne pas déplacer les fonctions.

Comportement attendu :

- Si un bloc `: << DOC` existe déjà :
  - le conserver
  - le corriger si nécessaire (arguments, effets de bord, résumé)
  - compléter les sections manquantes
- Si la documentation est correcte :
  - NE RIEN MODIFIER
- Si une fonction n’a PAS de documentation :
  - ajouter un bloc `: << DOC` juste au-dessus

Format OBLIGATOIRE :

: << DOC
<Nom de la fonction>

Résumé :
<Résumé clair en une phrase>

Arguments :
$1: <description>
$2: <description>
(indiquer "aucun" si pas d’arguments)

Retour :
<description ou "aucun">

Effets de bord :
<liste précise des effets de bord>
(indiquer "aucun" si applicable)

Exemple :
<nom_fonction> "arg1" "arg2"
DOC

Contraintes strictes :

- Le bloc `: << DOC` doit être placé IMMÉDIATEMENT AU-DESSUS de la fonction.
- Le délimiteur doit être exactement `DOC`.
- Aucune ligne de documentation ne doit être hors du heredoc.
- Aucune ligne de code ne doit être ajoutée, supprimée ou modifiée.
