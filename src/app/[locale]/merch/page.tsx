import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import Link from "next/link";

import { CartButton } from "@/components/merch/CartButton";
import { ComicCover } from "@/components/merch/ComicCover";
import { LoginCard } from "@/components/merch/LoginCard";
import { PointsPanel } from "@/components/merch/PointsPanel";
import { ProductCard } from "@/components/merch/ProductCard";
import { StoreHero } from "@/components/merch/StoreHero";
import { getComics, getFeaturedProduct, getListing } from "@/lib/api/merch";
import { getPointsBalance, getViewerState } from "@/lib/api/points";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

/**
 * The merch store index. Figma:
 * `context/design/10-merch/Merch Store- Not logged in.png`, 1440 x 3319.
 *
 * A plain page like About - not a gate, so no rail and no curtain. Data comes
 * from the mock adapters in `src/lib/api/merch.ts`; nothing here knows they are
 * mocks.
 *
 * THE CONTAINER IS 80px, not the 108 of The Game or the 90 of About. Measured:
 * the featured tile starts at x 80 and the grid's right edge lands on 1360.
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
  const t = getMessages(locale).merch.meta;
  return pageMetadata({ locale, path: "/merch", title: t.title, description: t.description });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  // Not public yet - the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("merch")) return <HiddenSection section="merch" locale={locale} messages={messages} />;

  const [featured, listing, comics, viewer, balance] = await Promise.all([
    getFeaturedProduct(),
    getListing(),
    getComics(),
    getViewerState(),
    getPointsBalance(),
  ]);

  return (
    <main>
      <div className="mx-auto w-full max-w-360 px-6 pt-28 md:px-7 md:pt-33.75">
        <div className="flex justify-end">
          <CartButton messages={messages} locale={locale} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-360 px-6 md:mt-3.5 md:px-20">
        <StoreHero
          product={featured}
          messages={messages}
          locale={locale}
          aside={
            viewer === "signed-out" ? (
              <LoginCard messages={messages} />
            ) : (
              <PointsPanel balance={balance} messages={messages} />
            )
          }
        />

        <section className="pt-24 md:pt-43">
          <h2 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">
            {messages.merch.sections.merch}
          </h2>

          <ul className="mt-9 grid grid-cols-1 gap-x-8.25 gap-y-14 sm:grid-cols-2 lg:mt-5.25 lg:grid-cols-3">
            {listing.map((entry, i) => (
              <li key={entry.id}>
                <ProductCard
                  product={entry.product}
                  messages={messages}
                  locale={locale}
                  priority={i < 3}
                />
              </li>
            ))}
          </ul>
        </section>

        {comics.length > 0 ? (
          <section className="pt-24 md:pt-51">
            <h2 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">
              {messages.merch.sections.comics}
            </h2>

            {/* Four cards from two issues, alternating - the same repetition the
                merch grid and the About team grid use. */}
            <ul className="mt-9 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:mt-5.25 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => comics[i % comics.length]).map((issue, i) => {
                const copy =
                  messages.merch.comics.issues[
                    issue.copyKey as keyof typeof messages.merch.comics.issues
                  ];
                return (
                  <li key={`${issue.slug}-${i}`}>
                    <Link
                      href={`/${locale}/merch/comics/${issue.slug}`}
                      className="focus-visible:outline-signal group block focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      <ComicCover issue={issue} messages={messages} />
                      <h3 className="font-display text-menu-fg mt-5 text-[1.375rem] leading-none font-semibold tracking-[-0.03em] uppercase">
                        {copy.title}
                      </h3>
                      <p className="text-menu-fg/85 font-body text-body-sm mt-2.5 leading-none">
                        {copy.format}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className="h-24 md:h-[3.125rem]" />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
