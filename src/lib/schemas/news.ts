import { z } from "zod";

import { BAND_COLOURS } from "@/types/news";

/**
 * The frontmatter of one `src/content/news/<locale>/<slug>.md`, as Decap writes
 * it from `public/admin/config.yml`. The field names are the config's.
 *
 * Validated at build, because the CMS is an external source like any API
 * (coding-standard, "Data layer"): a file that does not fit fails the build
 * with its path in the message rather than shipping a half article.
 */
/** A field the editor may leave empty. Decap writes `""` for a cleared one and omits one never touched; both are "not written". */
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

export const articleFrontmatter = z.object({
  title: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  /** A plain `YYYY-MM-DD` from the datetime widget; anything ISO is accepted. */
  published: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
    .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}/, "published must be a date, YYYY-MM-DD")),
  tags: z.array(z.enum(["news", "announcement"])).min(1),
  coverStyle: z.enum(["full", "torn"]).default("full"),
  image: z.string().trim().min(1),
  imageAlt: z.string().trim().min(1),
  band: z.enum(BAND_COLOURS).default("dusk"),
  volume: optionalText,
  coverTitle: optionalText,
  author: optionalText,
  bodyImage: optionalText,
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatter>;
