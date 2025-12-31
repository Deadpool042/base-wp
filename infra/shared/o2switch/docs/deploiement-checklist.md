# Checklist déploiement — Mutualisé (OVH / o2switch)

## 0) Pré-requis

- PHP >= 8.1 (idéal 8.2+)
- MySQL/MariaDB compatible
- HTTPS actif (certificat Let’s Encrypt / hébergeur)
- Accès admin WP + accès FTP/SFTP + (SSH si disponible)

## 1) DNS & SSL

- Domaine / sous-domaine configuré
- HTTPS forcé
- Redirections www / non-www cohérentes
- HSTS (si possible)

## 2) Base de données

- DB créée + user dédié (pas root)
- Charset/collation : utf8mb4 + utf8mb4_unicode_ci

## 3) Déploiement fichiers

- Upload fichiers WP (ou migration via plugin)
- Droits fichiers : 644 / dossiers : 755 (selon hébergeur)
- `wp-content/uploads` writable
- Désactiver indexation répertoires si possible

## 4) WP config (minimum)

- Clés SALT à jour
- `WP_DEBUG` OFF en prod
- `DISALLOW_FILE_EDIT` ON
- Prefix tables non standard si nouveau site (option)

## 5) Installation / Migration

- Si migration :
  - vérifier URLs (home/siteurl)
  - search/replace si besoin
  - permaliens (flush)
- Vérifier emails (SMTP si nécessaire)
- Vérifier pages clés : home, contact, panier/checkout (si Woo)

## 6) Post-déploiement

- Cache activé + purge test
- Test formulaires + réception email
- Test perf (LCP, cache HIT)
- Test sécurité (login, brute force, headers)
- Sauvegarde planifiée

## 7) Livrables

- Accès admin documentés
- Procédure update mensuelle (lien vers maintenance)
- Runbook backup/restore fourni
