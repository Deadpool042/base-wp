MODE AGENT (ultra contrôlé)

Rôle: Tech lead + reviewer. Tu dois proposer une implémentation sans casser l’existant.
Interdits:
- inventer des fichiers qui n’existent pas sans préciser "NEW FILE"
- mélanger docker prod mutualisé (interdit)
- options UI non filtrées par règles

Procédure obligatoire:
1) Lire l’arborescence existante (lib/site-factory + modules + schemas).
2) Lister les sources of truth actuelles (où sont stockées config/services/profiles).
3) Proposer une cible (Target Architecture) en 5 points max.
4) Définir la config canonique (JSON) + versioning + migrations (si besoin).
5) Définir une registry services (structure + exemples) et la matrice d’autorisation.
6) Définir l’algorithme:
   resolveCapabilities(stack, hosting, profile) -> {allowedServices, allowedProviders, dockerAllowed, deployStrategy}
7) Générer un plan de changements:
   - NEW FILES
   - MODIFIED FILES
   - fonctions à ajouter/renommer
   - tests minimaux (smoke)
8) UI/UX refactor:
   - sections
   - champs conditionnels
   - warnings
   - actions deploy

Livrables:
- 1 JSON exemple config complète
- 1 example registry services
- pseudo-code resolveCapabilities
- checklist de PR (ordre de commit)
- risques & mitigations