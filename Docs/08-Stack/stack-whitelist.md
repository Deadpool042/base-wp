# 📦 Liste blanche — Plugins autorisés (solutions gratuites et remplaçables)

> 🔒 **Document interne**
>
> Cette liste regroupe les plugins **autorisés (gratuits ou free tier acceptable)** par catégorie
> de projet. La règle est simple : **pas de dépendance bloquante**, pas de verrouillage fonctionnel,
> toutes les solutions doivent être **remplaçables**.

---

## 🔎 Définition importante

Dans ce document, **autorisé** ne signifie pas strictement _open‑source_ au sens licence,
mais :

- solution **gratuite utilisable en production**
- sans obligation d’upgrade pour fonctionner
- sans verrouillage des données
- **remplaçable** par un équivalent OSS ou un module interne

Tout plugin avec stratégie d’upsell agressive, limitation artificielle
ou dépendance commerciale critique est **exclu**.

---

## 🟢 Catégorie 1 — Standard

Statut : plugins gratuits, remplaçables, validés par la stack interne.

Objectif : stack minimal, stable, facile à maintenir.

### 📌 Gestion des cookies / consentement

- **Complianz – GDPR/CCPA Cookie Consent**  
  Gestion des cookies complète, solution gratuite, remplaçable.

### 📌 SEO basique

- **Yoast SEO (Free)**  
  Alternative plugin remplaçable bien connue.
- **Rank Math SEO (Free)**  
  Solution gratuite complète.

### 📌 Formulaires

- **Contact Form 7**  
  Formulaires légers, solution gratuite, maintenus.
- **Flamingo** _(optionnel)_  
  Permet de stocker les soumissions CF7.

### 📌 Cache / performance

- **WP Super Cache**  
  Cache page simple.
- **LiteSpeed Cache** _(si serveur compatible)_  
  Très bon outil de cache, plugin remplaçable.

### 📌 Images & Media

- **WebP Converter for Media**  
  Conversion WebP automatique.
- **Smush – Image Optimizer (Free)**  
  Optimisation images.

⚠️ Attention : Smush est accepté uniquement en version gratuite,  
sans activation d’upsell ni de fonctionnalités verrouillées.

### 📌 Sitemap

- **Google XML Sitemaps**  
  Génère un sitemap classique.

### ⚠️ Interdit en Cat.1

- Plugins qui offrent des upsells persistants
- Suites “tout-en-un” avec bon nombre de modules activés par défaut

---

## 🟠 Catégorie 2 — Avancé

Statut : plugins gratuits, remplaçables, validés par la stack interne.

Objectif : fonctionnalités avancées sans complexité métier.

> On autorise un plugin **par besoin** uniquement.

### 📌 Recherche & filtres

- **Search & Filter**  
  Permet d’ajouter recherche améliorée et filtres.

### 📌 Multi-langue

- **Polylang (Free)**  
  Multi-langue simple.

### 📌 Newsletter / Email

- **MailPoet (Free)**  
  Permet d’envoyer newsletters depuis WordPress (Attention au volume).

⚠️ À éviter dès que le volume ou la délivrabilité devient critique.  
Prévoir une solution externe (Brevo, Resend, etc.).

### 📌 Tracking & Analytics

- **GA Google Analytics**  
  Intégration GA4 sans scripts inline.

### 📌 Tunnel de conversion

- **WP Funnels Lite** _(plugin remplaçable)_  
  Version libre pour tunnels simples.

### 📌 SEO avancé

- **Rank Math Free**  
  Avec schema et optimisations techniques.

### ⚠️ Bonnes pratiques Cat.2

- Limiter à un plugin _par fonctionnalité majeure_
- Toujours planifier une **couche d’abstraction (adapter)**

---

## 🔴 Catégorie 3 — Métier / Réglementé

Statut : plugins gratuits, remplaçables, validés par la stack interne.

Objectif : logique métier + code maison prioritaire.

> Ici, on **évite les plugins métier**.
> Les plugins doivent être **des briques techniques**, pas des cages métier.

### 📌 Utilitaires techniques

- **Query Monitor**  
  Outils de debug lors du dev.

- **WP-API (core)**  
  Tous les ajouts REST doivent rester plugin remplaçable.

- **WP Log Viewer**  
  Lecture simple des logs.

### 📌 Cache / objets

- **Object Cache Redis** _(si serveur dispo)_  
  Cache objet.

### ⚠️ Règles métier

Les éléments métier (accises, tarification, workflow) sont :

- implémentés **en module interne**
- ou réalisés via des extensions internes (pas plugin tiers)

Aucun plugin métier externe n’est autorisé sans revue approfondie.

---

## 🔵 Catégorie 4 — Premium / Headless

Statut : plugins gratuits, remplaçables, validés par la stack interne.

Objectif : architecture headless ou sur-mesure.

### 📌 API / headless

- **WPGraphQL**  
  Expose le contenu via GraphQL.

- **WP REST Filter**  
  Ajoute des filtres plugin remplaçable pour REST.

- **JWT Authentication**  
  Auth pour APIs REST/Headless.

### 📌 Media / utilitaires

- **WP Offload Media Lite** _(version gratuite acceptable, remplaçable par module interne)_  
  Permet offload media vers S3/Cloud.

### 📌 Observabilité

- **Query Monitor**
- **WP-API**

### ⚠️ Notes Cat.4

- La majorité du code métier et logique complexe
  doit être du **développement spécifique**.
- Les plugins doivent exposer des APIs claires.
- Ne jamais utiliser un plugin qui bride la structure headless.

---

## 🧠 Règles transversales à respecter

### 🧩 Adapter / Wrapper

Pour chaque plugin utilisé :

- créer une **couche d’adaptation interne**
- ne pas multiplier les usages directs du plugin dans le theme
- permettre un **remplacement facile**

### 🔄 Mise à jour

- vérifier compatibilité PHP / WP
- pas d’updates automatiques sans tests
- audits réguliers

### 🧪 Remplacement

Si un plugin n’a plus d’alternative plugin remplaçable viable :

- planifier un **module interne**
- documenter la migration

---

## ⚠️ Règle de conformité

Tout plugin listé ici peut être **retiré à tout moment** si :

- son modèle économique change
- une dépendance commerciale apparaît
- une alternative interne devient plus pertinente

La liste blanche est un **outil de gouvernance**, pas une garantie définitive.

---

## 📌 Conclusion

Cette **liste blanche** est un guide de référence interne.  
Chaque utilisation doit être validée selon :

- la catégorie du projet
- le périmètre fonctionnel
- la stratégie de maintenance

🔁 Toute évolution de cette liste doit passer par une **revue interne**.
