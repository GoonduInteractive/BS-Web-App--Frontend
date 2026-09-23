import { CartProvider } from "@/components/merch/CartProvider";
import { isHidden } from "@/lib/hidden-sections";

/**
 * Cart state is scoped to the store rather than the locale layout, so the
 * provider's client JS never ships to the gates, the character pages or About
 * - nor, while the store is not public (`lib/hidden-sections.ts`), to the
 * Coming Soon page its routes return instead.
 */
export default function MerchLayout({ children }: { children: React.ReactNode }) {
  if (isHidden("merch")) return children;
  return <CartProvider>{children}</CartProvider>;
}
