import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { getAchievements } from "@/lib/api/achievements";
import type { Messages } from "@/lib/utils/messages";
import type { Achievement } from "@/types/achievement";

/**
 * Section 4 of the Competition page — EARN ACHIEVEMENTS. Figma:
 * `context/design/06-competition/Competition.png`, y 2769..3546 at 1440.
 *
 * WHAT THE FRAME MEASURES:
 *
 *   heading   centred, ink 521..919, cap 40 at 2943 → --text-section-heading
 *   subtitle  centred, three lines at a 25 pitch from 3023, 690 wide, white
 *   cards     four at 301 x 391 from 3156, 24 apart, on --color-parchment
 *   badge     the delivered emblem at 1x, centred in a 140 slot 38 below the top
 *   title     cap 22 at 3350 → 36px Teko, --color-onyx, centred
 *   line      cap 3386, Host Grotesk 16, ash at 87%, centred; two lines on card 4
 *   REWARD:   cap 8 at 3444 → Host Grotesk 12, ash at 75%, 35 under the line
 *   reward    cap 3462, Host Grotesk 16 semibold, ash, 21 pitch, wraps at ~200
 *
 * THE GREYS ARE OPACITIES OF ASH, not tokens: over the parchment, ash at 75%
 * lands on the frame's #57544b to the value in every channel, and at 87% on
 * its #413e36 within two. Same approach the merch store took for its greys.
 *
 * THE BADGES ARE 1x AND CENTRED. Cards 2 to 4 centre the 114-wide file to the
 * pixel; card 1's sits 13 left, which is read as a nudge. Their tops and
 * bottoms both vary by up to 9px because the files carry different alpha
 * padding, so the slot is a fixed 140 with the emblem centred in it — the mean
 * of the frame's four centres.
 *
 * THE REWARD FOLLOWS THE LINE, it is not pinned to the bottom. Card 4's two-line
 * requirement pushes its REWARD 25 lower than the others', which is what the
 * frame draws; the grid stretches every card to the tallest.
 */
export async function EarnAchievements({ messages }: { messages: Messages }) {
  const achievements = await getAchievements();
  const t = messages.competition.achievements;

  return (
    <section className="mx-auto w-full px-6 pt-24 lg:px-20 lg:pt-43">
      <Reveal
        as="h2"
        className="font-display text-menu-fg text-section-heading text-center font-semibold tracking-[-0.058em] uppercase"
      >
        {t.heading}
      </Reveal>
      {/* 712 breaks the frame's three lines at "accelerate", "new" and "rest.":
          Host Grotesk sets them ~2.5% wider here than the frame's 690. */}
      <Reveal delay={80} className="mx-auto mt-5.5 max-w-178">
        <p className="text-menu-fg font-body text-body text-center">{t.subtitle}</p>
      </Reveal>

      <Reveal
        delay={160}
        className="mt-[3.8125rem] grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.slug} achievement={achievement} messages={messages} />
        ))}
      </Reveal>
    </section>
  );
}

function AchievementCard({
  achievement,
  messages,
}: {
  achievement: Achievement;
  messages: Messages;
}) {
  const t = messages.competition.achievements;
  const copy = t.items[achievement.copyKey as keyof typeof t.items];

  // 12 of side padding: the frame's widest title runs to 15 from the card's
  // edge, and 20 wrapped PATH OF THE ASCENDANT.
  return (
    <article className="bg-parchment flex flex-col items-center px-3 pt-9.5 pb-11.5 text-center">
      <div className="flex h-35 items-center justify-center">
        {/* Decorative: the title beneath names the achievement. */}
        <Image
          src={achievement.badge.src}
          alt=""
          width={achievement.badge.width}
          height={achievement.badge.height}
          className="h-auto w-[7.125rem] select-none"
        />
      </div>

      {/* --text-h3 at a 0.9 leading, so the requirement's line box starts where
          the frame's does, 3px under the cap. -0.05em lands every title on the
          frame's width (273 / 213 / 219 / 163) — a smaller correction than the
          48px names needed, so the gap is not simply a function of size. */}
      <h3 className="font-display text-onyx text-h3 mt-2.75 leading-[0.9] font-semibold tracking-[-0.05em] uppercase">
        {copy.title}
      </h3>
      <p className="text-ash/87 font-body text-body">{copy.requirement}</p>

      <p className="text-ash/75 font-body text-caption mt-8.75 uppercase">
        {t.rewardLabel}
      </p>
      {/* 200 wraps "Tournament Points + / Exclusive Badge" and "Season XP +
          Cosmetic / Unlock" as the frame does while "Rare Seasonal Collectible"
          stays on one line. */}
      <p className="text-ash font-body text-body mt-0.5 max-w-50 leading-[1.3] font-semibold">
        {copy.reward}
      </p>
    </article>
  );
}
