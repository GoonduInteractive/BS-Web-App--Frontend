import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { BracketButton } from "@/components/ui/BracketButton";
import { getActiveRegions } from "@/lib/api/regions";
import type { Messages } from "@/lib/utils/messages";

export async function RegionalLeagues({ messages }: { messages: Messages }) {
  const regions = await getActiveRegions();
  const t = messages.competition.regional;

  return (
    <section className="relative overflow-hidden">

      <Image
        src="/assets/competition/map.png"
        alt=""
        aria-hidden
        width={1322}
        height={649}
        sizes="1322px"
        className="pointer-events-none absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 select-none lg:top-53.5 lg:translate-y-0"
      />

      <div className="relative mx-auto w-full px-6 pt-24 pb-24 lg:grid lg:grid-cols-2 lg:px-20 lg:pt-80 lg:pb-30">
        {/* ---- Left: heading, pitch, CTA. 24 inside the container. ---- */}
        <div className="lg:pl-6">
          <Reveal
            as="h2"
            className="font-display text-menu-fg text-section-heading font-semibold tracking-[-0.058em] uppercase"
          >
            {t.heading}
          </Reveal>

          <Reveal delay={80} className="mt-6 max-w-95">
            <p className="text-menu-fg font-body text-body">{t.body}</p>
            <p className="text-menu-fg font-body text-body mt-5">{t.body2}</p>
          </Reveal>

          <Reveal delay={160} className="mt-12.25 -ml-2">
            <BracketButton className="px-4 py-4.75 leading-none tracking-normal whitespace-nowrap">
              {t.cta}
            </BracketButton>
          </Reveal>
        </div>

        {/* ---- The spindle, in the gutter. ---- */}
        <Divider className="text-ember absolute top-88.5 left-1/2 hidden -translate-x-1/2 lg:block" />

        <Reveal delay={160} className="mt-16 lg:mt-9.25 lg:pr-3.25 lg:pl-28.75">
          <h3 className="font-display text-menu-fg text-h5 font-semibold tracking-[-0.055em] uppercase">
            {t.regionsTitle}
          </h3>
          <ul className="mt-4">
            {regions.map((region) => (
              <li
                key={region.slug}
                className="border-ash text-menu-fg font-body text-body flex h-12.5 items-center gap-3.5 border-b pt-2"
              >
                <Image
                  src="/assets/competition/arrow-pointer.svg"
                  alt=""
                  aria-hidden
                  width={28}
                  height={23}
                  className="h-5.75 w-7 shrink-0 select-none"
                />
                {region.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 11 367"
      width={11}
      height={367}
      fill="currentColor"
      className={className}
    >
      <path d="M0 0h11l-4 12v343l4 12H0l4-12V12z" />
    </svg>
  );
}

