import { z } from "zod";

/**
 * The frontmatter of one `src/content/partners/<locale>/<slug>.md`, as Decap
 * writes it from the `partners` collection in `public/admin/config.yml`.
 */
export const partnerFrontmatter = z.object({
  name: z.string().trim().min(1),
  logo: z.string().trim().min(1),
  /** Optional in the editor, so the file may hold an empty string, `null` or nothing at all. */
  url: z
    .string()
    .trim()
    .nullish()
    .transform((v) => v || undefined)
    .pipe(z.url().optional()),
  order: z.coerce.number().int().min(1).default(1),
  /** Off keeps the logo out of the row until it is ready. */
  visible: z.boolean().default(true),
});

export type PartnerFrontmatter = z.infer<typeof partnerFrontmatter>;
