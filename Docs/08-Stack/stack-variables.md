# 🧩 Stack — Variables de projet

> 🔒 **Document interne**
>
> Ce document définit les éléments de la stack technique qui **varient selon le projet**,
> la catégorie (Cat.1 → Cat.4), l’hébergement ou les besoins fonctionnels.
>
> Il complète le **socle technique commun** (`stack-socle.md`) et ne le remplace jamais.

---

## 🎯 Objectif du document

- identifier ce qui **peut varier** d’un projet à l’autre
- éviter d’alourdir inutilement le socle commun
- cadrer les choix techniques autorisés
- prévenir les dérives de stack

---

## 🗂️ Variables liées à l’hébergement

### Type d’hébergement

Selon le projet, on peut utiliser :

- mutualisé (Cat.1 uniquement, avec contraintes)
- VPS managé
- VPS dédié
- infrastructure cloud (Cat.4)

👉 Tout hébergement doit permettre :

- HTTPS (TLS valide)
- PHP à jour
- accès cron
- sauvegardes automatisées

---

### Cache serveur

Selon l’hébergement :

- cache serveur natif (OVH, o2switch, etc.)
- cache via plugin léger validé
- cache reverse proxy (Cat.4)

⚠️ Un seul système de cache principal est autorisé.

---

## 📧 Variables liées aux emails

### Envoi d’emails

Selon le volume et la criticité :

- SMTP hébergeur (faible volume)
- service tiers (Brevo, Mailgun, Sendgrid…)

ℹ️ Les services tiers peuvent générer un **coût externe** pour le client.

---

### Emails transactionnels WooCommerce

- configuration SMTP obligatoire
- tests de délivrabilité systématiques
- journalisation minimale des envois

---

## 🧠 Variables liées aux modules activés

Les modules activés influencent directement la stack :

- multi-langue
- multi-devises
- paiement
- livraison
- tunnel de vente
- analytics
- IA
- connecteurs

👉 Chaque module activé :

- peut imposer un plugin spécifique
- peut modifier la catégorie du projet
- doit être listé explicitement dans le projet

---

## 🤖 Variables liées à l’IA

Uniquement si le **module Assistant IA** est activé :

- fournisseur IA (OpenAI ou équivalent)
- quota mensuel défini
- abonnement spécifique (hors maintenance globale)

⚠️ Aucun appel IA sans plafond défini.

---

## 🔌 Variables liées aux connecteurs externes

Selon le besoin :

- CRM
- ERP
- outil métier
- plateforme marketing

Chaque connecteur doit préciser :

- sens de synchronisation (uni/bidirectionnel)
- fréquence
- données concernées
- tolérance à l’échec

---

## 🔐 Variables de sécurité avancée

Selon la catégorie :

- règles WAF supplémentaires
- restrictions IP
- durcissement admin renforcé
- monitoring avancé

👉 La sécurité **ne peut jamais être inférieure** au socle commun.

---

## 📈 Variables de performance

Selon le trafic et la catégorie :

- optimisation images avancée
- lazy-loading spécifique
- CDN
- optimisation base de données
- découplage front/back (Cat.4)

---

## 🧩 Règle de cohérence

- le socle est **toujours présent**
- les variables sont **ajoutées**, jamais substituées
- toute variable non listée ici doit être validée

---

## 📌 Règle finale

> Toute variable non maîtrisée ou non documentée
> entraîne une **requalification** ou un **refus technique**.
