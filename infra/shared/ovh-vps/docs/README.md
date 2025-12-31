# Profil d’hébergement — OVH VPS

Ce dossier décrit le **profil d’hébergement OVH en VPS (ou dédié)** tel qu’utilisé par l’agence.
Il constitue une **référence figée** pour les projets nécessitant une infrastructure maîtrisée, scalable et performante.

---

## 🎯 Quand utiliser OVH VPS

Ce profil est obligatoire pour :

- e‑commerce à trafic significatif
- projets WooCommerce avancés
- sites à forts enjeux SEO / performance
- architectures headless (WordPress + Next.js)
- multi-sites ou multi-domaines
- besoins de scalabilité ou de haute disponibilité
- projets long terme avec évolutions fréquentes

Il est privilégié lorsque :

- le mutualisé atteint ses limites techniques
- la performance est un critère clé
- l’infrastructure doit être maîtrisée et auditable

---

## 🚫 Quand OVH VPS n’est PAS pertinent

Ce profil n’est pas recommandé pour :

- simples sites vitrines
- projets très faible trafic
- budgets contraints sans exigence technique
- clients ne souhaitant pas de maintenance technique

Dans ces cas, le profil **o2switch (mutualisé)** est privilégié.

---

## 🧩 Architecture technique

L’infrastructure VPS repose sur une stack **Dockerisée et prod‑like** :

- Docker / Docker Compose
- PHP‑FPM
- Nginx
- Base de données dédiée
- Reverse proxy (Traefik ou Nginx)
- HTTPS automatisé
- Environnements séparés (dev / prod)

📁 Voir la référence technique :

- `infra/docker/`

---

## 🧱 Socle technique obligatoire

Tout projet hébergé sur OVH VPS doit respecter :

- la stack définie dans `infra/docker/`
- les règles de sécurité VPS (firewall, accès SSH, backups)
- les conventions d’environnement (env, secrets, ports)
- les procédures de déploiement et rollback

Tout écart doit être explicitement documenté.

---

## 🔐 Sécurité

- Accès SSH sécurisés (clés uniquement)
- Firewall actif
- HTTPS forcé
- Isolation des services via Docker
- Backups automatisés et testés

---

## 🚀 Performance & scalabilité

- Cache applicatif maîtrisé
- Possibilité d’object‑cache (Redis)
- Séparation claire des responsabilités (web / php / db)
- Montée en charge possible (verticale ou horizontale)

---

## 🔄 Maintenance

Maintenance avancée :

- supervision de l’infrastructure
- mises à jour OS / Docker / services
- mises à jour applicatives
- surveillance performance et disponibilité
- gestion incidents et restauration

Ce profil implique une **maintenance technique continue**.

---

## 🧭 Règle agence

- un projet = un profil
- OVH = **VPS / dédié uniquement**
- aucune exception sans validation explicite

Ce profil est réservé aux projets nécessitant une **infrastructure professionnelle et maîtrisée**.
