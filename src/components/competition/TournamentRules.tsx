import { TournamentAccordion } from "@/components/competition/TournamentAccordion";
import { Reveal } from "@/components/motion/Reveal";
import type { Messages } from "@/lib/utils/messages";

/**
 * The two accordions under the journey — TOURNAMENT RULES, then REWARDS.
 * Figma: `Tournament (upcoming).png`, y 1456..2200 at 1440.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   rules     group heading cap 1557, Host Grotesk 16 semibold at 92%; items at
 *             a 25 pitch, 80%, bullet at 126 and text at 143; 50 between groups
 *   rewards   intro cap 2062 at 80%; three columns from 116 / 330 / 598 with
 *             Teko 20 headings and 14px items at a 23 pitch, ~60 apart
 *   bars      58 between the rules' last line and the REWARDS bar
 *
 * OPEN WHEN THE TOURNAMENT HAS NOT BEGUN, CLOSED ONCE IT RUNS — which is what
 * the two frames draw: the upcoming page opens both, the ongoing page closes
 * both above its bracket.
 *
 * The copy is shared by every tournament (the frame writes one rule sheet, with
 * the tournament's name in the rewards intro), so it lives once under
 * `messages.competition.detail`.
 */
export function TournamentRules({
  name,
  running,
  messages,
}: {
  name: string;
  running: boolean;
  messages: Messages;
}) {
  const t = messages.competition.detail;

  return (
    <section className="mx-auto w-full px-5 pt-24 lg:px-20 lg:pt-45">
      <Reveal>
        <TournamentAccordion
          title={t.rules.title}
          defaultOpen={!running}
          expandLabel={t.toggle.expand}
          collapseLabel={t.toggle.collapse}
        >
          <div className="space-y-6 pb-2">
            {t.rules.groups.map((group) => (
              <div key={group.heading}>
                <h3 className="text-menu-fg/92 font-body text-body-sm font-semibold lg:text-body">{group.heading}</h3>
                <ul className="mt-1.25">
                  {group.items.map((item) => (
                    <li key={item} className="text-menu-fg/80 font-body text-body-sm flex gap-2 pl-2.5 leading-[1.5625rem] lg:text-body lg:gap-3 lg:leading-[1.61875rem]">
                      <span aria-hidden className="shrink-0 select-none">
                        •
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TournamentAccordion>
      </Reveal>

      <Reveal delay={80} className="mt-10">
        <TournamentAccordion
          title={t.rewards.title}
          defaultOpen={!running}
          expandLabel={t.toggle.expand}
          collapseLabel={t.toggle.collapse}
        >
          <p className="text-menu-fg/80 font-body text-body-sm mt-1.25 leading-[1.5625rem] lg:text-body lg:leading-[1.61875rem]">
            {t.rewards.intro.replace("{name}", name)}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-16 gap-y-8 pb-2">
            {t.rewards.groups.map((group) => (
              <div key={group.heading}>
                <h3 className="font-display text-menu-fg text-[1.0625rem] leading-6 font-semibold tracking-[-0.055em] uppercase lg:text-h6 lg:leading-7">
                  {group.heading}
                </h3>
                <ul className="mt-1">
                  {group.items.map((item) => (
                    <li key={item} className="text-menu-fg/80 font-body text-body-sm flex gap-2.5 pl-2.5">
                      <span aria-hidden className="shrink-0 select-none">
                        •
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TournamentAccordion>
      </Reveal>
    </section>
  );
}
