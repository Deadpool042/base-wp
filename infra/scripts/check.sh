#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

# ---------- helpers ----------
ok()   { echo "✅ $*"; }
warn() { echo "⚠️  $*"; }
err()  { echo "❌ $*"; }

need_cmd() {
  local c="$1"
  if command -v "$c" >/dev/null 2>&1; then
    ok "Commande dispo: $c"
  else
    err "Commande manquante: $c"
    return 1
  fi
}

port_in_use() {
  local p="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 2
  fi
}

check_port_free() {
  local p="$1"
  if port_in_use "$p"; then
    warn "Port $p déjà utilisé (risque de conflit)"
  else
    ok "Port $p libre"
  fi
}

check_file() {
  local f="$1" label="${2:-file}"
  if [[ -f "$f" ]]; then
    ok "$label présent: $f"
  else
    err "$label manquant: $f"
    return 1
  fi
}

# ---------- checks ----------
echo "🔎 Check infra — base-wp"
echo

profile_info
echo

fail=0

# Base commands
need_cmd docker || fail=1
need_cmd bash || true
need_cmd lsof || warn "lsof absent (check ports limité)"
need_cmd jq   || warn "jq absent (project manager/metadata limités)"
need_cmd mkcert || warn "mkcert absent (TLS local *.local nécessitera mkcert)"

# Docker daemon
if docker info >/dev/null 2>&1; then
  ok "Docker daemon: OK"
else
  err "Docker daemon: KO (Docker Desktop lancé ?)"
  fail=1
fi

# docker compose
if docker compose version >/dev/null 2>&1; then
  ok "docker compose: OK"
else
  err "docker compose: KO"
  fail=1
fi

# fzf
if has_fzf; then
  ok "fzf: OK (menus interactifs activés)"
else
  warn "fzf non détecté. Installe-le: brew install fzf"
fi

# Compose files
echo
echo "📄 Compose files"
for f in "${COMPOSE_FILES[@]}"; do
  check_file "$f" "compose" || fail=1
done

# Env file
echo
echo "🔐 Env file"
if check_file "$ENV_FILE" "env"; then
  :
else
  print_env_hint || true
  fail=1
fi

# Ports
if [[ -f "$ENV_FILE" ]]; then
  load_env

  echo
  echo "🔌 Ports (exposés)"
  # Traefik publié en 80/443 dans ton profil ovh-vps
  check_port_free 80
  check_port_free 443

  # Mailpit si dev (ou si vars définies)
  MAILPIT_HTTP_PORT="${MAILPIT_HTTP_PORT:-8025}"
  MAILPIT_SMTP_PORT="${MAILPIT_SMTP_PORT:-1026}"
  if [[ "${ENV_NAME:-}" == "dev" || -n "${MAILPIT_HTTP_PORT:-}" || -n "${MAILPIT_SMTP_PORT:-}" ]]; then
    echo
    echo "✉️  Mailpit (dev-only)"
    check_port_free "$MAILPIT_HTTP_PORT"
    check_port_free "$MAILPIT_SMTP_PORT"
  fi
fi

# Services state (ne jamais faire échouer le check)
echo
echo "🐳 Services (profil: $PROFILE)"
if docker info >/dev/null 2>&1; then
  dc ps || true

  services="$(dc ps --services 2>/dev/null || true)"
  if [[ -z "${services:-}" ]]; then
    warn "Aucun service détecté. Infra non lancée ? (make up)"
  else
    ok "Services détectés: $(echo "$services" | tr '\n' ' ' | sed 's/ $//')"
  fi
fi

# Summary
echo
if [[ "$fail" -eq 0 ]]; then
  ok "Check terminé: tout semble OK."
else
  err "Check terminé: erreurs détectées."
fi

# Actions rapides
actions=$(
  cat <<'EOF'
Quitter
make up (start infra)
make ps (status)
make logs (pick service)
make wp (wp-cli menu)
make install (wp core install)
EOF
)

choice=""
if has_fzf; then
  choice="$(printf "%s\n" "$actions" | pick "Action")"
else
  echo
  echo "ℹ️  fzf non détecté : actions disponibles"
  echo "$actions"
fi

if [[ -n "${choice:-}" && "${choice:-}" != "Quitter" ]]; then
  case "$choice" in
    "make up (start infra)")        (cd "$ROOT_DIR" && make up) ;;
    "make ps (status)")            (cd "$ROOT_DIR" && make ps) ;;
    "make logs (pick service)")    (cd "$ROOT_DIR" && make logs) ;;
    "make wp (wp-cli menu)")       (cd "$ROOT_DIR" && make wp) ;;
    "make install (wp core install)") (cd "$ROOT_DIR" && make install) ;;
  esac
fi

exit "$fail"