import type { Messages } from "@/lib/utils/messages";

/**
 * SECTIONS THE PUBLIC MAY NOT SEE YET. Per the human (2026-09-19): "the news,
 * merch, comics and competition page needs to be connected to the coming soon
 * page for now as we don't want the public to see it yet."
 *
 * Each of these sections is built and stays built. While its name is in the
 * list, every route under it — the index, the details, the cart, the checkout,
 * the reader, the tournaments — opens onto the Coming Soon page with the
 * section's name on the chip (each page returns `HiddenSection` instead of its
 * own tree — it has to be the page, see that file), its head says nothing about
 * what is behind it (`pageMetadata`, in `lib/seo.ts`), the sitemap leaves it
 * out (`app/sitemap.ts`), and the comic reader's own-bar rule stands down
 * (`SiteChrome`). The links INTO a section —
 * the header's, the menu's, the door's CTA — are untouched, so they land on
 * Coming Soon the way Terms of Use and Privacy Policy do.
 *
 * TO OPEN A SECTION, REMOVE ITS NAME HERE. Nothing else changes.
 */
// export type HiddenSectionName = "news" | "merch" | "comics" | "competition";
export type HiddenSectionName =  "merch" | "comics" | "competition";

export const HIDDEN_SECTIONS: readonly HiddenSectionName[] = ["merch", "comics", "competition"];

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
 * the site already carries — nothing is added for this.
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
