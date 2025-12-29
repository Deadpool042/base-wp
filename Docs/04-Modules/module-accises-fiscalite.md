# 📦 Module Accises & fiscalité réglementée

> 🔒 **Document interne – critique**
>
> Ce module définit le cadre de gestion des **accises, droits indirects
> et fiscalités réglementées** appliquées à certains produits
> (alcool, produits soumis à accises ou taxes spécifiques).
>
> Il relève **exclusivement de la Catégorie 3**.
> Aucun élément lié aux accises ou fiscalités spécifiques
> n’est autorisé en **Catégorie 1 ou 2**.
> En **Catégorie 4**, la fiscalité est intégrée à l’architecture globale
> et n’est pas traitée comme un module isolé.

---

## ⚠️ Nature du module (à lire en premier)

Le module Accises & fiscalité est un **module métier sensible**.

Il implique :

- des obligations légales strictes
- une responsabilité financière potentielle
- une exposition juridique directe

👉 Il **ne peut jamais** être traité comme une option simple
ou un module standard.

---

## 🧠 C’est quoi le module Accises & fiscalité ?

Ce module permet d’implémenter des **règles fiscales spécifiques**
fournies par le client dans un contexte e‑commerce, notamment :

- droits d’accises
- taxes spécifiques par produit
- règles dépendantes du pays ou de la zone

👉 Objectif : assurer une **conformité fonctionnelle**
sans se substituer à un expert fiscal ou juridique.

---

## ❌ Exclusion absolue — Catégories 1 & 2

En **Catégorie 1 et 2**, il est strictement interdit de :

- gérer des accises
- implémenter des règles fiscales spécifiques
- mentionner une conformité réglementaire

➡️ Toute vente de produits soumis à accises
entraîne automatiquement une **requalification en Catégorie 3**.

---

## 🎯 Objectifs du module

- appliquer les règles d’accises fournies par le client
- fiabiliser les calculs de taxes spécifiques
- assurer la traçabilité des calculs
- documenter précisément les règles implémentées
- limiter les risques d’ambiguïté ou de dérive

---

## ⚙️ Ce que WooCommerce gère (ou ne gère pas) nativement

WooCommerce permet nativement :

- la gestion de taxes standards (TVA)
- l’affichage des taxes au panier et checkout
- la séparation prix / taxes

WooCommerce **ne gère pas nativement** :

- les droits d’accises
- les règles fiscales métier spécifiques
- les calculs dépendants du produit, du volume ou du degré
- les obligations fiscales réglementées

👉 Dès qu’une logique d’accises est requise,
le module devient obligatoire.

---

## 🔴 Niveau unique — Accises & fiscalité métier (Catégorie 3)

### Rôle

Implémenter une **logique fiscale spécifique**
strictement basée sur des règles fournies par le client.

⚠️ Le partenaire technique **n’est pas conseil fiscal**.

---

### Inclus

- identification des produits soumis à accises
- implémentation des règles de calcul (volume, degré, unité, etc.)
- gestion par pays ou zone définie
- affichage clair des taxes (panier / checkout)
- journalisation des calculs
- tests fonctionnels ciblés
- documentation fonctionnelle détaillée

---

### Exclus (non négociable)

- conseil fiscal ou juridique
- validation réglementaire officielle
- génération automatique de déclarations fiscales
- responsabilité en cas de contrôle ou redressement

---

### Pré‑requis obligatoires

- règles écrites et formalisées fournies par le client
- validation écrite des formules de calcul
- périmètre géographique défini
- absence totale de règles implicites

👉 Sans ces éléments, le module **n’est pas activable**.

---

### Contraintes techniques

- logique isolée et clairement documentée
- traçabilité complète des calculs
- tests unitaires ciblés
- absence de calcul implicite ou automatique

---

💰 **Prix fixe** : **4 000 € HT**  
📦 **Catégorie** : 3  
🔧 **Impact maintenance** : élevé / critique

---

## 🧪 Checklist avant livraison

- [ ] règles fiscales fournies et validées par écrit
- [ ] produits correctement qualifiés
- [ ] calculs testés sur cas réels
- [ ] affichage clair des taxes
- [ ] documentation remise
- [ ] clause de responsabilité intégrée

---

## 🚫 Règles non négociables

- aucune accise sans règle écrite
- aucune interprétation fiscale
- aucune responsabilité portée par le partenaire
- toute évolution réglementaire = devis spécifique

---

## 📌 Clause de protection (contractuelle)

> Le partenaire technique implémente les règles **telles que fournies**
> par le client.
>
> Il n’assume **aucune responsabilité fiscale ou juridique**
> en cas d’erreur de déclaration, de changement de réglementation
> ou de contrôle administratif.

---

## 📌 Règle finale

> Les accises ne sont **pas une fonctionnalité**,
> mais une **obligation réglementaire**.
>
> Elles imposent cadrage, documentation
> et maintenance renforcée.
