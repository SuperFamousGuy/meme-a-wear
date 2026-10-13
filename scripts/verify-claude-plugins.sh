#!/usr/bin/env bash
# Smoke-test the runtime dependencies of every plugin in .claude/settings.json.
# Run after scripts/install-claude-plugins.sh. Exits non-zero on any failure.
set -uo pipefail

failures=0
check() {
  local name=$1; shift
  if "$@" >/dev/null 2>&1; then echo "ok   $name"; else echo "FAIL $name"; failures=$((failures + 1)); fi
}

# Exit 0 if version $1 >= version $2 (dotted numeric, leading "v" ignored).
version_at_least() {
  node -e 'const p = v => v.replace(/^v/, "").split(/[.+-]/).slice(0, 3).map(Number);
    const [a, b] = [p(process.argv[1]), p(process.argv[2])];
    for (let i = 0; i < 3; i++) if ((a[i] || 0) !== (b[i] || 0)) process.exit(a[i] > b[i] ? 0 : 1);' "$1" "$2"
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

# claude-mem: Node and Bun meet the minimums in its package.json engines field.
root=$(plugin_root claude-mem@thedotmack)
engine() { node -e 'console.log(require(process.argv[1]).engines?.[process.argv[2]]?.replace(/^>=\s*/, "") ?? "0")' "$root/package.json" "$1"; }
min_node=$(engine node); min_bun=$(engine bun)
check "claude-mem node >= $min_node" version_at_least "$(node --version)" "$min_node"
check "claude-mem bun >= $min_bun" version_at_least "$(bun --version 2>/dev/null)" "$min_bun"

# claude-mem: install its Bun dependencies (the plugin's own Setup hook).
# version-check.js exits 0 even when it cannot install. It writes .install-version
# only after the full dependency closure resolves, so test that marker.
node "$root/scripts/version-check.js" >/dev/null 2>&1
check "claude-mem runtime" node -e 'const fs = require("fs"), path = require("path"), root = process.argv[1];
  const marker = fs.readFileSync(path.join(root, ".install-version"), "utf8");
  let version; try { version = JSON.parse(marker).version } catch { version = marker.trim().replace(/^v/, "") }
  process.exit(version === require(path.join(root, "package.json")).version ? 0 : 1)' "$root"

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
