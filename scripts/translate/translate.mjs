/**
 * Machine-translate the Igbo locale from the English one, incrementally.
 *
 *   node scripts/translate/translate.mjs              messages and CMS content
 *   node scripts/translate/translate.mjs --messages   src/messages/en.json → ig.json only
 *   node scripts/translate/translate.mjs --content    src/content/<collection>/en → ig only
 *   node scripts/translate/translate.mjs --dry-run    list what would be sent; call nothing
 *   node scripts/translate/translate.mjs --check      exit 1 if anything is untranslated; call nothing
 *
 * Needs GOOGLE_TRANSLATE_API_KEY (Cloud Translation API, basic edition) in the
 * shell, `.env` or `.env.local`. See README.md → Igbo translation.
 *
 * WHAT COUNTS AS UNTRANSLATED. The script never starts from the beginning: it
 * only sends what is missing.
 *
 *   ig.json   a key that is absent, or whose value still carries the `TODO ig:`
 *             placeholder. A value identical to the English is NOT untranslated
 *             there — the 34 that match (NNỌỌ, Lagos, Soma, © …) were written that
 *             way on purpose.
 *   content   a translated field (per the Decap config) that is absent, empty,
 *             or IDENTICAL TO THE ENGLISH — which is what "Fill in from another
 *             locale" leaves behind on the Igbo tab, and the one-click step the
 *             editor takes before publishing.
 *
 * WHAT IT NEVER TOUCHES. `ledger.json` beside this file records, for every
 * string the machine wrote, a hash of the English it came from and a hash of
 * the Igbo it produced. If the Igbo on disk no longer matches what the machine
 * wrote, a person edited it, and the script leaves it alone for good. If the
 * English changed since, the string is translated again. The ledger is also the
 * review list: everything in it is machine output and should be read by an Igbo
 * speaker (Google's Igbo is weak on tone marks and idiom).
 *
 * Placeholders such as `{name}` and `{n}` are wrapped so the API leaves them
 * alone, and a result that loses one is rejected. All-caps English comes back
 * all-caps Igbo. Multi-line strings are translated line by line so markdown
 * paragraphs and list markers survive.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MESSAGES_DIR = join(ROOT, "src/messages");
const CONFIG_PATH = join(ROOT, "public/admin/config.yml");
const LEDGER_PATH = join(ROOT, "scripts/translate/ledger.json");

const SOURCE = "en";
const TARGET = "ig";
const TODO_PREFIX = `TODO ${TARGET}:`;

/**
 * Message keys that are copied from English rather than translated — a
 * person's name is not a word. One regular expression per key path. Empty
 * since the team moved into the CMS (2026-09-22), where `name` is a
 * `duplicate` field and is never sent; add a pattern here if a name lands in
 * `en.json` again.
 */
const COPY_MESSAGE_KEYS = [];

/** Google's basic-edition limits, with room to spare. */
const BATCH_SEGMENTS = 64;
const BATCH_CHARS = 15_000;

// ---------------------------------------------------------------------------
// Arguments and environment
// ---------------------------------------------------------------------------

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const CHECK = args.has("--check");
const only = args.has("--messages") ? "messages" : args.has("--content") ? "content" : "both";

for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(join(ROOT, file));
  } catch {
    // Absent is fine; the key may be in the shell.
  }
}

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const ENDPOINT = process.env.TRANSLATE_ENDPOINT ?? "https://translation.googleapis.com/language/translate/v2";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 12);
const isTodo = (s) => typeof s === "string" && s.startsWith(TODO_PREFIX);
const isBlank = (s) => typeof s !== "string" || s.trim() === "";
const PLACEHOLDER = /\{[^{}]+\}/g;

/** All-caps outside its placeholders — `{n} DAYS AGO` counts. */
const isAllCaps = (s) => {
  const t = s.replace(PLACEHOLDER, "");
  return /[A-Za-z]/.test(t) && t === t.toUpperCase();
};
/** Upper-case everything except placeholders, so `{n}` never becomes `{N}`. */
const upperOutsidePlaceholders = (s) => s.replace(/(\{[^{}]+\})|([^{]+)/g, (_, ph, txt) => ph ?? txt.toUpperCase());

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** A line's leading whitespace and markdown marker — list bullet, number, heading, quote — which are never sent. */
const MARKER = /^(\s*(?:[-*+]\s+|\d+\.\s+|#{1,6}\s+|>\s+)?)/;
const splitMarker = (line) => {
  const prefix = line.match(MARKER)[1];
  return [prefix, line.slice(prefix.length)];
};

/** Wrap placeholders so the API returns them untouched, in `html` format. */
const protect = (s) => s.replace(PLACEHOLDER, (m) => `<span translate="no">${m}</span>`);
const unprotect = (s) => s.replace(/<span translate="no">([^<]*)<\/span>/g, "$1");

function readJson(path, fallback) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback;
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// The translator: one call per batch, one cache per run
// ---------------------------------------------------------------------------

const cache = new Map();
const stats = { sent: 0, chars: 0, calls: 0, failed: [] };

async function callApi(segments) {
  const url = `${ENDPOINT}?key=${encodeURIComponent(API_KEY)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q: segments, source: SOURCE, target: TARGET, format: "html" }),
  });
  stats.calls += 1;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let detail = body;
    try {
      detail = JSON.parse(body).error?.message ?? body;
    } catch {
      // Not JSON; keep the raw body.
    }
    throw new Error(`Translation API ${res.status}: ${detail}`);
  }
  const json = await res.json();
  return json.data.translations.map((t) => decodeEntities(t.translatedText));
}

/**
 * Translate every distinct line in `strings`, filling the cache. Lines are the
 * unit so that markdown paragraphs and list markers come back where they were.
 */
async function prime(strings) {
  const lines = new Set();
  for (const s of strings) {
    for (const line of s.split("\n")) {
      if (isBlank(line) || cache.has(line)) continue;
      if (isBlank(splitMarker(line)[1])) cache.set(line, line); // a bare marker: nothing to send
      else lines.add(line);
    }
  }
  const queue = [...lines];
  while (queue.length) {
    const batch = [];
    let chars = 0;
    while (queue.length && batch.length < BATCH_SEGMENTS && chars + queue[0].length <= BATCH_CHARS) {
      const line = queue.shift();
      batch.push(line);
      chars += line.length;
    }
    if (!batch.length) batch.push(queue.shift()); // one over-long line
    const out = await callApi(batch.map((l) => protect(splitMarker(l)[1].trim())));
    stats.sent += batch.length;
    stats.chars += batch.reduce((n, l) => n + l.length, 0);
    batch.forEach((line, i) => {
      let result = unprotect(out[i] ?? "").trim();
      const wanted = (line.match(PLACEHOLDER) ?? []).sort().join("|");
      const got = (result.match(PLACEHOLDER) ?? []).sort().join("|");
      if (wanted !== got) {
        stats.failed.push(line);
        return; // left out of the cache; the caller keeps the placeholder
      }
      if (isAllCaps(line)) result = upperOutsidePlaceholders(result);
      // The line's own whitespace and markdown marker go back in front.
      cache.set(line, splitMarker(line)[0] + result);
    });
  }
}

/** The translation of a whole string from the cache, or null if any line failed. */
function translated(s) {
  const out = [];
  for (const line of s.split("\n")) {
    if (isBlank(line)) {
      out.push(line);
      continue;
    }
    if (!cache.has(line)) return null;
    out.push(cache.get(line));
  }
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// The ledger
// ---------------------------------------------------------------------------

const ledger = readJson(LEDGER_PATH, {});

/**
 * What to do with one Igbo value. `identicalIsUntranslated` is true for CMS
 * content (the editor's copy-across leaves English there) and false for the
 * message file (34 values match on purpose).
 */
function decide(key, en, ig, { identicalIsUntranslated }) {
  if (isBlank(en)) return "skip";
  const entry = ledger[key];
  if (isBlank(ig) || isTodo(ig)) return "translate";
  if (entry && entry.src === hash(en) && entry.out === hash(ig)) return "skip"; // machine output, still current
  if (identicalIsUntranslated && ig === en) return "translate";
  if (entry && entry.out !== hash(ig)) return "keep"; // a person edited it
  if (entry && entry.src !== hash(en)) return "translate"; // the English moved on
  return "skip"; // a person wrote it, or it is settled
}

// ---------------------------------------------------------------------------
// Messages: src/messages/en.json → ig.json
// ---------------------------------------------------------------------------

function flatten(value, path = "", out = []) {
  if (Array.isArray(value)) value.forEach((v, i) => flatten(v, path ? `${path}.${i}` : String(i), out));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) flatten(v, path ? `${path}.${k}` : k, out);
  else out.push([path, value]);
  return out;
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** Rebuild `ig` in `en`'s shape and key order, with `values` filled in by path. */
function rebuild(en, values, path = "") {
  if (Array.isArray(en)) return en.map((v, i) => rebuild(v, values, path ? `${path}.${i}` : String(i)));
  if (en && typeof en === "object") {
    const out = {};
    for (const [k, v] of Object.entries(en)) out[k] = rebuild(v, values, path ? `${path}.${k}` : k);
    return out;
  }
  return values.get(path);
}

async function runMessages(report) {
  const en = readJson(join(MESSAGES_DIR, `${SOURCE}.json`));
  const igPath = join(MESSAGES_DIR, `${TARGET}.json`);
  const ig = readJson(igPath, {});
  const values = new Map();
  const todo = [];

  for (const [path, enValue] of flatten(en)) {
    const igValue = getPath(ig, path);
    const key = `messages:${path}`;
    const copy = COPY_MESSAGE_KEYS.some((re) => re.test(path));
    const action = copy && (isBlank(igValue) || isTodo(igValue)) ? "copy" : decide(key, enValue, igValue, { identicalIsUntranslated: false });
    if (action === "copy") {
      values.set(path, enValue);
      ledger[key] = { src: hash(enValue), out: hash(enValue) };
      report.copied.push(key);
    } else if (action === "translate") {
      todo.push([path, enValue, key]);
      values.set(path, igValue ?? `${TODO_PREFIX} ${enValue}`);
    } else {
      values.set(path, igValue ?? enValue);
      if (action === "keep") report.kept.push(key);
    }
  }

  const stale = flatten(ig).filter(([path]) => getPath(en, path) === undefined).map(([p]) => p);
  report.untranslated.push(...todo.map(([, , key]) => key));
  if (DRY_RUN || CHECK) return;

  await prime(todo.map(([, enValue]) => enValue));
  for (const [path, enValue, key] of todo) {
    const out = translated(enValue);
    if (out === null) continue; // failed line; the TODO stays
    values.set(path, out);
    ledger[key] = { src: hash(enValue), out: hash(out) };
    report.translated.push(key);
  }
  writeJson(igPath, rebuild(en, values));
  if (stale.length) report.notes.push(`${stale.length} ${TARGET}.json key(s) with no English counterpart were dropped: ${stale.join(", ")}`);
}

// ---------------------------------------------------------------------------
// Content: src/content/<collection>/en/<slug>.md → ig/<slug>.md
// ---------------------------------------------------------------------------

const TEXT_WIDGETS = new Set(["string", "text", "markdown"]);

/**
 * A plan per field from the Decap config: `translate` a text widget marked
 * `i18n: true`, `copy` anything else, recurse into a list's fields. Decap
 * ignores `i18n` on the fields INSIDE a translated list or object — the whole
 * thing is per locale — so `inherited` carries the parent's flag down.
 */
function planFields(fields, inherited = false) {
  const plan = {};
  for (const f of fields ?? []) {
    const translated = inherited || f.i18n === true;
    if (f.widget === "list" && translated) {
      plan[f.name] = f.fields
        ? { list: { object: planFields(f.fields, true) } }
        : { list: f.field && TEXT_WIDGETS.has(f.field.widget) ? "translate" : "copy" };
    } else if (f.widget === "object" && translated) {
      plan[f.name] = { object: planFields(f.fields, true) };
    } else if (TEXT_WIDGETS.has(f.widget) && translated) {
      plan[f.name] = "translate";
    } else {
      plan[f.name] = "copy";
    }
  }
  return plan;
}

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error("no frontmatter");
  return { data: parseYaml(m[1]) ?? {}, body: m[2] };
}

function joinFrontmatter(data, body) {
  return `---\n${stringifyYaml(data, { lineWidth: 0 }).trimEnd()}\n---\n${body ?? ""}`;
}

/** Walk a plan over the English and Igbo values, collecting decisions per leaf. */
function walk(plan, en, ig, keyBase, leaves) {
  if (plan === "copy") return en;
  if (plan === "translate") {
    if (typeof en !== "string") return en;
    leaves.push({ key: keyBase, en, ig: typeof ig === "string" ? ig : undefined });
    return { $leaf: keyBase };
  }
  if (plan.list) {
    if (!Array.isArray(en)) return en;
    return en.map((item, i) => walk(plan.list, item, Array.isArray(ig) ? ig[i] : undefined, `${keyBase}.${i}`, leaves));
  }
  if (plan.object) {
    if (!en || typeof en !== "object") return en;
    const out = {};
    for (const [name, sub] of Object.entries(plan.object)) if (name in en) out[name] = walk(sub, en[name], ig?.[name], `${keyBase}.${name}`, leaves);
    return out;
  }
  return en;
}

function fill(shape, values) {
  if (Array.isArray(shape)) return shape.map((v) => fill(v, values));
  if (shape && typeof shape === "object") {
    if ("$leaf" in shape) return values.get(shape.$leaf);
    const out = {};
    for (const [k, v] of Object.entries(shape)) out[k] = fill(v, values);
    return out;
  }
  return shape;
}

async function runContent(report) {
  if (!existsSync(CONFIG_PATH)) return;
  const config = parseYaml(readFileSync(CONFIG_PATH, "utf8"));
  const collections = (config.collections ?? []).filter((c) => c.i18n === true && c.folder);
  const jobs = [];

  for (const collection of collections) {
    const plan = planFields(collection.fields);
    const enDir = join(ROOT, collection.folder, SOURCE);
    const igDir = join(ROOT, collection.folder, TARGET);
    if (!existsSync(enDir)) continue;
    for (const file of readdirSync(enDir).filter((f) => f.endsWith(".md"))) {
      const slug = file.replace(/\.md$/, "");
      const en = splitFrontmatter(readFileSync(join(enDir, file), "utf8"));
      const igFile = join(igDir, file);
      const ig = existsSync(igFile) ? splitFrontmatter(readFileSync(igFile, "utf8")) : { data: {}, body: "" };
      const keyBase = `content:${collection.name}/${slug}`;
      const leaves = [];
      // The body is the `body` field when the collection has one; otherwise it stays as is.
      const enData = plan.body ? { ...en.data, body: en.body } : en.data;
      const igData = plan.body ? { ...ig.data, body: ig.body } : ig.data;
      const shape = {};
      for (const [name, sub] of Object.entries(plan)) if (name in enData) shape[name] = walk(sub, enData[name], igData[name], `${keyBase}#${name}`, leaves);
      // Fields in the English file the config does not know (legacy keys) are carried over untouched.
      for (const [name, value] of Object.entries(enData)) if (!(name in shape)) shape[name] = value;
      jobs.push({ collection, plan, slug, igFile, igDir, shape, leaves, keyBase });
    }
  }

  const values = new Map();
  const todo = [];
  for (const job of jobs) {
    for (const leaf of job.leaves) {
      const action = decide(leaf.key, leaf.en, leaf.ig, { identicalIsUntranslated: true });
      if (action === "translate") {
        todo.push(leaf);
        values.set(leaf.key, leaf.ig ?? leaf.en);
      } else {
        values.set(leaf.key, leaf.ig ?? leaf.en);
        if (action === "keep") report.kept.push(leaf.key);
      }
    }
  }
  report.untranslated.push(...todo.map((l) => l.key));
  if (DRY_RUN || CHECK) return;

  await prime(todo.map((l) => l.en));
  for (const leaf of todo) {
    const out = translated(leaf.en);
    if (out === null) continue;
    values.set(leaf.key, out);
    ledger[leaf.key] = { src: hash(leaf.en), out: hash(out) };
    report.translated.push(leaf.key);
  }

  const written = new Set(report.translated);
  for (const job of jobs) {
    const changed = job.leaves.some((l) => written.has(l.key));
    if (!changed && existsSync(job.igFile)) continue;
    const data = fill(job.shape, values);
    const body = job.plan.body ? data.body : "";
    if (job.plan.body) delete data.body;
    mkdirSync(job.igDir, { recursive: true });
    writeFileSync(job.igFile, joinFrontmatter(data, body));
    report.files.push(job.igFile.slice(ROOT.length + 1));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const report = { translated: [], copied: [], kept: [], untranslated: [], files: [], notes: [] };

  if (!DRY_RUN && !CHECK && !API_KEY) {
    console.error("GOOGLE_TRANSLATE_API_KEY is not set. Put it in .env or .env.local, or run with --dry-run / --check.");
    process.exit(2);
  }

  if (only !== "content") await runMessages(report);
  if (only !== "messages") await runContent(report);

  if (CHECK) {
    console.log(`${report.untranslated.length} untranslated`);
    for (const key of report.untranslated) console.log(`  ${key}`);
    process.exit(report.untranslated.length ? 1 : 0);
  }
  if (DRY_RUN) {
    console.log(`Would translate ${report.untranslated.length} string(s):`);
    for (const key of report.untranslated) console.log(`  ${key}`);
    if (report.kept.length) console.log(`Keeping ${report.kept.length} hand-edited string(s).`);
    return;
  }

  const stale = report.untranslated.length - report.translated.length;
  console.log(
    `Translated ${report.translated.length}, copied ${report.copied.length}, kept ${report.kept.length} hand-edited` +
      ` — ${stats.calls} call(s), ${stats.sent} line(s), ${stats.chars.toLocaleString()} characters.`,
  );
  for (const file of report.files) console.log(`  wrote ${file}`);
  for (const note of report.notes) console.log(`  note: ${note}`);
  if (stats.failed.length) {
    console.log(`  ${stats.failed.length} line(s) came back with a placeholder missing and were left untranslated:`);
    for (const line of stats.failed) console.log(`    ${line}`);
  }
  if (stale > stats.failed.length) console.log(`  ${stale} string(s) could not be translated this run.`);

  if (report.translated.length || report.copied.length) writeJson(LEDGER_PATH, Object.fromEntries(Object.entries(ledger).sort()));
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
