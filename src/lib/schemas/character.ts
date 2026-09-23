import { z } from "zod";

import { CHARACTER_GROUPS } from "@/types/character";

/**
 * The frontmatter of one `src/content/characters/<locale>/<slug>.md`, as Decap
 * writes it from the `characters` collection in `public/admin/config.yml`.
 *
 * LENIENT WHERE THE EDITOR IS STRICT. Decap requires weapon, chi, intro, lore
 * and the rest before it will publish; here they are optional so that an entry
 * switched OFF can be half-written - a name, a group and a portrait waiting
 * for its copy - without failing the build. The page hides what is empty.
 */
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

const ability = z.object({ name: z.string().trim().min(1), text: z.string().trim().default("") });

export const characterFrontmatter = z.object({
  name: z.string().trim().min(1),
  role: optionalText,
  group: z.enum(CHARACTER_GROUPS).default("champions"),
  visible: z.boolean().default(true),
  order: z.coerce.number().int().min(1).default(1),
  image: z.string().trim().min(1),
  alt: z.string().trim().min(1),
  bio: optionalText,
  weapon: optionalText,
  chi: optionalText,
  intro: optionalText,
  lore: optionalText,
  abilities: z.array(ability).default([]),
  variants: z.array(ability).default([]),
  action: optionalText,
  gallery: z.array(z.string().trim().min(1)).default([]),
});

export type CharacterFrontmatter = z.infer<typeof characterFrontmatter>;
