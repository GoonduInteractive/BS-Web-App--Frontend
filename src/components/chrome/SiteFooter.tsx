import Image from "next/image";
import Link from "next/link";

import type { Messages } from "@/lib/utils/messages";

/**
 * The site's foot. At `md` and up, three columns: the wordmark with the
 * copyright under it, the links, "Created by" with the studio mark - as every
 * 1440 frame draws it. BELOW `md` IT IS A CENTRED STACK: wordmark, the links one
 * under another, "Created by" and the studio mark, and the copyright LAST -
 * the order the phone frames agree on (`05-community/mobile-active-map`,
 * `08-news/News Details - Mobile`, `09-comics/comic-detail-mobile`, 2026-09-15).
 * Measured off the comic frame: the rule 46 above the mark; links 78 under
 * it on a 55 pitch; "Created by" 77 under the last link, the studio mark 11
 * under it, the copyright 38 under that and 33 above the end.
 *
 * The wordmark group is `contents` on the phone so its two children take
 * their own places in the stack - the copyright at the end - and a block
 * again from `md`, where they share the left column.
 */

export function SiteFooter({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.footer;

  return (
    <footer className="bg-ink">
      <div className="mx-auto w-full max-w-360 px-6 md:px-20">

        <Image
          src="/assets/ornaments/Arrow-border-footer.svg"
          alt=""
          aria-hidden
          width={1282}
          height={11}
          className="h-2.75 w-full object-fill"
        />

        {/* Measured off the 404 and Community frames at 1440 (they agree): the
            wordmark's ink 45 tall, 51 under the rule; the copyright 27 under it;
            the links level with its lower half; Created by 12 down, the mark
            10 under that; 48 from the copyright to the end. Both logo files
            carry transparent padding, so their boxes run past their ink. */}
        <div className="flex flex-col items-center pt-9 pb-8.25 text-center md:flex-row md:items-start md:justify-between md:gap-8 md:pt-9 md:pb-11.25 md:text-left">
          <div className="contents md:block">
            <Image
              src="/assets/brand/beyond-service-logo.png"
              alt={t.wordmarkAlt}
              width={360}
              height={104}
              className="h-17.5 w-auto"
            />
            <p className="text-menu-fg/70 font-body text-body-sm order-last mt-9.5 md:order-none md:mt-1.5">{t.copyright}</p>
          </div>

          <nav
            aria-label={t.navLabel}
            className="mt-15.5 flex flex-col items-center gap-y-7.25 md:mt-0 md:flex-row md:flex-wrap md:gap-x-8.25 md:gap-y-4 md:pt-11.25"
          >
            {(
              [
                ["terms", `/${locale}/terms`],
                ["privacy", `/${locale}/privacy`],
                ["about", `/${locale}/about`],
                // No contact page: support is an inbox (`new-updates`, 2026-09-26).
                ["contact", `mailto:${messages.support.email}`],
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

          <div className="mt-[4.5625rem] md:mt-0 md:pt-3 md:text-right">
            <p className="text-menu-fg/70 font-body text-body-sm">{t.createdBy}</p>
            {/* The studio's own site, in a new tab so the visitor keeps their place here. */}
            <a
              href="https://goondu.games"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-visible:outline-signal mx-auto mt-2.75 block w-fit transition-opacity duration-150 ease-gate hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 md:mt-2.5 md:mr-0 md:ml-auto"
            >
              <Image src="/assets/brand/goondu-logo.png" alt={t.studioAlt} width={240} height={40} className="h-6 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
