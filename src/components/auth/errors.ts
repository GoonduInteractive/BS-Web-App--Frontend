import type { Messages } from "@/lib/utils/messages";
import type { AuthErrorReason } from "@/types/auth";

/**
 * The line for a failed auth call. `unverified` is never shown: the forms send
 * that visitor to Confirm Email instead, so it falls back to `unknown` here.
 */
export function errorLine(messages: Messages, reason: AuthErrorReason): string {
  return messages.auth.errors[reason === "unverified" ? "unknown" : reason];
}
