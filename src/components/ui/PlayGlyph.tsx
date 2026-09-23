/**
 * The play triangle inside the WATCH TRAILER button.
 *
 * DRAWN, NOT DELIVERED. The frame shows an outlined triangle - hairline stroke,
 * no fill, mitred corners - sitting left of the label at about 14 x 14. No icon
 * was exported with the section's assets, and this was flagged and shipped as
 * text only until the human asked for the glyph.
 *
 * That is not the same as substituting a placeholder asset. A play triangle is
 * geometry, not artwork: three points and a stroke, which is exactly what the
 * frame draws. If Design later exports an icon set, this is one file to swap.
 *
 * 13 wide by 15 tall in the frame - taller than it is wide, not equilateral -
 * against an 18px label. Sized in em off that ratio so it rides the button's
 * font size, and painted `currentColor`, rather than pinning either.
 */
export function PlayGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 13 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="miter"
      className="h-[0.834em] w-[0.723em] shrink-0 select-none"
    >
      <path d="M0.9 0.9 L12.1 7.5 L0.9 14.1 Z" />
    </svg>
  );
}
