import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parse as parseYaml } from "yaml";
import type { z } from "zod";

import { DEFAULT_LOCALE, type Locale } from "@/lib/utils/locales";

/**
 * Reading what Decap writes.
 *
 * Every CMS collection lands as `src/content/<collection>/<locale>/<slug>.md`
 * (see `public/admin/config.yml`), and every adapter over one reads it the
 * same way, so the reading lives here once and `lib/api/news.ts`,
 * `lib/api/team.ts` and the rest only say what their frontmatter looks like.
 *
 * THE ENGLISH FILE IS THE LIST, AND THE ENGLISH FIELD IS THE FALLBACK. An
 * entry exists when `en/<slug>.md` does. The other locale's file is laid over
 * it field by field: whatever that file has is used, whatever it lacks — the
 * whole file, or a field the editor left empty, or an empty body — reads in
 * English. That is the moment between a publish and the Translate Igbo
 * workflow's commit, and it means a new entry never 404s or half-renders in
 * Igbo.
 *
 * A FILE THAT DOES NOT FIT FAILS THE BUILD, naming itself and the field.
 * Vercel keeps the previous deploy live and the log says what to open. The
 * English file is checked on its own first, so a field it lacks is reported
 * against it and not against the Igbo file that inherits it.
 *
 * Nothing here caches: the adapters wrap their reads in React's `cache()` so a
 * render reads each file once and a dev server sees a new file on the next
 * request.
 */

const CONTENT_DIR = join(process.cwd(), "src/content");

export class ContentFileError extends Error {
  constructor(file: string, detail: string) {
    super(`${file}: ${detail}. Open the entry in /admin, complete the field and publish again.`);
    this.name = "ContentFileError";
  }
}

export type Entry<T> = { slug: string; data: T; body: string };

type Raw = { data: Record<string, unknown>; body: string };

/** Frontmatter between the first two `---` lines, then the markdown body. */
function splitFrontmatter(text: string): Raw {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text.trim() };
  const data = parseYaml(match[1]);
  return { data: data && typeof data === "object" ? (data as Record<string, unknown>) : {}, body: match[2].trim() };
}

function readRaw(file: string): Raw | null {
  return existsSync(file) ? splitFrontmatter(readFileSync(file, "utf8")) : null;
}

/** An empty value in the Igbo file counts as "not written" and falls through to the English. */
const isWritten = (v: unknown) => !(v === undefined || v === null || (typeof v === "string" && v.trim() === ""));

function validate<S extends z.ZodType>(schema: S, data: Record<string, unknown>, file: string): z.output<S> {
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  const detail = parsed.error.issues
    .map((i) => `${i.path.join(".") || "frontmatter"} — ${i.message.includes("received undefined") ? "is required" : i.message}`)
    .join("; ");
  throw new ContentFileError(file.slice(process.cwd().length + 1), detail);
}

/** Every slug in a collection, from its English folder. Empty when nothing has been published. */
export function contentSlugs(collection: string): readonly string[] {
  const dir = join(CONTENT_DIR, collection, DEFAULT_LOCALE);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
}

/** One entry in one locale, English underneath. Null when no English file exists. */
export function readEntry<S extends z.ZodType>(collection: string, locale: Locale, slug: string, schema: S): Entry<z.output<S>> | null {
  const enFile = join(CONTENT_DIR, collection, DEFAULT_LOCALE, `${slug}.md`);
  const en = readRaw(enFile);
  if (!en) return null;

  let data = validate(schema, en.data, enFile);
  let body = en.body;

  if (locale !== DEFAULT_LOCALE) {
    const ownFile = join(CONTENT_DIR, collection, locale, `${slug}.md`);
    const own = readRaw(ownFile);
    if (own) {
      const merged = { ...en.data };
      for (const [key, value] of Object.entries(own.data)) if (isWritten(value)) merged[key] = value;
      data = validate(schema, merged, ownFile);
      if (own.body.trim()) body = own.body;
    }
  }

  return { slug, data, body };
}

/** Every entry in a collection, in one locale. */
export function readEntries<S extends z.ZodType>(collection: string, locale: Locale, schema: S): Entry<z.output<S>>[] {
  return contentSlugs(collection).flatMap((slug) => {
    const entry = readEntry(collection, locale, slug, schema);
    return entry ? [entry] : [];
  });
}
