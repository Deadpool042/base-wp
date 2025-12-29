# Modules — Catalogue (synthèse)

Ce document est la **version courte** du catalogue modules.

Objectifs :

- lister les **modules les plus courants**
- clarifier ce qui est **natif WordPress / WooCommerce**
- renvoyer vers des **fichiers dédiés** pour le détail (périmètre, prix, exclusions)

👉 **Un module n’est jamais inclus par défaut.**

---

## 🧱 Stack technique autorisée (WordPress / WooCommerce)

Par défaut, les modules s’appuient sur la **stack technique validée** suivante :

### WordPress

- WordPress stable (dernière LTS recommandée)
- Thème léger orienté performance (ex : Astra)
- Éditeur de blocs (Gutenberg / Spectra)
- Pas de page builder lourd par défaut (Elementor exclu)

### WooCommerce

- WooCommerce stable (LTS)
- Checkout natif WooCommerce
- Hooks & extensions officielles ou validées
- Pas de surcharge du core Woo sans validation

👉 Tout écart à cette stack entraîne :

- une requalification de catégorie
- ou un devis spécifique

---

## ✅ Ce que WordPress fournit nativement (hors modules)

WordPress couvre nativement :

- pages & articles, catégories, tags
- recherche simple
- médias (images, fichiers)
- gestion de menus
- utilisateurs & rôles (standard)
- formulaires via plugins légers (contact simple)
- SEO de base via plugins (métas simples) selon socle technique

👉 Si ces besoins suffisent, on reste en **Catégorie 1**.

---

## ✅ Ce que WooCommerce fournit natively (hors modules)

WooCommerce couvre nativement :

- catalogue produits (simples / variables)
- panier & checkout standard
- paiements basiques (via passerelles)
- livraison simple (zones + règles basiques)
- coupons / promos simples
- taxes standard
- emails transactionnels standards
- filtres basiques (catégories, attributs)

👉 Si on reste dans ce cadre, on reste en **Catégorie 1**.

---

## 🟢 Catégorie 2 — Modules standards (les plus courants)

> Modules fonctionnels maîtrisés — périmètre fini, risque contenu.

### 🌍 Multi-langue (Cat.2)

- 2 langues, structure URL (/fr, /en), sélecteur, hreflang de base
- exclut : SEO international avancé, contenu multi-pays complexe

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-multi-langue.md`

---

### 🇪🇺 Multi-devises (Cat.2)

- 2 devises, conversion, arrondis cohérents, affichage panier/checkout
- exclut : fiscalité internationale, pricing par pays

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-multi-devises.md`

---

### 💳 Paiement (Cat.2)

- 1–2 moyens standards (ex : Stripe/PayPal), DSP2/3DS, tests sandbox
- exclut : abonnements, paiement fractionné, wallets multiples avancés

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-paiement.md`

---

### 🚚 Livraison (Cat.2)

- dès que la livraison dépasse le **Woo natif** (zones basiques + règles simples)
- domicile + relais simple, règles par zones/tranches, tests panier→checkout

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-livraison.md`

---

### 🔀 Tunnel de vente (Cat.2)

- tunnel simple (2–4 étapes), formulaires multi-étapes, protections anti-spam
- exclut : scoring, A/B testing avancé, automatisation marketing

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-tunnel-de-vente.md`

---

### 📈 Analytics e‑commerce (Woo) (Cat.2)

- configuration analytics Woo (ventes, panier, produits)
- tableaux de bord standards
- conformité RGPD (via consentement)
- exclut : data science, attribution avancée, BI externe

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-analytics-woo.md`

---

### 🤖 Assistant IA / Chat intelligent (Cat.2)

ℹ️ **Modalité spécifique**

Le module Assistant IA est le **seul module** :

- reposant sur un service externe à coût variable (API IA)
- soumis à un **abonnement mensuel dédié**, en sus de la maintenance globale
- entièrement désactivable sans impact sur le fonctionnement du site

👉 Cet abonnement couvre l’usage IA, l’infrastructure associée et le pilotage.

- assistant conversationnel orienté **conversion et support pré‑achat**
- réponses basées sur :
  - contenu du site (pages, FAQ, produits)
  - règles métier simples fournies
- aide au choix produit, orientation, réponses fréquentes
- possibilité d’évolution vers support client (Cat.3)

Exclut (non négociable) :

- promesse de réponses parfaites
- entraînement IA propriétaire complexe
- analyse juridique / fiscale
- support client temps réel illimité

🧱 **Stack autorisée** :

- WordPress / WooCommerce
- API IA (OpenAI ou équivalent)
- base de connaissances contrôlée (contenu site / FAQ)

👉 Voir : `module-assistant-ia.md`

---

### 📨 Newsletter & Email marketing (light) (Cat.2)

- collecte email + double opt-in + connexion outil emailing (Brevo/Mailchimp)
- exclut : segmentation avancée, automation complexe, rédaction contenu

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-newsletter-email-marketing.md`

---

### 🔍 Recherche & filtres avancés (Cat.2)

- filtres combinables, recherche améliorée (pondération basique), mobile
- exclut : moteurs externes (Algolia/Elastic avancé), IA de recherche

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-filtre-et-recherche.md`

---

### 📈 SEO avancé (Cat.2)

- SEO on‑site avancé (structure, balises, maillage, schema simples)
- optimisation pages clés & templates
- exclut : stratégie éditoriale longue durée, SEO international avancé

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-seo-avance.md`

---

### 🔐 Sécurité renforcée (Cat.2)

- extension du **socle sécurité commun** (headers, TLS, consentement déjà en place)
- durcissement avancé WordPress/Woo (accès admin, rôles, surfaces d’attaque)
- protection formulaires renforcée (captcha avancé, honeypot, rate‑limit fin)
- surveillance étendue & alertes
- exclut : audit sécurité profond, SOC, réponse à incident

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-securite-renforcee.md`

---

### 👤 Comptes clients avancés (Cat.2)

- personnalisation de l’espace “Mon compte”
- champs supplémentaires, affichage conditionnel
- parcours client amélioré (commandes, infos, documents)
- exclut : portails clients complexes, logique métier spécifique

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-compte-client.md`

---

### 🌗 Dark mode / Thème adaptatif (Cat.2)

- mode sombre / clair utilisateur (préférence système + toggle)
- styles cohérents sur tout le site (UI, contenus, Woo)
- respect accessibilité (contrastes, lisibilité)
- exclut : theming complexe par rôle ou branding multi‑chartes

🧱 **Stack autorisée** : WordPress / WooCommerce (thème + extensions validées)

👉 Voir : `module-dark-mode.md`

---

### ♿️ Accessibilité renforcée (Cat.2)

- outils d’adaptation visuelle (taille texte, contraste, lisibilité)
- exclut : audits RGAA, adaptations métier spécifiques, validation légale

- 🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-accessibilite-renforcee.md`

---

### 🔌 Connecteurs simples (Cat.2)

- connexion à 1 outil tiers, sync simple, logs basiques, doc d’usage
- exclut : sync bidirectionnelle complexe, dépendance critique

🧱 **Stack autorisée** : WordPress / WooCommerce (extensions validées)

👉 Voir : `module-connecteurs.md`

---

> ℹ️ Les modules IA de Catégorie 2 sont limités à des usages
> d’assistance, d’orientation et de conversion.
> Tout usage critique, métier ou réglementé
> entraîne un passage en **Catégorie 3**.

## 🔴 Catégorie 3 — Modules métier / réglementés

> Modules critiques — cadrage strict, validation écrite, maintenance renforcée.

### 🧾 Accises & fiscalité spécifique (Cat.3)

- taxes spécifiques (accises / droits indirects), règles fournies par le client
- prérequis : règles écrites + formules validées + périmètre géographique défini
- exclut (non négociable) : conseil fiscal/juridique, responsabilité en cas de contrôle

🧱 **Stack autorisée** : WooCommerce + extensions spécialisées validées (selon cadrage)

👉 Voir : `module-accises-fiscalite.md`

---

### 🏷️ Tarification métier (Cat.3)

- prix conditionnels (B2B/B2C, volume, contrat), priorisation des règles
- prérequis : règles écrites exhaustives + validation client
- exclut : moteur illimité, pricing algorithmique/IA, ERP complexe

🧱 **Stack autorisée** : WooCommerce + extensions spécialisées validées (selon cadrage)

👉 Voir : `module-tarification-metier.md`

---

### 📊 Dashboard personnalisé (hors admin WP) (Cat.3)

- interface dédiée hors wp‑admin
- vues métier (commandes, clients, KPIs)
- accès par rôles, permissions spécifiques
- exclut : BI avancée, reporting temps réel massif

🧱 **Stack autorisée** : WooCommerce + extensions spécialisées validées (selon cadrage)

👉 Voir : `module-dashboard-personnalise.md`

---

## 🔵 Catégorie 4 — Modules premium

> Architecture / performance — cas ponctuels, sur devis.

🧱 **Stack autorisée** : WordPress headless / Next.js / infra spécifique (sur devis)

### ⚡ Performance avancée (Cat.4)

> ℹ️ Ce module s’appuie sur le **socle performance commun**
> (hébergement, cache de base, bonnes pratiques)
> et intervient uniquement pour des **optimisations avancées**.

👉 Voir : `module-performance-avancee.md`

### 🧱 Architecture Headless (Cat.4)

👉 Voir : `module-architecture-headless.md`

---

## ℹ️ Règle de facturation des modules (rappel)

- les **tarifs des modules** sont définis dans leurs **fichiers dédiés**
- la **catégorie du projet** (Cat.2, Cat.3, Cat.4) prime toujours sur la nature du module
- il n’existe **aucune répartition financière par module** dans ce document
- la maintenance est **globale**, non cumulative, et définie dans le dossier Maintenance

👉 Toute ambiguïté sur la catégorie entraîne une **requalification du projet**.

---

## 🚫 Règles non négociables

- un module ne devient jamais “inclus”
- tout module ajoute de la complexité
- trop de modules → requalification catégorie
- un module mal défini = refus
- aucun outil marketing / tracking sans consentement explicite

---

## 📌 Principe final

> **Les modules créent de la valeur, pas du chaos.**
