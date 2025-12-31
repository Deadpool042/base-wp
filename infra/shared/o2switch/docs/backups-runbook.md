# Runbook sauvegardes — Mutualisé

## Stratégie recommandée

- Backups automatiques quotidiens (si hébergeur le propose)
- Backups applicatifs (plugin) : DB + wp-content (uploads)
- Rétention : 7j / 30j selon offre

## Avant une MAJ

- backup manuel “juste avant”
- noter versions (WP + plugins majeurs)

## Restauration

1. Restaurer fichiers (wp-content + thème/plugin)
2. Restaurer DB
3. Vérifier `siteurl/home`
4. Flush permaliens
5. Vérifier checkout/formulaires

## Vérification post-restore

- home OK
- admin OK
- email OK
- performance OK (cache)
