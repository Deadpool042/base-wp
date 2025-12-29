# base-wp

Socle technique WordPress — **gouvernance de stack**, règles de dépendances et cadre décisionnel  
pour des projets WordPress maintenables, scalables et auditables.

---

## 🎯 Objectif du projet

`base-wp` définit une **base commune agence** destinée à :

- garantir la cohérence technique entre projets
- éviter le lock-in (plugins, freemium, solutions opaques)
- cadrer les choix techniques dès l’avant-vente
- faciliter la maintenance long terme
- fournir un cadre clair aux développeurs et partenaires

Ce dépôt **ne contient pas de code applicatif**, mais un **cadre normatif**.

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

## 📌 Statut

- usage interne / gouvernance
- pas de distribution de template
- pas de promesse open-source
- évolutif selon les retours terrain

---

## 📝 Licence

Aucune licence n’est fournie.  
Tous droits réservés.
