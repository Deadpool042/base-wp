# 📦 Module Dark mode & thème adaptatif

> 🔒 **Document interne**
>
> Ce module définit le cadre de mise en place d’un **thème adaptatif**
> (clair / sombre) avec respect des préférences utilisateur
> et des contraintes d’accessibilité.
>
> Il s’applique à partir de la **Catégorie 2**.
> En **Catégorie 1**, aucun dark mode spécifique n’est mis en place.
> En **Catégorie 4**, la gestion des thèmes fait partie intégrante
> de l’architecture front et n’est pas traitée comme un module isolé.

---

## 🧠 C’est quoi le module Dark mode & thème adaptatif ?

Ce module permet de proposer une **variation visuelle clair / sombre**
cohérente sur l’ensemble du site, sans dégrader l’accessibilité,
les performances ou la lisibilité.

👉 Il s’agit d’un **confort utilisateur**, pas d’une refonte graphique.

---

## 🎯 Objectifs du module

- offrir un mode sombre utilisable et cohérent
- respecter les préférences système de l’utilisateur
- garantir les contrastes et la lisibilité
- préserver les performances front

---

## ℹ️ Clarification — Catégorie 1

En **Catégorie 1**, aucun module Dark mode n’est appliqué.

Le site utilise :

- un thème unique (clair ou sombre)
- sans bascule utilisateur
- sans adaptation dynamique

Toute demande de bascule clair / sombre
entraîne l’activation du **module Dark mode**
à partir de la **Catégorie 2**.

---

## ⚙️ Ce que WordPress / WooCommerce gèrent nativement

### WordPress (natif)

WordPress permet nativement :

- la gestion des thèmes
- la gestion des styles globaux
- la détection des préférences système (via CSS)

WordPress **ne gère pas nativement** :

- la bascule utilisateur persistante
- la cohérence multi-templates
- les règles d’accessibilité automatisées

### WooCommerce (natif)

WooCommerce permet nativement :

- l’héritage des styles du thème
- l’affichage standard des composants e-commerce

WooCommerce **ne gère pas nativement** :

- l’adaptation automatique clair / sombre
- la cohérence visuelle des composants dynamiques
- les contrastes garantis sur checkout et comptes clients

👉 Dès qu’une bascule utilisateur est demandée,
le module devient nécessaire.

---

## 🟢 Niveau 1 — Thème adaptatif standard (Catégorie 2)

### Rôle -Niveau 1

Ajouter un mode sombre fonctionnel
sans logique métier ni accessibilité renforcée.

### Inclus - Niveau 1

- bascule clair / sombre (toggle)
- respect des préférences système
- persistance du choix utilisateur
- styles adaptés pour templates clés
- compatibilité mobile

### Exclus - Niveau 1

- adaptation graphique sur mesure
- règles d’accessibilité avancées
- variations par rôle ou contexte

### Contraintes - Niveau 1

- thème existant conservé
- périmètre visuel figé

💰 **Prix fixe** : **400 € HT**  
📦 **Catégorie** : 2

---

## 🔴 Niveau 2 — Thème adaptatif accessible (Catégorie 3)

### Rôle - Niveau 2

Adapter le dark mode à des contraintes
d’accessibilité ou de lisibilité renforcées.

### Inclus - Niveau 2

- contrastes renforcés (WCAG)
- ajustements UI spécifiques
- cohérence étendue (checkout, compte client)
- validation accessibilité

### Exclus - Niveau 2

- refonte graphique complète
- design system dédié

### Contraintes - Niveau 2

- validation formelle des critères
- tests approfondis

💰 **Prix fixe** : **900 € HT**  
📦 **Catégorie** : 3

---

## 🚫 Hors périmètre du module

- refonte graphique globale
- design system multi-thèmes
- gestion avancée par profil utilisateur
- front headless dédié

---

## 🧪 Checklist avant livraison

- [ ] bascule fonctionnelle sur tout le site
- [ ] préférences persistées
- [ ] contrastes vérifiés
- [ ] compatibilité mobile validée
- [ ] performances contrôlées

---

## 📌 Règle finale

> Le dark mode est un **confort visuel**.
> Toute demande de refonte graphique ou logique avancée
> entraîne une **requalification** ou un **devis spécifique**.
