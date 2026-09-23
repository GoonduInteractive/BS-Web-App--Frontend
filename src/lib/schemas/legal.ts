import { z } from "zod";

/**
 * The frontmatter of one `src/content/legal/<locale>/<slug>.md`, as Decap
 * writes it from the `legal` collection in `public/admin/config.yml`.
 *
 * A legal page with no sections is not a legal page, so the list has a
 * minimum: an editor who empties it fails the build rather than publishing a
 * blank Terms page.
 */
export const legalFrontmatter = z.object({
  title: z.string().trim().min(1),
  lastUpdated: z.string().trim().min(1),
  order: z.coerce.number().int().min(1).default(1),
  sections: z
    .array(
      z.object({
        navLabel: z.string().trim().min(1),
        heading: z.string().trim().min(1),
        body: z.string().trim().min(1),
      }),
    )
    .min(1),
});

export type LegalFrontmatter = z.infer<typeof legalFrontmatter>;
