"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { useGateEntry } from "@/components/gates/GateEntry";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import { getLenis } from "@/lib/animation/lenis";
import type { GateId } from "@/lib/gates";


export function GateCurtain({
  children,
  preview,
  href,
  title,
  gate,
}: {
  /** The outgoing page's last section; the sheet rides over it. */
  children: ReactNode;
  /** What rises - the next gate's door (`gatePreview`) or the next page's first section. */
  preview: ReactNode;
  /** The route pushed under cover: the portal (`/en`) for a door, or a page's own path. */
  href: string;
  /** The next gate's name, ghosted across the seam. */
  title: string;
  /**
   * The door the portal should stand at on arrival. Named BEFORE the push (see
   * GateEntry.seedGate) so the home route paints that gate on its first render
   * - the same `GateSection` the sheet is already showing. Omit when `href` is
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
      // If the tear already owns the screen, this does nothing - the visitor
      // gets one transition, not two.
      const release = claim();
      if (!release) return;

      // SEEDED BEFORE THE PUSH, so the portal paints this door on its first
      // render rather than the entry screen for a frame.
      if (gate) seedGate(gate);

      // `scroll: false` stops Next restoring a scroll position, then the jump to
      // the top happens while the sheet still covers everything, so the new
      // route paints exactly what is already on screen. Through Lenis where it
      // runs - it was stopped for the sweep, and `force` is how a stopped Lenis
      // is moved - and started again for the page that is arriving.
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
      const plate = q("[data-pullup-plate]")[0] as HTMLElement | undefined;
      const seam = q("[data-pullup-seam]")[0] as HTMLElement | undefined;
      if (!sheet || !plate) return;

      gsap.matchMedia().add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { motion } = context.conditions as { motion: boolean };
          if (!motion) {
            gsap.set([sheet, plate, seam].filter(Boolean) as HTMLElement[], { clearProps: "all" });
            return;
          }

          /** Near enough the end of the page that further scrolling is a pull. */
          const atFoot = () =>
            window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - FOOT_ZONE;
          const threshold = () => (window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_THRESHOLD : THRESHOLD);
          /** Where the strip's top edge is on screen right now. */
          const stripTop = () => host.getBoundingClientRect().top;
          /** An arc value as px of crown rise. */
          const crown = (arc: number) => Math.max(0, arc) * ARC_HEIGHT * window.innerHeight;
          const sweepEase = gsap.parseEase("power1.inOut");

          let arc = 0;
          let active = false;
          let completing = false;
          let idleFrames = -1;
          let springVelocity = 0;
          let springing = false;

          /**
           * Draw the sheet with its straight edge at `edge` px from the top of
           * the viewport and its crown `rise` px above that.
           *
           * The box grows UPWARD by `room` - the tallest the crown can ever be -
           * so the crown always has somewhere to go while the box's bottom stays
           * on the viewport's bottom (growing it by moving it up would lift its
           * bottom and show the page beneath mid-sweep). The plate is pinned
           * `room` down inside it, so it stays exactly viewport-sized. The clip
           * is half an ellipse, `w / 2` across and `rise` tall: it leaves the
           * screen's sides steeply and rounds over the top, so it reads as a
           * dome. The parabola it replaced (2026-10-03) left the sides at a
           * shallow angle and, across a 1440 screen, read as a flat line.
           *
           * The plate lifts by pi/4 of the rise - the half-ellipse's average -
           * but never more than the edge is from the top, or its foot would
           * clear the viewport's bottom at the end of the sweep.
           */
          const draw = (edge: number, rise: number) => {
            const room = crown(ARC_MAX);
            gsap.set(sheet, { y: edge - room, height: `calc(100dvh + ${room}px)` });
            const w = sheet.offsetWidth;
            const h = sheet.offsetHeight;
            gsap.set(sheet, {
              clipPath: `path("M0 ${room} A ${w / 2} ${rise} 0 0 1 ${w} ${room} L ${w} ${h} L 0 ${h} Z")`,
            });
            gsap.set(plate, { top: room, y: -Math.min((Math.PI / 4) * rise, Math.max(0, edge)) });
          };

          /** Every frame of a pull: glue the sheet to the strip, count idle frames, run the spring. */
          const tick = () => {
            if (!active || completing) return;

            if (springing) {
              // Semi-implicit Euler in four sub-steps; stiff springs need them.
              const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 30) / 4;
              for (let i = 0; i < 4; i++) {
                const force = -SPRING.stiffness * arc - SPRING.damping * springVelocity;
                springVelocity += (force / SPRING.mass) * dt;
                arc += springVelocity * dt;
              }
              if (Math.abs(arc) < 0.0005 && Math.abs(springVelocity) < 0.01) {
                settle();
                return;
              }
            } else if (idleFrames >= 0 && ++idleFrames > IDLE_FRAMES) {
              // The hand has let go. Motion values report no velocity after a
              // pause this long, so the spring starts from rest.
              springing = true;
              springVelocity = 0;
            }

            draw(stripTop(), crown(arc));
          };

          /** Switch the sheet from its place in the strip to the viewport. Same pixels. */
          const lift = () => {
            active = true;
            gsap.set(sheet, { position: "fixed", top: 0, left: 0, width: "100%", zIndex: 30 });
            // The seam title straddles the edge; keep it over the fixed sheet.
            if (seam) gsap.set(seam, { zIndex: 31 });
            gsap.ticker.add(tick);
          };

          /** Put it back in the strip. */
          const settle = () => {
            gsap.ticker.remove(tick);
            active = false;
            springing = false;
            idleFrames = -1;
            arc = 0;
            gsap.set(sheet, { clearProps: "position,top,left,width,height,zIndex,transform,clipPath" });
            gsap.set(plate, { clearProps: "top,transform" });
            if (seam) gsap.set(seam, { clearProps: "opacity,zIndex" });
          };

          const complete = () => {
            completing = true;
            gsap.ticker.remove(tick);
            // The page holds still under the sweep so the swap lands on scroll 0.
            getLenis()?.stop();

            const fromArc = arc;
            const fromEdge = stripTop();
            const sweep = { t: 0 };

            const tween = gsap.to(sweep, {
              t: 1,
              duration: SWEEP,
              ease: "none",
              onUpdate: () => {
                const t = sweep.t;
                // The pull's arc hands over to the sweep's, which peaks at
                // ARC_MAX mid-travel and is gone on arrival.
                const sweepArc = Math.max(fromArc * (1 - t) ** 2, Math.sin(t * Math.PI) * ARC_MAX);
                draw(fromEdge * (1 - sweepEase(t)), crown(sweepArc));
                // The seam title goes before the gate's own title arrives.
                if (seam) gsap.set(seam, { opacity: Math.max(0, 1 - t / 0.3) });
              },
              onComplete: () => {
                // A tear mid-flight owns the screen; leave it alone and come back down.
                if (busy()) {
                  tween.reverse();
                  return;
                }
                swap.current();
              },
              onReverseComplete: () => {
                completing = false;
                getLenis()?.start();
                springing = true;
                springVelocity = 0;
                gsap.ticker.add(tick);
              },
            });
          };

          /** One increment of pull, in px of scroll intent. Only a pull down the page counts. */
          const nudge = (delta: number) => {
            if (completing || delta <= 0) return;
            if (!active) {
              if (!atFoot() || busy()) return;
              lift();
            }
            springing = false;
            idleFrames = 0;
            // Rubber band: the further it is stretched, the less each push counts.
            arc = Math.min(ARC_MAX, arc + delta * SENSITIVITY * (1 - arc / ARC_MAX));
            draw(stripTop(), crown(arc));
            if (arc >= threshold()) complete();
          };

          const onWheel = (event: WheelEvent) => {
            // A wheel inside a dialog or another scroller is theirs, not a pull.
            if ((event.target as Element | null)?.closest?.("[role='dialog'], [data-lenis-prevent]")) return;
            // Line and page modes (Firefox) normalised to px.
            const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1;
            if (atFoot() || active) nudge(event.deltaY * unit);
          };

          let touchY = 0;
          const onTouchStart = (event: TouchEvent) => {
            touchY = event.touches[0]?.clientY ?? 0;
          };
          const onTouchMove = (event: TouchEvent) => {
            const y = event.touches[0]?.clientY;
            if (y === undefined) return;
            // A finger moving up the screen is a pull up.
            const delta = touchY - y;
            touchY = y;
            if (atFoot() || active) nudge(delta);
          };

          window.addEventListener("wheel", onWheel, { passive: true });
          window.addEventListener("touchstart", onTouchStart, { passive: true });
          window.addEventListener("touchmove", onTouchMove, { passive: true });

          return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            gsap.ticker.remove(tick);
            // If the page goes mid-sweep, do not leave Lenis stopped.
            if (completing) getLenis()?.start();
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

      {/* THE FOOT: the strip of the next gate the frames show at rest - 237px at
          1440, 135 on the phone frame. `overflow-clip` clips the viewport-tall
          sheet to it AND keeps it out of the page's scrollable height; a fixed
          sheet escapes the clip, which is what the pull relies on. The top edge
          is straight at rest; the scene draws the arch with a clip-path. */}
      <div ref={root} data-pullup className="relative h-[8.4375rem] lg:h-[14.8125rem]">
        {/* The clip is its own box so the seam title beside it, which straddles
            the strip's top edge, is not cut in half. */}
        <div className="absolute inset-0 overflow-clip">
          <div data-pullup-sheet className="absolute top-0 left-0 h-dvh w-full overflow-hidden">
            {/* The next gate's own hero, inert. */}
            <div data-pullup-plate inert className="pointer-events-none absolute inset-0 select-none">
              {preview}
            </div>
          </div>
        </div>

        {/* THE SEAM TITLE. The frame ghosts the next gate's name large across the
            join - measured cap 152, ink `--color-menu-fg` at 80% (it reads
            rgb(197,197,197) on black and rgb(218,220,221) on the plate, which no
            flat colour does). At a negative offset so it straddles the sheet's
            top edge exactly as the frame draws it: cap top 67px above the plate
            line, the rest below. It stays through the pull and goes early in the
            sweep, before the gate's own title arrives, because the preview is
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

/* Thorgal's values, from its bundle. */

/** How close to the end of the page counts as "at the bottom", in px. */
const FOOT_ZONE = 50;
/** `arc` gained per px of wheel or finger travel, before the rubber-band falloff. */
const SENSITIVITY = 0.001;
/** The ceiling `arc` stretches towards, and the sweep's peak. */
const ARC_MAX = 1.5;
/**
 * Crown rise per unit of `arc`, as a share of viewport height. Thorgal's is
 * 0.075 (0.05 of a canvas padded to 1.5 viewports); raised on request
 * (2026-09-26) so the arch reads clearly before it commits - about 115px at
 * the desktop threshold on a 900px screen, rather than Thorgal's ~47px.
 */
const ARC_HEIGHT = 0.18;
/** `arc` that commits to the next gate: desktop, and below `MOBILE_BREAKPOINT`. */
const THRESHOLD = 0.7;
const MOBILE_THRESHOLD = 0.3;
const MOBILE_BREAKPOINT = 768;
/** Frames without a pull before it lets go. */
const IDLE_FRAMES = 6;
/** The spring it lets go on. */
const SPRING = { stiffness: 300, damping: 25, mass: 0.8 };
/** Seconds for the sweep up over the page. */
const SWEEP = 0.7;
