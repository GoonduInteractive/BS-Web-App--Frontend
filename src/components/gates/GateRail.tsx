"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils/cn";
import { GATES, gateFromPathname, gateHref, type GateId } from "@/lib/gates";

/**
 * The gate rail — a fixed stack on the left edge naming the four gates and
 * marking which one you are standing at.
 *
 * IT IS A NAV, NOT A STEPPER. Any gate is reachable from any other; The Game
 * straight to Competition is a normal interaction. So there is no previous/next
 * logic here and no directional variation in the tear — every jump looks
 * identical regardless of distance or direction.
 *
 * WHY IT LIVES IN THE LAYOUT
 *
 * This is mounted once from `layout.tsx` (via SiteChrome) and never from a gate
 * page. If each page rendered its own rail it would unmount and remount across
 * the tear, risking a flash on either side of the wipe. Because it persists and
 * the tear is fully opaque at its midpoint, the active item swaps while hidden:
 * the highlight is simply already correct when the screen reopens.
 *
 * WHY EVERY ITEM IS A PLAIN LINK
 *
 * TransitionProvider intercepts every internal anchor click globally, so these
 * get the tear for free. Calling the transition from a click handler here would
 * duplicate that logic and drift from the rest of the site.
 *
 * Clicking the ALREADY-ACTIVE gate is a no-op with no code of its own:
 * `TransitionProvider.navigate` returns early when `href === pathname`, and the
 * delegated handler has already called `preventDefault`. The link stays
 * focusable and in tab order, which is what keeps the rail keyboard-navigable in
 * visual order.
 */

export function GateRail({
  railLabel,
  labels,
}: {
  railLabel: string;
  labels: Record<GateId, string>;
}) {
  const pathname = usePathname();
  const active = gateFromPathname(pathname);
  const railRef = useRef<HTMLElement>(null);

  /**
   * Fade the rail out once the gate hero leaves the viewport.
   *
   * The rail is part of the gate, not persistent site navigation — verified
   * against the prototype at five points down The Game page, where it is present
   * at the hero and absent at every content section below it. Once the user
   * starts reading, it gets out of the way.
   *
   * ScrollTrigger is imported dynamically for the same reason GSAP core is in
   * TransitionProvider: this is a content site on metered Nigerian data, and
   * ~11KB gzipped should not sit in the initial bundle for a fade.
   *
   * INERT UNTIL CHUNK 2 — there is no content below the hero yet, so there is
   * nothing to scroll. Verified with a temporary spacer instead.
   */
  useEffect(() => {
    if (!active) return;
    const rail = railRef.current;
    if (!rail) return;

    let trigger: { kill: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const hero = document.querySelector("[data-gate-hero]");
      if (!hero) return;

      const set = (visible: boolean) => {
        gsap.to(rail, {
          opacity: visible ? 1 : 0,
          duration: 0.2,
          ease: "power2.out",
          overwrite: true,
          // Opacity and pointer-events only. Never width, height or position.
          onStart: () => {
            rail.style.pointerEvents = visible ? "" : "none";
          },
        });
      };

      trigger = ScrollTrigger.create({
        trigger: hero,
        start: "bottom bottom",
        onEnter: () => set(false),
        onLeaveBack: () => set(true),
      });
    })();

    return () => {
      cancelled = true;
      trigger?.kill();
    };
    // Re-created per route: a new page means a new [data-gate-hero] element.
  }, [active, pathname]);

  // Not on a gate route — which is also how the entry screen gets no rail
  // without this component knowing the entry screen exists.
  if (!active) return null;

  const locale = pathname.split("/").filter(Boolean)[0] ?? "en";

  return (
    <nav
      ref={railRef}
      aria-label={railLabel}
      // Desktop only, and the breakpoint MUST be written out literally here.
      // Tailwind v4 scans source statically, so a class assembled at runtime —
      // `${BREAKPOINT}:block` — is never emitted into the CSS, and the rail then
      // silently stays display:none with no error anywhere. That cost a round.
      // FLAGGED: the exact breakpoint was never specified. `lg` is 1024px.
      //
      // No mobile variant by design: gate navigation on small screens lives
      // entirely in the menu overlay.
      className="fixed top-[calc(50%+8px)] left-0 z-30 hidden -translate-y-1/2 lg:block"
    >
      {/* The panel bleeds off the left edge, as in the frames. */}
      <ul className="bg-menu/70 flex flex-col py-5 pr-4 pl-0 backdrop-blur-xs">
        {GATES.map((gate) => {
          const isActive = gate.id === active.id;
          return (
            <li key={gate.id} className="px-5.5 py-3.5">
              <Link
                href={gateHref(locale, gate)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  // w-33, not the frame's 112px, and that is a deliberate
                  // deviation. The frames are inconsistent about the dot: gate 1
                  // shows one, gates 2-4 do not, and their active label uses the
                  // full 112px box. "The Characters" is 85px at this size, so a
                  // 112px box cannot hold the dot AND the label — it truncates to
                  // "The Cha...". The rail spec asks for the dot, so the box grew
                  // by 20px instead. Truncating the label is the worse trade.
                  // FLAGGED for Design along with the dot inconsistency.
                  "font-body text-caption focus-visible:outline-signal flex h-14 w-33 items-center gap-2 whitespace-nowrap transition-colors duration-150 ease-gate focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive
                    ? // Solid, lighter than the plate behind it, and semi-opaque.
                      "bg-menu-fg/12 text-menu-fg pl-4"
                    : // Dashed outline, text dimmed to about sixty percent.
                      "border border-dashed border-menu-fg/25 text-menu-fg/60 pl-[19px] hover:border-menu-fg/50 hover:text-menu-fg",
                )}
              >
                {/* Decorative. aria-current carries the active state for
                    assistive tech, so the dot is never the only signal. */}
                {isActive ? (
                  <span aria-hidden className="bg-gild size-3 shrink-0 rounded-full" />
                ) : null}
                <span>{labels[gate.id]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
