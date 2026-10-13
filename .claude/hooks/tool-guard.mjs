#!/usr/bin/env node
// PreToolUse hook that limits an agent's Bash and browser tools to one job.
// Usage: tool-guard.mjs <profile>
// - meme-expert: Bash may run only the watch plugin's watch.py, with an exact
//   list of options, or its setup.py --check, to view video.
// - designer: Bash may run only scripts/generate-image.mjs, which itself
//   keeps every file it reads or writes inside designs/.
// Neither profile allows shell syntax beyond quoting.
// - The browser's computer tool may only take screenshots, zoom, scroll, and
//   wait. No clicks or typing, because the pane may hold the user's sign-ins.
// - The browser's navigate tool may only open public https:// URLs, so it
//   can't reach local files, this machine, or a private network.
// Fails closed: any error exits 2, which blocks the call.
import { lookup } from "node:dns/promises";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isIP } from "node:net";
import { homedir } from "node:os";
import { delimiter, join, resolve, sep } from "node:path";

const profile = process.argv[2];

function block(reason) {
  process.stderr.write(`${profile ?? "unknown"} tool guard: ${reason}\n`);
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

function checkDesignerBash(command, cwd) {
  const [program, script] = words(command);
  const root = realpathSync(process.env.CLAUDE_PROJECT_DIR || cwd);
  if (program !== "node" || !script || realpathSync(resolve(cwd || root, script)) !== join(root, "scripts", "generate-image.mjs")) {
    block("only node scripts/generate-image.mjs is allowed");
  }
}

// watch can't tell yt-dlp to ignore its config files, and a config file can
// name a cookie jar or a browser profile. Watch runs only when none exists.
function ytDlpConfigs() {
  const home = homedir();
  const xdg = process.env.XDG_CONFIG_HOME || join(home, ".config");
  const files = [
    join(xdg, "yt-dlp", "config"), join(xdg, "yt-dlp", "config.txt"),
    join(xdg, "yt-dlp.conf"), join(xdg, "yt-dlp.conf.txt"),
    join(home, "yt-dlp.conf"), join(home, "yt-dlp.conf.txt"),
    join(home, ".yt-dlp", "config"), join(home, ".yt-dlp", "config.txt"),
    "/etc/yt-dlp.conf", "/etc/yt-dlp/config", "/etc/yt-dlp/config.txt",
  ];
  // A portable config sits next to the yt-dlp program.
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (dir && existsSync(join(dir, "yt-dlp"))) files.push(join(dir, "yt-dlp.conf"));
  }
  return files.filter((file) => existsSync(file));
}

function checkWatchBash(command) {
  const [program, script, ...args] = words(command);
  if (program !== "python3" || !script) block("only python3 with a watch script is allowed");

  const scripts = join(homedir(), ".claude", "plugins", "cache", "claude-video", "watch");
  const path = realpathSync(script);
  const match = path.startsWith(scripts + sep) && path.match(/[/\\]skills[/\\]watch[/\\]scripts[/\\](watch|setup)\.py$/);
  if (!match) block(`${script} is not the watch plugin's watch.py or setup.py`);

  const configs = ytDlpConfigs();
  if (configs.length > 0) block(`yt-dlp config files could add sign-ins: ${configs.join(", ")}. Ask the user to remove them.`);

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

// True for loopback, private, link-local, shared, and unspecified addresses.
function isPrivate(address) {
  const v4 = address.replace(/^::ffff:/i, "");
  if (isIP(v4) === 4) {
    const [a, b] = v4.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const v6 = address.toLowerCase();
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6);
}

// shortcut: a DNS check here can't stop rebinding, where a name resolves to a
// public address now and a private one when the browser loads it. Enforce
// public-only egress at the network layer if the browser can reach anything
// sensitive.
async function checkUrl(url) {
  if (typeof url !== "string" || !url.startsWith("https://")) block("navigate needs a full https:// URL");
  const host = new URL(url).hostname.toLowerCase().replace(/\.$/, "");
  if (/^[\d.]+$/.test(host) || host.startsWith("[") || !host.includes(".") ||
      /(^|\.)(localhost|localdomain|local|internal|lan|home|test)$/.test(host)) {
    block(`${host} isn't a public host name`);
  }
  const addresses = await lookup(host, { all: true });
  const internal = addresses.find(({ address }) => isPrivate(address));
  if (internal) block(`${host} resolves to ${internal.address}, a private address`);
}

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const tool = input.tool_input ?? {};
  if (profile !== "meme-expert" && profile !== "designer") block("usage: tool-guard.mjs meme-expert|designer");
  if (input.tool_name === "Bash") {
    if (typeof tool.command !== "string") block("no command in tool input");
    if (profile === "designer") checkDesignerBash(tool.command.trim(), input.cwd);
    else checkWatchBash(tool.command.trim());
  } else if (profile === "designer") {
    block(`${input.tool_name} isn't allowed for the designer`);
  } else if (input.tool_name?.endsWith("__navigate")) {
    await checkUrl(tool.url);
  } else if (input.tool_name?.endsWith("__computer")) {
    if (!BROWSER_ACTIONS.has(tool.action)) block(`browser action ${tool.action} isn't allowed. Only screenshot, zoom, scroll, and wait are.`);
  } else {
    block(`${input.tool_name} isn't covered by this guard`);
  }
  process.exit(0);
} catch (error) {
  block(error.message);
}
