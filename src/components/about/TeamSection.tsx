"use client";

import { useRef } from "react";

import { TeamCard } from "@/components/about/TeamCard";
import { Chip } from "@/components/ui/Chip";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import { TEAM, lastRowOffsetClass, lastRowStart } from "@/lib/team";
import type { Messages } from "@/lib/utils/messages";


export function TeamSection({ messages }: { messages: Messages }) {
  const t = messages.about.team;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, teamScene);

  const offsetClass = lastRowOffsetClass(TEAM.length);
  const offsetAt = lastRowStart(TEAM.length);

  return (
    <section ref={root} className="bg-scar">
      <div className="mx-auto max-w-360 px-6 pt-24 pb-14.5 md:px-[5.625rem]">
        <header
          data-team-head
          className="flex flex-col items-start text-left md:items-center md:text-center"
        >
          <Chip>{t.chip}</Chip>

          <h2 className="font-display text-menu-fg text-story-title mt-5 font-semibold tracking-[-0.051em] uppercase">
            {t.title}
          </h2>
        </header>

        <ul className="mt-14 grid grid-cols-1 gap-x-5 gap-y-15.5 sm:grid-cols-2 lg:grid-cols-3 xl:mt-23 xl:grid-cols-4">
          {TEAM.map((member, i) => {
            const copy = t.members[member.memberKey];
            return (
              <li
                key={member.id}
                data-team-card
                className={i === offsetAt && offsetClass ? offsetClass : undefined}
              >
                <TeamCard
                  name={copy.name}
                  role={copy.role}
                  image={member.image}
                  imageAlt={copy.portraitAlt}
                  portraitClass={member.portraitClass}

                  priority={false}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const teamScene: SceneBuilder = (gsap, q, section) => {
  const head = q("[data-team-head]");
  const cards = q("[data-team-card]");

  gsap.matchMedia().add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      if (!motion) {
        gsap.set([head, cards], { clearProps: "all" });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });

      tl.from(head, { y: 26, opacity: 0, duration: 0.8 }).from(
        cards,
        { y: 30, opacity: 0, duration: 0.75, stagger: 0.08 },
        0.2,
      );
    },
  );
};
