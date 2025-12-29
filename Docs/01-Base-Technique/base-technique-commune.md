# Base technique commune — Tous les sites (socle minimal)

Ce document définit le **socle technique minimal commun** appliqué à **tous les sites**, quelle que soit la catégorie (Cat.1, Cat.2, Cat.3, Cat.4).

Il sert de référence interne (agence / partenaire technique) et garantit :

- un niveau de **sécurité mesurable**
- une **stabilité minimale**
- une **maintenance possible**
- une qualité technique homogène

Ce socle est **obligatoire pour tous les projets**.

---

## 🎯 Objectifs minimums

- Sécurité : niveau minimum défini (voir section Sécurité)
- Stabilité : site maintenable sans dette critique
- Performance : site fonctionnel et cohérent
- Maintenance : site maintenable dans le temps

---

## 🔐 1. Sécurité (obligatoire)

### 🎯 Résultat attendu

- Note **A minimum** sur <https://observatory.mozilla.org>

  > ℹ️ La note Mozilla Observatory évalue principalement la configuration serveur
  > (TLS, headers HTTP, bonnes pratiques de sécurité).
  > Elle **ne constitue pas un audit applicatif complet**
  > ni une garantie d’invulnérabilité du site.

### Exigences

- HTTPS actif avec certificat valide
- Redirection HTTP → HTTPS
- TLS à jour (pas de versions obsolètes)
- En-têtes de sécurité configurés :
  - Content-Security-Policy (CSP adaptée)
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
- Cookies sécurisés :
  - Secure
  - HttpOnly
  - SameSite adapté
- XML-RPC désactivé si non requis
- Protection contre attaques par force brute
- Accès admin sécurisé (URL non exposée, rôles limités)

> ⚠️ **Limite de responsabilité**
>
> Le partenaire technique met en œuvre les mesures de sécurité définies dans ce socle,
> mais n’assume **aucune obligation de résultat absolu**
> face à des attaques ciblées, sophistiquées ou à des failles tierces.

### 🍪 Gestion des cookies & consentement (obligatoire)

#### 🎯 Résultat attendu - Gestion des cookies

- Conformité RGPD / ePrivacy (UE)
- Consentement explicite avant dépôt de cookies non essentiels
- Possibilité de modifier le choix à tout moment

#### Exigences - Catégorisation claire des cookies (essentiels, préférences, statistiques, marketing)

- Bandeau de consentement visible et non intrusif
- Acceptation / refus / personnalisation des cookies
- Blocage par défaut des cookies non essentiels
- Chargement conditionnel des scripts tiers (analytics, tracking, pixels)
- Conservation de la preuve de consentement
- Texte clair, sans dark patterns

#### Implémentation standard

- CMP reconnue et maintenue (ex : Complianz, Borlabs ou équivalent)
- Configuration standardisée mutualisable
- Compatibilité WordPress & WooCommerce

> ℹ️ Les outils de marketing, tracking, analytics et pixels tiers
> sont **hors périmètre du socle sécurité**
> et relèvent exclusivement du **module Marketing & Tracking**.

### 🛡️ Protection des formulaires & anti‑spam (obligatoire)

#### 🎯 Résultat attendu - Protection des formulaires

- Protection contre le spam automatisé
- Limitation des abus (flood, bots, injections simples)
- Préservation de la délivrabilité email et des performances

#### Exigences minimales

- Protection anti‑bot sur tous les formulaires publics (contact, devis, inscription)
- Mécanisme non intrusif privilégié (ex : CAPTCHA invisible ou équivalent)
- Blocage du spam automatisé sans dégrader l’expérience utilisateur
- Validation serveur des champs (sanitisation + validation)
- Limitation basique du nombre de soumissions (rate‑limit léger)

#### Implémentation standard - Protection des formulaires

- Solution reconnue et maintenue (ex : reCAPTCHA v3, Turnstile Cloudflare ou équivalent)
- Intégration compatible WordPress & WooCommerce
- Paramétrage mutualisable sur tous les projets

#### Hors périmètre du socle

- Workflows anti‑fraude avancés
- Scoring comportemental complexe
- Systèmes propriétaires ou IA anti‑spam

### Hors Catégorie 1

- Hébergement ne permettant pas la configuration des headers
- Refus HTTPS ou headers de sécurité
- Plugins de sécurité imposés et non maintenus

---

## ⚡ 2. Performance (standard)

### 🎯 Résultat attendu - standard

- Temps de chargement raisonnable
- Expérience fluide sur mobile et desktop

### Exigences - standard

- Cache actif (serveur ou applicatif)
- Images optimisées (compression + dimensions adaptées)
- Chargement différé des médias non critiques
- Scripts non essentiels différés
- Thème léger, sans surcharge inutile
- Pas de dépendances JS excessives

> Objectif : **performance propre et stable**, pas optimisation extrême.

---

## 🧱 3. Architecture & stabilité

### Exigences de l'architecture - standard

- WordPress **non headless**
- Version PHP supportée et maintenue
- Nombre de plugins limité et justifié
- Plugins reconnus, maintenus, sans doublon fonctionnel
- Aucun plugin exotique ou non maintenu
- Structure claire des rôles utilisateurs
- Accès FTP / SSH sécurisé si nécessaire

---

## 🔄 4. Maintenance (socle commun)

La maintenance est **obligatoire** et assurée par le partenaire technique.

### Inclus systématiquement

- Mises à jour WordPress
- Mises à jour plugins et thème
- Vérification post‑mise à jour
- Sauvegardes automatiques
- Monitoring disponibilité
- Correction de bugs techniques mineurs
- Maintien de la conformité sécurité (Mozilla ≥ A)
- Maintien de la conformité cookies & consentement

### Non inclus

- Contenu éditorial
- Changements UI / design
- Ajout de fonctionnalités
- Évolutions métier ou réglementaires

---

## 🧪 5. Vérifications avant livraison (socle commun)

Avant livraison d’un site Catégorie 1, les points suivants doivent être validés :

- [ ] HTTPS actif et fonctionnel
- [ ] Mozilla Observatory ≥ A
- [ ] Sauvegardes opérationnelles
- [ ] Cache actif
- [ ] Plugins à jour et justifiés
- [ ] Accès admin sécurisé
- [ ] Site fonctionnel après mise à jour complète
- [ ] Formulaires protégés contre le spam et les abus

---

## 🚫 6. Exclusions du socle commun

Un projet sort du **socle commun** si :

- l’hébergement est imposé et non configurable
- des plugins non maintenus sont exigés
- des règles de sécurité doivent être désactivées
- la maintenance est refusée par le client
- des contraintes techniques empêchent le respect du socle
- refus de mise en conformité cookies / consentement
- refus de mise en place d’une protection anti‑spam sur les formulaires

---

## 🔎 Lien entre socle commun et Catégorie 1

- La **Base technique commune** s’applique à **tous les sites**, toutes catégories confondues.
- La **Catégorie 1** correspond à :
  > Socle commun
  >
  > - contraintes commerciales et fonctionnelles supplémentaires
  > - périmètre strict (templates, variants, pas de métier)

👉 Un site peut respecter le socle commun **sans** être Catégorie 1.  
👉 Aucun site ne peut être livré **sans** respecter le socle commun.

## 📌 Principe fondamental

> **Le socle technique commun est non négociable.**  
> Il garantit la qualité, la sécurité et la maintenabilité de tous les projets.

---
