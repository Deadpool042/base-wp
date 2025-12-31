#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# Logs — format simple, stable, réutilisable partout
# ------------------------------------------------------------------------------

log()  { printf "%s\n" "$*"; }
info() { printf "ℹ️  %s\n" "$*"; }
ok()   { printf "✅ %s\n" "$*"; }
warn() { printf "⚠️  %s\n" "$*"; }
err()  { printf "❌ %s\n" "$*" >&2; }
die()  { err "$*"; exit 1; }