---
name: auditshell
description: Auditer un script Bash (sécurité, robustesse, UX) et proposer des corrections SANS modifier le code
---

Tu audits le code Bash sélectionné et tu produis un rapport en FRANÇAIS.

Objectif :

- détecter les risques (sudo, rm -rf, awk/sed sur fichiers système, injection, chemins, permissions)
- détecter les bugs probables (quoting, -euo pipefail, tests, globbing, retours, erreurs silencieuses)
- proposer des améliorations concrètes

Règles obligatoires :

- Ne pas modifier le code (aucune édition).
- Ne pas renommer les fonctions.
- Ne pas supprimer de fonctions.
- Tout doit être en FRANÇAIS.
- Si tu proposes des changements, fournis-les sous forme de patchs ou d’extraits MAIS sans appliquer.

Format attendu :

1. Résumé (2–5 points)
2. Risques critiques (avec pourquoi + impact)
3. Bugs probables (avec exemple de cas)
4. Améliorations recommandées (priorisées)
5. Patchs suggérés (optionnel) :
   - montrer le diff minimal
   - expliquer pourquoi
