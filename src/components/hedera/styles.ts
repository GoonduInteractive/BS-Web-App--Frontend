/**
 * The Hedera section's recurring classes. NO FRAME DRAWS ANY HEDERA SCREEN:
 * they are built from the profile's own vocabulary - a rounded `pitch` card,
 * `ash` tiles inside it, the EDIT PROFILE outline button, the Seeds panel's
 * heading - per the standing rule for undrawn features.
 */
export const PANEL = "bg-pitch rounded-[1.25rem] px-6 py-8 md:px-10 md:py-10";

export const TILE = "bg-ash rounded-lg";

export const PANEL_TITLE = "text-menu-fg/85 font-body text-[1.1875rem] leading-none tracking-wider";

export const BODY = "text-menu-fg/85 font-body text-body";

export const QUIET = "text-menu-fg/60 font-body text-[0.8125rem] leading-snug";

export const FIGURE = "font-display text-menu-fg leading-none font-semibold";

/** EDIT PROFILE's button, for every second action. */
export const OUTLINE_BUTTON =
  "border-menu-fg/90 text-menu-fg font-body focus-visible:outline-signal inline-flex h-11 cursor-pointer items-center justify-center gap-2.5 rounded-md border px-4 text-[0.9375rem] leading-none transition-colors duration-150 ease-gate hover:bg-menu-fg/10 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default disabled:opacity-50";

export const TEXT_LINK =
  "text-menu-fg font-body text-body-sm underline underline-offset-4 transition-opacity duration-150 ease-gate hover:opacity-75 focus-visible:outline-signal focus-visible:outline-2 focus-visible:outline-offset-4";

/** The CTA's own padding, as the empty states set it. */
export const CTA = "px-3.75 py-[1.15rem] tracking-normal";
