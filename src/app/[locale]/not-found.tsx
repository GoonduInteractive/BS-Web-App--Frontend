import { NotFoundView } from "@/components/chrome/NotFoundView";

/**
 * The locale's 404 — what `notFound()` opens onto anywhere under `/[locale]` (an
 * unknown article, character, product…) and, through the catch-all in
 * `[...rest]/page.tsx`, any path that matches no route. Rendered inside the
 * locale layout, so the header, menu and sound toggle stand over it and the
 * copy comes in the visitor's language (through `LocaleProvider` — a not-found
 * boundary gets no params). The response is a real 404.
 *
 * A path with no valid locale at all (`/xyz`) fails in the layout itself and
 * gets Next's plain page; there is no root layout to dress it. FLAGGED.
 */
export default function NotFound() {
  return <NotFoundView />;
}
