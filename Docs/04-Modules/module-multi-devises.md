# 📦 Module Multi‑devises

> 🔒 **Document interne**
>
> Ce module définit la gestion de plusieurs devises sur le site (affichage, conversion, arrondis).
>
> Il s’applique aux **Catégories 2 et 3**.

En **Catégorie 4**, la gestion multi‑devises fait partie intégrante  
de l’architecture internationale (marchés distincts)  
et n’est pas traitée comme un module isolé.

---

## 🧠 C’est quoi ce module ?

Permettre l'affichage et la gestion de plusieurs devises côté client avec conversions cohérentes au panier et checkout.

### 📌 Règle structurante — Devise ≠ Marché

L’ajout de plusieurs devises **ne signifie pas automatiquement**  
une vente internationale structurée.

Tant que :

- les prix de base restent identiques
- la fiscalité ne varie pas par pays
- la logistique est commune
- le tunnel de paiement est identique

la multi‑devise est considérée comme une **facilité d’affichage**  
et reste en **Catégorie 2 ou 3**.

La **Catégorie 4** s’applique uniquement lorsque la devise  
est liée à des **marchés distincts**  
(prix par pays, fiscalité locale, règles de paiement ou logistique spécifiques).

---

## ⚙️ Ce que WordPress / WooCommerce gèrent nativement

### WooCommerce (natif)

WooCommerce propose nativement :

- une **devise principale unique**
- la gestion des prix dans cette devise
- la facturation dans une seule monnaie

WooCommerce **ne gère pas nativement** :

- l’affichage multi‑devises côté frontend
- la conversion dynamique des prix
- les règles d’arrondi par devise
- la cohérence panier / checkout en multi‑devise

👉 Dès qu’un affichage ou une conversion multi‑devise est requis,  
un module dédié est obligatoire.

---

## 🟢 Niveau 1 — Multi‑devise standard (Catégorie 2)

### Rôle

Permettre à l’utilisateur de consulter les prix dans plusieurs devises,  
avec une conversion automatique basée sur une devise de référence.

### Inclus

- mise en place d’un plugin multi‑devise éprouvé
- affichage des prix convertis sur le catalogue
- conversion au panier et au checkout
- règles d’arrondi simples et cohérentes
- tests fonctionnels complets

### Exclus

- prix spécifiques par pays
- règles fiscales différenciées
- logique métier liée à la devise

### Contraintes

- une devise de référence unique
- conversion automatique (taux externes)
- tunnel de paiement identique pour toutes les devises

💰 **Prix fixe** : **700 € HT**  
📦 **Impact catégorie** : Catégorie 2

---

## 🔴 Niveau 2 — Multi‑devise avancée (Catégorie 3)

### Rôle - catégorie 3

Gérer des comportements spécifiques liés à la devise,  
sans aller jusqu’à une architecture multi‑marchés.

### Inclus - catégorie 3

- règles d’affichage conditionnelles par devise
- exclusions de moyens de paiement selon la devise
- gestion avancée des arrondis
- validation complète des scénarios de commande

### Exclus - gestion de marchés distincts

- prix distincts par pays
- fiscalité locale par marché
- logistique différenciée

### Contraintes - catégorie 3

- cadrage fonctionnel obligatoire
- validation client formelle des règles

💰 **Prix fixe** : **1 200 € HT**  
📦 **Impact catégorie** : Catégorie 3

---

## 🧪 Checklist avant livraison

- [ ] devises affichées correctement sur le catalogue
- [ ] conversions vérifiées au panier
- [ ] montants cohérents au checkout
- [ ] arrondis validés
- [ ] scénarios de paiement testés
