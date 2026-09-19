"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { useGateEntry } from "@/components/gates/GateEntry";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import { getLenis } from "@/lib/animation/lenis";
import type { GateId } from "@/lib/gates";

/**
 * The gate pull-up, the way Thorgal does it.
 *
 * AT REST THE FOOT IS THE FRAME. The page ends on the next gate's name ghosted
 * across a seam, with a strip of that gate's plate showing beneath it — 237px
 * of it at 1440, 135 on the phone frame — and ordinary scrolling stops there.
 * Nothing moves on its own.
 *
 * THE PULL IS THE VISITOR'S. Scrolling on, once the page has nothing left to
 * give, starts to draw the next gate up over this one — not one-to-one with the
 * wheel, but as if something were drawing it up and it were heavy: each notch
 * adds to a target the sheet eases towards, so it lags the hand and keeps
 * moving a moment after it. Stop, and it settles back down to the seam. Keep
 * going past the point of no return (`THRESHOLD`), and it draws itself the rest
 * of the way and the route changes underneath it, invisibly.
 *
 * HOW THE SHEET IS IN TWO PLACES AT ONCE. At rest it is absolutely positioned
 * in the strip, top-aligned, its lower two-thirds clipped by the strip
 * (`overflow: clip`, which also keeps a viewport-tall element from lengthening
 * the page). The moment a pull begins it is switched to `position: fixed` and
 * translated to exactly where it already appears — the strip's top at the foot
 * of a fully scrolled viewport — so the switch is invisible, and from there the
 * translate carries it up over the outgoing page, which holds still underneath
 * because the page is not scrolling at all while it pulls. A fixed element
 * escapes an ancestor's clip, which is the whole trick. (The outgoing section
 * used to be `sticky` so a viewport-tall panel could ride over it in flow;
 * with a 237px strip in flow, sticky would shove the section down over the
 * strip and bury the scroll cue, so it is plain flow now.)
 *
 * THE PAGE HOLDS STILL WHILE IT PULLS. Lenis is asked to stop for the length of
 * the pull and started again when the sheet settles or the route changes;
 * scrolling back during a pull lowers the sheet first, and only once it is
 * down does the page scroll again.
 *
 * THE ARCH is an elliptical radius across the full width, `50% 50% 0 0 / 12%
 * 12% 0 0`, with the vertical component going 12% -> 0 as the sheet rises — a
 * dome, not two corners. The seam title fades out by 30% of the rise, before
 * the gate's own title arrives, so the name is never on screen twice.
 *
 * THE PREVIEW IS THE REAL COMPONENT — the same `GateSection` the next route
 * paints, built by the page with the same props. Rebuilding the hero by hand
 * would guarantee a visible snap at the swap. It is `inert`: its CTA, cue and
 * chip must not be reachable while it is scenery.
 *
 * REDUCED MOTION gets none of this: the foot as drawn, still, and the cue above
 * it is a plain link with an instant route change.
 */
export function GateCurtain({
  children,
  preview,
  href,
  title,
  gate,
}: {
  /** The outgoing page's last section; the sheet rides over it while it holds still. */
  children: ReactNode;
  /** What rises — the next gate's door (`gatePreview`) or the next page's first section. */
  preview: ReactNode;
  /** The route pushed under cover: the portal (`/en`) for a door, or a page's own path. */
  href: string;
  /** The next gate's name, ghosted across the seam. */
  title: string;
  /**
   * The door the portal should stand at on arrival. Named BEFORE the push (see
   * GateEntry.seedGate) so the home route paints that gate on its first render
   * — the same `GateSection` the sheet is already showing. Omit when `href` is
   * a page: pages paint themselves.
   */
  gate?: GateId;
}) {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { claim, busy } = usePageTransition();
  const { seedGate } = useGateEntry();

  // Written in an effect, never during render: the scene is built once and its
  // listeners outlive every later render, so they must not close over the first
  // render's router.
  const swap = useRef<() => void>(() => {});
  useEffect(() => {
    swap.current = () => {
      // If the tear already owns the screen, this does nothing — the visitor
      // gets one transition, not two.
      const release = claim();
      if (!release) return;

      // SEEDED BEFORE THE PUSH, so the portal paints this door on its first
      // render rather than the entry screen for a frame.
      if (gate) seedGate(gate);

      // `scroll: false` stops Next restoring a scroll position, then the jump to
      // the top happens while the sheet still covers everything, so the new
      // route paints exactly what is already on screen. Through Lenis where it
      // runs — it was stopped for the pull, and `force` is how a stopped Lenis
      // is moved — and started again for the page that is arriving.
      router.push(href, { scroll: false });
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.start();
      } else {
        window.scrollTo(0, 0);
      }
      // Released on the next frame, once the push has been handed to React.
      requestAnimationFrame(() => release());
    };
  }, [claim, router, href, gate, seedGate]);

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
          if (!motion) {
            gsap.set([sheet, seam].filter(Boolean) as HTMLElement[], { clearProps: "all" });
            return;
          }

          /** The distance the sheet travels: from the strip's top to the viewport's. */
          const travel = () => window.innerHeight - host.getBoundingClientRect().height;
          /** Scrolled as far as the page goes, within a couple of pixels of Lenis's settling. */
          const atFoot = () =>
            window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

          // `target` is where the hand has asked the sheet to be; `shown` is where
          // it is, easing towards `target`. The gap between them is the weight.
          let target = 0;
          const shown = { p: 0 };
          let active = false;
          let completing = false;
          let releaseTimer = 0;

          const paint = () => {
            // Heavy at first, quick at the end: a curve rather than a line.
            const eased = shown.p ** 1.4;
            gsap.set(sheet, {
              y: travel() * (1 - eased),
              "--arch": `${12 * (1 - eased)}%`,
            });
            if (seam) gsap.set(seam, { opacity: Math.max(0, 1 - shown.p / 0.3) });
          };

          const follow = (to: number, duration: number, ease: string, onComplete?: () => void) =>
            gsap.to(shown, { p: to, duration, ease, overwrite: true, onUpdate: paint, onComplete });

          /** Switch the sheet from its place in the strip to the viewport. Same pixels. */
          const lift = () => {
            active = true;
            getLenis()?.stop();
            gsap.set(sheet, { position: "fixed", top: 0, left: 0, width: "100%", zIndex: 30 });
            paint();
          };

          /** Put it back in the strip and let the page scroll again. */
          const settle = () => {
            active = false;
            target = 0;
            gsap.set(sheet, { clearProps: "position,top,left,width,zIndex,transform" });
            // Back to inheriting the strip's resting 12%.
            sheet.style.removeProperty("--arch");
            if (seam) gsap.set(seam, { clearProps: "opacity" });
            getLenis()?.start();
          };

          const complete = () => {
            completing = true;
            window.clearTimeout(releaseTimer);
            follow(1, 0.55, "power2.in", () => {
              // A tear mid-flight owns the screen; leave it alone and come back down.
              if (busy()) {
                completing = false;
                follow(0, 0.6, "power3.out", settle);
                return;
              }
              swap.current();
            });
          };

          /** The hand has stopped: past the point of no return it finishes, short of it it settles. */
          const release = () => {
            if (!active || completing) return;
            if (target >= THRESHOLD) complete();
            else follow(0, 0.7, "power3.out", settle);
          };

          /** One increment of pull, in pixels of scroll intent. Positive pulls up. */
          const nudge = (delta: number) => {
            if (completing) return;
            if (!active) {
              if (delta <= 0 || !atFoot()) return;
              lift();
            }
            target = Math.min(1, Math.max(0, target + delta / (travel() * GAIN)));
            window.clearTimeout(releaseTimer);
            if (target >= 1) {
              complete();
              return;
            }
            if (target === 0) {
              // Pulled back all the way: down at once, and the page is free again.
              follow(0, 0.35, "power2.out", settle);
              return;
            }
            follow(target, 0.45, "power2.out");
            releaseTimer = window.setTimeout(release, 180);
          };

          const onWheel = (event: WheelEvent) => {
            // A wheel inside a dialog or another scroller is theirs, not a pull.
            if ((event.target as Element | null)?.closest?.("[role='dialog'], [data-lenis-prevent]")) return;
            const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1;
            nudge(event.deltaY * unit);
          };

          let touchY: number | null = null;
          const onTouchStart = (event: TouchEvent) => {
            touchY = event.touches[0]?.clientY ?? null;
            window.clearTimeout(releaseTimer);
          };
          const onTouchMove = (event: TouchEvent) => {
            const y = event.touches[0]?.clientY;
            if (y === undefined || touchY === null) return;
            // A finger moving up the screen is a pull up; touch is quicker than a wheel.
            nudge((touchY - y) * TOUCH_GAIN);
            touchY = y;
          };
          const onTouchEnd = () => {
            touchY = null;
            window.clearTimeout(releaseTimer);
            release();
          };

          window.addEventListener("wheel", onWheel, { passive: true });
          window.addEventListener("touchstart", onTouchStart, { passive: true });
          window.addEventListener("touchmove", onTouchMove, { passive: true });
          window.addEventListener("touchend", onTouchEnd, { passive: true });
          window.addEventListener("touchcancel", onTouchEnd, { passive: true });

          return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
            window.clearTimeout(releaseTimer);
            // If the page goes while a pull is in flight, do not leave Lenis stopped.
            if (active) getLenis()?.start();
          };
        },
      );
    },
    [busy],
  );

  useGsapScene(root, scene);

  return (
    <>
      {children}

      {/* THE FOOT: the strip of the next gate the frames show at rest — 237px at
          1440, 135 on the phone frame. `overflow-clip` clips the viewport-tall
          sheet to it AND keeps it out of the page's scrollable height; a fixed
          sheet escapes the clip, which is what the pull relies on.

          `--arch` is declared here with a value so GSAP can tween it: an
          unregistered custom property has no type and would interpolate as a
          string. Resting at 12% draws the dome on the strip as the frame does. */}
      <div
        ref={root}
        data-pullup
        style={{ "--arch": "12%" } as React.CSSProperties}
        className="relative h-[8.4375rem] lg:h-[14.8125rem]"
      >
        {/* The clip is its own box so the seam title beside it, which straddles
            the strip's top edge, is not cut in half. */}
        <div className="absolute inset-0 overflow-clip">
          <div
            data-pullup-sheet
            className="absolute top-0 left-0 h-dvh w-full overflow-hidden [border-radius:50%_50%_0_0/var(--arch)_var(--arch)_0_0]"
          >
            {/* The next gate's own hero, inert. */}
            <div inert className="pointer-events-none absolute inset-0 select-none">
              {preview}
            </div>
          </div>
        </div>

        {/* THE SEAM TITLE. The frame ghosts the next gate's name large across the
            join — measured cap 152, ink `--color-menu-fg` at 80% (it reads
            rgb(197,197,197) on black and rgb(218,220,221) on the plate, which no
            flat colour does). At a negative offset so it straddles the sheet's
            top edge exactly as the frame draws it: cap top 67px above the plate
            line, the rest below. It goes with the seam — gone by 30% of the
            rise, before the gate's own title arrives — because the preview is
            the real `GateSection` and renders that title itself.

            The chevron and SCROLL TO GO NEXT that complete the seam are rendered
            by the outgoing page's last section, measured to their own frame
            positions, so they are not repeated here. */}
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

/**
 * How much scroll a full pull takes, in multiples of the sheet's travel: 1.1
 * travels of wheel (about four notches on a 900px screen) to the top. The
 * point of no return is a little under half way — enough that a stray notch
 * settles back, and a second one commits.
 */
const GAIN = 1.1;
const THRESHOLD = 0.45;
/** A finger covers less ground than a wheel; weight it up so a swipe commits. */
const TOUCH_GAIN = 1.6;
