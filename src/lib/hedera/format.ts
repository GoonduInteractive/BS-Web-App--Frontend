import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import { formatPrice } from "@/lib/utils/price";
import type { FiatPrice } from "@/types/hedera";

/** "1,234.5 HBAR": two places at most, grouped as the rest of the site groups numbers. */
export function formatHbar(amount: number, messages: Messages): string {
  const grouped = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(amount);
  return messages.hedera.hbar.replace("{amount}", grouped);
}

/** A store price in its own currency: "₦4,500" or "$25". */
export function formatFiat(price: FiatPrice, locale: Locale, messages: Messages): string {
  if (price.currency === "NGN") return formatPrice(price.amount, locale, messages.merch.price);
  const grouped = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 }).format(price.amount);
  return messages.hedera.usd.replace("{amount}", grouped);
}

/** "18 Nov 2026". */
export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

/** "18 Nov 2026, 14:05". */
export function formatMoment(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** "09:42" left of a quote; "00:00" once it's gone. Whole seconds left, so a fresh quote reads 10:00. */
export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
