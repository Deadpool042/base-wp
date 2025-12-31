#!/usr/bin/env bash
set -euo pipefail

# ROOT_DIR = racine du repo (bin/../)
ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)}"

PROJECTS_DIR="${PROJECTS_DIR:-$ROOT_DIR/projects}"
ARCHIVE_DIR="${ARCHIVE_DIR:-$PROJECTS_DIR/.archive}"

# UI-friendly defaults
FORMAT="${FORMAT:-ndjson}"          # ndjson|human
INTERACTIVE="${INTERACTIVE:-1}"     # 1|0