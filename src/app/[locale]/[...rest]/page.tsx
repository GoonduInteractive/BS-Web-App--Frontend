import { notFound } from "next/navigation";

/**
 * Any path under a locale that matches no route. Without this, Next answers
 * `/en/anything` with its own bare 404 outside the locale layout; with it, the
 * request reaches the layout and `notFound()` opens the designed page (see
 * `../not-found.tsx`) with a 404 status. Nothing is prerendered here — there
 * is nothing to prerender — so it renders on request, which is what a 404 is.
 */
export default function CatchAll() {
  notFound();
}
