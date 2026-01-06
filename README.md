# site-factory

Socle technique WordPress — **gouvernance de stack**, règles de dépendances et cadre décisionnel  
pour des projets WordPress maintenables, scalables et auditables.

---

## 🎯 Objectif du projet

`site-factory` définit une **plateforme interne d’orchestration et de gouvernance** destinée à :

- garantir la cohérence technique entre projets
- éviter le lock-in (plugins, freemium, solutions opaques)
- cadrer les choix techniques dès l’avant-vente
- faciliter la maintenance long terme
- fournir un cadre clair aux développeurs et partenaires

Ce dépôt combine un **cadre normatif** et un **outil CLI interne** (`.bin/site-factory`) servant de point d’entrée unique.

---

## 🧱 Ce que couvre ce socle

- socle WordPress commun (obligatoire)
- politique de dépendances
- liste blanche de plugins autorisés
- exclusions techniques non négociables
- flux décisionnel (plugin validé vs custom)
- règles de placement :
  - Plugin Agence
  - Plugin Client
  - Plugin Webmaster
- CLI interne `site-factory` (gestion des projets, point d’entrée des services)

---

## 📁 Organisation de la documentation

La documentation est la **source de vérité** du projet.

```text
Docs/
└── 08-Stack/
    ├── README.md              # Socle technique (référence principale)
    ├── stack-whitelist.md     # Plugins autorisés (gouvernance)
    ├── stack-refus.md         # Exclusions techniques (prioritaire)
    └── flux-decisionnel.md    # Décision plugin vs custom & placement
```

---

## 🔐 Principes clés

- ❌ pas de plugin freemium bloquant dans le socle
- ❌ pas de dépendance commerciale critique
- ❌ pas de page builder lourd
- ✅ plugins gratuits, remplaçables, sans lock-in
- ✅ modules internes pour la valeur métier
- ✅ décisions traçables et auditables

Tout ce qui sort de ce cadre entraîne :

- une **requalification du projet**
- ou un **refus technique explicite**

---

## 🧭 Comment utiliser ce dépôt

- comme **référence interne agence**
- comme **cadre d’arbitrage technique**
- comme **base d’onboarding développeur**
- comme support de discussion avec un client ou partenaire technique

👉 Toute décision doit s’appuyer sur :

1. le socle
2. la white-list
3. le stack-refus
4. le flux décisionnel

---

## 🧰 CLI (site-factory)

Le dépôt inclut une CLI interne `site-factory` utilisée par l’UI et par les scripts.

Note (fixtures de test) :
`lib/site-factory/projects/fixtures` est un lien symbolique vers `lib/site-factory/projects/_fixtures`.

Exemples (workflow minimal) :

- `site-factory projects configure <client/site> --deployment-target mutualized:o2switch`
- `site-factory projects docker generate <client/site> --profile local --force`
- `site-factory projects deploy <client/site> --env staging --ssh-host <host> --ssh-user <user> --ssh-path <remote_path> --dry-run`
- `site-factory projects deploy <client/site> --env prod --ssh-host <host> --ssh-user <user> --ssh-path <remote_path> --dry-run`

---

## 📌 Statut

- usage interne / gouvernance
- CLI interne comme point d’entrée unique (`.bin/site-factory`)
- UI interne en cours de structuration
- pas de distribution de template
- pas de promesse open-source
- évolutif selon les retours terrain

---

## 📝 Licence

Aucune licence n’est fournie.  
Tous droits réservés.
