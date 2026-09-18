import Image from "next/image";

import { NsibidiField } from "@/components/chrome/NsibidiField";
import { SoundToggle } from "@/components/chrome/SoundToggle";
import { EnterButton } from "@/components/chrome/EnterButton";
import type { Messages } from "@/lib/utils/messages";

/**
 * Full-screen entry gate, before the site proper (overview section 3).
 * Figma: context/design/01-entry/page entry.png
 *
 * Not yet built, and each needs its own intake:
 *  - the loader that precedes this (motion moment 7)
 *  - the language choice. The frame shows ONE button; the overview describes a
 *    NNOO *and* WELCOME choice. Awaiting the second frame.
 *  - the transition from here into the gate sequence
 */
export function EntryScreen({ messages }: { messages: Messages }) {
  const t = messages.entry;

  return (
    <main className="bg-entry relative grid min-h-dvh grid-rows-[auto_1fr] overflow-hidden">
      {/* Nsibidi marquee. Decorative, so it is hidden from assistive tech. */}
      <NsibidiField />

      <header className="relative z-10 flex justify-center pt-16">
        <Image
          src="/assets/brand/goondu-logo.png"
          alt={t.wordmarkAlt}
          width={336}
          height={46}
          priority
          className="h-auto w-40 select-none md:w-55.5"
        />
      </header>

      <div className="relative z-10 flex flex-col items-center justify-center gap-15 px-6 pt-20">
        <Image
          src="/assets/brand/trial-of-the-gods.png"
          alt={t.lockupAlt}
          width={2916}
          height={1563}
          priority
          sizes="(max-width: 767px) 88vw, 42vw"
          className="h-auto w-full max-w-150 select-none"
        />
        <EnterButton label={t.enterIgbo} hoverLabel={t.enterEnglish} />
      </div>

      {/* Absolutely placed so it never pushes the centred block off-centre. */}
      <footer className="absolute bottom-20 left-6 z-10 md:bottom-15 md:left-22.5">
        <SoundToggle onLabel={t.soundOn} offLabel={t.soundOff} />
      </footer>
    </main>
  );
}
