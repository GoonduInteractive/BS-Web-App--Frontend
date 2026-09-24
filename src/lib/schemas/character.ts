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

/** A core ability also carries its own action shot, the picture on its tile. */
const coreAbility = ability.extend({ image: optionalText });

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
  abilities: z.array(coreAbility).default([]),
  /** The CORE ABILITIES switch, Show or Hide. Absent on entries written before it existed. */
  abilitiesSection: z.enum(["show", "hide"]).optional(),
  /** The switch's first form, a boolean Decap could not save as false. Read where the select is unset. */
  showAbilities: z.boolean().optional(),
  variants: z.array(ability).default([]),
  gallery: z.array(z.string().trim().min(1)).default([]),
});

export type CharacterFrontmatter = z.infer<typeof characterFrontmatter>;
