# Runbook opérations — Mutualisé

## Routine mensuelle

- MAJ core/plugins/thème (ordre : plugins -> thème -> core)
- Vérifier logs erreurs (si dispo)
- Vérifier formulaires + emails
- Vérifier sauvegardes
- Scan sécurité (quick)

## Incidents

- Site down : désactiver plugin fautif (renommer dossier plugin via FTP)
- Erreurs 500 : vérifier PHP version + logs
- Problème email : basculer SMTP (provider)
- Lenteur : vérifier cache + plugins lourds
