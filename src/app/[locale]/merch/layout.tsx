import { notFound } from "next/navigation";

import { CartProvider } from "@/components/merch/CartProvider";
import { getCartIndex } from "@/lib/api/merch";
import { isHidden } from "@/lib/hidden-sections";
import { isLocale } from "@/lib/utils/locales";

/**
 * Cart state is scoped to the store rather than the locale layout, so the
 * provider's client JS never ships to the gates, the character pages or About
 * - nor, while the store is not public (`lib/hidden-sections.ts`), to the
 * Coming Soon page its routes return instead.
 *
 * The provider also gets the catalogue's variants (`getCartIndex`), so it
 * can read the API's cart, which holds variant ids, as the site's lines.
 */
export default async function MerchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  if (isHidden("merch")) return children;
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <CartProvider index={await getCartIndex()} locale={locale}>
      {children}
    </CartProvider>
  );
}
