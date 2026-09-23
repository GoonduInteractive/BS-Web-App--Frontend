import Image from "next/image";

import { BracketButton } from "@/components/ui/BracketButton";
import { TornPanel } from "@/components/ui/TornPanel";
import type { Messages } from "@/lib/utils/messages";

/**
 * The signed-out right column: the offer, on a red plate over a torn sheet.
 *
 * Frame at 1440 - 903..1356 x 192..786, red 333 tall then white 261. The red
 * plate's torn bottom lands ON the white sheet, so the two overlap; drawn as
 * neighbours their deckles interlock over black.
 *
 * FLAGGED: LOGIN is inert. There is no auth in this build.
 */
export function LoginCard({ messages }: { messages: Messages }) {
  const t = messages.merch.login;

  return (
    <div className="flex flex-col lg:-mt-1.25">
      {/* Delivered artwork: the sunburst and its torn edge cannot be drawn
          procedurally, so this one is a bitmap by necessity. */}
      <div className="relative z-10 aspect-[453/333] w-full">
        <Image
          src="/assets/merch/red-nsibidi-bg.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 1023px) 92vw, 36vw"
          className="object-cover select-none"
        />
        <Image
          src="/assets/merch/red-nsibidi.svg"
          alt=""
          aria-hidden
          width={165}
          height={166}
          className="absolute top-1/2 left-1/2 w-[35%] -translate-x-1/2 -translate-y-1/2 select-none"
        />
      </div>

      {/* Procedural, at the delivered tear-bg.svg's own filter values, so the
          deckle stays a constant physical size. */}
      <TornPanel className="text-menu-fg -mt-5 px-11 pt-14 pb-11.25">
        <p className="font-display text-scar text-[1.9375rem] leading-[2.375rem] font-semibold tracking-[-0.01em] uppercase">
          {t.pitch.split("\n").map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>

        <div className="mt-12.75 -ml-1.25">
          <BracketButton field="light" className="bg-ink px-4.75 py-[1.15rem] text-body tracking-normal">
            {t.cta}
          </BracketButton>
        </div>
      </TornPanel>
    </div>
  );
}
