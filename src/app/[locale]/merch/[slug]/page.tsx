import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { CartButton } from "@/components/merch/CartButton";
import { ProductCard } from "@/components/merch/ProductCard";
import { ProductDetail } from "@/components/merch/ProductDetail";
import { JsonLd } from "@/components/chrome/JsonLd";
import { getProducts, getProduct, getRelated } from "@/lib/api/merch";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { localePath, pageMetadata, SITE_URL, STUDIO_NAME } from "@/lib/seo";

/**
 * One product. Figma: `context/design/10-merch/Merch Store- Merch Details.png`.
 *
 * Fully static: every locale x slug is enumerated at build time.
 */
export async function generateStaticParams() {
  const products = await getProducts();
  return LOCALES.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const messages = getMessages(locale);
  const product = (await getProducts()).find((p) => p.slug === slug);
  if (!product) return {};

  const copy = messages.merch.products[product.copyKey];
  return pageMetadata({
    locale,
    path: `/merch/${product.slug}`,
    title: `${copy.name} | ${messages.merch.meta.title}`,
    description: copy.description,
    image: product.image,
    imageAlt: copy.name,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);

  // The adapter throws a typed MerchNotFoundError for an unknown slug; a bad URL
  // is a 404 rather than a crash.
  const product = await getProduct(slug).catch(() => null);
  if (!product) notFound();
  // Not public yet — the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("merch")) return <HiddenSection section="merch" locale={locale} messages={messages} />;

  const related = await getRelated(slug);
  const copy = messages.merch.products[product.copyKey];

  // The product for search engines. Naira, as the page prices it; no
  // availability is claimed, because nothing here can be bought yet.
  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: copy.name,
    description: copy.description,
    image: [new URL(product.image, SITE_URL).toString()],
    brand: { "@type": "Brand", name: STUDIO_NAME },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "NGN",
      url: new URL(localePath(locale, `/merch/${product.slug}`), SITE_URL).toString(),
    },
  };

  return (
    <main>
      <JsonLd data={structured} />
      <div className="mx-auto w-full max-w-360 px-6 pt-28 md:px-7 md:pt-33.75">
        <div className="flex justify-end">
          <CartButton messages={messages} locale={locale} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-360 px-6 md:mt-3.5 md:px-20">
        <ProductDetail product={product} messages={messages} locale={locale} />

        <section className="pt-20 md:pt-26">
          <h2 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">
            {messages.merch.detail.related}
          </h2>

          <ul className="mt-9 grid grid-cols-1 gap-x-8.25 gap-y-14 sm:grid-cols-2 lg:mt-5.25 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ProductCard product={item} messages={messages} locale={locale} />
              </li>
            ))}
          </ul>
        </section>

        <div className="h-24 md:h-[3.125rem]" />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
