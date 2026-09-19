import { CartProvider } from "@/components/merch/CartProvider";

/**
 * Cart state is scoped to the store rather than the locale layout, so the
 * provider's client JS never ships to the gates, the character pages or About.
 */
export default function MerchLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
