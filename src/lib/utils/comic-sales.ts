import type { Messages } from "@/lib/utils/messages";
import type { CartLine, ComicFormat, ComicIssue } from "@/types/merch";

/**
 * Selling chapters (the team's rules, 2026-10-01): each chapter is bought on
 * its own, online and/or in print. Online is never a whole volume.
 */

/** The formats a chapter is sold in, online first. */
export function comicFormats(issue: Pick<ComicIssue, "formats">): ComicFormat[] {
  return (["online", "physical"] as const).filter((f) => issue.formats[f] !== undefined);
}

/** "Online · Physical – Vol. 1, Ch. 1": the line under a cover. */
export function comicLabel(issue: ComicIssue, messages: Messages): string {
  const c = messages.merch.comics;
  return c.label
    .replace("{formats}", comicFormats(issue).map((f) => c.formatNames[f]).join(" · "))
    // A live chapter's volume number isn't in the API's reply (FLAGGED): a dash.
    .replace("{volume}", issue.volume ? String(issue.volume) : "—")
    .replace("{chapter}", String(issue.chapter));
}

/**
 * Which format a comic cart line is for.
 *
 * A comic has no colour or size, so its line carries the format in
 * `colourId` ("online" or "physical"). The cart already tells lines apart by
 * that field, which keeps the online and printed copies of one chapter as two
 * lines without changing the cart. A line saved before formats existed holds
 * "-" and reads as the chapter's first format.
 */
export function lineFormat(line: Pick<CartLine, "colourId">, issue: ComicIssue): ComicFormat {
  if (line.colourId === "online" || line.colourId === "physical") return line.colourId;
  return comicFormats(issue)[0] ?? "physical";
}

/** Whether a cart needs shipping: any garment or printed chapter. Online chapters ship nothing. */
export function needsShipping(lines: readonly CartLine[], comics: readonly ComicIssue[]): boolean {
  return lines.some((line) => {
    const issue = comics.find((c) => c.slug === line.slug);
    return !issue || lineFormat(line, issue) === "physical";
  });
}
