import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import type { Messages } from "@/lib/utils/messages";
import type { Partner } from "@/types/partner";

/**
 * PARTNERS, the logo row under the team on the About page.
 * Figma: `context/design/new-updates/ABOUT GOONDU GAMES.png`.
 *
 * Its own band and its own CMS collection since 2026-09-28 (`lib/api/partners.ts`)
 * - partners were a third tab of THE TEAM before. Every logo is drawn at one
 * height and its own width, so wordmarks and square marks sit on one line, and
 * the row wraps and stays centred for any number of them.
 *
 * NOTHING PUBLISHED, NOTHING DRAWN: unlike the team there is no Coming Soon
 * here - an empty PARTNERS heading over the footer says nothing useful.
 */
export function PartnersSection({ partners, messages }: { partners: readonly Partner[]; messages: Messages }) {
  if (partners.length === 0) return null;
  const t = messages.about.partners;

  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-360 px-6 pt-24 md:px-22.5 md:pt-37.5">
        <Reveal
          as="h2"
          className="font-display text-menu-fg text-story-title text-center font-semibold tracking-[-0.051em] uppercase"
        >
          {t.title}
        </Reveal>

        <Reveal as="ul" delay={120} className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-10 md:mt-14 md:gap-x-22">
          {partners.map((partner) => {
            const logo = (
              <Image
                src={partner.logo}
                alt={partner.name}
                width={0}
                height={0}
                sizes="(max-width: 767px) 60vw, 20rem"
                unoptimized={partner.logo.endsWith(".svg")}
                className="h-12 w-auto max-w-60 object-contain md:h-16 md:max-w-80"
              />
            );
            return (
              <li key={partner.slug}>
                {partner.url ? (
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-100 transition-opacity hover:opacity-75 focus-visible:opacity-75"
                  >
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
