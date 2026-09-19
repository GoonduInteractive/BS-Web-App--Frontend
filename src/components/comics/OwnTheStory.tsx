import Image from "next/image";

import { BracketButton } from "@/components/ui/BracketButton";
import { TornBand } from "@/components/ui/TornBand";
import type { Messages } from "@/lib/utils/messages";


export function OwnTheStory({ messages, href }: { messages: Messages; href: string }) {
  const t = messages.comics.own;

  return (
    <TornBand seed={2291} className="relative">

      <div className="grid grid-cols-1 lg:grid-cols-[50.8%_49.2%]">
        <div className="relative aspect-600/670 w-full overflow-hidden lg:aspect-auto">
          <Image
            src="/assets/comics/stories.png"
            alt={t.photoAlt}
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover select-none"
          />
        </div>

        <div className="bg-gild flex flex-col justify-center px-6 py-16 md:px-16 md:py-24 lg:justify-start lg:px-27.25 lg:pt-38.5 lg:pb-26">
          <span className="text-menu-fg font-body inline-grid h-7.5 w-fit place-items-center bg-[url('/assets/comics/red-chip.svg')] bg-size-[100%_100%] bg-center bg-no-repeat px-3.5 text-[0.6875rem] leading-none font-semibold tracking-[0.06em]">
            {t.chip}
          </span>

          <h2 className="font-display text-ink mt-5.5 text-[2.25rem] leading-[1.083] font-semibold tracking-[-0.03em] uppercase md:text-[3.925rem]">
            {t.title.split("\n").map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <div className="mt-7.75">
            {t.body.map((line) => (
              <p key={line} className="text-ink font-body text-body-sm leading-6">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-17.75 -ml-2.5">
            <BracketButton
              href={href}
              field="light"
              className="bg-ink px-4.5 py-[1.15rem] text-body tracking-normal"
            >
              {t.cta}
            </BracketButton>
          </div>
        </div>
      </div>
    </TornBand>
  );
}
