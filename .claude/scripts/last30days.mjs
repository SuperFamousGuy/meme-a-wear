#!/usr/bin/env node
// Runs the installed last30days research engine without a shell, so the
// shell guard can allow one exact command shape instead of arbitrary scripts.
// Usage: last30days.mjs diagnose
//        last30days.mjs research <topic>
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const plugins = join(homedir(), ".claude/plugins");
const script = "skills/last30days/scripts/last30days.py";

// Returns true when a < b, comparing dotted version numbers.
function older(a, b) {
  const x = a.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) < (y[i] ?? 0);
  }
  return false;
}

// The newest cached version, else the marketplace clone.
function engine() {
  const cache = join(plugins, "cache/last30days-skill/last30days");
  const versions = existsSync(cache)
    ? readdirSync(cache).filter((v) => /^[0-9]+(\.[0-9]+)*$/.test(v) && existsSync(join(cache, v, script)))
    : [];
  if (versions.length) {
    const newest = versions.reduce((a, b) => (older(a, b) ? b : a));
    return join(cache, newest, script);
  }
  const clone = join(plugins, "marketplaces/last30days-skill", script);
  if (existsSync(clone)) return clone;
  throw new Error("the last30days plugin isn't installed");
}

// The engine needs Python 3.12 or later.
function python() {
  for (const name of ["python3.13", "python3.12", "python3"]) {
    const probe = spawnSync(name, ["-c", "import sys; print(sys.version_info >= (3, 12))"], { encoding: "utf8" });
    if (probe.status === 0 && probe.stdout.trim() === "True") return name;
  }
  throw new Error("last30days needs Python 3.12 or later");
}

function args(argv) {
  const [mode, topic, ...extra] = argv;
  if (mode === "diagnose" && topic === undefined) return ["--diagnose"];
  if (mode === "research" && extra.length === 0 && typeof topic === "string") {
    // A leading dash would turn the topic into an engine flag.
    if (!/^[^-\0-\x1f][^\0-\x1f]{0,199}$/.test(topic)) throw new Error("the topic must be 1-200 characters and can't start with -");
    return [topic, "--emit=compact"];
  }
  throw new Error("usage: last30days.mjs diagnose | research <topic>");
}

try {
  const result = spawnSync(python(), [engine(), ...args(process.argv.slice(2))], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
} catch (error) {
  process.stderr.write(`last30days: ${error.message}\n`);
  process.exit(1);
}
