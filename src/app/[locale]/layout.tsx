import type { Metadata, Viewport } from "next";
import { Host_Grotesk, Teko } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";

import { JsonLd } from "@/components/chrome/JsonLd";
import { LocaleProvider } from "@/components/chrome/LocaleProvider";
import { SiteChrome } from "@/components/chrome/SiteChrome";
import { SoundProvider } from "@/components/chrome/SoundProvider";
import { GateEntryProvider } from "@/components/gates/GateEntry";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { OG_IMAGE, SITE_NAME, SITE_URL, STUDIO_NAME } from "@/lib/seo";
import { isLocale, LOCALES } from "@/lib/utils/locales";
import { getViewerState } from "@/lib/api/points";
import { getProfile } from "@/lib/api/profile";
import { getMessages } from "@/lib/utils/messages";
import "../globals.css";


const teko = Teko({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-teko",
  display: "swap",
});


const hostGrotesk = Host_Grotesk({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-host-grotesk",
  display: "swap",
});


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const description = getMessages(isLocale(locale) ? locale : "en").site.description;
  return {
    metadataBase: SITE_URL,
    applicationName: SITE_NAME,
    title: { default: SITE_NAME, template: "%s" },
    description,
    authors: [{ name: STUDIO_NAME }],
    creator: STUDIO_NAME,
    publisher: STUDIO_NAME,
    robots: { index: true, follow: true },
    openGraph: { type: "website", siteName: SITE_NAME, title: SITE_NAME, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: SITE_NAME, description, images: [OG_IMAGE.url] },
  };
}

/** The browser chrome takes the page's own black - the manifest says the same. */
export const viewport: Viewport = { themeColor: "#000000" };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // The account dropdown's two states come from the same mock flag the store's
  // points panels use. Nothing here is a session - see `getViewerState`.
  const viewer = await getViewerState();
  const profile = viewer === "signed-out" ? null : await getProfile();

  // Who publishes this site and what it is, for search engines - the studio as
  // the organisation, the site as the work, on every page.
  const site = getMessages(locale).site;
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL.origin}/#organization`,
        name: STUDIO_NAME,
        url: SITE_URL.origin,
        logo: `${SITE_URL.origin}/assets/brand/goondu-logo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL.origin}/#website`,
        name: SITE_NAME,
        description: site.description,
        url: `${SITE_URL.origin}/${locale}`,
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL.origin}/#organization` },
      },
    ],
  };

  return (
    <html lang={locale} className={`${teko.variable} ${hostGrotesk.variable}`}>
      <body>
        <JsonLd data={structured} />
        <TransitionProvider>

          <SmoothScroll />

          <GateEntryProvider>
            {/* Inside GateEntryProvider: the bed the portal plays is whichever
                door it is standing at, which is that provider's state. */}
            <SoundProvider>
            {/* The locale and its copy for the not-found boundary, which Next
                renders without params. The same messages object SiteChrome takes. */}
            <LocaleProvider locale={locale} messages={getMessages(locale)}>
              {children}

              <SiteChrome messages={getMessages(locale)} profile={profile} />
            </LocaleProvider>
            </SoundProvider>
          </GateEntryProvider>
        </TransitionProvider>

        {/* Microsoft Clarity - session recordings & heatmaps.
            `lazyOnload` waits for the browser idle time so it never blocks
            render or competes with your fonts and hydration. */}
        <Script id="ms-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "ykej0l8day");
          `}
        </Script>
      </body>
    </html>
  );
}