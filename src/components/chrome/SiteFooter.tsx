import Image from "next/image";
import Link from "next/link";

import type { Messages } from "@/lib/utils/messages";

/**
 * The site footer. Figma: `context/design/04-characters/character-detail.png`,
 * y 4850..5040 at 1440 — the first frame that shows one.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   rule        x  80..1360  y 4850
 *   wordmark    x  81        y 4906..4955
 *   copyright   x  81        cap top 4977
 *   links       x 543..907   cap top 4946
 *   credit      right edge 1345, "Created by" over the Goondu wordmark
 *
 * SCOPED TO THIS PAGE FOR NOW. It is built as a component rather than dropped
 * into the layout because no other frame on this site shows a footer yet, and
 * putting one under the gate sequence — which is deliberately exactly one
 * viewport tall with nothing to scroll to — would break that.
 *
 * FLAGGED: the three link destinations do not exist. Terms of Use and Privacy
 * Policy have no route and no design; About is `/about`, which is in the site
 * map but not built. They are rendered as the frame draws them and point at the
 * routes they will have.
 */
export function SiteFooter({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.footer;

  return (
    <footer className="bg-ink">
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-20">
        {/* 1282 x 11 natural, which is this container width at 1440 exactly.
            Same dimension rule as the hero, in the footer stroke, and stretched
            the same way — see DetailHero for why object-fill is the only fit
            that works on artwork carrying no preserveAspectRatio. */}
        <Image
          src="/assets/ornaments/Arrow-border-footer.svg"
          alt=""
          aria-hidden
          width={1282}
          height={11}
          className="h-[0.6875rem] w-full object-fill"
        />

        {/* THE EXTRA BOTTOM PADDING IS FOR THE SOUND TOGGLE, which SiteChrome
            fixes at bottom-4/left-4 and bottom-10/left-24. Fixed to the
            viewport, it lands on whatever is at the foot of the page — and this
            is the first page on the site that has anything there, so the
            collision had never shown up before. It sat squarely on the
            copyright line. Padding the footer is what keeps them apart without
            moving a control that four other routes place correctly. */}
        <div className="flex flex-col gap-12 pt-14 pb-28 md:flex-row md:items-start md:justify-between md:gap-8 md:pb-32">
          <div>
            <Image
              src="/assets/brand/beyond-service-logo.png"
              alt={t.wordmarkAlt}
              width={360}
              height={104}
              className="h-[3.0625rem] w-auto"
            />
            <p className="text-menu-fg/70 font-body text-body-sm mt-[1.375rem]">{t.copyright}</p>
          </div>

          <nav aria-label={t.navLabel} className="flex flex-wrap gap-x-[3.75rem] gap-y-4 md:pt-[2.25rem]">
            {(
              [
                ["terms", `/${locale}/terms`],
                ["privacy", `/${locale}/privacy`],
                ["about", `/${locale}/about`],
              ] as const
            ).map(([key, href]) => (
              <Link
                key={key}
                href={href}
                className="text-menu-fg font-body text-body focus-visible:outline-signal transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {t.links[key]}
              </Link>
            ))}
          </nav>

          <div className="md:text-right">
            <p className="text-menu-fg/70 font-body text-body-sm">{t.createdBy}</p>
            <Image
              src="/assets/brand/goondu-logo.png"
              alt={t.studioAlt}
              width={240}
              height={40}
              className="mt-2 h-[1.4375rem] w-auto md:ml-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
