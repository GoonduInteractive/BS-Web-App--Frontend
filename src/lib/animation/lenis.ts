import type Lenis from "lenis";

/**
 * The one Lenis instance, for the few things that must talk to the scroller
 * rather than to the scroll. `SmoothScroll` sets it when it creates Lenis and
 * clears it on teardown; anything else only reads.
 *
 * The gate pull-up is the reader: while a visitor is pulling the next gate up
 * the page must hold still, and the only way to hold a Lenis page still is to
 * ask Lenis. `null` under reduced motion (Lenis is never created) and before
 * the smooth-scroll chunk has loaded, and every caller treats it as optional.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
