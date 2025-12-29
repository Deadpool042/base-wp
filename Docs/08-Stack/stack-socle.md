# 🧱 Stack socle — Commun à tous les sites

> 🔒 **Document interne**
>
> Ce document liste **ce qui est installé / activé par défaut** sur tous les sites,
> quelle que soit la catégorie (Cat.1 → Cat.4).
>
> Objectifs :
>
> - standardiser la stack
> - éviter les plugins freemium bloquants
> - garantir un minimum de sécurité / conformité / performance
> - rendre la maintenance prévisible

---

## ✅ Principes non négociables

- Le socle doit rester **minimal**, stable, maintenable.
- Pas de dépendance “freemium bloquante”.
- Pas de page builder lourd par défaut.
- Toute exception doit être documentée dans la fiche projet.

---

## 🧩 Répartition (où ça vit)

| Élément                                            | Où ça vit            | Accès            |
| -------------------------------------------------- | -------------------- | ---------------- |
| Socle sécurité / perf / consentement / protections | **Plugin Agence**    | Agence           |
| Outils d’édition (blocs, modèles, UI “safe”)       | **Plugin Webmaster** | Webmaster client |
| Métier spécifique / règles propres au client       | **Plugin Client**    | Admin client     |

👉 Voir aussi : `flux-decisionnel.md` (OSS vs custom & placement).

---

## 🧱 WordPress — Base commune

### Thème & édition

- **Astra** (thème)
- **Gutenberg** (éditeur de blocs)
- **Spectra** (blocs)

### Configuration standard

- rôles WP propres et limités (admin / éditeur / auteur / etc.)
- structure pages / articles / blog disponible nativement
- médias : tailles d’images définies + bonnes pratiques (formats modernes si possible)

---

## 🛒 WooCommerce — Base commune (si e-commerce)

- WooCommerce stable
- catalogue produits standard
- panier + commande natifs
- taxes / coupons / emails transactionnels natifs (standard)

📌 Dès qu’on dépasse le natif (paiement, livraison, devises, règles avancées), on passe via **modules** (Cat.2+).

---

## 🔐 Sécurité — Socle (toujours)

### OSS autorisé

- **Wordfence** (WAF / pare-feu applicatif)

### Module socle (Plugin Agence)

- durcissement WP (réduction surface d’attaque selon besoin)
- contrôle des accès admin (pratiques standard)
- alertes techniques (événements critiques)

---

## 🍪 Cookies & consentement — Socle (toujours)

### OSS autorisé - cookies / consentement

- un outil de consentement cookies (CMP) **validé** (sans freemium bloquant)

### Module socle (Plugin Agence) - gestion du consentement

- chargement conditionnel des scripts (mesure / marketing)
- catégories minimum : nécessaire / mesure / marketing

---

## 🧾 Formulaires — Protection (socle)

### Module socle (Plugin Agence) - protections standard

- anti-spam : honeypot + temporisation
- limitation tentatives (rate limit simple)
- validation serveur systématique

### Captcha (si formulaires publics)

- captcha simple (outil validé)

---

## ⚡ Performance — Socle

### Module socle (Plugin Agence) - performance standard

- règles “anti-bloat” : limiter scripts tiers
- optimisation images (bonnes pratiques + contrôle)
- cache : configuration selon hébergement (voir ci-dessous)

### OSS autorisé (selon hébergement)

- cache / optimisation validés **uniquement** si nécessaires

---

## 💾 Sauvegardes — Socle

Objectif : sauvegardes automatiques + restauration réaliste.

### Option recommandée (à standardiser)

- **Sauvegarde infra** (cron) : base + fichiers → stockage externe (S3/OVH Object Storage)

### Module socle (Plugin Agence) - gestion des sauvegardes automatiques

- écran “statut sauvegarde” (date dernière sauvegarde)
- alerte si retard ou échec

---

## ✉️ Emails — Socle (selon cas)

WordPress/Woo utilisent `mail()` par défaut : ce n’est pas fiable selon hébergement.

### Règle

- si le site envoie des emails (formulaires, commandes) → **envoi fiable obligatoire**

### Deux options validées

- SMTP simple
- API emailing (service tiers)

⚠️ **Coût externe possible** (selon prestataire). À mentionner dans le projet.

---

## 📌 Liste “toujours” (résumé)

- Astra + Gutenberg + Spectra
- Plugin Agence (socle) : sécurité / perf / consentement / protections
- Wordfence (WAF)
- CMP cookies (outil validé)
- Protection formulaires (anti-spam + captcha si formulaires publics)
- Sauvegardes automatiques + suivi
- Emails fiables si emails sortants

---

## 🚫 Exclus du socle

- page builders lourds (Elementor)
- plugins freemium bloquants
- tracking / marketing activé sans consentement
- empilement d’extensions “tout-en-un” non justifiées

---

## 🔁 Liens utiles

- `base.md` — description détaillée du socle
- `flux-decisionnel.md` — décider OSS vs custom & placement
- `modules.md` — catalogue modules (synthèse)
- `03-Maintenance/maintenance.md` — maintenance globale
