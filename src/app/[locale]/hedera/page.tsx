import { Gift, Link2, ShoppingBag, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HiddenSection } from "@/components/chrome/HiddenSection";
import { NsibidiField } from "@/components/chrome/NsibidiField";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ExplainerActions } from "@/components/hedera/ExplainerActions";
import { HederaArt } from "@/components/hedera/HederaArt";
import { HederaFaq } from "@/components/hedera/HederaFaq";
import { PublicNote } from "@/components/hedera/bits";
import { TILE } from "@/components/hedera/styles";
import { Chip } from "@/components/ui/Chip";
import { isHidden } from "@/lib/hidden-sections";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/lib/utils/locales";
import { getMessages } from "@/lib/utils/messages";

/**
 * What Hedera exclusives are (the doc's screen 1, public). No frame: the hero
 * is the Community page's - the entry screen's gradient and drifting Nsibidi
 * rows, no plate - and the rest is the profile's tiles.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).hedera.explainer.meta;
  return pageMetadata({ locale, path: "/hedera", title: t.title, description: t.description });
}

const STEPS = [
  ["link", Link2],
  ["claim", Gift],
  ["buy", ShoppingBag],
  ["prizes", Trophy],
] as const;

const RULES = ["optional", "cosmetic", "separate", "keys", "adults"] as const;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  if (isHidden("hedera")) return <HiddenSection section="hedera" locale={locale} messages={messages} />;
  const t = messages.hedera.explainer;

  return (
    <main>
      <section className="bg-entry relative overflow-hidden">
        <NsibidiField />
        <div className="relative z-10 mx-auto w-full max-w-360 px-6 pt-34 pb-20 md:px-20 lg:pt-56.75 lg:pb-28">
          <Chip>{messages.hedera.chip}</Chip>
          <h1 className="font-display text-menu-fg text-game-hero mt-8 max-w-[14ch] font-semibold tracking-[-0.058em] uppercase">
            {t.title}
          </h1>
          <p className="text-menu-fg font-body text-body mt-5 max-w-[36rem]">{t.intro}</p>
          <p className="text-menu-fg/70 font-body text-body-sm mt-3">{t.optional}</p>
          <ExplainerActions messages={messages} locale={locale} className="mt-10" />

          {/* The right half: a character with HBAR's mark and the Hedera logo (stand-in art, `lib/hedera/art.ts`). */}
          <div className="pointer-events-none absolute top-32 right-20 bottom-0 hidden w-[40%] lg:block">
            <HederaArt art="explainer" variant="hero" />
          </div>
        </div>
      </section>

      <section className="bg-roster">
        <div className="mx-auto w-full max-w-360 px-6 py-20 md:px-20 md:py-28">
          <h2 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">{t.stepsTitle}</h2>
          <ul className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([key, Icon]) => (
              <li key={key} className={`${TILE} px-6 pt-6 pb-7`}>
                <span className="bg-gild grid size-10 place-items-center rounded-sm">
                  <Icon aria-hidden className="text-ink size-5" strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-menu-fg mt-6 text-[1.5rem] leading-none font-semibold tracking-[-0.03em] uppercase">
                  {t.steps[key].title}
                </h3>
                <p className="text-menu-fg/85 font-body text-body-sm mt-3">{t.steps[key].body}</p>
              </li>
            ))}
          </ul>

          {/* GOOD TO KNOW, two columns (the human, 2026-11-23: the list alone left the right of the
              page empty): the heading, a line and the public-network note on the left, held in view
              while the questions run down the right. Questions that open: what Hedera is, then each
              rule as the question a player would ask, its answer the rule itself. Stacked on a phone. */}
          <div className="mt-20 grid grid-cols-1 gap-x-16 gap-y-10 md:mt-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2 className="font-display text-menu-fg text-h2 leading-none font-semibold tracking-[-0.075em] uppercase">{t.rulesTitle}</h2>
              <p className="text-menu-fg/85 font-body text-body mt-5 max-w-[26rem]">{t.faq.intro}</p>
              <PublicNote messages={messages} className="mt-8 max-w-[26rem]" />
            </div>
            <HederaFaq
              items={[
                { id: "what", question: t.faq.what.question, answer: t.faq.what.answer },
                ...RULES.map((key) => ({ id: key, question: t.faq.questions[key], answer: t.rules[key] })),
              ]}
            />
          </div>
        </div>
      </section>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}
