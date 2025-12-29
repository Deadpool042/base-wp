# 🧱 Socle technique — Base commune (toutes catégories)

> 🔒 **Document interne**
>
> Ce document définit la **base commune** appliquée à **tous les sites** (Cat.1 → Cat.4),
> avant tout module.
>
> Objectifs :
>
> - standardiser la stack
> - garantir un niveau minimum de sécurité et performance
> - simplifier la maintenance
> - limiter la dépendance aux plugins freemium

---

## ✅ Principes non négociables

- **On part du besoin**, pas d’un plugin.
- La base commune doit rester **simple, stable, maintenable**.
- **Pas de page builder lourd** par défaut (Elementor exclu).
- **Pas de freemium bloquant** dans le socle.
- Le client et le webmaster n’ont **pas accès** à la configuration “Agence”.

---

## 🧱 Stack WordPress (commune)

### Noyau

- WordPress stable (version maintenue).
- Thème léger orienté performance : **Astra**.
- Éditeur de blocs : **Gutenberg** + **Spectra**.

### Contenu

- Pages, articles (blog), catégories, étiquettes.
- Menus, médias, utilisateurs & rôles standards.

---

## 🛒 Stack WooCommerce (si e‑commerce)

- WooCommerce stable (version maintenue).
- Panier + commande natifs.
- Paiements et livraisons natifs **tant que le besoin reste standard**.

👉 Dès qu’on dépasse le natif (paiement, livraison, devises, etc.), on bascule vers un **module** (Cat.2+).

---

## 🔌 Architecture des plugins custom (règle de séparation)

La base repose sur **3 plugins custom**, avec des accès séparés :

### 1) Plugin Agence (socle + modules réutilisables)

**But :** tout ce qui est technique, réutilisable, structurant.

- sécurité (socle)
- performance (socle)
- journalisation et alertes
- outils de maintenance
- adaptateurs si un plugin OSS est utilisé (encapsulation)

👉 **Accès : Agence uniquement**.

### 2) Plugin Client (spécifique au projet)

**But :** règles métier propres au client (si besoin).

- paramètres métier
- règles de tarification spécifiques
- règles réglementaires (si applicable)
- connecteurs spécifiques au client

👉 **Accès : administrateur client** (écran dédié, sans jargon technique).

### 3) Plugin Webmaster (édition / contenu / réglages “safe”)

**But :** outils éditoriaux et confort de gestion.

- blocs / modèles Spectra
- éléments de présentation non critiques
- outils de contenu (bannières, messages)
- réglages d’interface simples

👉 **Accès : webmaster client**.

---

## 🔐 Sécurité — Socle commun (tous sites)

### Objectif

Obtenir un site “propre” et robuste, avec un minimum de surface d’attaque.

### Mesures incluses dans la base

- HTTPS obligatoire.
- Durcissement WordPress :
  - restrictions d’accès à l’administration
  - rôles et droits propres
  - réduction des surfaces inutiles (selon besoin)
- Sauvegardes automatiques (fichiers + base).
- Mises à jour encadrées (WordPress / extensions / thème).
- Surveillance basique : erreurs, indisponibilités.

### WAF

- **Wordfence** utilisé comme WAF / pare-feu applicatif, configuré de manière standard.

---

## 🧾 Formulaires — Protection (socle commun)

Tous les formulaires doivent être protégés **dès la base** :

- anti-spam (honeypot / temporisation)
- limitation de tentatives (rate limit simple)
- validation serveur (obligatoire)

📌 **Captcha**

- inclus dans le socle **si le site a des formulaires publics**
- niveau “standard” : captcha simple (selon outil retenu)

👉 Toute logique avancée (règles conditionnelles complexes, anti-abus renforcé) peut devenir **module sécurité renforcée** (Cat.2).

---

## 🍪 Cookies & consentement — Socle commun

- Bandeau consentement obligatoire.
- Chargement conditionnel des scripts (aucun outil marketing/mesure sans consentement).
- Registre / catégories de consentement (au minimum : nécessaire / mesure / marketing).

👉 Les outils marketing/mesure avancés relèvent du **module Marketing & Tracking** (Cat.2/3).

---

## ⚡ Performance — Socle commun

### Objectif - performance standard

Un site rapide “par défaut”, sans optimisation extrême.

### Mesures incluses dans la base - performance standard

- Cache (page / objet si applicable) configuré selon hébergement.
- Optimisation images : formats modernes (WebP/AVIF si possible), tailles adaptées.
- Chargement différé des médias non critiques.
- Limitation des scripts tiers.

👉 Les optimisations avancées (infrastructure, CDN, stratégie cache poussée, tuning) relèvent de **Cat.4 Performance avancée**.

---

## 🧰 Plugins OSS — Règle générale

- OSS autorisé **uniquement** s’il est :

  - stable, maintenu
  - compatible avec la stack
  - non freemium bloquant
  - utilisable **sans hacks**

- Tous les OSS utilisés doivent être listés dans la documentation projet (voir `template-projet.md`).

---

## ✅ Liste blanche OSS (socle)

> Cette liste peut évoluer. Si un besoin n’est pas couvert → module custom.

- **Wordfence** (WAF / sécurité applicative)
- **Outil de consentement cookies** (à valider, sans dépendance freemium bloquante)
- **Cache** (selon hébergement)
- **Optimisation images** (selon besoin)

📌 Les autres besoins (multi-langue, multi-devises, paiement, livraison, etc.) sont traités via **modules** et/ou OSS **validés au cas par cas**.

---

## 🧪 Contrôles qualité (base)

À valider sur chaque site :

- sécurité : configuration Wordfence en place
- formulaires : anti-spam actif + validation serveur
- cookies : consentement en place + scripts conditionnels
- performance : cache + images optimisées
- mises à jour : procédure définie

---

## 🔁 Liens utiles

- `template-projet.md` — fiche de cadrage projet
- `flux-decisionnel.md` — décider OSS vs custom & placement
- `modules.md` — catalogue modules (synthèse)
- `03-Maintenance/maintenance.md` — maintenance (globale)

---

## 📌 Note

Ce socle est volontairement **minimal et robuste**.
Tout ajout de complexité (plugins, scripts, intégrations) doit passer par :

- une justification
- une documentation
- une validation (catégorie / module)
