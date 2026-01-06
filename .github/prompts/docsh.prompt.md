---
name: docsh
description: Doc Bash FR tooltip VS Code (sans changer la logique)
---

Ajoute une doc *en commentaires #* juste AU-DESSUS de chaque fonction.

Règles:
- FR uniquement.
- Ne modifie pas la logique, ne renomme pas, ne déplace pas.
- Doc courte (tooltip): 6-10 lignes max/fonction.
- Format EXACT:

# <function_name>
# Summary: ...
# Args:
#   $1 ...
#   $2 ...
# Returns: ...
# Side effects: ...
# Example: <function_name> "arg1" "arg2"

- Si pas d’args: "Args: none"
- Si aucun effet: "Side effects: none"