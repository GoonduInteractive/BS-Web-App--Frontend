import { cn } from "@/lib/utils/cn";

/**
 * A section heading, optionally two-tone.
 *
 * Three headings on The Game page split their emphasis across one line:
 * "TWO PATHS." is muted and "ONE ASCENSION." is bright; "SOULS OF THE" is dark
 * and "ARENA" is muted. `muted` renders before the children on Two Paths and
 * after on Souls, so the component takes both and lets the caller order them.
 *
 * FLAGGED: the muted tone has no token. It is expressed as the heading colour at
 * reduced opacity, which holds on both the dark fields and the bone one, rather
 * than inventing a hex. Ask Design for the real value.
 */
export function SectionTitle({
  children,
  mutedBefore,
  mutedAfter,
  mutedClassName,
  as: Tag = "h2",
  className,
}: {
  children: React.ReactNode;
  mutedBefore?: string;
  mutedAfter?: string;
  /**
   * Override the muted tone for one call site.
   *
   * The default 45% is a guess, as the note above says. The Souls of the Arena
   * frame measures its muted ARENA at 58% ink over bone, which is a visible
   * step darker - but that is evidence from ONE frame, and the same span on a
   * dark field is a different sum. So the section that measured it overrides
   * it, and the shared default stays put until Design gives a real value.
   */
  mutedClassName?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        // ARBITRARY SIZES, NOT text-h2, AND THAT IS NOT A STYLE PREFERENCE.
        // twMerge misclassifies our custom `text-*` scale tokens as COLOURS, so
        // `text-h2` here and a `text-menu-fg` from the caller landed in the same
        // group and BOTH were dropped - every SectionTitle rendered at the
        // inherited 16px. An arbitrary value carrying a length unit is
        // unambiguously a font-size, so it survives the merge.
        // Same trap as `text-h7` on BracketButton. Sizes with a `--text-*` token
        // must not be passed through cn() alongside a text colour.
        "font-display text-[2.5rem] leading-[0.95] font-semibold tracking-[-0.02em] uppercase md:text-[3.5rem]",
        className,
      )}
    >
      {mutedBefore ? <span className={cn("opacity-45", mutedClassName)}>{mutedBefore} </span> : null}
      {children}
      {mutedAfter ? <span className={cn("opacity-45", mutedClassName)}> {mutedAfter}</span> : null}
    </Tag>
  );
}
