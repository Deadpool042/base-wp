# Checklist performance — Mutualisé

## Cache (obligatoire)

- Cache page activé
- Exclusions cache : /wp-admin, pages perso (compte, panier, checkout)
- Compression Gzip/Brotli (si possible)
- Cache navigateur pour assets statiques

## Images

- WebP/AVIF si possible
- Lazyload
- Tailles responsive (srcset)
- Limiter les sliders lourds

## Plugins

- éviter “tout-en-un” lourds
- limiter le nombre
- désactiver ce qui n’est pas utilisé

## Thème

- pas de page builder lourd si possible
- limiter les scripts
- charger fonts en local si pertinent

## Mesures

- PageSpeed / Lighthouse
- TTFB (mutualisé = variable, le cache compense)
- Vérifier cache HIT via headers (si dispo)
