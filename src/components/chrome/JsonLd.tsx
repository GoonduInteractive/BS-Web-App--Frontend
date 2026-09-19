import { jsonLd } from "@/lib/seo";

/**
 * Structured data for the page, as a `<script type="application/ld+json">`.
 * Rendered on the server, inert in the browser; `jsonLd` escapes `<` so the
 * data can never close the element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
