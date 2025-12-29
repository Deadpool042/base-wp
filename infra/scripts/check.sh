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
    # fallback best-effort (macOS usually has lsof)
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

load_env_safe() {
  require_file "$ENV_FILE"
  # shellcheck disable=SC1090
  source "$ENV_FILE"
}

# ---------- checks ----------
echo "🔎 Check infra — base-wp"
echo

fail=0

# Base commands
need_cmd docker || fail=1
need_cmd bash || true
need_cmd lsof || warn "lsof absent (check ports limité)"

if docker info >/dev/null 2>&1; then
  ok "Docker daemon: OK"
else
  err "Docker daemon: KO (Docker Desktop lancé ?)"
  fail=1
fi

# Docker Compose v2 (docker compose)
if docker compose version >/dev/null 2>&1; then
  ok "docker compose: OK"
else
  err "docker compose: KO"
  fail=1
fi

# fzf (optional but recommended)
if has_fzf; then
  ok "fzf: OK (menus interactifs activés)"
else
  warn "fzf non détecté (menus interactifs fallback). Reco: brew install fzf"
fi

# Required files
if [[ -f "$COMPOSE_FILE" ]]; then ok "compose.yml présent"; else err "compose.yml manquant: $COMPOSE_FILE"; fail=1; fi
if [[ -f "$ENV_FILE" ]]; then ok ".env présent"; else err ".env manquant: $ENV_FILE (cp infra/docker/env/.env.example infra/docker/env/.env)"; fail=1; fi

# Env parsing + ports
if [[ -f "$ENV_FILE" ]]; then
  load_env_safe

  WP_PORT="${WP_PORT:-8000}"
  DB_PORT="${DB_PORT:-3306}"
  MAILPIT_HTTP_PORT="${MAILPIT_HTTP_PORT:-8025}"
  MAILPIT_SMTP_PORT="${MAILPIT_SMTP_PORT:-1025}"

  echo
  echo "🔌 Ports"
  check_port_free "$WP_PORT"
  check_port_free "$DB_PORT"
  check_port_free "$MAILPIT_HTTP_PORT"
  check_port_free "$MAILPIT_SMTP_PORT"
fi

# Services state
echo
echo "🐳 Services (docker compose ps)"
if docker info >/dev/null 2>&1 && [[ -f "$COMPOSE_FILE" && -f "$ENV_FILE" ]]; then
  dc ps || true

  services="$(dc ps --services 2>/dev/null || true)"
  if [[ -z "${services:-}" ]]; then
    warn "Aucun service détecté. Infra non lancée ? (make up)"
  else
    ok "Services détectés: $(echo "$services" | tr '\n' ' ' | sed 's/ $//')"
  fi
fi

# Summary + actions
echo
if [[ "$fail" -eq 0 ]]; then
  ok "Check terminé: tout semble OK."
else
  err "Check terminé: erreurs détectées."
fi

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

if has_fzf; then
  choice="$(printf "%s\n" "$actions" | pick "Action")"
else
  choice="Quitter"
fi

case "${choice:-Quitter}" in
  "make up (start infra)")       (cd "$ROOT_DIR" && make up) ;;
  "make ps (status)")            (cd "$ROOT_DIR" && make ps) ;;
  "make logs (pick service)")    (cd "$ROOT_DIR" && make logs) ;;
  "make wp (wp-cli menu)")       (cd "$ROOT_DIR" && make wp) ;;
  "make install (wp core install)") (cd "$ROOT_DIR" && make install) ;;
  *) true ;;
esac

exit "$fail"