# Infra — Mutualisé (o2switch uniquement)

Ce dossier contient le **cadre de déploiement et d’exploitation** WordPress pour hébergements mutualisés.

Objectif :

- livrer des sites WP fiables malgré les contraintes (pas de Docker, ressources limitées)
- standardiser perf / sécurité / backups
- faciliter l’onboarding et la maintenance

---

## Convention agence — Hébergement

Dans le cadre de ce socle :

- **o2switch est considéré comme hébergement mutualisé**
- **OVH est réservé aux déploiements VPS ou dédiés**
- le mutualisé OVH n’est **pas supporté** dans ce cadre

Ce dossier **ne couvre donc que les sites hébergés sur o2switch**.
Les infrastructures OVH (VPS) sont documentées séparément dans `infra/docker/`.

---

📌 Source de vérité :

- `docs/deploiement-checklist.md`
- `docs/perf-checklist.md`
- `docs/securite-checklist.md`
- `docs/backups-runbook.md`
- `docs/operations-runbook.md`

---

## Infra — Profils d’hébergement (référence agence)

Ce dossier contient le **cadre de référence des profils d’hébergement WordPress** utilisés par l’agence.

Objectifs :

- figer les règles techniques par type d’hébergement
- éviter toute ambiguïté (mutualisé vs VPS)
- standardiser déploiement, maintenance et discours client
- servir de base contractuelle et opérationnelle

---

## Organisation du dossier

```text
infra/shared/
├── o2switch/        # Hébergement mutualisé
│   ├── README.md
│   └── docs/
│       ├── deploiement-checklist.md
│       ├── perf-checklist.md
│       ├── securite-checklist.md
│       ├── backups-runbook.md
│       ├── operations-runbook.md
│       └── plugins-socle.md
│
├── ovh-vps/         # VPS OVH (infra maîtrisée)
│   ├── README.md
│   └── docs/
│       ├── deploiement-checklist.md
│       ├── perf.md
│       ├── securite.md
│       ├── backups-runbook.md
│       └── monitoring.md
│
└── README.md        # Ce fichier
```

Chaque sous-dossier représente un **profil d’hébergement figé**, avec ses règles propres.

---

## Règle d’or

- un projet = **un profil**
- aucun mélange des règles mutualisé / VPS
- tout écart doit être explicitement validé et documenté

---

📌 Ce dossier est la **source de vérité infra** pour :

- la qualification client
- le choix de l’hébergement
- la maintenance
- les refus techniques
