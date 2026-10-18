#!/usr/bin/env node
// PreToolUse hook for a subagent. Allows Write, Edit, and NotebookEdit only
// inside the directories named in its arguments and the agent's memory
// directory. Usage: write-guard.mjs <agent> <dir> [<dir>...]
// Fails closed: any error exits 2, which blocks the call. Other nonzero exit
// codes would let the call proceed.
import { readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { canonical } from "./paths.mjs";

const [agent, ...dirs] = process.argv.slice(2);

function block(reason) {
  process.stderr.write(`${agent ?? "unknown agent"} write guard: ${reason}\n`);
  process.exit(2);
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
