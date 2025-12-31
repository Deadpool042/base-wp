# Runbook sauvegardes — OVH VPS

Ce document définit la **stratégie officielle de sauvegarde et de restauration**
pour les projets hébergés sur **OVH VPS**.

Objectifs :

- garantir la continuité de service
- permettre une restauration rapide et fiable
- réduire l’impact des incidents (humains, techniques, sécurité)

---

## 🎯 Périmètre

Ce runbook s’applique aux projets :

- hébergés sur **OVH VPS ou dédié**
- utilisant l’infrastructure Docker définie dans `infra/docker/`
- incluant WordPress (classique ou headless)

---

## 🧱 Ce qui doit être sauvegardé

### Données applicatives (OBLIGATOIRE)

- base de données (MySQL / MariaDB)
- `wp-content/uploads`
- fichiers de configuration WordPress spécifiques (si présents)

### Infrastructure (RECOMMANDÉ)

- fichiers `.env` (hors secrets sensibles non chiffrés)
- `docker-compose.yml` et overrides
- scripts infra (`infra/scripts`)

---

## 🕒 Fréquence recommandée

| Élément         | Fréquence           |
| --------------- | ------------------- |
| Base de données | Quotidienne         |
| Uploads         | Quotidienne         |
| Infra / config  | À chaque changement |

Rétention minimale :

- **7 jours glissants** (minimum)
- **30 jours** pour projets critiques

---

## 📍 Localisation des sauvegardes

- Sauvegardes **hors VPS** (obligatoire)
- Stockage possible :
  - Object Storage OVH
  - serveur distant sécurisé
  - stockage chiffré (S3 compatible)

❌ Interdit : sauvegardes uniquement locales sur le VPS.

---

## ⚙️ Méthodes de sauvegarde

### Base de données

- dump SQL automatisé
- compression (`.gz`)
- horodatage explicite

### Fichiers

- archive des volumes nécessaires
- exclusion des caches temporaires
- compression recommandée

### Automatisation

- cron système
- scripts versionnés
- logs de sauvegarde conservés

---

## 🔁 Procédure de restauration

### 1. Préparation

- identifier la sauvegarde cible
- prévenir les parties concernées
- passer le site en maintenance si nécessaire

### 2. Restauration

1. Arrêter les services Docker
2. Restaurer les volumes fichiers
3. Restaurer la base de données
4. Vérifier les variables d’environnement
5. Redémarrer les services

### 3. Vérifications post-restore

- accès front-end
- accès admin
- formulaires / emails
- pages critiques (checkout, compte)
- logs applicatifs

---

## 🧪 Tests de restauration

- test de restauration **au minimum trimestriel**
- validation fonctionnelle complète
- documentation des résultats

---

## 🚨 Cas particuliers

### Incident de sécurité

- isoler le VPS
- restaurer depuis une sauvegarde saine
- changer tous les accès (SSH, admin WP, DB)

### Erreur humaine

- identifier l’heure de l’erreur
- restaurer la version immédiatement antérieure

---

## 🧭 Règle agence

- pas de projet OVH VPS sans sauvegardes automatisées
- pas de mise en production sans test de restauration
- toute exception doit être validée et documentée

Ce runbook fait partie intégrante du **socle infra OVH VPS**.
