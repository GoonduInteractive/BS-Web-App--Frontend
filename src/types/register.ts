/**
 * A sign-up from the header's REGISTER sheet. The one contract on the site
 * that describes data a real person hands over; the Google Sheet behind
 * `lib/api/register.ts` has these columns, in this order, after a timestamp.
 */
export type Registration = {
  firstName: string;
  lastName: string;
  /** As typed, whitespace and separators removed: `+2348030000000`. */
  whatsapp: string;
  email: string;
  /** Which language the sheet was filled in. */
  locale: string;
  /** The path the visitor registered from, for the sheet only. */
  page: string;
};

export type RegistrationResult = {
  ok: true;
  /** The address was already on the list; nothing was added. */
  duplicate: boolean;
  /**
   * Whether the script's reply was read. False when the browser refused it
   * and the row's arrival was confirmed blind — then `duplicate` is unknown
   * and reported false. See `lib/api/register.ts`.
   */
  read: boolean;
};
