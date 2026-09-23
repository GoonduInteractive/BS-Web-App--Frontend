import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { TransferView } from "@/components/merch/TransferView";
import { getComics, getProducts } from "@/lib/api/merch";
import { getTransferAccount } from "@/lib/api/payment";
import { isHidden } from "@/lib/hidden-sections";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";
import { pageMetadata } from "@/lib/seo";

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
    path: "/merch/checkout/transfer",
    title: `${messages.merch.transfer.bankName} | ${messages.merch.meta.title}`,
    noIndex: true,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  // Not public yet - the Coming Soon page stands in. See `lib/hidden-sections.ts`.
  if (isHidden("merch")) return <HiddenSection section="merch" locale={locale} messages={messages} />;

  const [account, products, comics] = await Promise.all([
    getTransferAccount(),
    getProducts(),
    getComics(),
  ]);

  return (
    <main>
      {/* The phone frame keeps the desktop's 228 above the heading. */}
      <div className="mx-auto w-full max-w-360 px-6 pt-57 md:px-20">
        <TransferView account={account} products={products} comics={comics} messages={messages} locale={locale} />
        <div className="h-24 md:h-38" />
      </div>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
