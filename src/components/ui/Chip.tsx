/**
 * The Ọnụ Ụzọ chip - the torn cream plate above every gate title.
 *
 * The plate is `ornaments/onu-uzo-chip.svg`, a 96x30 rect filled #E1D3A0 and
 * torn by an feTurbulence + feDisplacementMap pair, the same technique as the
 * page wipe. It is rendered at its NATURAL size because that is exactly what the
 * frames measure: 96 x 29 in every 1440-wide gate frame.
 *
 * That asset is also where --color-gild's real value came from, which closes
 * overview risk 6. The token is used for the active gate rail dot; the chip
 * itself uses the artwork so it keeps its ragged edge.
 *
 * ASSET RENAMED: delivered as "Rectangle 2.svg". The space in the filename has
 * to be percent-encoded in every CSS url() and defeats Tailwind's arbitrary
 * value syntax, so it was renamed. No artwork was touched.
 *
 * FLAGGED: the plate is a fixed 96x30 background, so a label longer than
 * "ỌNỤ ỤZỌ 4" would overflow it. Every current label is the same length in both
 * locales, so this holds today. If Design ever varies the label, the plate needs
 * to become a scalable mask instead of a background image.
 *
 * FLAGGED: gate 2's frame shows a CYAN chip (about #5EC1CE) where gates 1, 3 and
 * 4 show cream. No asset carries that colour and no token exists for it, so all
 * four are built on the delivered cream plate pending Design.
 */
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-ink font-display font-bold text-caption inline-grid h-7.5 w-24 place-items-center bg-[url('/assets/ornaments/onu-uzo-chip.svg')] bg-size-[107%_123%] bg-center bg-no-repeat pb-px font-semibold tracking-[0.17em] select-none">
      {children}
    </span>
  );
}
