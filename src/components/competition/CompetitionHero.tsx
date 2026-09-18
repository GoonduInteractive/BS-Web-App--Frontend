"use client";

import Image from "next/image";

import { GateReturn } from "@/components/gates/GateReturn";
import { Reveal } from "@/components/motion/Reveal";
import { usePointerDrift } from "@/hooks/usePointerDrift";
import type { Messages } from "@/lib/utils/messages";

export function CompetitionHero({ messages }: { messages: Messages }) {
  const t = messages.competition.hero;
  const { frontRef, backRef } = usePointerDrift<HTMLDivElement, HTMLDivElement>();

  return (
    <section className="bg-competition-hero relative flex min-h-dvh flex-col overflow-hidden">
      <div className="@container relative mx-auto flex w-full flex-1 flex-col">
        <div className="relative z-10 px-6 pt-32 pb-8 lg:px-27 lg:pt-56.75 lg:pb-37">

          <Reveal className="-ml-1 lg:-ml-4">
            <GateReturn label={messages.competition.backToGate} />
          </Reveal>


          <Reveal
            as="p"
            className="font-display text-menu-fg text-h5 mt-8 font-normal tracking-wide uppercase"
          >
            {t.overline}
          </Reveal>

          <Reveal
            as="h1"
            className="font-display text-menu-fg text-game-hero mt-[1.15rem] font-semibold tracking-[-0.058em] uppercase"
          >
            {t.title}
          </Reveal>

          <Reveal delay={80} className="mt-[0.65rem] max-w-126 lg:max-w-[35cqw]">
            <p className="text-menu-fg font-body text-body whitespace-pre-line">{t.body}</p>
          </Reveal>
        </div>

        <FigureStage frontAlt={t.frontAlt} rearAlt={t.rearAlt} frontRef={frontRef} backRef={backRef} />
      </div>
    </section>
  );
}

function FigureStage({
  frontAlt,
  rearAlt,
  frontRef,
  backRef,
}: {
  frontAlt: string;
  rearAlt: string;
  frontRef: React.Ref<HTMLDivElement>;
  backRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div

      className="pointer-events-none relative mt-auto h-[171cqw] select-none md:h-[55.2cqw] md:[--fx:0.1cqw] md:[--ox:-29.7cqw] lg:absolute lg:inset-0 lg:h-auto lg:[--fx:0.069444cqw] lg:[--ox:0cqw]"
    >
      <div
        ref={backRef}
        className="absolute bottom-[-47.8cqw] left-[-81.9cqw] w-[261.7cqw] md:bottom-[calc(-207*var(--fx))] md:left-[calc(var(--ox)+376*var(--fx))] md:w-[calc(1004*var(--fx))]"
      >
        
        <Image
          src="/assets/characters/soma-nysc.png"
          alt={rearAlt}
          width={4096}
          height={4096}
          sizes="(min-width: 1024px) 70vw, (min-width: 768px) 100vw, 154vw"
          className="h-auto w-full"
        />
      </div>
      <div
        ref={frontRef}
        className="absolute bottom-[-17.5cqw] left-[-14.4cqw] w-[156.1cqw] md:bottom-[calc(6*var(--fx))] md:left-[calc(var(--ox)+718*var(--fx))] md:w-[calc(622*var(--fx))]"
      >
        <Image
          src="/assets/competition/soma-front.png"
          alt={frontAlt}
          width={936}
          height={968}
          sizes="(min-width: 1024px) 44vw, (min-width: 768px) 62vw, 96vw"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
