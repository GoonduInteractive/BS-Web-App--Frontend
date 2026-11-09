import type { AuthErrorReason } from "@/types/auth";

/** Why an auth call failed, as a reason the forms have a line for. */
export class AuthError extends Error {
  constructor(public readonly reason: AuthErrorReason) {
    super(reason);
    this.name = "AuthError";
  }
}
