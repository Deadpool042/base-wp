# WP Base v1 — Prêt projet (Spéc interne, 1 page)

## Executive Summary

Ce document présente le socle WordPress unique (mono-repo) conçu pour générer rapidement des sites “projet-ready”. L'objectif est de fournir une base stable, sécurisée et conforme RGPD, facilitant le développement local et la gestion ultérieure des projets clients et déclinaisons (headless / Next.js). La version 1 se concentre sur un socle commun robuste, sans viser une production durcie complète.

---

## Glossaire rapide

- **Socle** : Ensemble commun et réutilisable de configurations, plugins et conventions pour tous les sites.
- **Profil** : Composition spécifique d’un site WordPress selon ses besoins (ex : vitrine, blog, ecommerce).
- **Prêt projet** : Environnement local reproductible avec des conventions stables et un socle préparé sécurité/RGPD/performance, sans prétendre à une production finale durcie.

---

## Périmètre v1

### Inclus (socle commun à tous les sites)

#### Thème & édition (décision v1)

- Thème : Astra Pro
- Éditeur : Gutenberg
- Blocks : Spectra

#### Sécurité — niveau socle

- Baseline sécurité avec durcissement raisonnable (pas de WAF/CDN imposé en v1)
- Stratégie “pas de trous évidents” : gestion des accès admin/roles, désactivation des surfaces inutiles, hygiène des secrets/env
- Objectif documentation : viser une conformité “mesurable” (type Observatory) en production, sans blocage en local

#### Cookies & consentement (décision v1)

- CMP standard : Complianz
- Règle : aucun tracking non essentiel actif par défaut (opt-in)

#### Formulaires — anti-spam (décision v1)

- Captcha par défaut : Cloudflare Turnstile (si formulaire public)
- Protection standard : validation serveur + anti-spam léger (honeypot, tempo, rate-limit)

#### Performance — standard

- Cache “standard” (selon hébergement plus tard), optimisation images, lazyload, scripts raisonnables
- Objectif : base rapide sans sur-optimisation prématurée

#### Architecture & stabilité

- Conventions claires de structure (emplacement de la config, assets, plugins, mu-plugins)
- Séparation nette entre socle commun et ajouts projet

#### Maintenance (socle commun)

- Cadre prévu pour mises à jour, backups, contrôles avant livraison (process), sans automatisation “prod” obligatoire en v1

---

## Profils WP Classic (v1)

Les profils sont définis sur le papier (composition) même si aucun module métier n’est encore implémenté.

1. **wp-classic/vitrine**
   - Pages, navigation, formulaire contact protégé, SEO et performance standards

2. **wp-classic/blog**
   - Vitrine + catégories, tags, auteur, archives, recherche

3. **wp-classic/ecommerce** (activé quand e-commerce confirmé)
   - Socle + WooCommerce + exigences emails transactionnels “projet-ready”
   - (WooCommerce est intégré au socle uniquement si profil ecommerce)

---

## Hors scope v1 (volontaire)

- “Prêt prod” complet (headers serveur, CSP/HSTS final, CDN/WAF, tuning infra, observabilité avancée)
- Automatisation “doctor –fix”
- Modules métier client (billing, TVA, multi-apps, etc.)
- Multi-tenant / instances clients dans le mono-repo
- Variantes WP headless et Next.js (à définir après stabilisation WP classic)

---

## Règles de non-dérive (stack refus)

Dès v1, la logique “stack refus” s’applique :

- Refus des builders lourds, plugins freemium à pression commerciale, “tout-en-un” opaques
- Refus du tracking sans consentement
- Refus de l’empilement de plugins sans justification
- Refus d’hébergement non conforme (à la mise en production)

---

## Contrat de sortie (Definition of Done v1)

Le socle v1 est considéré “OK” lorsque :

- On peut instancier un WP “projet-ready” avec Astra Pro + Spectra
- CMP Complianz standardisée (désactivable/activable selon besoin), Turnstile standardisé pour formulaires
- Profils classic (vitrine, blog, ecommerce) documentés et différenciés par composition
- Conventions d’architecture écrites (emplacement des plugins, mu-plugins, presets)
- Le tout est stable, compréhensible, et prêt à accueillir les modules/plugins ultérieurement
