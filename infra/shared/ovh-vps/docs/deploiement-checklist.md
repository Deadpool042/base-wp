# Checklist de déploiement — OVH VPS

Cette checklist décrit le **processus standard et obligatoire** de déploiement pour tout projet hébergé sur **OVH VPS**.
Elle sert de référence opérationnelle pour l’agence.

---

## 🎯 Objectifs

- garantir un déploiement reproductible
- limiter les erreurs humaines
- assurer sécurité, performance et stabilité dès la mise en production

---

## 1️⃣ Pré-requis serveur (AVANT tout déploiement)

### VPS

- VPS OVH provisionné (OS à jour)
- ressources adaptées au projet (CPU / RAM / disque)
- accès SSH fonctionnel

### Sécurité serveur

- accès SSH **par clé uniquement**
- login root direct désactivé ou restreint
- firewall actif (UFW ou équivalent)
  - ports ouverts strictement nécessaires (22, 80, 443)

---

## 2️⃣ Préparation système

- système mis à jour
- fuseau horaire configuré
- Docker installé
- Docker Compose installé

Vérification :

```bash
make check
```

---

## 3️⃣ Préparation du projet

- dépôt Git cloné sur le VPS
- branche cible identifiée (main / prod)
- fichiers `.env` présents et complétés
- secrets non versionnés

⚠️ Aucun secret ne doit être commité.

---

## 4️⃣ Configuration DNS

- domaine / sous-domaine pointé vers l’IP du VPS
- TTL raisonnable avant bascule
- vérifier propagation DNS

---

## 5️⃣ Démarrage de l’infrastructure

```bash
make up
```

Vérifier :

- services Docker actifs
- healthchecks au vert
- absence d’erreurs critiques dans les logs

---

## 6️⃣ Installation applicative

```bash
make install
```

Contrôles :

- WordPress accessible
- accès admin fonctionnel
- base de données opérationnelle

---

## 7️⃣ HTTPS & sécurité

- HTTPS actif (Traefik ou équivalent)
- redirection HTTP → HTTPS
- certificats valides

---

## 8️⃣ Vérifications fonctionnelles

- pages clés accessibles
- formulaires fonctionnels
- emails envoyés et reçus
- comptes utilisateurs OK

---

## 9️⃣ Vérifications performance

- TTFB cohérent
- cache actif si prévu
- pas d’erreurs PHP récurrentes

---

## 🔟 Livraison

- accès documentés
- sauvegardes actives
- monitoring en place
- runbooks fournis

---

## 🧭 Règle agence

- aucun site n’est livré sans avoir validé **toutes les étapes**
- toute dérogation doit être explicitement validée

Cette checklist fait partie intégrante du **profil OVH VPS**.
