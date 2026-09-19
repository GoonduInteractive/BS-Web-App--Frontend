import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { CartButton } from "@/components/merch/CartButton";
import { CartView } from "@/components/merch/CartView";
import { getComics, getProducts } from "@/lib/api/merch";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * The cart. Figma: `Merch Store- Cart.png` and `Cart (1).png`.
 *
 * The page is static and the catalogue is read here, on the server; only the
 * lines themselves are client state, so what ships to the browser is the view
 * and not the adapter.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = getMessages(locale);
  return pageMetadata({
    locale,
    path: "/merch/cart",
    title: `${messages.merch.cart.title} | ${messages.merch.meta.title}`,
    noIndex: true,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  // Not public yet — the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("merch")) return <HiddenSection section="merch" locale={locale} messages={messages} />;

  const [products, comics] = await Promise.all([getProducts(), getComics()]);

  return (
    <main>
      <div className="mx-auto w-full max-w-360 px-6 pt-28 md:px-7 md:pt-33.75">
        <div className="flex justify-end">
          <CartButton messages={messages} locale={locale} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-360 px-6 md:mt-1.5 md:px-20">
        <CartView products={products} comics={comics} messages={messages} locale={locale} />
        <div className="h-24 md:h-[9.25rem]" />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
