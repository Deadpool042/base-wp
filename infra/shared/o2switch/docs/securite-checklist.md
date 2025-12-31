# Checklist sécurité — Mutualisé

## Accès

- Admin unique + comptes nominatifs
- MDP forts + 2FA si possible
- Limitation tentatives login (plugin ou hébergeur)
- Désactiver XML-RPC si non nécessaire

## WP config

- `DISALLOW_FILE_EDIT` = true
- `WP_DEBUG` = false
- SALT à jour
- Masquer version WP (best effort)

## Plugins

- uniquement plugins “validés” (white-list)
- pas de nulled
- pas de freemium bloquant dans le socle

## Fichiers

- empêcher l’exécution PHP dans uploads (si possible)
- protéger wp-config.php (droits)
- backups non accessibles publiquement

## Mises à jour

- core/plugins/thème : au moins mensuel
- surveillance vulnérabilités (WPScan / alerting)
