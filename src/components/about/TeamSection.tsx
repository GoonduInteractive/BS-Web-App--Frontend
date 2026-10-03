"use client";

import { useRef, useState } from "react";

import { EmptyTeam } from "@/components/about/EmptyTeam";
import { TeamCard } from "@/components/about/TeamCard";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { PanelTabs } from "@/components/ui/PanelTabs";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import { TEAM_CARD, portraitFraming } from "@/lib/team";
import type { Messages } from "@/lib/utils/messages";
import { TEAM_GROUPS, type TeamGroup, type TeamMember } from "@/types/team";

/**
 * THE TEAM band on the About page. Figma: `context/design/11-about/`.
 *
 * The people come from the CMS through the page (`lib/api/team.ts`); this
 * component only lays them out and animates them in.
 *
 * TABBED SINCE 2026-09-22, per the human: Core Team and Contributors (Partners
 * moved out to their own band, `PartnersSection`, on 2026-09-28),
 * drawn with the Community page's own switcher (`PanelTabs`) rather than a
 * second control that looks like it - the same tabs, ids, keyboard pattern and
 * sliding underline the Community Wall and the Competition standings use.
 * Another tab is one entry in `TEAM_GROUPS`, one label in
 * `messages.about.team.tabs`, and one option in the CMS select; the row here
 * reads the list and nothing counts them.
 *
 * A TAB WITH NOBODY IN IT IS STILL DRAWN, showing the empty state under it -
 * Contributors is empty until the first one is published, and a tab that
 * vanished would leave the visitor wondering what they saw a moment ago.
 */
export function TeamSection({ members, messages }: { members: readonly TeamMember[]; messages: Messages }) {
  const t = messages.about.team;
  const root = useRef<HTMLElement>(null);
  const [group, setGroup] = useState<TeamGroup>("core");
  useGsapScene(root, teamScene);

  const shown = members.filter((member) => member.group === group);

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

          {/* Left on the phone with the heading, centred under it from md - the
              band's own alignment, which the heading above already follows. */}
          <PanelTabs
            name="team"
            label={t.chip}
            tabs={TEAM_GROUPS.map((key) => ({ key, label: t.tabs[key] }))}
            active={group}
            onChange={setGroup}
            // Wraps if the tabs ever outgrow a phone - the slider reads each tab's
            // own offset and follows it to the second line. One line, centred, from
            // md, at the frame's gap.
            className="mt-9 -ml-2.5 flex-wrap gap-x-4 gap-y-3 md:ml-0 md:justify-center md:gap-x-[1.875rem]"
          />
        </header>

        {/* Keyed on the tab so the row re-enters with the Reveal's own rise when
            the visitor switches, the way the Community page's panels do. */}
        <div id={`team-panel-${group}`} role="tabpanel" aria-labelledby={`team-tab-${group}`}>
        <Reveal key={group} as="div">
          {shown.length === 0 ? (
            <EmptyTeam messages={messages} />
          ) : (
            /* A WRAPPING FLEX ROW, NOT A GRID, so that a short last row centres
               itself - one card left over sits in the middle, two sit either side
               of it - at every breakpoint and for any number of people. A grid
               cannot do that: its tracks are fixed, so the leftovers hug the left
               unless a column start is computed per count AND per breakpoint.
               Each card carries the width its column had, so a full row is laid
               out exactly as the grid laid it out. */
            <ul className="mt-14 flex flex-wrap justify-center gap-x-5 gap-y-15.5 xl:mt-23">
              {shown.map((member) => (
                <li key={member.slug} data-team-card className={TEAM_CARD}>
                  <TeamCard
                    name={member.name}
                    role={member.role}
                    image={member.image}
                    imageAlt={member.portraitAlt}
                    portraitClass={portraitFraming(member.image)}
                    priority={false}
                  />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
        </div>
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

      tl.from(head, { y: 26, opacity: 0, duration: 0.8 });
      if (cards.length) tl.from(cards, { y: 30, opacity: 0, duration: 0.75, stagger: 0.08 }, 0.2);
    },
  );
};
