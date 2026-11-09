export type PasswordStrength = "weak" | "fair" | "good" | "strong";

/**
 * A rough guide for the person typing, not a rule: the backend decides what it
 * accepts. One point each for reaching 8 and 12 characters, mixed case, a
 * digit and a symbol. Under 8 is always weak, whatever else it has. Null for
 * an empty field, when the meter is not drawn.
 */
export function passwordStrength(password: string, minLength: number): PasswordStrength | null {
  if (!password) return null;
  if (password.length < minLength) return "weak";

  const score =
    1 +
    Number(password.length >= 12) +
    Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) +
    Number(/\d/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));

  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score === 3) return "good";
  return "strong";
}
