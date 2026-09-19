import { cn } from "@/lib/utils/cn";

/**
 * The hover rules under the site's links, at the human's direction (2026-09-16):
 * a link under the cursor turns `--color-linen` (#E8DDB7, the colour both files
 * carry) and a hand-drawn rule appears beneath it.
 *
 * Two delivered files, two rules: `ornaments/siteheader-hover-border.svg` (89 x 4,
 * a wavering 0.5 stroke) under the header's Comics / News / Merch Store, and
 * `ornaments/menu-border.svg` (746 x 14, a filled band with flared ends) under
 * the menu overlay's gate links, where it replaces the 2px line that grew from
 * the left.
 *
 * DRAWN INLINE, NOT LOADED, for the reason `TornPlate` gives: as an image an SVG
 * keeps its own aspect ratio inside any box (letterboxing), and these have to
 * span labels of every width — "News" and "Merch Store", THE GAME and THE
 * CHARACTERS. The path data is the file's, untouched; `preserveAspectRatio="none"`
 * stretches it to the label, the height stays the file's. The header rule's
 * stroke keeps its 0.5 through `vector-effect` — thin, as delivered, FLAGGED. The
 * colour is `currentColor` from the parent's `text-linen` rather than a hex here.
 *
 * REVEALED LEFT TO RIGHT with a clip, the way the old underline grew, so the
 * band's ends arrive as drawn rather than squashed by a scale. The global
 * reduced-motion block makes the reveal instant.
 */
const REVEAL =
  "pointer-events-none absolute left-0 w-full [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300 ease-gate group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)]";

/** The header links' rule: 89 x 4 in the file, stretched to the label. */
export function HeaderRule({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 89 4" preserveAspectRatio="none" fill="none" className={cn(REVEAL, "h-1", className)}>
      <path
        d="M0.25 2.4148L12.7119 0.365323C14.0515 0.145018 15.4249 0.436942 16.5591 1.18304L16.7307 1.29596C17.8269 2.01712 19.1481 2.3148 20.4477 2.13345L33.6221 0.295099C34.8709 0.120836 36.1374 0.455013 37.1377 1.22271C38.1319 1.98574 39.3894 2.32069 40.6314 2.15334L48.6587 1.07173C49.176 1.00203 49.7006 1.00763 50.2163 1.08836L57.863 2.28547C58.4106 2.37118 58.968 2.37217 59.5158 2.2884L67.0881 1.13053C67.7956 1.02234 68.5175 1.05577 69.212 1.22889L75.5973 2.8205C76.3565 3.00974 77.1477 3.03188 77.9163 2.88537L87.9824 0.96663"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** The menu links' rule: 746 x 14 in the file, stretched to the label. */
export function MenuRule({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 746 14" preserveAspectRatio="none" className={cn(REVEAL, "h-3.5 fill-current", className)}>
      <path d="M745.934 -2.86693e-09C745.977 4.27766 746.213 8.66347 745.422 12.9112C743.163 13.8618 744.379 13.7017 741.732 13.5465C739.571 12.4664 734.802 10.8298 732.474 9.23956C716.739 8.39527 22.6039 8.86502 12.9459 9.64578C10.6151 11.2549 7.69385 11.6691 5.90008 13.103L0.189758 13.6253C0.0507198 9.46493 -0.287415 5.30706 0.520142 1.16686C3.6828 -0.0452039 2.25018 0.136833 5.78534 0.287731C7.68115 1.3544 10.5855 3.4523 11.7109 4.93622C14.8029 5.39014 697.633 6.19118 731.763 5.32429C736.511 1.38875 738.943 1.05567 745.934 -2.86693e-09Z" />
    </svg>
  );
}
