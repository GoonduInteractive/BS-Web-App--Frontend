import { z } from "zod";

/**
 * The frontmatter of one `src/content/hall/<locale>/<slug>.md`, as Decap writes
 * it from the `hall` collection in `public/admin/config.yml`.
 */
export const hallFrontmatter = z.object({
  handle: z.string().trim().min(1),
  season: z.coerce.number().int().min(1),
  /** Optional in the editor, so the file may hold an empty string, `null` or nothing at all. */
  tournament: z
    .string()
    .trim()
    .nullish()
    .transform((v) => v || undefined),
  portrait: z.string().trim().min(1),
  /** Off keeps the card out of the hall until it is ready. */
  visible: z.boolean().default(true),
});

export type HallFrontmatter = z.infer<typeof hallFrontmatter>;
