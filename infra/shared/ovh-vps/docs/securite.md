# Sécurité — OVH VPS

Ce document définit les **règles de sécurité obligatoires** pour tout projet hébergé sur **OVH VPS**.
Il constitue une **référence non négociable** pour l’agence.

---

## 🎯 Objectifs

- réduire la surface d’attaque
- prévenir les intrusions et erreurs humaines
- garantir l’intégrité des données
- assurer la continuité de service

---

## 1️⃣ Sécurité serveur (VPS)

### Accès SSH

- accès **par clé uniquement**
- authentification par mot de passe désactivée
- utilisateur non-root privilégié
- accès root restreint ou désactivé

### Firewall

- firewall actif (UFW ou équivalent)
- ports ouverts strictement nécessaires :
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)
- tout autre port explicitement justifié

### Système

- OS maintenu à jour
- paquets inutiles supprimés
- fuseau horaire cohérent

---

## 2️⃣ Sécurité Docker & infrastructure

- Docker installé depuis source officielle
- Docker Compose à jour
- services isolés par réseau Docker
- ports exposés limités au strict nécessaire
- aucun service sensible exposé publiquement (DB, Redis, etc.)

### Volumes & données

- volumes persistants clairement identifiés
- permissions cohérentes
- aucune donnée critique stockée hors volumes

---

## 3️⃣ Sécurité applicative WordPress

### Accès & comptes

- comptes nominatifs uniquement
- mots de passe forts obligatoires
- 2FA recommandé pour administrateurs
- suppression des comptes inutilisés

### Configuration

- `WP_DEBUG` désactivé en production
- édition de fichiers via l’admin désactivée
- XML-RPC désactivé si non utilisé
- clés de sécurité (SALT) à jour

### Plugins

- plugins issus de la **whitelist agence** uniquement
- plugins maintenus et à jour
- aucun plugin nulled ou abandonné

---

## 4️⃣ HTTPS & réseau

- HTTPS obligatoire sur tous les domaines
- redirection HTTP → HTTPS
- certificats renouvelés automatiquement
- aucune ressource chargée en HTTP

---

## 5️⃣ Logs & audit

- logs Docker accessibles
- logs applicatifs surveillés
- rotation des logs activée
- erreurs critiques investiguées

---

## 6️⃣ Incidents & réponses

### Tentative d’intrusion

- isolation du VPS si nécessaire
- analyse des logs
- changement immédiat des accès
- restauration depuis sauvegarde saine si doute

### Erreur humaine

- identification de l’action fautive
- rollback ou restauration
- documentation de l’incident

---

## 🧭 Règle agence

- aucun site OVH VPS sans ce socle de sécurité
- toute dérogation doit être explicitement validée
- la sécurité prime sur la rapidité

Ce document fait partie intégrante du **profil OVH VPS**.
