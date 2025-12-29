# 📦 Module Dashboard personnalisé

> 🔒 **Document interne**
>
> Ce module s’applique **uniquement à la Catégorie 3**.
> Il est explicitement exclu des Catégories 1 et 2.
> En Catégorie 4, les dashboards font partie de l’architecture globale et ne sont **pas traités comme un module**.

---

## 🧠 C’est quoi ce module ?

Ce module propose une interface métier dédiée, accessible hors de wp-admin, conçue pour afficher des KPIs et des vues métier spécifiques selon les permissions des utilisateurs. Il ne s'agit pas d'une refonte ou d'une personnalisation de l’interface wp-admin standard.

---

## 🎯 Objectifs du module

- Fournir une interface métier hors wp-admin
- Afficher des KPIs et des vues métier personnalisées
- Gérer les permissions d’accès selon les rôles

---

## ⚙️ Ce que WordPress / WooCommerce gèrent nativement

- WordPress natif :
  - wp-admin standard
  - tableaux de listes (posts, users, commandes)
  - rôles et capacités de base
- WordPress ne gère pas nativement :
  - dashboards métiers personnalisés
  - KPIs consolidés (KPI = Indicateur Clé de Performance)
  - vues multi-sources
  - interfaces hors wp-admin
- WooCommerce natif (le cas échéant) :
  - commandes, produits, rapports simples
- WooCommerce ne gère pas :
  - KPIs métier personnalisés
  - dashboards orientés décision

Dès qu’une vue métier spécifique est requise, ce module devient nécessaire.

---

## 🔴 Niveau unique — Dashboard personnalisé (Catégorie 3)

### Rôle

- Fournir un dashboard métier simple et dédié, accessible uniquement aux rôles autorisés.

### Inclus

- Pages dédiées et API spécifiques
- Gestion des accès par rôle
- Vues métiers standard et KPIs personnalisés

### Exclus

- Refonte du back-office wp-admin
- BI avancée ou data science
- Dashboards temps réel à forte volumétrie

### Contraintes

- Cadrage fonctionnel obligatoire avant développement
- Périmètre fonctionnel figé
- Responsabilité limitée aux données exposées dans le dashboard

💰 **Prix fixe** : **3 500 € HT**  
📦 **Impact catégorie** : Catégorie 3

---

## 🚫 Hors périmètre du module

- Refonte complète du back-office
- BI avancée
- Data science / prédictif
- Dashboards temps réel à forte volumétrie (Catégorie 4)

---

## 🧪 Checklist

- [ ] Tests des permissions
- [ ] Validation des données affichées
- [ ] Documentation remise
