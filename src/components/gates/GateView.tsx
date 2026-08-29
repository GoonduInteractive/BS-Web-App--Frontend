"use client";

import { useEffect, type ReactNode } from "react";

import { useGateEntry } from "@/components/gates/GateEntry";

/**
 * A gate route's two faces: the gate, and the page behind it. Exactly one of
 * them is in the document at a time.
 *
 * HIDDEN, NOT UNMOUNTED. Both faces are rendered by the server and shipped in
 * the static HTML — the page's copy has to be crawlable, and this site's whole
 * routing story is built on static generation for SEO. `hidden` takes it out of
 * layout without taking it out of the document.
 *
 * Taking the closed face out of layout is the point, not a side effect. The gate
 * is `h-dvh`, so while it is the only laid-out face the document is exactly one
 * viewport tall and there is no scroll at all — the gate cannot be scrolled past
 * because there is nowhere to scroll to. Once you are through, the gate has no
 * box either, so scrolling back up to it is equally impossible. The only way
 * across in either direction is the tear.
 *
 * A gate with no content behind it never closes: gates 2 to 4 have no sections
 * yet, so their CTA is inert and the gate stays up.
 */
export function GateView({ gate, children }: { gate: ReactNode; children?: ReactNode }) {
  const { entered } = useGateEntry();
  const hasContent = Boolean(children);
  const open = hasContent && entered;

  useWarmContentImages(hasContent);

  return (
    <>
      <div hidden={open}>{gate}</div>
      {hasContent ? (
        // The attribute is what `GateSection` tests to know whether this gate
        // has anything behind it, so it must not be renamed on one side only.
        <div data-gate-content hidden={!open}>
          {children}
        </div>
      ) : null}
    </>
  );
}

/**
 * Fetch the page's first image while the gate is still up.
 *
 * A hidden element has no box, so the browser never lazy-loads anything inside
 * it — left alone, the tear would open onto an empty hero and the plate would
 * pop in afterwards. This warms it from the markup the server already sent:
 * `<img>` elements exist in the DOM behind `hidden`, `src` and `srcset` and all,
 * so a bare `new Image()` primes the same cache entry the real one will hit.
 *
 * ON IDLE, and only the first image. Same reasoning as TransitionProvider's tear
 * warm: this is a content site on metered Nigerian data, so nothing may compete
 * with the gate's own LCP plate. By the time anyone has read the gate and
 * reached for the CTA, the fetch is long done.
 */
function useWarmContentImages(hasContent: boolean) {
  useEffect(() => {
    if (!hasContent) return;

    const warm = () => {
      const img = document.querySelector<HTMLImageElement>("[data-gate-content] img");
      if (!img) return;
      const warmer = new Image();
      if (img.srcset) warmer.srcset = img.srcset;
      if (img.sizes) warmer.sizes = img.sizes;
      warmer.src = img.src;
    };

    const idle = window.requestIdleCallback?.(warm) ?? window.setTimeout(warm, 400);
    return () => window.cancelIdleCallback?.(idle as number);
  }, [hasContent]);
}
