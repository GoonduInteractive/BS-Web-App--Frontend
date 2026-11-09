import type { Messages } from "@/lib/utils/messages";
import { passwordStrength, type PasswordStrength as Level } from "@/lib/utils/password-strength";

/** How many of the four segments fill, and in which token. Whole classes, for Tailwind's scan. */
const LEVEL: Record<Level, { filled: number; fill: string }> = {
  weak: { filled: 1, fill: "bg-signal" },
  fair: { filled: 2, fill: "bg-amber" },
  good: { filled: 3, fill: "bg-moss" },
  strong: { filled: 4, fill: "bg-moss" },
};

/**
 * Four flat segments under the password and the level in words. No frame
 * draws one (human, 2026-10-03: "fits well with the ui style"), so it is built
 * from what the card already has: square ends, the smoke hairline grey for an
 * empty segment, and existing tokens for the fill: signal for weak, amber for
 * fair, moss for good and strong. FLAGGED. The words carry the meaning for
 * anyone who cannot tell the colours apart, and they are announced politely
 * as they change. Nothing is drawn while the field is empty.
 */
export function PasswordStrength({
  id,
  password,
  minLength,
  messages,
}: {
  /** The password input points at this with `aria-describedby`. */
  id: string;
  password: string;
  minLength: number;
  messages: Messages;
}) {
  const t = messages.auth.strength;
  const level = passwordStrength(password, minLength);
  const { filled, fill } = level ? LEVEL[level] : { filled: 0, fill: "" };

  return (
    <div className={level ? "mt-2.5" : "hidden"}>
      <div aria-hidden className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 transition-colors duration-300 ease-gate ${i < filled ? fill : "bg-smoke"}`}
          />
        ))}
      </div>
      <p id={id} aria-live="polite" className="text-white/60 font-body mt-1.5 text-[0.75rem] leading-4">
        {level ? `${t.label} ${t[level]}` : null}
      </p>
    </div>
  );
}
