#!/usr/bin/env node
// PreToolUse hook that limits the tools an agent uses to view images and
// video to viewing only:
// - Bash may run only the watch plugin's watch.py, with an exact list of
//   options, or its setup.py --check. No shell syntax beyond quoting.
// - The browser's computer tool may only take screenshots, zoom, scroll, and
//   wait. No clicks or typing, because the pane may hold the user's sign-ins.
// Fails closed: any error exits 2, which blocks the call.
import { readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join, sep } from "node:path";

function block(reason) {
  process.stderr.write(`view guard: ${reason}\n`);
  process.exit(2);
}

// Options that read a video. Left out on purpose: --out-dir writes to a chosen
// directory, --cookies and --cookies-from-browser use the user's sign-ins,
// --engine and --whisper override the user's choice of upload provider.
// argparse accepts abbreviations such as --out, so options must match exactly.
const WATCH_OPTIONS = new Set([
  "--question", "--detail", "--start", "--end", "--timestamps", "--max-frames",
  "--resolution", "--fps", "--no-dedup", "--no-whisper", "--sub-lang",
]);
const BROWSER_ACTIONS = new Set(["screenshot", "zoom", "scroll", "wait"]);

// Splits a command into words like a shell would, but accepts only plain
// words, 'single-quoted', and "double-quoted" text. Anything a shell would
// expand or treat as an operator blocks the call.
function words(command) {
  const out = [];
  let word = null;
  let quote = null;
  for (const c of command) {
    if (quote) {
      if (c === quote) quote = null;
      else if (quote === '"' && /[$`\\!]/.test(c)) throw new Error(`"${c}" inside double quotes`);
      else word += c;
    } else if (c === "'" || c === '"') {
      quote = c;
      word ??= "";
    } else if (c === " " || c === "\t") {
      if (word !== null) out.push(word);
      word = null;
    } else if (/[A-Za-z0-9_./:@%+,=-]/.test(c)) {
      word = (word ?? "") + c;
    } else {
      throw new Error(`"${c}" outside quotes`);
    }
  }
  if (quote) throw new Error("unclosed quote");
  if (word !== null) out.push(word);
  return out;
}

function checkBash(command) {
  const [program, script, ...args] = words(command);
  if (program !== "python3" || !script) block("only python3 with a watch script is allowed");

  const scripts = join(homedir(), ".claude", "plugins", "cache", "claude-video", "watch");
  const path = realpathSync(script);
  const match = path.startsWith(scripts + sep) && path.match(/[/\\]skills[/\\]watch[/\\]scripts[/\\](watch|setup)\.py$/);
  if (!match) block(`${script} is not the watch plugin's watch.py or setup.py`);

  if (match[1] === "setup") {
    if (args.length !== 1 || args[0] !== "--check") block("setup.py is allowed only with --check. Ask the user to run setup.");
    return;
  }
  // A local path as the source could upload a project file to the engine.
  // watch.py takes one positional argument, so later words are option values.
  if (!/^https:\/\//.test(args[0] ?? "")) block("the first watch.py argument must be an https:// video URL");
  for (const arg of args) {
    if (arg.startsWith("-") && !WATCH_OPTIONS.has(arg.split("=")[0])) block(`watch.py option ${arg} isn't allowed`);
  }
}

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const tool = input.tool_input ?? {};
  if (input.tool_name === "Bash") {
    if (typeof tool.command !== "string") block("no command in tool input");
    checkBash(tool.command.trim());
  } else if (input.tool_name?.endsWith("__computer")) {
    if (!BROWSER_ACTIONS.has(tool.action)) block(`browser action ${tool.action} isn't allowed. Only screenshot, zoom, scroll, and wait are.`);
  } else {
    block(`${input.tool_name} isn't covered by this guard`);
  }
  process.exit(0);
} catch (error) {
  block(error.message);
}
