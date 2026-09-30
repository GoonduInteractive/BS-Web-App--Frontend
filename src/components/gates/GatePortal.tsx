"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";

import { useGateEntry, type GateStep } from "@/components/gates/GateEntry";
import { GateRiseTear, type GateRiseTearHandle } from "@/components/gates/GateRiseTear";
import { GateSection } from "@/components/gates/GateSection";
import { useGateScroll } from "@/components/gates/useGateScroll";
import { usePageTransition } from "@/components/transition/TransitionProvider";
import { gateHref, getGate, nextGate, type GateId } from "@/lib/gates";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";

/**
 * The home route's two faces: the entry screen, then the gate the visitor is
 * standing at. `/en` is the portal - ENTER opens onto Ọnụ Ụzọ 1, the cues and
 * the rail move between the four doors, and the URL never changes until a
 * door's CTA takes you through to its page. See `GateEntry`.
 *
 * The entry screen is server-rendered and passed in whole, so the landing
 * page's HTML is the entry screen; the gates paint on the client, after a
 * choice, from the same manifest and copy the pull-up previews use.
 *
 * THE GATE RISE. A scroll, swipe or arrow key between doors shows the way
 * (after Thorgal's door-to-door move), in two beats:
 *
 * 1. RED RISES. Down, a red sheet rises from below with the pull-up's arched
 *    leading edge, torn (`GateRiseTear`), flattening as it covers the screen;
 *    up, it comes down from above, arched the other way. The door being left
 *    sinks back under it - smaller, darker, drifting against the move. The
 *    rail has already lit the destination.
 * 2. RED SPLITS. At full cover the site's own classic tear takes over (same
 *    ember, so the handover cannot be seen), the next door is swapped in
 *    underneath, and the red tears apart left and right to reveal it. Its chip
 *    and title arrive as the red parts.
 *
 * Clicks (rail, cue, menu) keep the plain tear. Both hold the same lock, so
 * only one ever runs.
 *
 * The red sheet sits at z-50 like the tear, over the header, because Design
 * put the header behind the tear and this is the tear.
 *
 * DURING A RISE BOTH DOORS ARE MOUNTED, as layers keyed by gate id. The
 * incoming one is the same element before, during and after - hidden until the
 * red covers the screen - so it is never remounted when the move ends: no
 * image reload, no restarted Ken Burns. The outgoing one simply leaves the list.
 */
export function GatePortal({ entry, locale, gates }: { entry: ReactNode; locale: Locale; gates: Messages["gates"] }) {
  const { shown, step, endStep } = useGateEntry();
  const { wipeOpen } = usePageTransition();
  const incoming = useRef<HTMLDivElement>(null);
  const outgoing = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const tear = useRef<GateRiseTearHandle>(null);
  // Scroll, swipe or arrow keys move between the doors; idle on the entry screen.
  useGateScroll(shown);
  useGateRise(step, outgoing, incoming, sheet, tear, wipeOpen, endStep);
  if (!shown) return <>{entry}</>;

  const layers: { id: GateId; role: "rest" | "out" | "in" }[] = step
    ? [
        { id: step.from, role: "out" },
        { id: step.to, role: "in" },
      ]
    : [{ id: shown, role: "rest" }];

  const renderGate = (id: GateId) => {
    const gate = getGate(id);
    const next = nextGate(gate);
    const copy = gates[gate.id];
    return (
      <GateSection
        gate={gate}
        chip={copy.chip}
        title={copy.title}
        cta={copy.cta}
        href={gateHref(locale, gate)}
        plateAlt={copy.plateAlt}
        characterAlt={gates.characterAlt}
        next={next.id}
        cueLabel={gates.cue[next.id]}
      />
    );
  };

  return (
    <main data-gate={getGate(shown).slug} className="relative overflow-clip">
      {layers.map(({ id, role }) => (
        <div
          key={id}
          ref={role === "in" ? incoming : role === "out" ? outgoing : undefined}
          // The door being left is scenery for its last second.
          inert={role === "out"}
          className={role === "in" ? "absolute inset-0 z-10" : undefined}
        >
          {renderGate(id)}
        </div>
      ))}

      {/* The red that rises: the sheet, and the torn band on its leading edge.
          The band is a sibling rather than a child because the sheet is
          clipped to its arch, and the band lives just outside that edge. */}
      {step && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
          <div ref={sheet} className="bg-ember absolute inset-0" />
          <GateRiseTear ref={tear} dir={step.dir} />
        </div>
      )}
    </main>
  );
}

/**
 * Play one move - red rises, red splits - then hand back with `done`.
 *
 * A LAYOUT effect, so the red is parked off-screen and the incoming door
 * hidden before the frame they mount in is painted; a plain effect would
 * flash both for a frame. GSAP arrives by dynamic import, as everywhere on
 * this site; the parked styles are written by hand until it does.
 *
 * The lock `stepGate` took is held until the split has finished, so a second
 * scroll cannot start another move over the opening tear.
 */
function useGateRise(
  step: GateStep | null,
  outgoingRef: RefObject<HTMLDivElement | null>,
  incomingRef: RefObject<HTMLDivElement | null>,
  sheetRef: RefObject<HTMLDivElement | null>,
  tearRef: RefObject<GateRiseTearHandle | null>,
  wipeOpen: (commit: () => void) => Promise<void>,
  done: () => void,
) {
  useLayoutEffect(() => {
    if (!step) return;
    const incoming = incomingRef.current;
    const outgoing = outgoingRef.current;
    const sheet = sheetRef.current;
    if (!incoming || !outgoing || !sheet) {
      done();
      return;
    }

    const { dir } = step;
    const heading = Array.from(incoming.querySelector("[data-gate-heading]")?.children ?? []) as HTMLElement[];

    /** Place the red sheet `progress` (0..1) of the way in, arched by `rise` px. */
    const place = (progress: number, rise: number) => {
      const w = sheet.offsetWidth;
      const h = sheet.offsetHeight;
      sheet.style.transform = `translate3d(0, ${dir * (1 - progress) * 100}%, 0)`;
      // The leading edge is a 4x(1-x) parabola with its crown at the box's
      // edge and its ends `rise` in from it - the pull-up's shape, pointing the
      // way the red travels.
      sheet.style.clipPath =
        rise <= 0.5
          ? ""
          : dir === 1
            ? `path("M0 ${rise} Q ${w / 2} ${-rise} ${w} ${rise} L ${w} ${h} L 0 ${h} Z")`
            : `path("M0 0 L ${w} 0 L ${w} ${h - rise} Q ${w / 2} ${h + rise} 0 ${h - rise} Z")`;
      // The torn band on that same edge: the box's top when rising, its bottom
      // when coming down. Thinning as it lands, and off-screen by then, since it
      // sits outside the edge.
      tearRef.current?.draw(
        dir === 1 ? h * (1 - progress) : h * progress,
        rise,
        TEAR_THICKNESS * window.innerHeight * (1 - 0.5 * progress),
        w,
      );
    };

    place(0, 0);
    incoming.style.visibility = "hidden";
    heading.forEach((el) => (el.style.opacity = "0"));

    let cancelled = false;
    let timeline: gsap.core.Timeline | undefined;

    void Promise.all([import("gsap"), imagesReady(incoming)]).then(([{ gsap }]) => {
      if (cancelled) return;
      const ease = gsap.parseEase(RISE_EASE);
      const travel = { p: 0 };

      // Beat 1: the red rises over the door being left, which sinks back.
      timeline = gsap.timeline();
      timeline.to(travel, {
        p: 1,
        duration: RISE,
        ease: "none",
        onUpdate: () => {
          const eased = ease(travel.p);
          // Deep while it travels, flat by the time it covers.
          place(eased, ARCH * window.innerHeight * (1 - eased));
        },
        onComplete: () => {
          // Beat 2: full cover. The classic tear takes over and splits open
          // onto the next door, whose chip and title come in as it parts.
          void wipeOpen(() => {
            incoming.style.visibility = "";
            // The classic panels cover everything now; the risen red (sheet
            // and band, one container) steps aside under them.
            if (sheet.parentElement) sheet.parentElement.style.visibility = "hidden";
            gsap.fromTo(
              heading,
              { y: 24, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.3, ease: "power2.out", clearProps: "transform,opacity" },
            );
          }).then(() => {
            if (!cancelled) done();
          });
        },
      });
      timeline.to(outgoing, { scale: 0.94, yPercent: -dir * 6, opacity: 0.35, duration: RISE, ease: RISE_EASE }, 0);
    });

    return () => {
      cancelled = true;
      timeline?.kill();
      incoming.style.visibility = "";
      heading.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
    // Keyed on the step alone: one move per step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
}

/**
 * Wait for the incoming door's images, or give up after a beat. It is hidden
 * until the red covers the screen, and a lazy plate might not start loading
 * until later, so they are asked for eagerly.
 */
function imagesReady(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  images.forEach((img) => {
    if (img.loading === "lazy") img.loading = "eager";
  });
  return Promise.race([
    Promise.all(images.map((img) => (img.complete ? null : img.decode().catch(() => null)))),
    new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS)),
  ]);
}

/** Seconds for the red to rise and cover. The split that follows is the classic tear's own open. */
const RISE = 0.9;
const RISE_EASE = "power3.inOut";
/** Depth of the leading arch as the red sets off, as a share of the viewport's height. */
const ARCH = 0.2;
/** How far the torn band reaches beyond the leading edge, as a share of the viewport's height. */
const TEAR_THICKNESS = 0.05;
/** Longest the rise waits on the incoming door's images. */
const IMAGE_WAIT_MS = 700;
