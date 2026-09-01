"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { usePageTransition } from "@/components/transition/TransitionProvider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";

/**
 * The gate pull-up. Scrolling past the end of a gate page draws the next gate's
 * hero up over it; when it covers the viewport the route changes invisibly.
 * Spec: `context/current-feature.md`.
 *
 * THE STRUCTURE IS THE ANIMATION. The outgoing page's last section is
 * `sticky top-0` and the panel follows it in normal flow, so ordinary scrolling
 * already slides the panel up over a section that holds still. No transform is
 * needed for the travel itself.
 *
 * WHICH IS WHY THE `y` TWEEN THE SPEC LISTS IS NOT HERE, and that is the one
 * deliberate departure. Step 2 asks for `y` 100% -> 0 AND the radius on one
 * scrub. With this structure flow already supplies exactly that travel; adding
 * the transform on top would move the panel twice as fast as the scroll and it
 * would arrive at the swap while the page was still half a viewport short. The
 * radius is scrubbed, the travel is flow, and the two stay in step because the
 * trigger measures the panel's own progress.
 *
 * THE ARCH IS AN ELLIPTICAL RADIUS, NOT A CORNER ROUNDING. A dome across the
 * full width, `50% 50% 0 0 / 12% 12% 0 0`, with only the VERTICAL component
 * animated 12% -> 0. The horizontal stays at 50% throughout, which is what keeps
 * the curve a single arc from edge to edge instead of two corners.
 *
 * THE PREVIEW IS THE REAL COMPONENT. `preview` is the same `GateSection` the
 * next route paints, built by the page with the same props. Rebuilding the hero
 * by hand is the one thing guaranteed to produce a visible snap at the swap.
 *
 * IT IS INERT. The preview carries a live CTA, a cue link and a chip; none of
 * them should be reachable while it is scenery, and its CTA would otherwise read
 * `[data-gate-content]` from the page it is sitting on and open THAT. `inert`
 * takes it out of the tab order and out of the accessibility tree at once.
 */
export function GateCurtain({
  children,
  preview,
  href,
  title,
}: {
  /** The outgoing page's last section. Made sticky so the panel rides over it. */
  children: ReactNode;
  /** The next gate's hero — the same component that route renders. */
  preview: ReactNode;
  href: string;
  /** The next gate's name, ghosted across the seam. */
  title: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { claim, busy } = usePageTransition();

  // Written in an effect, never during render: the scene is built once and its
  // ScrollTrigger outlives every later render, so it must not close over the
  // first render's router.
  const swap = useRef<() => void>(() => {});
  useEffect(() => {
    swap.current = () => {
      // STEP 5. If the tear already owns the screen, this does nothing — the
      // visitor gets one transition, not two.
      const release = claim();
      if (!release) return;

      // STEP 4. `scroll: false` stops Next restoring a scroll position, then the
      // jump to the top happens while the panel still covers everything, so the
      // new route paints exactly what is already on screen.
      router.push(href, { scroll: false });
      window.scrollTo(0, 0);
      // Released on the next frame, once the push has been handed to React.
      requestAnimationFrame(() => release());
    };
  }, [claim, router, href]);

  const scene = useCallback<SceneBuilder>(
    (gsap, q, host) => {
      const sheet = q("[data-pullup-sheet]")[0] as HTMLElement | undefined;
      const seam = q("[data-pullup-seam]")[0] as HTMLElement | undefined;
      if (!sheet) return;

      gsap.matchMedia().add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { motion } = context.conditions as { motion: boolean };

          // STEP 6. Reduced motion gets no scrub at all — not a shortened one,
          // which would be a jarring flash. The seam stays visible and the cue
          // above it is a plain link with an instant route change.
          if (!motion) {
            gsap.set([sheet, seam].filter(Boolean) as HTMLElement[], {
              clearProps: "all",
            });
            return;
          }

          let pushed = false;

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: host,
              // The panel's own travel: from the moment its top enters the
              // viewport to the moment it is flush with the top.
              start: "top bottom",
              end: "top top",
              // `1`, not `true`. The smoothing lag stops the arch feeling glued
              // to the scrollbar on a trackpad flick.
              scrub: 1,
              invalidateOnRefresh: true,
              onLeave: (self) => {
                // Progress 1, scrolling down, once. A flick can cross the
                // threshold more than once; the latch keeps the push single.
                if (pushed || self.direction !== 1) return;
                // A tear mid-flight owns the screen. Leave it alone.
                if (busy()) return;
                pushed = true;
                swap.current();
              },
            },
          });

          // The arch, across the whole travel.
          timeline.fromTo(
            sheet,
            { "--arch": "12%" },
            { "--arch": "0%", ease: "none", duration: 1 },
            0,
          );
          // The seam title, gone by 30% — before the gate.s own title arrives, so
        // the two never read as one word printed twice.
          if (seam)
            timeline.to(seam, { opacity: 0, ease: "none", duration: 0.3 }, 0);
        },
      );
    },
    [busy],
  );

  useGsapScene(root, scene);

  return (
    <>
      {/* The outgoing page holds still while the panel rides over it. Sticky
          rather than a ScrollTrigger pin: it is one declaration, it cannot
          desync from the scroller, and it needs no pin-spacer in the flow. */}
      <div className="sticky top-0">{children}</div>

      {/* `--arch` is the vertical radius component. Declaring it here with an
          initial value is what lets GSAP tween it: an unregistered custom
          property has no type, so it interpolates as a string and jumps. The
          resting 0% also means that with no JS the panel is simply square —
          correct, just without the arch. */}
      <div
        ref={root}
        data-pullup
        style={{ "--arch": "0%" } as React.CSSProperties}
        className="relative h-dvh"
      >
        <div
          data-pullup-sheet
          className="relative h-full w-full overflow-hidden [border-radius:50%_50%_0_0/var(--arch)_var(--arch)_0_0]"
        >
          {/* The next gate's own hero, inert. */}
          <div
            // @ts-expect-error — `inert` is a valid attribute; React's types
            // only added it in 19 and this project is on 18's JSX namespace.
            inert=""
            className="pointer-events-none absolute inset-0 select-none"
          >
            {preview}
          </div>
        </div>

        {/* THE SEAM TITLE. The frame ghosts the next gate's name large across the
            join — measured cap 152, ink `--color-menu-fg` at 80% (it reads
            rgb(197,197,197) on black and rgb(218,220,221) on the plate, which no
            flat colour does).

            OUTSIDE THE SHEET, so the arch's `overflow-hidden` does not clip it,
            and at a negative offset so it straddles the panel's top edge exactly
            as the frame draws it: cap top 67px above the plate line, the rest
            below.

            IT FADES, AND THAT IS A DEPARTURE WORTH NAMING. The spec does not
            mention fading it, but the preview is the real `GateSection` and that
            renders the gate's OWN title — so once the panel is up, the same words
            were on screen twice at two sizes. The seam title belongs to the seam,
            which is a moment rather than a place, so it goes when the seam does.
            Gone by 45% of the travel, well before the gate's own title arrives.

            The chevron and SCROLL TO GO NEXT that complete the seam are already
            rendered by the outgoing page's last section, measured to their own
            frame positions, so they are not repeated here. */}
        <h2
          data-pullup-seam
          aria-hidden
          className="font-display text-menu-fg/80 pointer-events-none absolute inset-x-0 -top-16.75 text-center text-[clamp(4rem,16.6vw,14.9375rem)] leading-none font-semibold tracking-[-0.062em] uppercase"
        >
          {title}
        </h2>
      </div>
    </>
  );
}
