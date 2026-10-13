#!/usr/bin/env bash
# Install every marketplace and plugin declared in .claude/settings.json.
# Requires: claude, node. Safe to rerun.
set -euo pipefail

settings="$(cd "$(dirname "$0")/.." && pwd)/.claude/settings.json"

node -e '
  const s = require(process.argv[1]);
  for (const { source: m } of Object.values(s.extraKnownMarketplaces))
    console.log(m.source === "github" ? m.repo : m.url);
' "$settings" |
  while read -r source; do
    claude plugin marketplace add "$source" || echo "marketplace already added: $source"
  done

node -e '
  const s = require(process.argv[1]);
  for (const [p, on] of Object.entries(s.enabledPlugins)) if (on) console.log(p);
' "$settings" |
  while read -r plugin; do
    claude plugin install "$plugin"
  done

claude plugin list
