# 📂 Classification des Plugins & Modules par Rôle

> 🔒 **Document interne**
>
> Ce fichier liste tous les plugins et modules réutilisables,
> classés selon **le rôle qui doit y avoir accès** :
>
> - **Agence** : parties du socle et modules métier
> - **Client** : paramètres propres au projet
> - **Webmaster** : outils d’édition et configuration non-métier

---

## 🧠 Pourquoi cette classification

Certains utilisateurs (ex : webmaster du client) n’ont pas besoin,
ni ne doivent voir ou modifier, des éléments techniques ou métier.
Cette classification :

- organise les droits d’accès
- réduit les risques d’erreur
- améliore la sécurité et l’expérience

---

## 🔑 Légende

| Niveau        | Accès typique      | Contenu                           |
| ------------- | ------------------ | --------------------------------- |
| **Agence**    | Agence / Tech lead | Socle technique et modules métier |
| **Client**    | Client (admin)     | Paramètres spécifiques au projet  |
| **Webmaster** | Client-Webmaster   | Outils éditoriaux, UI, contenus   |

---

## 📦 Plugins & Modules — Par rôle

### 🧰 **Agence — Plugin Agence**

Contient les modules et dépendances qui structurent le socle technique,
la sécurité, l’architecture des modules et la logique métier générique.

📌 **Responsabilités**

- Socle sécurité & performance
- Framework modules (activation / niveaux)
- Intégrations IA (assistant IA)
- Règles métier standards (par ex : multi-langue, multi-devises)
- Connecteurs / logiques complexes
- Abstractions de dépendances

📌 **Contenu typique**

- Modules :
  - Recherche & filtres avancés
  - Assistant IA
  - Accises & fiscalité
  - Tarification métier
- Plugins OSS encapsulés et adaptateurs
- Gestion centralisée des logs / alertes

👉 **Accès UI** : réservé aux équipes techniques / agence

---

### 🧑‍💼 **Client — Plugin Client**

Contient uniquement :

- Règles métier propres au projet
- Paramètres/IDs/API clients
- Custom Post Types métier
- Règles de routing custom
- Connecteurs spécifiques au projet ou au client

⚠️ **Note**
Le client admin voit cette interface, mais **sans accès aux socles techniques** ni aux modules génériques de l’agence.

📌 **Contenu typique**

- Configuration de règles spécifiques
- Tableaux de prix métier
- Paramètres d’API externes
- Mappages custom pour connecteurs
- Restrictions métier propres au site

👉 **Accès UI** : administrateur client ( UI spécifique “mon projet” )

---

### 🧑‍💻 **Webmaster — Plugin Webmaster**

Outils pensés pour les éditeurs / webmaster du client,
non sensibles techniquement et sans logique métier critique.

📌 **Responsabilités**

- UI / styles / thèmes (dark mode, accessibilité)
- Patterns Gutenberg
- Éléments SEO non critique
- Gestion des menus, blocs utils
- Shortcodes spécifiques, mais _pas métier_
- Outils de contenu (messages, banners, CTA)

📌 **Contenu typique**

- Dark mode toggle
- Accessibilité basique (contraste, taille)
- Patterns de blocs réutilisables
- Snippets UI
- Interfaces de publication avancée

👉 **Accès UI** : webmaster client

---

## 📊 Carte des Plugins & Modules (Classification rapide)

| Plugin / Module         | Catégorie projet | Où vit-il ?               | Accès UI        |
| ----------------------- | ---------------- | ------------------------- | --------------- |
| Multi-langue            | Cat.2            | **Agence**                | Agence          |
| Multi-devises           | Cat.2            | **Agence**                | Agence          |
| Paiement avancé         | Cat.2            | **Agence**                | Agence          |
| Livraison étendue       | Cat.2            | **Agence**                | Agence          |
| Tunnel de vente         | Cat.2            | **Agence**                | Agence          |
| Analytics e-commerce    | Cat.2            | **Agence**                | Agence          |
| Assistant IA            | Cat.2            | **Agence**                | Agence          |
| Newsletter / Email      | Cat.2            | **Webmaster**             | Webmaster       |
| Recherche & filtres     | Cat.2            | **Agence**                | Agence          |
| SEO avancé              | Cat.2            | **Webmaster**             | Webmaster       |
| Sécurité renforcée      | Cat.2            | **Agence**                | Agence          |
| Comptes clients avancés | Cat.2            | **Webmaster**             | Webmaster       |
| Dark mode               | Cat.2            | **Webmaster**             | Webmaster       |
| Accessibilité renforcée | Cat.2            | **Webmaster**             | Webmaster       |
| Connecteurs simples     | Cat.2            | **Agence**                | Agence          |
| Accises & fiscalité     | Cat.3            | **Agence** + **Client\*** | Agence / Client |
| Tarification métier     | Cat.3            | **Client**                | Client          |
| Dashboard personnalisé  | Cat.3            | **Client**                | Client          |
| Performance avancée     | Cat.4            | **Agence**                | Agence          |
| Architecture Headless   | Cat.4            | **Agence**                | Agence          |

\* _Pour Accises & fiscalité, certaines options doivent être présentées au client mais **les règles métier restent gérées par l’agence (validation / encadrement)**._

---

## 🛠️ Règles d’accès UI

### 🧰 Agence

- Accès complet à tous les modules
- Peut activer / désactiver toute fonctionnalité
- Peut modifier les dépendances OSS

### 🧑‍💼 Client

- Accès à son **plugin client**
  - Paramètres métier spécifiques
  - Validation de règles métiers définies
- Ne voit **pas** :
  - sécurité/performance globale
  - règles internes d’architecture
  - logs techniques avancés

### 🧑‍💻 Webmaster

- Accès à son **plugin webmaster**
  - UI/UX éditorial
  - Patterns / styles
  - Outils non critiques
- Ne voit **pas** :
  - logique métier métier
  - configurations techniques sensibles

---

## 📌 Bonnes pratiques

✔ Ne donne jamais accès à la configuration “Agence”  
 au client / webmaster directement.  
✔ Les écrans “agence” doivent être **cachés / non visibles**
pour les autres rôles.  
✔ Le plugin webmaster doit être **léger** et **safe UI only**.  
✔ Le plugin client doit être **transparente au client**, sans jargon technique.

---

## 📎 Annexes liées

- `stack-whitelist.md` — plugins OSS classés
- `modules.md` — catalogue complet des modules
- `base.md` — socle technique global
- `flux-decisionnel.md` — règles de qualification

---

### 📌 Résumé

Ce document permet de savoir **qui voit quoi**, **qui modifie quoi**, et où chaque fonctionnalité/vérification doit être implémentée.  
Il complète la vision déjà définie dans les docs de socle et modules.

---
