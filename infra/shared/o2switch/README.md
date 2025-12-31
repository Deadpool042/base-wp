# Profil d’hébergement — o2switch (Mutualisé)

Ce dossier décrit le **profil d’hébergement mutualisé o2switch** tel qu’utilisé par l’agence.
Il constitue une **référence figée** pour le choix technique, le déploiement, la maintenance et le discours client.

---

## 🎯 Quand utiliser o2switch

Ce profil est adapté pour :

- sites vitrines
- blogs
- sites institutionnels
- petits WooCommerce (catalogue simple, trafic modéré)
- projets à budget maîtrisé

Il est privilégié lorsque :

- le client n’a pas besoin d’une infra dédiée
- les contraintes de performance sont raisonnables
- la maintenance doit rester simple et standardisée

---

## 🚫 Quand o2switch n’est PAS adapté

Ce profil ne convient pas pour :

- e‑commerce à fort trafic
- besoins de scalabilité
- headless (WordPress + Next.js)
- traitements lourds (imports massifs, sync externes fréquentes)
- exigences fortes en performance ou SEO technique avancé

Dans ces cas, le profil **OVH VPS** est obligatoire.

---

## 🧩 Contraintes techniques

- Hébergement mutualisé (ressources partagées)
- Pas de Docker
- Pas de services additionnels (Redis, Varnish, Traefik…)
- Cache serveur non configurable
- PHP et MySQL fournis par l’hébergeur

👉 Le site doit être **optimisé par conception**, pas par l’infrastructure.

---

## 🧱 Socle technique obligatoire

Tout site hébergé sur o2switch doit respecter :

- le **socle plugins mutualisé**
- les **checklists de déploiement, performance et sécurité**
- les règles de maintenance définies par l’agence

📄 Voir :

- `docs/plugins-socle.md`
- `docs/deploiement-checklist.md`
- `docs/perf-checklist.md`
- `docs/securite-checklist.md`

---

## 🔄 Maintenance

Maintenance standard :

- mises à jour mensuelles (core / plugins / thème)
- vérification cache et performances
- vérification emails et formulaires
- contrôle des sauvegardes

Toute demande hors de ce cadre est considérée comme **évolution ou changement de profil**.

---

## 🧭 Règle agence

- un projet = un profil
- o2switch = **mutualisé uniquement**
- aucune exception sans validation explicite

Ce profil est conçu pour être **robuste, simple et rentable**, aussi bien pour le client que pour l’agence.
