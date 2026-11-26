import type { ReactNode } from "react";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { HederaArt } from "@/components/hedera/HederaArt";
import { HederaNav } from "@/components/hedera/HederaNav";
import { Chip } from "@/components/ui/Chip";
import type { HederaArtKey } from "@/lib/hedera/art";
import type { Messages } from "@/lib/utils/messages";

/**
 * Every Hedera page but the explainer: the profile's ground and container
 * (`profile/page.tsx`), the gate chip over a display title, the section's own
 * pages under it. No frame draws it.
 *
 * `art` puts the screen's picture to the right of the title, from `lg` up
 * (`HederaArt`; stand-ins until Sophia's art arrives). The title block then
 * keeps at least the art's height, so the art never runs into the content.
 */
export function HederaFrame({
  messages,
  locale,
  title,
  intro,
  nav = true,
  art,
  children,
}: {
  messages: Messages;
  locale: string;
  title: string;
  intro?: string;
  /** The section's links; off on the steps of a flow (linking, paying). */
  nav?: boolean;
  /** The picture beside the title; none on a page that has its own (an exclusive's). */
  art?: HederaArtKey;
  children: ReactNode;
}) {
  return (
    <main className="bg-roster min-h-dvh">
      <div className="mx-auto w-full max-w-360 px-6 pt-28 pb-24 md:px-20 md:pt-[11.5625rem]">
        <div className={art ? "relative lg:min-h-[15.5rem] lg:pr-[25rem]" : undefined}>
          <header>
            <Chip>{messages.hedera.chip}</Chip>
            <h1 className="font-display text-menu-fg text-h2 mt-5 leading-none font-semibold tracking-[-0.075em] uppercase">
              {title}
            </h1>
            {intro ? <p className="text-menu-fg/85 font-body text-body mt-4 max-w-[40rem]">{intro}</p> : null}
          </header>

          {nav ? <HederaNav messages={messages} locale={locale} className="mt-9" /> : null}

          {art ? (
            <div className="pointer-events-none absolute inset-y-0 -top-6 right-0 hidden w-[23rem] lg:block">
              <HederaArt art={art} variant="header" />
            </div>
          ) : null}
        </div>

        <div className="mt-10 md:mt-12">{children}</div>
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
