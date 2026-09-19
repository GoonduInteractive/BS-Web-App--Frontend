import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { CheckoutView } from "@/components/merch/CheckoutView";
import { getCountries, getStates } from "@/lib/api/geo";
import { getComics, getProducts } from "@/lib/api/merch";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * Checkout. Figma: `Merch Store- Checkout-New User.png`.
 *
 * NO CART CONTROL IN THE HEADER ROW, because the frame draws none — this is the
 * end of the funnel and the cart is already on screen to the right.
 *
 * The container is 93px, wider than the store's 80: the frame's panels run
 * 93..1347, symmetric.
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
    path: "/merch/checkout",
    title: `${messages.merch.checkout.shipping} | ${messages.merch.meta.title}`,
    noIndex: true,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  // Not public yet — the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("merch")) return <HiddenSection section="merch" locale={locale} messages={messages} />;

  const [products, comics, countries, states] = await Promise.all([
    getProducts(),
    getComics(),
    getCountries(),
    getStates("ng"),
  ]);

  return (
    <main>
      <div className="mx-auto w-full max-w-360 px-6 pt-28 md:px-23.25 md:pt-34.5">
        <CheckoutView
          products={products} comics={comics}
          countries={countries}
          states={states}
          messages={messages}
          locale={locale}
        />
        <div className="h-24 md:h-[4.75rem]" />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
