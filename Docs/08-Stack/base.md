# 🧱 Socle technique commun — Toutes catégories

> 🔒 **Document interne**
>
> Ce document définit le **socle technique, architectural et fonctionnel**
> utilisé dans toutes les catégories de projets (1 à 4).
>
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

---

## 📍 Stack technique recommandée

### 💻 Base WordPress

- **WordPress core**
  - Version stable supportée officiellement
  - Préférer configurations serveur compatibles (PHP FPM, etc.)
- **Thème recommandé**
  - **Astra** (léger, compatible Gutenberg)
  - **Spectra** (patterns & UI building léger)

👉 Objectif : **aucun page builder lourd** (pas d’Elementor, pas de solution freemium bloquante).

---

## 📦 Composants UI / UX (toutes catégories)

Le front se base sur :

- **Gutenberg** (éditeur de blocs)
- **Patterns / Variants** intégrés au thème
- **UI minimale et performante**
- Pas de builders lourds ni de "framework de page builder"

➡️ Toute logique UI doit être :

- dans le thème (patterns, components)
- ou via un module interne
- jamais via un plugin tiers lourd

---

## 🔌 Politique de dépendances

### ✅ Plugins autorisés (gratuits et remplaçables)

Ceux qui sont :

- **gratuits utilisables en production**
- sans obligation d’upgrade pour fonctionner
- **sans dépendance bloquante ou verrouillage fonctionnel**
- **remplaçables** par une alternative OSS ou un module interne

(la liste par catégorie est définie dans **stack-whitelist.md**, document de gouvernance)

### ❌ Plugins interdits

- freemium qui bloque des fonctions en prod
- “suites” monolithiques (multiples fonctions non séparables)
- dépendances non documentées ou fermées
- plugins dont le modèle économique peut impacter la maintenance ou la réversibilité

---

## 📦 Architecture des plugins custom

Ce socle suppose l’usage de **3 plugins custom séparés** pour structurer proprement les responsabilités :

### 🧰 1. Plugin Agence

Contient :

- socle technique (sécurité/performance)
- framework des modules internes
- helpers génériques
- intégration des dépendances OSS via abstraction

Ne contient pas :

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

- outils d’édition et UX safe pour les éditeurs
- patterns de contenu
- réglages SEO/contours éditoriaux
- éléments non-métier mais utiles au quotidien

---

## 🚦 Règle d’abstraction (Adapter / Wrapper)

Pour tout plugin utilisé :

1. Créer une **couche d’abstraction** (Adapter)
2. Ne jamais appeler le plugin directement dans tous les templates
3. Garder la capacité à **remplacer le plugin** sans tout casser

---

## 🔐 Sécurité globale

Inclut :

- mises à jour WordPress / plugins
- protections anti-brute force
- règles d’en-têtes sécurité
- vérifications HTTPS strictes
- surveillance des formulaires (anti-spam OSS si nécessaire)

Exclut :

- sécurité applicative métier
- firewall applicatif complexe (hors accord spécifique)

### 🔐 Protection applicative

Pour une couche WAF applicative légère, il est possible d’installer :

- **Wordfence Security (version gratuite)**

Cette intégration est **optionnelle mais recommandée**.

Wordfence :

- bloque en temps réel certaines attaques applicatives
- complète les protections serveur
- ne remplace pas une solution WAF infra (Cloudflare / ModSecurity)

---

## 📈 Performance standard

- cache page statique
- optimisation des assets (CSS/JS)
- compression / WebP
- CDN si nécessaire
- monitoring de performance de base

---

## 🍪 Cookies & Consentement

- gestion des cookies selon RGPD
- scripts marketing uniquement avec consentement explicite
- pas de tracking sans cadre et tiers consentis

---

## 📊 Données & Tracking

- métriques de base (via plugins OSS tels que GA OSS)
- pas de collecte extensive / identification sans accord
- documentation interne claire

---

## 🧠 Fonctionnalités frontières

Certaines fonctionnalités ne sont pas du socle obligatoire,
mais peuvent être activées selon les besoins, **si elles respectent la politique de dépendances (gratuité, réversibilité, absence de lock-in)**.

### 📌 Multi-langue

Autorisé si :

- implémentation via plugin gratuit et remplaçable (Polylang Free par exemple)
- ou via module interne métier si des règles de traduction complexes sont requises

### 📌 Multi-devises

Autorisé si :

- géré par un plugin gratuit et remplaçable
- ou via module interne si règles métier spécifiques (tarification, taxes)

---

## 🧰 Workflows & Modules internes conseillés

Fonctions que tu devrais coder en module (pas plugin tiers) :

- Workflow métier (validation, étapes)
- Tarification métier
- Accises / réglementaire
- Connecteurs (ERP/CRM)
- Tunnel de conversion structuré
- Recherche & filtres avancés
- Dashboard personnalisé

👉 L’idée : **plugins pour commodité et standard**, **modules internes pour valeur métier et différenciation**.

---

## 🧩 Pattern de release / maintenance

Tous les composants doivent :

- avoir un système de version
- être testés avant mise en prod
- avoir une **feuille de migration**
- avoir une documentation associée
- être examinés pour impact sur maintenance

---

## 📌 Versioning du socle

- **v1** : socle minimal Cat.1 → Cat.2
- **v2** : ajout modules internes
- **v3** : cases Cat.3 / Cat.4

Chaque mise à jour de socle doit être **revue globale**.

---

## 📝 Conclusion

Ce socle ne couvre pas les **règles métier spécifiques**,
mais définit les **contrôles techniques et choix d’architecture**
sur lesquels toutes les catégories s’appuient.

---

## 📍 Annexes recommandées

Ces documents complètent le socle technique et doivent être utilisés
en complément de ce fichier. Ils détaillent :

- **stack-whitelist.md** (plugins autorisés, gratuits et remplaçables par catégorie)
- **adapter-patterns.md** (exemples d’adapters)
- **security-hardening.md**
- **performance-baseline.md**
