import Image from "next/image";

/**
 * Small profile icons.
 *
 * DRAWN, NOT SHIPPED. No asset was delivered for the pencil, the log-out arrow,
 * the location pin or the account figure, and the four Nsibidi glyphs that WERE
 * delivered are used directly. Same approach, and the same caveat, as the double
 * chevron in `PointsPanel` and the trash in `CartView`: they are traced from the
 * frame and should be replaced when Design supplies the real set.
 *
 * The flag is the Nigerian national flag — green, white, green in a 2:1 box.
 * That is a fact rather than a design decision, so it is drawn rather than
 * treated as a missing asset. The emoji was not used: it renders as a country
 * code on Windows, which is where this is being built and reviewed.
 */
export function EditGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="size-4"
    >
      <path
        d="M11.3 1.7a1.7 1.7 0 0 1 2.4 2.4l-8 8L2 13.4l1.3-3.7 8-8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogOutGlyph() {
  return (
    <Image
      src="/assets/player-profile/logout.svg"
      alt=""
      aria-hidden
      width={18}
      height={18}
      className="size-4.5 select-none"
    />
  );
}

export function LoginGlyph() {
  return (
    <Image
      src="/assets/player-profile/login.svg"
      alt=""
      aria-hidden
      width={18}
      height={18}
      className="size-4.5 select-none"
    />
  );
}

export function PinGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="size-4"
    >
      <path
        d="M8 14.5s5-4.2 5-8a5 5 0 0 0-10 0c0 3.8 5 8 5 8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.4" r="1.8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function PersonGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="size-5"
    >
      <circle
        cx="10"
        cy="6.5"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.8 17c0-3.2 2.8-5.2 6.2-5.2s6.2 2 6.2 5.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NigeriaFlag() {
  return (
    <svg
      width="18"
      height="12"
      viewBox="0 0 18 12"
      aria-hidden
      className="h-3 w-4.5 shrink-0 rounded-[1px]"
    >
      <rect width="18" height="12" fill="#ffffff" />
      <rect width="6" height="12" fill="#008751" />
      <rect x="12" width="6" height="12" fill="#008751" />
    </svg>
  );
}
