#!/usr/bin/env node
// PreToolUse hook for the meme-expert subagent. Allows Write, Edit, and
// NotebookEdit only inside trends/ and the agent's memory directory.
// Fails closed: any error exits 2, which blocks the call. Other nonzero exit
// codes would let the call proceed.
import { readFileSync, realpathSync } from "node:fs";
import { dirname, basename, join, resolve, sep } from "node:path";

function block(reason) {
  process.stderr.write(`meme-expert write guard: ${reason}\n`);
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
      const parent = dirname(current);
      if (parent === current) throw new Error(`can't resolve ${path}`);
      tail.push(basename(current));
      current = parent;
    }
  }
}

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
  if (typeof target !== "string" || target === "") block("no file path in tool input");

  const root = canonical(process.env.CLAUDE_PROJECT_DIR || input.cwd);
  const file = canonical(resolve(input.cwd || root, target));
  const allowed = [
    join(root, "trends"),
    join(root, ".claude", "agent-memory", "meme-expert"),
  ];

  if (!allowed.some((dir) => file.startsWith(dir + sep))) {
    block(`${target} is outside trends/ and .claude/agent-memory/meme-expert/. Report this blocked write instead of retrying.`);
  }
  process.exit(0);
} catch (error) {
  block(error.message);
}
