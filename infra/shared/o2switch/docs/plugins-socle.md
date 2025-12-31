# Socle plugins WordPress — Hébergement mutualisé

(OVH / o2switch)

Ce document définit le **socle minimal recommandé** de plugins WordPress pour
les sites hébergés sur des offres mutualisées.

> Pour les contraintes spécifiques hébergeur, voir :
> • ovh-specificites.md
> • o2switch-specificites.md

🎯 Objectifs :

- performance acceptable malgré les limites serveur
- sécurité renforcée sans surcouche lourde
- maintenance simple et industrialisable
- compatibilité maximale OVH / o2switch

---

## 🧱 Principes

- un plugin = une responsabilité
- éviter les “usines à gaz”
- priorité aux plugins stables et maintenus
- pas de dépendance à Redis / Docker / services externes obligatoires
- tout plugin hors socle doit être **justifié**

---

## 🔌 Socle recommandé (par catégorie)

### 🔹 Cache & performance (OBLIGATOIRE)

### **1 seul plugin à choisir selon contexte**

| Plugin           | Usage         | Notes                                  |
| ---------------- | ------------- | -------------------------------------- |
| WP Fastest Cache | ⭐ recommandé | Simple, efficace, compatible mutualisé |
| WP Super Cache   | Alternative   | Officiel Automattic                    |
| Cache Enabler    | Alternative   | Léger, peu d’options                   |

❌ À éviter sur mutualisé :

- plugins nécessitant Redis/Varnish
- cache serveur non maîtrisé

---

### 🔹 Sécurité (OBLIGATOIRE)

| Plugin           | Usage         |
| ---------------- | ------------- |
| WP Cerber        | ⭐ recommandé |
| Wordfence        | Alternative   |
| iThemes Security | Alternative   |

Configuration minimale :

- limitation tentatives login
- désactivation XML-RPC si inutile
- alertes email activées

---

### 🔹 Sauvegardes (OBLIGATOIRE)

| Plugin                  | Usage                   |
| ----------------------- | ----------------------- |
| UpdraftPlus             | ⭐ recommandé           |
| All-in-One WP Migration | Alternative (migration) |

Recommandations :

- backups DB + fichiers
- stockage externe si possible
- backup manuel avant MAJ

---

### 🔹 Email / SMTP (OPTIONNEL)

À activer **uniquement si problèmes d’email**

| Plugin       | Usage         |
| ------------ | ------------- |
| FluentSMTP   | ⭐ recommandé |
| WP Mail SMTP | Alternative   |

Providers courants :

- o2switch : SMTP natif OK
- OVH : SMTP OVH ou externe (Brevo, Mailgun…)

---

### 🔹 SEO (OPTIONNEL)

| Plugin            | Usage       |
| ----------------- | ----------- |
| Yoast SEO         | Référence   |
| RankMath          | Alternative |
| The SEO Framework | Léger       |

⚠️ 1 seul plugin SEO à la fois.

---

### 🔹 Anti-spam (OPTIONNEL)

| Plugin       | Usage         |
| ------------ | ------------- |
| Antispam Bee | ⭐ recommandé |
| Akismet      | Alternative   |

---

## 🚫 Plugins refusés (mutualisé)

- cache serveur nécessitant Redis/Varnish
- plugins de sécurité “all-in-one” trop intrusifs
- page builders lourds (sauf exception client)
- plugins abandonnés / non maintenus
- plugins “nulled” ou crackés (refus absolu)

---

## 🔄 Maintenance

- mise à jour mensuelle minimum
- désactivation immédiate des plugins inutilisés
- audit plugins tous les 6 mois

---

## 📌 Règle agence

Tout plugin hors de ce socle doit être :

- validé techniquement
- documenté
- assumé en maintenance
