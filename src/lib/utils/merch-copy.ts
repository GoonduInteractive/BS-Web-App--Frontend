import type { Messages } from "@/lib/utils/messages";
import type { ComicIssue, ProductColour } from "@/types/merch";

export function colourLabel(colour: ProductColour, messages: Messages): string {
  return colour.label ?? (colour.labelKey ? messages.merch.colours[colour.labelKey] : colour.id);
}

/** A size as printed: a standard one through the copy, any other as the API names it. */
export function sizeLabel(size: string, messages: Messages): string {
  return (messages.merch.sizes as Record<string, string>)[size] ?? size;
}

/** The comics page's synopsis, as paragraphs: the chapter's description. */
export function issueSynopsis(issue: ComicIssue): readonly string[] {
  return issue.copy.description ? [issue.copy.description] : [];
}
