#!/usr/bin/env node
// PreToolUse hook for a subagent. Allows Write, Edit, and NotebookEdit only
// inside the directories named in its arguments and the agent's memory
// directory. Usage: write-guard.mjs <agent> <dir> [<dir>...]
// Fails closed: any error exits 2, which blocks the call. Other nonzero exit
// codes would let the call proceed.
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, basename, join, resolve, sep } from "node:path";

const [agent, ...dirs] = process.argv.slice(2);

function block(reason) {
  process.stderr.write(`${agent ?? "unknown agent"} write guard: ${reason}\n`);
  process.exit(2);
}

// Resolves symlinks in the longest existing prefix, so a new file in an
// existing directory, or a new directory, still resolves correctly.
function canonical(path) {
  const tail = [];
  let current = path;
  for (;;) {
    try {
      return join(realpathSync(current), ...tail.reverse());
    } catch {
      // Only a truly missing entry may be skipped. An entry that exists but
      // won't resolve, such as a dangling symlink, could redirect the write.
      if (lstatSync(current, { throwIfNoEntry: false })) {
        throw new Error(`can't resolve ${current}`);
      }
      const parent = dirname(current);
      if (parent === current) throw new Error(`can't resolve ${path}`);
      tail.push(basename(current));
      current = parent;
    }
  }
}

try {
  if (!/^[a-z0-9-]+$/.test(agent ?? "") || dirs.length === 0) block("usage: write-guard.mjs <agent> <dir> [<dir>...]");
  if (dirs.some((dir) => !/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(dir))) block("each dir must be a plain relative path");

  const input = JSON.parse(readFileSync(0, "utf8"));
  const target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
  if (typeof target !== "string" || target === "") block("no file path in tool input");

  const root = canonical(process.env.CLAUDE_PROJECT_DIR || input.cwd);
  const file = canonical(resolve(input.cwd || root, target));
  const memory = join(".claude", "agent-memory", agent);
  const allowed = [...dirs, memory].map((dir) => join(root, dir));

  if (!allowed.some((dir) => file.startsWith(dir + sep))) {
    block(`${target} is outside ${[...dirs, memory].map((dir) => dir + "/").join(", ")}. Report this blocked write instead of retrying.`);
  }
  process.exit(0);
} catch (error) {
  block(error.message);
}
