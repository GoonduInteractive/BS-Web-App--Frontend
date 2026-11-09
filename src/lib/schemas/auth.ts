import { z } from "zod";

/**
 * The account as the API returns it. Every reply that carries a user goes
 * through this before the site trusts it. When the backend's contract
 * changes, this is the first file to change to match it.
 */
export const authUserSchema = z.object({
  id: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  handle: z.string(),
  avatar: z.string().min(1),
});
