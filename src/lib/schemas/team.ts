import { z } from "zod";

import { TEAM_GROUPS } from "@/types/team";

/**
 * The frontmatter of one `src/content/team/<locale>/<slug>.md`, as Decap
 * writes it from the `team` collection in `public/admin/config.yml`.
 */
export const teamFrontmatter = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  portraitAlt: z.string().trim().min(1),
  image: z.string().trim().min(1),
  group: z.enum(TEAM_GROUPS).default("core"),
  order: z.coerce.number().int().min(1).default(1),
  /** Off keeps the person out of the grid until their portrait and role are ready. */
  visible: z.boolean().default(true),
});

export type TeamFrontmatter = z.infer<typeof teamFrontmatter>;
