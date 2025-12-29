# 📦 Module Connecteurs externes

> 🔒 **Document interne**
>
> Ce module définit le cadre de mise en place de **connecteurs externes**
> entre le site et des services tiers (CRM, outils marketing, automatisations).
>
> Il s’applique à partir de la **Catégorie 2**.
> En **Catégorie 1**, aucun connecteur externe n’est mis en place.
> En **Catégorie 4**, les intégrations font partie de l’architecture globale
> et ne sont pas traitées comme un module isolé.

---

## 🧠 C’est quoi le module Connecteurs externes ?

Le module Connecteurs permet de **relier le site à des services tiers**
afin d’échanger des données ou d’automatiser des actions simples,
sans créer de dépendance critique au fonctionnement du site.

👉 Il s’agit d’une **facilitation fonctionnelle**, pas d’un socle métier.

---

## 🎯 Objectifs du module

- connecter le site à des outils tiers
- automatiser des actions simples
- fiabiliser les échanges de données
- conserver une architecture maîtrisée

---

## ℹ️ Clarification — Catégorie 1

En **Catégorie 1**, aucun module Connecteurs n’est appliqué.

Le site fonctionne de manière **autonome** :

- formulaires natifs WordPress / WooCommerce
- traitements internes simples
- aucune dépendance externe

Toute synchronisation avec un outil tiers
entraîne l’activation du **module Connecteurs**
à partir de la **Catégorie 2**.

---

## ⚙️ Ce que WordPress / WooCommerce gèrent nativement

### WordPress (natif)

WordPress permet nativement :

- la gestion des formulaires simples
- l’envoi d’emails basiques
- les webhooks simples via extensions
- le traitement interne des données

WordPress **ne gère pas nativement** :

- la synchronisation avec des outils externes
- la gestion des erreurs de flux
- le monitoring d’intégrations
- les règles conditionnelles complexes

### WooCommerce (natif)

WooCommerce permet nativement :

- des webhooks e-commerce simples
- l’export basique de données
- l’envoi d’événements standards

WooCommerce **ne gère pas nativement** :

- la synchronisation bidirectionnelle
- le mapping avancé de données
- la gestion métier via outils tiers

👉 Dès qu’un outil externe intervient,
le module devient nécessaire.

---

## 🟢 Niveau 1 — Connecteurs simples (Catégorie 2)

### Rôle - Niveau 1

Mettre en place un **connecteur standard**
sans logique métier critique.

### Inclus - Niveau 1

- connexion à **1 outil tiers** (ex: CRM, emailing, automatisation)
- synchronisation simple (unidirectionnelle ou basique)
- déclencheurs standards (création, mise à jour)
- logs basiques
- tests fonctionnels
- documentation d’usage

### Exemples de connecteurs - Niveau 1

- CRM simple
- outil d’emailing
- automatisation type Zapier / Make
- webhook simple

### Exclus - Niveau 1

- synchronisation bidirectionnelle complexe
- règles conditionnelles avancées
- dépendance critique au service tiers

### Contraintes - Niveau 1

- API stable fournie par le service tiers
- quotas API respectés
- structure figée après validation

💰 **Prix fixe** : **900 € HT**  
📦 **Catégorie** : 2

---

## 🔴 Niveau 2 — Connecteurs métier (Catégorie 3)

### Rôle - Niveau 2

Mettre en place des connecteurs impliquant
une **logique métier** ou un impact opérationnel direct.

### Inclus - Niveau 2

- connexion à **jusqu’à 2 outils tiers**
- synchronisation bidirectionnelle
- règles conditionnelles
- mapping de données avancé
- gestion des erreurs
- documentation technique

### Exclus - Niveau 2

- ERP complexes
- systèmes industriels
- synchronisation temps réel critique

### Contraintes - Niveau 2

- cadrage fonctionnel obligatoire
- validation écrite des règles
- tests approfondis

💰 **Prix fixe** : **2 500 € HT**  
📦 **Catégorie** : 3

---

## 🚫 Hors périmètre du module

- ERP complexes
- middleware avancé
- architectures distribuées
- synchronisation critique temps réel (Catégorie 4)

---

## 🧪 Checklist avant livraison

- [ ] outil tiers connecté
- [ ] flux de données testés
- [ ] gestion des erreurs validée
- [ ] quotas API respectés
- [ ] documentation remise

---

## 🚫 Règle non négociable

- Catégorie 1 = aucun connecteur
- toute connexion externe = module Connecteurs
- aucune dépendance critique sans requalification

---

## 📌 Règle finale

> Un connecteur est une **facilitation fonctionnelle**,
> pas une dépendance métier.
>
> Toute demande hors cadre entraîne une **requalification**
> ou un **devis spécifique**.
