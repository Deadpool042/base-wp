# Monitoring — OVH VPS

Ce document définit la **stratégie de monitoring minimale obligatoire** pour tout projet hébergé sur **OVH VPS**.
Il permet d’anticiper les incidents, de réagir rapidement et de garantir la disponibilité du service.

---

## 🎯 Objectifs

- surveiller la disponibilité du site
- détecter les incidents avant l’utilisateur final
- identifier les problèmes de performance
- faciliter le diagnostic en cas d’erreur

---

## 🧩 Périmètre de surveillance

Le monitoring couvre :

- l’infrastructure VPS
- les services Docker
- l’application WordPress
- les points d’entrée HTTP

---

## 1️⃣ Disponibilité

### Site web

- surveillance HTTP/HTTPS
- vérification des codes de réponse (200 attendus)
- pages critiques :
  - page d’accueil
  - `/wp-login.php` ou endpoint équivalent

### Services Docker

- état des conteneurs
- healthchecks Docker
- redémarrages anormaux

---

## 2️⃣ Performance

### Serveur

- charge CPU
- utilisation mémoire
- espace disque
- IO disque (si possible)

### Application

- temps de réponse HTTP
- TTFB
- augmentation soudaine des latences

---

## 3️⃣ Erreurs

- erreurs HTTP (4xx / 5xx)
- erreurs PHP récurrentes
- erreurs applicatives critiques

Les erreurs doivent être :

- identifiées
- contextualisées
- corrélées à un événement (MAJ, pic trafic, déploiement)

---

## 4️⃣ Alertes

### Déclencheurs recommandés

- site inaccessible
- service Docker arrêté
- saturation disque (>80%)
- charge CPU anormalement élevée
- erreurs 5xx répétées

### Canaux d’alerte

- email technique
- outil de monitoring externe (si présent)

---

## 5️⃣ Logs

- accès aux logs Docker
- logs applicatifs WordPress
- rotation des logs activée
- conservation minimale des logs

---

## 6️⃣ Intervention

En cas d’alerte :

1. identifier la nature de l’incident
2. vérifier l’état des services
3. consulter les logs
4. appliquer la correction appropriée
5. documenter l’incident

---

## 🧭 Règle agence

- aucun site OVH VPS sans monitoring minimal
- toute alerte critique doit être traitée
- le monitoring fait partie intégrante de la maintenance

Ce document fait partie intégrante du **profil OVH VPS**.
