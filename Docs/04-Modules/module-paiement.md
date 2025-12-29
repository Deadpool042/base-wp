# 📦 Module Paiement

> 🔒 **Document interne**
>
> Ce module définit le cadre d’intégration et de configuration des moyens de paiement
> pour les sites e‑commerce WordPress / WooCommerce.
>
> Il s’applique à partir de la **Catégorie 2**.
> En **Catégorie 4**, le paiement fait partie intégrante de l’architecture globale
> et n’est pas traité comme un module isolé.

---

## 🧠 C’est quoi le module Paiement ?

Le module Paiement couvre la mise en place, la sécurisation et la validation
des moyens de paiement utilisés par le site.

Il garantit un paiement **fiable, conforme (DSP2 / 3DS)** et maintenable,
sans ajouter de logique métier inutile.

👉 Tant que l’on reste dans le paiement WooCommerce standard,
aucun module n’est requis (Catégorie 1).

---

## 🎯 Objectifs du module

- proposer des moyens de paiement adaptés au projet
- garantir la sécurité des transactions
- respecter les obligations réglementaires (DSP2 / 3DS)
- assurer un parcours de paiement stable et maintenable

---

## ⚙️ Ce que WordPress / WooCommerce gèrent nativement

### WordPress (natif)

WordPress ne gère **aucun paiement** nativement :

- aucune logique de transaction
- aucune gestion bancaire
- aucune conformité réglementaire

Toute gestion de paiement repose sur WooCommerce ou des extensions dédiées.

### WooCommerce (natif)

WooCommerce permet nativement :

- l’utilisation de moyens de paiement standards via extensions reconnues
- un parcours de paiement simple et linéaire
- une devise principale unique
- la gestion de la DSP2 / 3D Secure via les PSP compatibles
- des emails transactionnels standards

WooCommerce **ne gère pas nativement** :

- l’optimisation avancée du checkout
- les règles conditionnelles complexes
- les paiements fractionnés ou différés
- les abonnements ou paiements récurrents
- les logiques métier liées au paiement

👉 Dès qu’on sort du paiement standard « clé en main »,
le **module Paiement** devient obligatoire.

---

## 📌 Quand ce module est pertinent ?

Ce module est recommandé si :

- plusieurs moyens de paiement sont proposés
- une configuration DSP2 / 3DS doit être maîtrisée
- le projet dépasse le simple paiement WooCommerce par défaut
- des règles de paiement doivent être clairement cadrées

👉 Si le site utilise uniquement le paiement WooCommerce standard,
ce module est **inutile** (Catégorie 1).

---

## 🟢 Niveau 1 — Paiement standard (Catégorie 2)

### Rôle

Mettre en place des moyens de paiement courants,
sans logique métier spécifique.

### Inclus

- 1 à 2 moyens de paiement standards (ex. : CB via Stripe, PayPal)
- configuration WooCommerce
- activation DSP2 / 3D Secure
- gestion des échecs de paiement
- emails transactionnels standards
- tests complets en environnement sandbox

### Exclus

- paiements fractionnés
- abonnements
- règles conditionnelles avancées
- optimisation spécifique du checkout

### Contraintes

- configuration standard uniquement
- fournisseurs reconnus et maintenus
- aucun développement spécifique

💰 **Prix fixe** : **800 € HT**  
📦 **Catégorie** : 2

---

## 🔴 Niveau 2 — Paiement avancé (Catégorie 3)

### Rôle - catégorie 3

Gérer des paiements avec contraintes fonctionnelles,
réglementaires ou métier.

### Inclus - intégration de 3 moyens de paiement ou plus

- paiements multiples ou combinés
- règles conditionnelles (montant, produit, pays)
- paiements fractionnés ou différés
- contraintes fiscales ou légales
- cadrage fonctionnel documenté
- tests approfondis

### Exclus - cas complexes

- PSP bancaires propriétaires sans API stable
- solutions sur mesure (Catégorie 4)

### Contraintes - catégorie 3

- cadrage fonctionnel obligatoire
- validation écrite du périmètre
- responsabilité accrue sur le paiement

💰 **Prix fixe** : **1 600 € HT**  
📦 **Catégorie** : 3

---

## 🚫 Hors périmètre du module

- intégrations bancaires sur mesure
- PSP non maintenus ou instables
- parcours de paiement totalement custom (Catégorie 4)

---

## 🧪 Checklist avant livraison

- [ ] moyens de paiement testés (sandbox)
- [ ] DSP2 / 3D Secure fonctionnel
- [ ] emails transactionnels validés
- [ ] gestion des erreurs testée
- [ ] périmètre validé et documenté

---

## 📌 Règle finale

> Catégorie 1 = paiement WooCommerce standard uniquement.  
> Toute modification du parcours ou des règles de paiement
> entraîne l’activation du **module Paiement**
> ou une **requalification de la catégorie**.
