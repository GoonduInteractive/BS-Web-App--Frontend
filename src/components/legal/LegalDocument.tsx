import { LegalNav } from "@/components/legal/LegalNav";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { Reveal } from "@/components/motion/Reveal";
import { Prose, splitBlocks } from "@/components/ui/Prose";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { LegalPage } from "@/types/legal";

/**
 * Terms & Conditions and Privacy Policy - one component, two documents, since
 * the frames are the same page with different words. Figma:
 * `context/design/terms/Terms & Conditions.png`, `Privacy.png`, and
 * `Terms & Conditions- Mobile.png`.
 *
 * WHAT THE FRAME MEASURES, at 1440:
 *
 *   band            #282828 (`--color-ash`) to y 365, the title's caps 67px
 *                   tall and centred, the date 30 under them
 *   block           x 189..1146 - a 1062 container centred in 1440
 *   nav             193 wide, items 42 tall on a 50 pitch, active in #800c00
 *                   (`--color-ember`), label inset 12
 *   gap             133 between the nav and the text
 *   text column     632 wide
 *   section heading Teko caps 15px → 24px, `--text-h5`
 *   body            14 / 23, which is `--text-body-sm`
 *   rule            1px between sections, white at a low opacity
 *
 * Both flat fields land exactly on tokens the site already has, so this page
 * introduced no colour.
 *
 * THE SECTIONS ARE THE CMS'S, and the nav is built from them - adding,
 * removing or reordering one in `/admin` moves both. Their anchors come from
 * the nav label (`lib/api/legal.ts`), so an editor never sees an anchor.
 */
export function LegalDocument({
  page,
  messages,
  locale,
}: {
  page: LegalPage;
  messages: Messages;
  locale: Locale;
}) {
  return (
    <main>
      {/* The band carries the fixed header, so it opens with room for it. */}
      {/* THE TWO FRAMES SET THIS BAND DIFFERENTLY, and both are measured.
          1440: centred, caps 67 tall with their top at 187, the date at 283,
          the floor at 365 - Teko's caps are 0.677 of its size, so 98px gives 66.
          360: LEFT, one line at 42px with its caps at 134, the date at 190, the
          floor at 235. */}
      <header className="bg-ash px-6 pt-[8.1875rem] pb-8 text-left md:pt-[11.3125rem] md:pb-[4.25rem] md:text-center">
        <Reveal as="h1" className="font-display text-menu-fg text-[2.625rem] leading-[0.92] font-semibold tracking-[-0.045em] uppercase md:text-[6.125rem]">
          {page.title}
        </Reveal>
        <Reveal delay={80} as="p" className="text-menu-fg font-body text-body-sm mt-5 leading-none md:mt-3">
          {messages.legal.lastUpdated} {page.lastUpdated}
        </Reveal>
      </header>

      <div className="bg-roster">
        {/* 1062 of 1440 is 73.75%, centred - the frame's margins, held as a cap
            so the block stops growing on a wider screen. */}
        <div className="mx-auto w-full max-w-[69.375rem] px-6 pt-14 pb-24 md:pt-20 md:pb-[7.5rem] lg:grid lg:grid-cols-[12.0625rem_1fr] lg:gap-x-[8.3125rem]">
          <LegalNav sections={page.sections} />

          <div className="lg:max-w-[39.5rem]">
            {page.sections.map((section, i) => (
              <Reveal
                key={section.id}
                as="section"
                delay={i === 0 ? 0 : 40}
                className={
                  i === 0
                    ? ""
                    : "border-menu-fg/15 mt-12 border-t pt-12 md:mt-[3.625rem] md:pt-[3.625rem]"
                }
              >
                {/* `scroll-mt` clears the fixed header when an anchor lands here. */}
                <h2
                  id={section.id}
                  className="font-display text-menu-fg text-h5 scroll-mt-32 leading-none font-semibold tracking-[-0.02em] uppercase"
                >
                  {section.heading}
                </h2>
                <Prose blocks={splitBlocks(section.body)} className="mt-7" />
              </Reveal>
            ))}
          </div>
        </div>

        <SiteFooter messages={messages} locale={locale} />
      </div>
    </main>
  );
}
