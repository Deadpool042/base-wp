# 📚 Stack technique WordPress / WooCommerce

Ce document décrit la **stack technique recommandée**
pour les projets WordPress / WooCommerce
dans le cadre de l’**offre Agence**.

Il précise les composants de base,
les dépendances autorisées,
ainsi que les règles d’architecture front / back.
Il sert de référence pour
l’industrialisation et la qualification des projets.

> 🔒 **Document interne**
> Ce document définit le **socle technique, architectural et fonctionnel**
> utilisé dans toutes les catégories de projets (1 à 4).
> Il sert de référence unique pour :
>
> - l’industrialisation
> - la qualification
> - les dépendances et plugins autorisés
> - l’architecture front / back
> - les règles de remplacement

---

## 🎯 Objectif du socle commun

Ce socle a pour objectifs :

- garantir une **base stable et maintenable**
- éviter les dépendances risquées (plugins freemium, lock-in)
- permettre des **livraisons rapides et cohérentes**
- définir ce qui est **système vs module métier**
- préserver la capacité à **remplacer ou internaliser** des composants
- faciliter la montée en catégorie (1 à 4)
- assurer une qualité constante entre les projets
- réduire les coûts de maintenance et d’évolution
- favoriser les bonnes pratiques WordPress / WooCommerce
- assurer la compatibilité avec les évolutions futures
- permettre une formation et une prise en main aisées
- optimiser les performances globales du site
- garantir la sécurité et la conformité réglementaire
- faciliter l’intégration avec des services tiers
- assurer une expérience utilisateur cohérente
- permettre une personnalisation maîtrisée
- garantir la pérennité des choix technologiques
- favoriser l’innovation et l’adoption de nouvelles technologies
- assurer une documentation claire et accessible
- faciliter la collaboration entre les équipes
- garantir une évolutivité adaptée aux besoins futurs
- optimiser les coûts de développement et d’exploitation
- assurer une gestion efficace des ressources serveur
- garantir une accessibilité conforme aux standards
- faciliter la gestion des contenus et des médias
- assurer une compatibilité multi-navigateurs et multi-appareils
- garantir une intégration fluide avec les outils marketing
- assurer une gestion efficace des utilisateurs et des rôles
- faciliter la mise en place de workflows de développement agiles
- garantir une surveillance et une analyse performantes du site
- assurer une gestion efficace des sauvegardes et de la restauration
- faciliter la mise en place de tests automatisés et manuels

---

## 📍 Stack technique recommandée

Cette section définit **le socle strictement commun**, présent sur **tous les projets**,
indépendamment de la catégorie (1 à 4).

Tout ajout hors de ce périmètre relève :

- soit de la **white-list par catégorie**
- soit d’un **module interne**
- soit d’une **option explicitement validée**

---

### 💻 Base WordPress (socle obligatoire)

- **WordPress core**

  - Version stable supportée officiellement
  - Configuration serveur compatible (PHP-FPM, OPcache, HTTPS)
  - Mises à jour de sécurité obligatoires

- **Thème**
  - Thème léger compatible Gutenberg (Astra _free_ ou équivalent)
  - Aucun page builder lourd ou freemium bloquant
  - Personnalisation via thème enfant ou code interne uniquement

---

### 🔌 Plugins socle obligatoires (toutes catégories)

Ces plugins sont **gratuits, remplaçables et sans lock-in**.

- **Yoast SEO (Free)** ou **Rank Math (Free)** – SEO de base
- **Contact Form 7** – formulaires simples
- **Flamingo** – stockage des soumissions CF7
- **WP Super Cache** ou **LiteSpeed Cache** – cache page
- **Google XML Sitemaps** – génération de sitemap
- **Query Monitor** – debug (environnement non-prod)
- **Health Check & Troubleshooting** – diagnostic
- **Polylang (Free)** – multi-langue simple (si requis)

⚠️ Tout autre plugin est **hors socle** et doit être justifié
via la white-list ou un module interne.

---

### 🔓 Plugins optionnels (selon catégorie)

Les plugins suivants **ne font pas partie du socle**.
Ils peuvent être utilisés uniquement s’ils sont :

- listés dans `stack-whitelist.md`
- validés pour la catégorie concernée
- encapsulés via une couche d’abstraction

Exemples :

- sécurité avancée
- sauvegardes
- optimisation images
- analytics
- newsletters
- e-commerce

---

### 🧱 Niveaux de composants

- **Socle obligatoire**  
  Présent sur tous les projets (ce document)

- **Optionnel cadré**  
  Dépend de la catégorie projet (voir white-list)

- **Métier**  
  Implémenté via module interne ou plugin client uniquement

---

### 📦 Composants UI / UX (toutes catégories)

Ces règles s’appliquent **quel que soit le niveau de catégorie**.

Le front se base sur :

- **Gutenberg** (éditeur de blocs)
- **Patterns / Variants** intégrés au thème
- **UI minimale et performante**
- Pas de builders lourds ni de "framework de page builder"
- ➡️ Toute logique UI doit être :
  - dans le thème (patterns, components)
  - ou via un module interne
  - jamais via un plugin tiers lourd
  - Respect des normes d’accessibilité (WCAG)
  - Optimisation pour les performances front-end
  - Compatibilité multi-navigateurs et multi-appareils
  - Utilisation de CSS et JavaScript optimisés
  - Mise en place de tests utilisateurs pour valider l’UX
  - Documentation des composants UI pour les développeurs
  - Facilité de personnalisation pour les besoins spécifiques du projet
  - Intégration fluide avec les modules métier spécifiques
  - Utilisation de bibliothèques légères et performantes
  - Respect des bonnes pratiques de développement front-end
  - Mise en place de processus de revue de code pour le front-end
  - Surveillance continue des performances front-end
  - Optimisation des temps de chargement des pages
  - Utilisation de techniques modernes de développement front-end (Flexbox, Grid, etc.)

---

## 🔌 Politique de dépendances

### ✅ Plugins autorisés (gratuits et remplaçables)

Ceux qui sont :

- **gratuits utilisables en production**
- **légers et performants**
- **maintenus régulièrement**
- **sans upsells persistants**
- **remplaçables facilement** par une alternative OSS ou un module interne
- **compatibles avec la version de WordPress utilisée**
- **conformes aux normes de sécurité**
- **documentés clairement**
  (la liste par catégorie est définie dans **stack-whitelist.md**, document de gouvernance)

Toute exception doit être :

- documentée
- validée explicitement
- réversible sans refonte majeure

---

## 📦 Architecture des plugins custom

Ce socle suppose l’usage de **3 plugins custom séparés** pour structurer proprement les responsabilités :

### 🧰 1. Plugin Agence

Contient :

- socle technique (sécurité/performance)
- framework des modules internes
- helpers génériques
- intégration des dépendances OSS via abstraction

- Ne contient pas :
- règles métier spécifiques au client
- contenu éditorial client

### 🪪 2. Plugin Client

Contient :

- règles métier propres au projet
- paramètres spécifiques au client
- custom post types métier
- connecteurs uniques

Ne contient pas :

- code réutilisable sur d’autres projets
- outils génériques d’agence

### 🗂️ 3. Plugin Webmaster

Contient :

- outils d’administration spécifiques
- optimisations SEO avancées
- configurations de monitoring
- outils de gestion de contenu

Ne contient pas :

- règles métier
- socle technique
- connecteurs externes
- outils réutilisables sur d’autres projets
- contenu éditorial client
- modules internes génériques
- custom post types métier
- paramètres spécifiques au client
- framework des modules internes
- helpers génériques
- intégration des dépendances OSS via abstraction
- optimisations de performance serveur
- configurations de sécurité avancées
- outils de sauvegarde et de restauration
- outils de gestion des utilisateurs et des rôles

---

## 🚦 Règle d’abstraction (Adapter / Wrapper)

Pour tout plugin utilisé :

1. Créer une **couche d’abstraction** (Adapter)
2. Ne jamais appeler le plugin directement dans tous les templates
3. Garder la capacité à **remplacer le plugin** sans tout casser
4. Documenter l’Adapter pour faciliter la maintenance et les évolutions futures
5. Mettre en place des tests unitaires pour l’Adapter afin de garantir son bon
6. fonctionnement lors des mises à jour du plugin sous-jacent
7. Assurer une séparation claire entre la logique métier et l’Adapter
8. Utiliser des interfaces pour définir les interactions avec l’Adapter
9. Prévoir des mécanismes de fallback en cas de défaillance du plugin sous-jacent
10. Suivre les bonnes pratiques de développement pour garantir la qualité du code de l’Adapter
11. Mettre en place un processus de revue de code pour les modifications apportées à l’Adapter
12. Surveiller les performances de l’Adapter pour éviter les goulots d’étranglement
13. Documenter les dépendances du plugin sous-jacent pour faciliter la gestion des versions
14. Assurer la compatibilité de l’Adapter avec les différentes versions de WordPress et PHP utilisées dans les projets

---

## 🔐 Sécurité globale

Inclut :

- mises à jour WordPress / plugins
- configuration firewall
- durcissement WordPress
- surveillance des intrusions
- audits de sécurité réguliers
- gestion des accès et permissions
- sauvegardes régulières et tests de restauration
- conformité RGPD et autres régulations
- formation des équipes aux bonnes pratiques de sécurité
- surveillance des vulnérabilités connues
- mise en place de certificats SSL/TLS
- gestion des mots de passe et authentification forte
- journalisation des activités et audits
- plan de réponse aux incidents de sécurité
- tests de pénétration périodiques
- sensibilisation à la sécurité pour les utilisateurs finaux
- utilisation de plugins de sécurité reconnus et maintenus
- configuration sécurisée des serveurs d’hébergement
- surveillance continue des performances et de la disponibilité du site
- mise en place de politiques de sécurité claires et documentées
- évaluation régulière des risques de sécurité
- intégration de la sécurité dans le cycle de développement

---

## 📄 Documents associés

- [Liste blanche des plugins autorisés](stack-whitelist.md) (document de gouvernance – référence prioritaire)
- [Architecture des modules internes](modules.md)
