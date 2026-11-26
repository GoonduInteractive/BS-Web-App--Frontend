import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { CommunityBoard } from "@/components/community/CommunityBoard";
import { GatePage } from "@/components/gates/GatePage";
import { getWallNotes } from "@/lib/api/community";
import { getActivePlayers } from "@/lib/api/players";
import { handFont } from "@/lib/hand-font";
import { pageMetadata } from "@/lib/seo";
import { isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

// The wall's handwriting: one definition for every page that draws it (`lib/hand-font.ts`).

/**
 * Ọnụ Ụzọ 3 - Community. Figma: `context/design/02-gates/` for the gate,
 * `context/design/05-community/` for the page behind it: `Community Wall.png`
 * and `MOBILE-WALL.png` (2026-09-14), the sheet in `Community wall form.png`.
 * `Active player map.png` and `mobile-active-map/home/game.png` are the second tab.
 *
 * Same arrangement as the other gate pages: `GatePage` owns the gate and these
 * are the page behind it. No pull-up - the frame ends on the footer.
 */
/**
 * Still prerendered, but rebuilt in the background at most every five
 * minutes: the wall's notes come from the game backend, and one an admin
 * approves should show without a redeploy.
 */
export const revalidate = 300;

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
  const [notes, players] = await Promise.all([getWallNotes(), getActivePlayers()]);

  return (
    <GatePage id="community" params={params}>
      <div className={handFont.variable}>
        <CommunityBoard
          notes={notes}
          hotspots={players.hotspots}
          activeTotal={players.active}
          regionCounts={players.regions}
          messages={messages}
          locale={locale}
        />
        <SiteFooter messages={messages} locale={locale} />
      </div>
    </GatePage>
  );
}
