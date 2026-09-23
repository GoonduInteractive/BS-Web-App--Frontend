import type { SceneBuilder } from "@/hooks/useGsapScene";

/**
 * The Competition page's GSAP choreography - the tournament page's sections
 * and the leaderboard - in one place, keyed by name so a Server Component can
 * ask for a scene with a string (see `Scene`).
 *
 * Every scene is built through `useGsapScene`, so it is lazy, scoped, reverted
 * on unmount, and never built on an element without a box. Every scene has its
 * own reduced-motion branch, which is the rule: the global CSS block cannot
 * touch what GSAP writes inline (see `useReducedMotion`).
 *
 * Two conventions, both load-bearing:
 *
 *  - TWEEN WRAPPERS, NOT THE ELEMENT THAT HOVERS. Tailwind's `translate-*`
 *    and `scale-*` are the individual CSS transform properties, which GSAP
 *    folds into `transform` and then zeroes inline, killing the hover for good
 *    (the warning on `useGsapScene`). So every tweened target is a plain
 *    wrapper, and hover lifts sit on the element inside it.
 *  - CLEAR PROPS ON COMPLETE. Scenes rebuild on relayout; without clearing,
 *    GSAP's inline opacity and transform would survive into the next build.
 *    Only THOSE props, never `clearProps: "all"`: the bracket's cards and
 *    lines are positioned by inline `top`/`height` that React writes, and
 *    "all" wiped them - under reduced motion every card sat at the top of its
 *    column until this was caught.
 */

type Media = { motion: boolean; reduced: boolean; wide: boolean };

const CONDITIONS = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  /** Tailwind's `lg` - where the bracket tree and the podium grid appear. */
  wide: "(min-width: 64rem)",
};

/** Tailwind's `xl` - where the journey stepper turns horizontal. */
const STEPPER_CONDITIONS = { ...CONDITIONS, wide: "(min-width: 80rem)" };

const REST = { clearProps: "opacity,transform,transformOrigin" };

/**
 * The tournament hero's render: arrives from the right and settles, as the
 * character heroes' figures do. Not scroll-triggered - the hero is in view on
 * arrival, so it plays once on mount.
 */
const heroFigure: SceneBuilder = (gsap, _q, root) => {
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    if ((ctx.conditions as Media).reduced) {
      gsap.set(root, REST);
      return;
    }
    gsap.from(root, { opacity: 0, x: 40, scale: 1.05, duration: 1.3, ease: "power2.out", ...REST });
  });
};

/** The facts strip: each fact rises in turn as the strip comes up. */
const facts: SceneBuilder = (gsap, q, root) => {
  const items = q("[data-fact]");
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    if ((ctx.conditions as Media).reduced) {
      gsap.set(items, REST);
      return;
    }
    gsap.from(items, {
      y: 18,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: root, start: "top 88%", once: true },
      ...REST,
    });
  });
};

/**
 * The journey: stages rise one after another and the link between each pair
 * draws itself from the stage before - along the row at `xl`, down the column
 * below it.
 */
const stepper: SceneBuilder = (gsap, q, root) => {
  const stages = q("[data-stage]");
  const links = q("[data-link]");
  gsap.matchMedia().add(STEPPER_CONDITIONS, (ctx) => {
    const { reduced, wide } = ctx.conditions as Media;
    if (reduced) {
      gsap.set([stages, links], REST);
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", ...REST },
      scrollTrigger: { trigger: root, start: "top 80%", once: true },
    });
    tl.from(stages, { y: 22, opacity: 0, duration: 0.65, stagger: 0.14 }).from(
      links,
      wide
        ? { scaleX: 0, transformOrigin: "left center", duration: 0.45, stagger: 0.14 }
        : { scaleY: 0, transformOrigin: "center top", duration: 0.45, stagger: 0.14 },
      0.3,
    );
  });
};

/** CURRENT MATCHUPS: the cards rise in turn. */
const matchups: SceneBuilder = (gsap, q, root) => {
  const cards = q("[data-match]");
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    if ((ctx.conditions as Media).reduced) {
      gsap.set(cards, REST);
      return;
    }
    gsap.from(cards, {
      y: 30,
      opacity: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: root, start: "top 80%", once: true },
      ...REST,
    });
  });
};

/**
 * The four figures: the cards rise and each number counts up to its value -
 * a figure that arrives at 128 reads as a figure, one that is simply printed
 * reads as a label. Counted through a proxy so the text can be grouped the
 * way the page groups every other number.
 */
const stats: SceneBuilder = (gsap, q, root) => {
  const cards = q("[data-stat]");
  const counts = q("[data-count]") as HTMLElement[];
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    if ((ctx.conditions as Media).reduced) {
      gsap.set(cards, REST);
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: root, start: "top 82%", once: true },
    });
    tl.from(cards, { y: 26, opacity: 0, duration: 0.7, stagger: 0.1, ...REST });
    counts.forEach((el, i) => {
      const target = Number(el.dataset.count);
      if (!Number.isFinite(target)) return;
      const proxy = { value: 0 };
      const format = new Intl.NumberFormat("en-NG");
      tl.to(
        proxy,
        {
          value: target,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = format.format(Math.round(proxy.value));
          },
        },
        0.15 + i * 0.1,
      );
    });
  });
};

/**
 * The bracket, round by round: a round's cards rise, then the lines out of
 * them draw across the gutter, meet, and run on into the round they decide -
 * so the tree grows the way a tournament does. The same tree at every width;
 * on a phone only the first round is in view and the rest plays into the
 * scroll.
 */
const bracket: SceneBuilder = (gsap, q, root) => {
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    const { reduced } = ctx.conditions as Media;
    const everything = q("[data-bracket-card], [data-stub], [data-bus]");
    if (reduced) {
      gsap.set(everything, REST);
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", ...REST },
      scrollTrigger: { trigger: root, start: "top 75%", once: true },
    });

    const rounds = q("[data-round]").length;
    for (let r = 0; r < rounds; r += 1) {
      const cards = q(`[data-round="${r}"] [data-bracket-card]`);
      tl.from(cards, { y: 24, opacity: 0, duration: 0.6, stagger: 0.06 }, r ? "-=0.25" : 0);
      if (r === rounds - 1) break;
      const gutter = `[data-gutter="${r}"]`;
      tl.from(q(`${gutter} [data-stub="out"]`), { scaleX: 0, transformOrigin: "left center", duration: 0.35, stagger: 0.04 }, "-=0.3")
        .from(q(`${gutter} [data-bus]`), { scaleY: 0, transformOrigin: "center top", duration: 0.35, stagger: 0.04 }, "-=0.2")
        .from(q(`${gutter} [data-stub="in"]`), { scaleX: 0, transformOrigin: "left center", duration: 0.3, stagger: 0.04 }, "-=0.2");
    }
  });
};

/**
 * The podium: the three blocks rise from the ground - the edges first, the
 * gold in the middle last and highest - the portraits drop onto them and the
 * points chips snap in. The phone's stacked cards rise in rank order.
 */
const podium: SceneBuilder = (gsap, q, root) => {
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    const { reduced, wide } = ctx.conditions as Media;
    const everything = q("[data-podium-block], [data-podium-portrait], [data-podium-name], [data-podium-chip], [data-podium-card]");
    if (reduced) {
      gsap.set(everything, REST);
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", ...REST },
      scrollTrigger: { trigger: root, start: "top 80%", once: true },
    });
    if (!wide) {
      tl.from(q("[data-podium-card]"), { y: 28, opacity: 0, duration: 0.7, stagger: 0.12 });
      return;
    }
    tl.from(q("[data-podium-block]"), {
      scaleY: 0,
      transformOrigin: "center bottom",
      duration: 0.8,
      stagger: { each: 0.14, from: "edges" },
    })
      .from(q("[data-podium-portrait]"), { y: -28, opacity: 0, duration: 0.7, stagger: { each: 0.14, from: "edges" } }, 0.25)
      .from(q("[data-podium-name]"), { y: 12, opacity: 0, duration: 0.6, stagger: { each: 0.14, from: "edges" } }, 0.4)
      .from(q("[data-podium-chip]"), { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)", stagger: { each: 0.14, from: "edges" } }, 0.55);
  });
};

/** The table: rows arrive one after another. */
const board: SceneBuilder = (gsap, q, root) => {
  const rows = q("[data-row]");
  gsap.matchMedia().add(CONDITIONS, (ctx) => {
    if ((ctx.conditions as Media).reduced) {
      gsap.set(rows, REST);
      return;
    }
    gsap.from(rows, {
      y: 14,
      opacity: 0,
      duration: 0.55,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: { trigger: root, start: "top 85%", once: true },
      ...REST,
    });
  });
};

export const COMPETITION_SCENES = {
  heroFigure,
  facts,
  stepper,
  matchups,
  stats,
  bracket,
  podium,
  board,
} satisfies Record<string, SceneBuilder>;

export type CompetitionScene = keyof typeof COMPETITION_SCENES;
