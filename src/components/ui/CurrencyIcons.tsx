/**
 * The two currencies' marks (the human, 2026-11-23: "an actual seed icon",
 * and an HBAR mark that looks like HBAR).
 *
 * SEEDS: a seed - pointed at the top, full at the foot, its seam curving
 * down the middle - drawn as an outline in `currentColor`, so it sits on the
 * gild tiles in ink and anywhere else in that ground's text colour. It
 * replaces the Nsibidi glyph that stood in for Seeds.
 *
 * HBAR: the HBAR token's own mark, the Hedera "H" - two uprights and two
 * crossbars - in a circle: white disc, ink letter, as the token is shown on
 * a dark ground. It replaces the "ℏ" typed into a square.
 *
 * Both are decorative wherever they sit next to their name (`aria-hidden`).
 */
export function SeedIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.75c3.9 2.7 6 6.4 6 10.1 0 4.4-2.7 8.4-6 8.4s-6-4-6-8.4c0-3.7 2.1-7.4 6-10.1Z" />
      <path d="M12.3 7.4c-1.6 3-1.9 7.3 0 11.6" />
    </svg>
  );
}

export function HbarIcon({ className = "size-9" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" className="fill-menu-fg" />
      <path d="M8.4 6.4v11.2M15.6 6.4v11.2M8.4 10.6h7.2M8.4 13.6h7.2" className="stroke-ink" strokeWidth="1.9" strokeLinecap="square" fill="none" />
    </svg>
  );
}
