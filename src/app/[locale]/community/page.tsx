import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { CommunityBoard } from "@/components/community/CommunityBoard";
import { GatePage } from "@/components/gates/GatePage";
import { getWallNotes } from "@/lib/api/community";
import { getHotspots, getInviteLink } from "@/lib/api/players";
import { getViewerState } from "@/lib/api/points";
import { getProfile } from "@/lib/api/profile";
import { pageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * THE WALL'S HANDWRITING, loaded on this route alone. Bradley Hand ITC, from
 * the file the human dropped in (moved from `public/font/` to `src/app/fonts/`
 * so Next bundles and hashes it rather than serving the raw TTF). Scoped here
 * rather than in the layout so no other page preloads a 160KB face it never
 * draws; `--font-hand` in globals.css reads the variable this sets.
 *
 * LICENCE - FLAGGED. Bradley Hand ITC is a Monotype face, not an open one like
 * Teko and Host Grotesk. Serving it from the site is web-font embedding and
 * needs a licence that covers it. A one-line swap to a Google face (Kalam is
 * the nearest) is the alternative if none is bought.
 */
const bradley = localFont({
  src: "../../fonts/BRADHI.ttf",
  variable: "--font-bradley",
  display: "swap",
  preload: false,
});

/**
 * Ọnụ Ụzọ 3 - Community. Figma: `context/design/02-gates/` for the gate,
 * `context/design/05-community/` for the page behind it: `Community Wall.png`
 * and `MOBILE-WALL.png` (2026-09-14), the sheet in `Community wall form.png`.
 * `Active player map.png` and `mobile-active-map/home/game.png` are the second tab.
 *
 * Same arrangement as the other gate pages: `GatePage` owns the gate and these
 * are the page behind it. No pull-up - the frame ends on the footer.
 */
export function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return params.then(({ locale }) => {
    if (!isLocale(locale)) return {};
    const t = getMessages(locale).community.meta;
    return pageMetadata({ locale, path: "/community", title: t.title, description: t.description });
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const [notes, hotspots, invite, viewer] = await Promise.all([
    getWallNotes(),
    getHotspots(),
    getInviteLink(),
    getViewerState(),
  ]);
  // A submitted note is signed by the mock profile when the viewer is "signed
  // in", else by the copy's "You". No account exists; see the notes.
  const you = viewer === "signed-out" ? messages.community.wall.you : (await getProfile()).name;

  return (
    <GatePage id="community" params={params}>
      <div className={bradley.variable}>
        <CommunityBoard notes={notes} hotspots={hotspots} invite={invite} messages={messages} you={you} />
        <SiteFooter messages={messages} locale={locale} />
      </div>
    </GatePage>
  );
}
