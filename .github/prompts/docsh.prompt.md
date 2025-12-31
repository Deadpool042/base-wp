---
name: docsh
description: Documenter du code Bash en français (sans modifier la logique)
---

Analyse le code Bash sélectionné et AJOUTE la documentation manquante.

Règles obligatoires :

- Toute la documentation doit être rédigée en FRANÇAIS.
- Chaque fonction doit être documentée individuellement.
- Chaque documentation doit suivre le format spécifié ci-dessous.
- NE JAMAIS utiliser de commentaires de type JSDoc (`/** */`) en Bash.
- NE PAS utiliser de commentaires `#` pour la documentation.
- Utiliser UNIQUEMENT des blocs heredoc Bash inactifs (`: << DOC … DOC`).
- Ne pas modifier la logique métier du code.
- Ne pas renommer les fonctions.
- Ne pas supprimer de fonctions existantes.
- Ne pas déplacer les fonctions.

Format OBLIGATOIRE pour chaque fonction (à placer juste au-dessus) :

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
<ex: écrit dans /etc/hosts, crée des fichiers, lance docker, supprime des dossiers, etc.>
(indiquer "aucun" si applicable)

Exemple :
<nom_fonction> "arg1" "arg2"
DOC

Contraintes strictes :

- Le bloc `: << DOC` doit être placé IMMÉDIATEMENT AU-DESSUS de la fonction.
- Le délimiteur doit être exactement `DOC`.
- Aucune ligne de documentation ne doit être hors du heredoc.
- Aucune ligne de code ne doit être ajoutée, supprimée ou modifiée.

Objectif :

- Documentation lisible par un humain
- Compatible shellcheck
- Adaptée à un projet CLI / infra (BaseWP)
