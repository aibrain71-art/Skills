#!/bin/bash
# SessionStart hook: install this repo's slash commands into the session sandbox.
#
# Runs only inside a Claude Code on the web session (CLAUDE_CODE_REMOTE=true).
# Local CLI sessions already have ~/.claude/commands/ managed by the user;
# we don't touch them.
#
# Idempotent: copies are unconditional, so re-running just refreshes the files.

set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
SRC_DIR="$REPO_ROOT/commands"
DST_DIR="$HOME/.claude/commands"

mkdir -p "$DST_DIR"

if [ -d "$SRC_DIR" ]; then
  # Local working tree: copy directly, no network.
  for f in "$SRC_DIR"/*.md; do
    [ -e "$f" ] || continue
    cp -f "$f" "$DST_DIR/"
  done
else
  # Fallback: fetch from GitHub raw on the default branch.
  BRANCH="main"
  BASE="https://raw.githubusercontent.com/aibrain71-art/skills/${BRANCH}/commands"
  for cmd in skill-add.md skill-install.md; do
    curl -fsSL --max-time 5 "${BASE}/${cmd}" -o "${DST_DIR}/${cmd}" || true
  done
fi
