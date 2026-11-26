/**
 * The community wall filter: the check a note runs through before it is sent,
 * per product's "Community Wall Filter, Implementation Guide" (2026-11-17)
 * and its list, `community-wall-filter.json`.
 *
 * PURE AND SELF-CONTAINED ON PURPOSE: no imports, no `@/` paths, only erasable
 * TypeScript. `node --test` runs it as it is (Node 24 strips the types), and
 * the backend can run this same file for its server check. One
 * implementation means the two checks can't disagree.
 *
 * THE LIST DRIVES IT. Categories are read from the file's keys, so product can
 * add one without a release: `<category>` is a list, `<category>_combo_terms`
 * and `<category>_combo_context` a pair, `allowlist` and
 * `url_and_number_patterns` are special. A category this file has never heard
 * of blocks under `other`, the lowest priority.
 *
 * WHERE THE GUIDE LEAVES ROOM, these readings (FLAGGED to product and backend):
 * - The spaceless phrase check ("dmme", "shutup") matches the joined phrase as
 *   a whole word, like every other entry, not as a substring of the note with
 *   its spaces removed: that would find "my x" in "I lost all my xp".
 * - An entry's own punctuation is flexible: "i'm 16" matches "im 16" and the
 *   phone keyboard's "I’m 16"; "t.me" matches "tme" but not "isn't me".
 * - A word in both halves of a pair does not pair with itself: "plug in your
 *   headphones" is not drugs talk, "weed plug" is.
 * - The allowlist is taken out before the lists too, not only the patterns, so
 *   "follow @goondugames" doesn't trip the `@` context. It is taken out only as
 *   a whole string: "@goondugamesfake" keeps its handle.
 * - Leetspeak symbols ending a word are punctuation: "sh1t!" is "shit", not
 *   "shiti".
 */

export type WallFilterList = {
  version: string;
  updated?: string;
  allowlist: string[];
  url_and_number_patterns: string[];
  [key: string]: string | string[] | undefined;
};

/** The warnings, highest priority first (the guide's table). */
export const WALL_RULES = [
  "self_harm",
  "underage",
  "personal_info",
  "violence_threats",
  "hate_slurs",
  "sexual_content",
  "scam_fraud",
  "impersonation",
  "drugs",
  "gambling_betting",
  "contact",
  "profanity",
  "political",
  "religious",
  "marketing_spam",
  "competitor_brands",
  "other",
] as const;

export type WallRule = (typeof WALL_RULES)[number];

/** What a note broke: the list key and the entry. For the server and the admin only, never the player. */
export type FilterHit = { category: string; entry: string };

export type FilterResult = {
  /** The warning to show, or null when the note may go up. */
  rule: WallRule | null;
  hits: FilterHit[];
};

/** The list key → the warning it shows. */
export function ruleOf(category: string): WallRule {
  if (category.startsWith("profanity_")) return "profanity";
  if (category === "contact_solicitation" || category === "url_and_number_patterns") return "contact";
  return (WALL_RULES as readonly string[]).includes(category) ? (category as WallRule) : "other";
}

// ---------------------------------------------------------------- normalizing

const ALNUM = "\\p{L}\\p{N}";
const MASKS = "*#._~-";
const SUFFIXES = ["s", "es", "ed", "ing", "in", "er", "ers"];

const MARKS = new RegExp("\\p{M}", "gu");
const INVISIBLE = /[​-‍﻿­]/g;

/** Look-alike letters, lowercase (step 2 has run): Cyrillic, then Greek. */
const LOOKALIKES: Record<string, string> = {
  а: "a", в: "b", е: "e", і: "i", ј: "j", к: "k", м: "m", н: "h", о: "o", р: "p",
  с: "c", т: "t", у: "y", х: "x", ѕ: "s", ԁ: "d", һ: "h", ӏ: "l", ԛ: "q", ԝ: "w",
  α: "a", β: "b", γ: "y", ε: "e", η: "n", ι: "i", κ: "k", μ: "u", ν: "v", ο: "o",
  ρ: "p", ς: "s", τ: "t", υ: "u", χ: "x", ϲ: "c",
};
const LOOKALIKE = new RegExp(`[${Object.keys(LOOKALIKES).join("")}]`, "gu");

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g",
  "@": "a", $: "s", "!": "i", "|": "i", "+": "t", "€": "e",
};

/** Steps 1-5: NFKC, lowercase, accents and tone marks off, invisibles out, look-alikes to Latin. */
function baseNormalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .normalize("NFD")
    .replace(MARKS, "")
    .replace(INVISIBLE, "")
    .replace(LOOKALIKE, (c) => LOOKALIKES[c] ?? c);
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** The allowlist as whole strings: not inside a longer word, handle or domain. */
function allowlistRegexes(allowlist: readonly string[]): RegExp[] {
  return [...allowlist]
    .map(baseNormalize)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((s) => new RegExp(`(^|[^a-z0-9_.@-])${escapeRegex(s)}(?![a-z0-9_-]|\\.[a-z0-9])`, "g"));
}

/** Step 7, after reading word-final punctuation as punctuation. */
function leet(text: string): string {
  return text.replace(/[!?.,;:]+(?=\s|$)/g, "").replace(/[01345789@$!|+€]/g, (c) => LEET[c] ?? c);
}

/** Step 9: "f u c k" and "f.u.c.k" → "fuck" (three letters or more, one at a time). */
const SPACED = new RegExp(`(^|[^${ALNUM}])((?:\\p{L}[\\s${escapeRegex(MASKS)}]{1,2}){2,}\\p{L})(?![${ALNUM}])`, "gu");
const joinSpaced = (text: string) =>
  text.replace(SPACED, (_, before: string, run: string) => before + run.replace(new RegExp(`[^${ALNUM}]`, "gu"), ""));

/**
 * Step 10's two versions, and a third: only the stretched runs (three or more)
 * cut to one, real doubles kept. Without it a phrase with a double letter of
 * its own can't be caught stretched: "mkpuuuru mmiri" is "mkpuuru mmiri" cut to
 * two and "mkpuru miri" cut to one, and neither is "mkpuru mmiri". Then step 11's.
 */
const collapseToTwo = (text: string) => text.replace(/(.)\1{2,}/gu, "$1$1");
const collapseToOne = (text: string) => text.replace(/(.)\1+/gu, "$1");
const collapseStretched = (text: string) => text.replace(/(.)\1{2,}/gu, "$1");
const readAsU = (text: string) => text.replace(/ph/g, "f").replace(/v/g, "u");

/** A word with a masking character inside it: "f*ck", "sh.t", "f-u-c-k", "fu**". */
const MASKED = new RegExp(`\\p{L}+(?:[${escapeRegex(MASKS)}]+\\p{L}*)+`, "gu");

/**
 * Step 8: each masked word, read as every word of the list it could be (a mask
 * is one letter or none), gives the note another version with that word in.
 */
function unmask(text: string, vocabulary: readonly string[]): string[] {
  const versions: string[] = [];
  for (const word of new Set(text.match(MASKED) ?? [])) {
    if (word.replace(new RegExp(`[${escapeRegex(MASKS)}]`, "g"), "").length < 2) continue;
    // Tested against list words only, which are all letters: `.?` is "one letter or none".
    const shape = new RegExp(`^${[...word].map((c) => (MASKS.includes(c) ? ".?" : escapeRegex(c))).join("")}$`);
    for (const candidate of vocabulary.filter((w) => shape.test(w)).slice(0, 4)) {
      versions.push(text.split(word).join(candidate));
    }
  }
  return versions;
}

/** Steps 7-11 on the step-6 text: every version the second pass checks. */
function secondPass(stepSix: string, vocabulary: readonly string[]): string[] {
  const mapped = leet(stepSix.replace(/\s+/g, " "));
  const out = new Set<string>();
  for (const version of [mapped, ...unmask(mapped, vocabulary)]) {
    const joined = joinSpaced(version);
    for (const v of [joined, collapseToTwo(joined), collapseToOne(joined), collapseStretched(joined)]) {
      out.add(v);
      out.add(readAsU(v));
    }
  }
  return [...out];
}

// ------------------------------------------------------------------- matching

/*
 * NO REGEX PER ENTRY. A Unicode-aware pattern costs V8 a few milliseconds to
 * build and run the first time, and the list has over a thousand entries: as
 * patterns that was ~3s for the first check on a desktop, several times that
 * on a mid-tier Android. Instead each version of the note is written once in a
 * canonical form - a space for a gap with a space in it, GLUE for punctuation
 * between letters with none ("chat.whatsapp" → "chat·whatsapp"), padded with a
 * space at each end - and entries are found in it by plain string scanning.
 */

/** A version of the note: as written (emoji, "18+", "@gmail.com") and canonical (words). */
type Text = { raw: string; canon: string };
type Matcher = { entry: string; digits: boolean; test: (text: Text) => boolean };
type Gap = "space" | "glue";

const GLUE = "·";
const GAP = new Set([" ", GLUE]);
const NON_ALNUM_RUN = new RegExp(`[^${ALNUM}]+`, "gu");
const IS_ALNUM = new RegExp(`^[${ALNUM}]`, "u");
const ENDS_ALNUM = new RegExp(`[${ALNUM}]$`, "u");
const SEGMENTS = new RegExp(`[${ALNUM}]+|[^${ALNUM}]+`, "gu");
const HAS_DIGIT = new RegExp("\\p{N}", "u");
const ENDS_IN_LETTER = new RegExp("\\p{L}$", "u");
const LETTERS = new RegExp("\\p{L}+", "gu");

const toText = (raw: string): Text => ({
  raw,
  canon: ` ${raw.replace(NON_ALNUM_RUN, (run) => (/\s/.test(run) ? " " : GLUE))} `,
});

/** Where the words after the first end, or -1: a "space" gap is any gap, a "glue" gap optional punctuation. */
function sequenceEnd(canon: string, at: number, words: readonly string[], gaps: readonly Gap[]): number {
  let j = at;
  for (let k = 1; k < words.length; k++) {
    if (gaps[k - 1] === "space") {
      if (!GAP.has(canon[j])) return -1;
      j += 1;
    } else if (canon[j] === GLUE) j += 1;
    if (!canon.startsWith(words[k], j)) return -1;
    j += words[k].length;
  }
  return j;
}

/** The words as whole words, in order, the last one with any of `endings`. */
function sequenceFound(canon: string, words: readonly string[], gaps: readonly Gap[], endings: readonly string[]) {
  for (let i = canon.indexOf(words[0]); i !== -1; i = canon.indexOf(words[0], i + 1)) {
    if (!GAP.has(canon[i - 1])) continue;
    const end = sequenceEnd(canon, i + words[0].length, words, gaps);
    if (end !== -1 && endings.some((s) => canon.startsWith(s, end) && GAP.has(canon[end + s.length]))) return true;
  }
  return false;
}

/** An entry that starts or ends with a symbol ("18+", "@gmail.com", "$", emoji), as written. */
function rawFound(raw: string, entry: string): boolean {
  const wordStart = IS_ALNUM.test(entry);
  const wordEnd = ENDS_ALNUM.test(entry);
  for (let i = raw.indexOf(entry); i !== -1; i = raw.indexOf(entry, i + 1)) {
    if (wordStart && i > 0 && IS_ALNUM.test(raw[i - 1])) continue;
    const after = raw[i + entry.length];
    if (wordEnd && after !== undefined && IS_ALNUM.test(after)) continue;
    return true;
  }
  return false;
}

/**
 * An entry: whole words, the common endings on the last one, any gap where
 * the entry has a space, its own punctuation optional ("i'm" is "im" or
 * "i’m"), and a phrase also as one word ("dmme").
 */
function toMatcher(raw: string): Matcher | null {
  const entry = baseNormalize(raw).trim().replace(/\s+/g, " ");
  if (!entry) return null;
  const digits = HAS_DIGIT.test(entry);
  if (!IS_ALNUM.test(entry) || !ENDS_ALNUM.test(entry)) {
    return { entry, digits, test: (text) => rawFound(text.raw, entry) };
  }
  const parts = entry.match(SEGMENTS) ?? [];
  const words = parts.filter((_, i) => i % 2 === 0);
  const gaps = parts.filter((_, i) => i % 2 === 1).map((p): Gap => (/\s/.test(p) ? "space" : "glue"));
  const endings = ENDS_IN_LETTER.test(entry) ? ["", ...SUFFIXES] : [""];
  const joined = gaps.includes("space") ? [words.join("")] : null;
  return {
    entry,
    digits,
    test: ({ canon }) =>
      sequenceFound(canon, words, gaps, endings) || (joined !== null && sequenceFound(canon, joined, [], endings)),
  };
}

/** Both passes; an entry with a digit in it only the first (leetspeak turns "14" into "ia"). */
function found(m: Matcher, first: Text, second: readonly Text[]): boolean {
  return m.test(first) || (!m.digits && second.some((text) => m.test(text)));
}

// ------------------------------------------------------------------ compiling

export type CompiledWallFilter = {
  version: string;
  allowlist: RegExp[];
  patterns: { entry: string; re: RegExp }[];
  lists: { category: string; matchers: Matcher[] }[];
  combos: { category: string; terms: Matcher[]; context: Matcher[] }[];
  /** Every word of every entry, with its endings: what a masked word may be. */
  vocabulary: string[];
};

const RESERVED = new Set(["version", "updated", "allowlist", "url_and_number_patterns"]);
const COMBO_KEY = /^(.+)_combo_(terms|context)$/;

/** Builds the matchers once per list; checking a note is then cheap. */
export function compileWallFilter(list: WallFilterList): CompiledWallFilter {
  const lists: CompiledWallFilter["lists"] = [];
  const combos = new Map<string, CompiledWallFilter["combos"][number]>();
  const words = new Set<string>();

  for (const [key, value] of Object.entries(list)) {
    if (RESERVED.has(key) || !Array.isArray(value)) continue;
    const matchers = value.map(toMatcher).filter((m): m is Matcher => m !== null);
    for (const m of matchers) for (const w of m.entry.match(LETTERS) ?? []) if (w.length >= 3) words.add(w);
    const combo = COMBO_KEY.exec(key);
    if (!combo) {
      lists.push({ category: key, matchers });
      continue;
    }
    const pair = combos.get(combo[1]) ?? { category: combo[1], terms: [], context: [] };
    pair[combo[2] === "terms" ? "terms" : "context"] = matchers;
    combos.set(combo[1], pair);
  }

  const patterns = list.url_and_number_patterns.flatMap((entry) => {
    try {
      return [{ entry, re: new RegExp(entry, "i") }];
    } catch {
      return []; // A pattern that doesn't compile is skipped rather than stopping every post.
    }
  });

  return {
    version: list.version,
    allowlist: allowlistRegexes(list.allowlist),
    patterns,
    lists,
    combos: [...combos.values()],
    vocabulary: [...new Set([...words].flatMap((w) => [w, ...SUFFIXES.map((s) => w + s)]))],
  };
}

/** Runs a note through the filter. The note itself is never changed. */
export function checkNote(filter: CompiledWallFilter, note: string): FilterResult {
  const stepSix = filter.allowlist.reduce((text, re) => text.replace(re, "$1 "), baseNormalize(note));
  const first = toText(stepSix);
  const second = secondPass(stepSix, filter.vocabulary).map(toText);
  const hits: FilterHit[] = [];

  for (const { entry, re } of filter.patterns) {
    if (re.test(stepSix)) hits.push({ category: "url_and_number_patterns", entry });
  }
  for (const { category, matchers } of filter.lists) {
    for (const m of matchers) if (found(m, first, second)) hits.push({ category, entry: m.entry });
  }
  for (const { category, terms, context } of filter.combos) {
    const term = terms.filter((m) => found(m, first, second));
    if (!term.length) continue;
    const ctx = context.filter((m) => found(m, first, second));
    const pair = term.flatMap((t) => ctx.filter((c) => c.entry !== t.entry).map((c) => `${t.entry} + ${c.entry}`))[0];
    if (pair) hits.push({ category, entry: pair });
  }

  const rule = hits.map((h) => ruleOf(h.category)).sort((a, b) => WALL_RULES.indexOf(a) - WALL_RULES.indexOf(b))[0];
  return { rule: rule ?? null, hits };
}
