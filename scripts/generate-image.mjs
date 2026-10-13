#!/usr/bin/env node
// Generates and prepares product artwork with Google's Gemini image models
// (the default) or Recraft. Reads and writes files only inside designs/.
//
//   node scripts/generate-image.mjs generate --prompt-file <designs/...> --out <designs/...>
//       [--provider google|recraft] [--count 1-4] [--aspect 3:4] [--size 1K|2K|4K]
//       [--reference <designs/...png>]
//   node scripts/generate-image.mjs prepare --op upscale|remove-background|vectorize
//       --in <designs/...> --out <designs/...>        (Recraft only)
//   node scripts/generate-image.mjs pick --in <designs/...> --out <designs/...>
//       (copies a chosen candidate to its final path)
//
// Each command prints the files it wrote, with pixel size for PNGs.
//   node scripts/generate-image.mjs self-test
//
// Keys come from GEMINI_API_KEY and RECRAFT_API_TOKEN. GEMINI_IMAGE_MODEL and
// RECRAFT_MODEL override the default models.
import assert from "node:assert/strict";
import { copyFileSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_COUNT = 4;

function fail(message) {
  process.stderr.write(`generate-image: ${message}\n`);
  process.exit(1);
}

// Resolves symlinks in the longest existing prefix, as the write guard does,
// so a symlink inside designs/ can't point a read or write elsewhere.
function canonical(path) {
  const tail = [];
  let current = path;
  for (;;) {
    try {
      return join(realpathSync(current), ...tail.reverse());
    } catch {
      if (lstatSync(current, { throwIfNoEntry: false })) throw new Error(`can't resolve ${current}`);
      const parent = dirname(current);
      if (parent === current) throw new Error(`can't resolve ${path}`);
      tail.push(basename(current));
      current = parent;
    }
  }
}

// Keeps every file this script reads or writes inside designs/, so a prompt
// can't send a secret to an image API or overwrite files elsewhere.
export function insideDesigns(path, root = ROOT) {
  const designs = canonical(join(root, "designs"));
  const file = canonical(resolve(root, path));
  if (!file.startsWith(designs + sep)) throw new Error(`${path} is outside designs/`);
  return file;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith("--") || argv[i + 1] === undefined) fail(`expected --option value, got ${argv[i]}`);
    args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

function key(name) {
  const value = process.env[name];
  if (!value) fail(`${name} isn't set. Ask the user to add it.`);
  return value;
}

async function post(url, headers, body) {
  const response = await fetch(url, { method: "POST", headers, body });
  const text = await response.text();
  if (!response.ok) fail(`${url} returned ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

// Returns [{data, mime}] for every image block in a Gemini interaction.
export function googleImages(interaction) {
  return (interaction.steps ?? [])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content ?? [])
    .filter((block) => block.type === "image" && typeof block.data === "string")
    .map((block) => ({ data: block.data, mime: block.mime_type ?? "image/png" }));
}

async function generateGoogle({ prompt, aspect, size, reference }) {
  const input = [{ type: "text", text: prompt }];
  if (reference) {
    input.push({ type: "image", mime_type: mimeOf(reference), data: readFileSync(reference).toString("base64") });
  }
  const interaction = await post(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    { "x-goog-api-key": key("GEMINI_API_KEY"), "Content-Type": "application/json" },
    JSON.stringify({
      model: process.env.GEMINI_IMAGE_MODEL || "gemini-nano-banana-2.1",
      input,
      response_format: { type: "image", mime_type: "image/png", aspect_ratio: aspect, image_size: size },
    }),
  );
  return googleImages(interaction);
}

async function generateRecraft({ prompt, aspect }) {
  const result = await post(
    "https://external.api.recraft.ai/v1/images/generations",
    { Authorization: `Bearer ${key("RECRAFT_API_TOKEN")}`, "Content-Type": "application/json" },
    JSON.stringify({ prompt, model: process.env.RECRAFT_MODEL || "recraftv4_1", size: aspect, n: 1, response_format: "b64_json" }),
  );
  return (result.data ?? []).map((image) => ({ data: image.b64_json, mime: "image/png" }));
}

// shortcut: the multipart field name ("file") and response shape come from
// Recraft's docs but are untested without an account. Test them once a
// RECRAFT_API_TOKEN exists.
async function prepareRecraft(op, input) {
  const paths = { upscale: "crispUpscale", "remove-background": "removeBackground", vectorize: "vectorize" };
  if (!paths[op]) fail(`--op must be one of ${Object.keys(paths).join(", ")}`);
  const form = new FormData();
  form.append("file", new Blob([readFileSync(input)], { type: mimeOf(input) }), basename(input));
  form.append("response_format", "b64_json");
  const result = await post(
    `https://external.api.recraft.ai/v1/images/${paths[op]}`,
    { Authorization: `Bearer ${key("RECRAFT_API_TOKEN")}` },
    form,
  );
  const image = result.image ?? {};
  if (image.b64_json) return Buffer.from(image.b64_json, "base64");
  if (image.url) return Buffer.from(await (await fetch(image.url)).arrayBuffer());
  fail(`Recraft returned no image: ${JSON.stringify(result).slice(0, 500)}`);
}

// Reads width and height from a PNG's IHDR chunk.
export function pngSize(buffer) {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return "";
  return ` ${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`;
}

function report(file) {
  console.log(`${file}${pngSize(readFileSync(file))}`);
}

function mimeOf(path) {
  const types = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
  return types[extname(path).toLowerCase()] ?? fail(`unsupported image type: ${path}`);
}

async function generate(args) {
  const provider = args.provider ?? "google";
  const count = Number(args.count ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) fail(`--count must be 1 to ${MAX_COUNT}`);
  if (!args["prompt-file"] || !args.out) fail("generate needs --prompt-file and --out");
  const options = {
    prompt: readFileSync(insideDesigns(args["prompt-file"]), "utf8"),
    aspect: args.aspect ?? "3:4",
    size: args.size ?? "4K",
    reference: args.reference && insideDesigns(args.reference),
  };
  const out = insideDesigns(args.out);
  mkdirSync(out, { recursive: true });

  const run = { google: generateGoogle, recraft: generateRecraft }[provider];
  if (!run) fail("--provider must be google or recraft");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  for (let i = 1; i <= count; i++) {
    const images = await run(options);
    if (images.length === 0) fail(`${provider} returned no image for candidate ${i}`);
    const { data, mime } = images.at(-1);
    const file = join(out, `${stamp}-${provider}-${i}${mime === "image/jpeg" ? ".jpg" : ".png"}`);
    writeFileSync(file, Buffer.from(data, "base64"));
    report(file);
  }
}

async function prepare(args) {
  if (!args.op || !args.in || !args.out) fail("prepare needs --op, --in, and --out");
  const input = insideDesigns(args.in);
  const out = insideDesigns(args.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, await prepareRecraft(args.op, input));
  report(out);
}

function pick(args) {
  if (!args.in || !args.out) fail("pick needs --in and --out");
  const out = insideDesigns(args.out);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(insideDesigns(args.in), out);
  report(out);
}

function selfTest() {
  assert.ok(insideDesigns("designs/cat/prompt.md").endsWith(join("designs", "cat", "prompt.md")));
  for (const bad of ["designs", "designs/../trends/x.md", "/etc/passwd", ".claude/settings.json", "designsX/a"]) {
    assert.throws(() => insideDesigns(bad), `${bad} should be rejected`);
  }
  const interaction = {
    status: "completed",
    steps: [
      { type: "user_input", content: [{ type: "image", data: "INPUT" }] },
      { type: "model_output", content: [{ type: "text", text: "Here you go" }, { type: "image", data: "QUJD", mime_type: "image/png" }] },
    ],
  };
  assert.deepEqual(googleImages(interaction), [{ data: "QUJD", mime: "image/png" }]);
  assert.deepEqual(googleImages({ steps: [] }), []);
  const png = Buffer.alloc(24);
  png.write("\x89PNG", 0, "latin1");
  png.writeUInt32BE(3600, 16);
  png.writeUInt32BE(4800, 20);
  assert.equal(pngSize(png), " 3600x4800");
  assert.equal(pngSize(Buffer.from("<svg/>")), "");
  console.log("self-test passed");
}

const [command, ...rest] = process.argv.slice(2);
const commands = {
  generate: () => generate(parseArgs(rest)),
  prepare: () => prepare(parseArgs(rest)),
  pick: () => pick(parseArgs(rest)),
  "self-test": selfTest,
};
if (!commands[command]) fail("usage: generate-image.mjs generate|prepare|pick|self-test [options]");
try {
  await commands[command]();
} catch (error) {
  fail(error.message);
}
