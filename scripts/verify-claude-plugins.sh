#!/usr/bin/env bash
# Smoke-test the runtime dependencies of every plugin in .claude/settings.json.
# Run after scripts/install-claude-plugins.sh. Exits non-zero on any failure.
set -uo pipefail

failures=0
check() {
  local name=$1; shift
  if "$@" >/dev/null 2>&1; then echo "ok   $name"; else echo "FAIL $name"; failures=$((failures + 1)); fi
}

plugin_root() {
  node -e 'const i = require(process.argv[1]); console.log(i.plugins[process.argv[2]]?.[0]?.installPath ?? "")' \
    "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/plugins/installed_plugins.json" "$1"
}

# Shared runtimes.
for bin in bash curl git node bun uv python3 ffmpeg ffprobe yt-dlp deno; do
  check "$bin on PATH" command -v "$bin"
done
check "node >= 20" node -e 'process.exit(parseInt(process.versions.node) < 20 ? 1 : 0)'
check "python >= 3.10" python3 -c 'import sys; sys.exit(sys.version_info < (3, 10))'

# Every enabled plugin is installed.
settings="$(cd "$(dirname "$0")/.." && pwd)/.claude/settings.json"
for plugin in $(node -e 'for (const [p, on] of Object.entries(require(process.argv[1]).enabledPlugins)) if (on) console.log(p)' "$settings"); do
  check "$plugin installed" test -d "$(plugin_root "$plugin")"
done

# impeccable: the launcher fetches its platform binary and answers the handshake.
root=$(plugin_root impeccable@impeccable)
check "impeccable engine" sh -c "'$root/skills/impeccable/scripts/impeccable' engine-probe | grep -q impeccable-engine"

# claude-mem: install its Bun dependencies (the plugin's own Setup hook).
# version-check.js exits 0 even when it cannot install, so test the result.
root=$(plugin_root claude-mem@thedotmack)
node "$root/scripts/version-check.js" >/dev/null 2>&1
check "claude-mem runtime" test -d "$root/node_modules/zod"

# watch: base setup finds ffmpeg, ffprobe, and yt-dlp.
root=$(plugin_root watch@claude-video)
check "watch setup" python3 "$root/skills/watch/scripts/setup.py" --check

# ponytail: the SessionStart hook runs under node.
root=$(plugin_root ponytail@ponytail)
check "ponytail hook" env CLAUDE_PLUGIN_ROOT="$root" node "$root/hooks/ponytail-activate.js"

# superpowers: the SessionStart hook runs under bash.
root=$(plugin_root superpowers@claude-plugins-official)
check "superpowers hook" env CLAUDE_PLUGIN_ROOT="$root" bash "$root/hooks/session-start"

echo "$failures failure(s)"
exit $((failures > 0))
