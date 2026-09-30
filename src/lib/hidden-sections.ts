import type { Messages } from "@/lib/utils/messages";

// export type HiddenSectionName = "news" | "merch" | "comics" | "competition";
export type HiddenSectionName =  "merch" | "comics" | "competition" ;

export const HIDDEN_SECTIONS: readonly HiddenSectionName[] = [ "merch", "comics", "competition"];

export function isHidden(section: HiddenSectionName): boolean {
  return HIDDEN_SECTIONS.includes(section);
}

/** The hidden section a locale-less route path is under, or null: `/news/foo` → `news`. */
export function hiddenSectionOf(path: string): HiddenSectionName | null {
  const first = path.split("/").filter(Boolean)[0];
  return HIDDEN_SECTIONS.find((section) => section === first) ?? null;
}

/**
 * The name that goes on the Coming Soon chip and in the head: the header's
 * label for the three utility sections, the gate's title for Competition. Copy
 * the site already carries - nothing is added for this.
 */
export function hiddenSectionLabel(section: HiddenSectionName, messages: Messages): string {
  switch (section) {
    // case "news":
    //   return messages.nav.news;
    case "merch":
      return messages.nav.merch;
    case "comics":
      return messages.nav.comics;
    case "competition":
      return messages.gates.competition.title;
  }
}


