import Image from "next/image";
import Link from "next/link";

import { SOCIAL_LINKS } from "@/lib/social";
import type { Messages } from "@/lib/utils/messages";


export function SiteFooter({ messages, locale }: { messages: Messages; locale: string }) {
  const t = messages.footer;

  return (
    <footer className="bg-ink">
      <div className="mx-auto w-full max-w-360 px-6 md:px-20">

        <Image
          src="/assets/ornaments/Arrow-border-footer.svg"
          alt=""
          aria-hidden
          width={1282}
          height={11}
          className="h-2.75 w-full object-fill"
        />

        <div className="flex flex-col items-center pt-9 pb-8.25 text-center md:flex-row md:items-start md:justify-between md:gap-8 md:pt-9 md:pb-11.25 md:text-left">
          <div className="contents md:block">
            <Image
              src="/assets/brand/Beyond%20Service-logo-footer.png"
              alt={t.wordmarkAlt}
              width={193}
              height={57}
              className="h-14.25 w-auto max-w-none md:-ml-1.75"
            />
            <p className="text-menu-fg/70 font-body text-body-sm order-last mt-9.5 md:order-none md:mt-4.5">{t.copyright}</p>
          </div>

          <div className="mt-[4.5rem] flex flex-col items-center md:mt-0 md:items-start md:pt-8">
          <nav
            aria-label={t.navLabel}
            className="flex flex-col items-center gap-y-7.25 md:flex-row md:flex-wrap md:gap-x-8.25 md:gap-y-4"
          >
            {(
              [
                ["terms", `/${locale}/terms`],
                ["privacy", `/${locale}/privacy`],
                ["about", `/${locale}/about`],
                // No contact page: support is an inbox (`new-updates`, 2026-09-26).
                ["contact", `mailto:${messages.support.email}`],
              ] as const
            ).map(([key, href]) => (
              <Link
                key={key}
                href={href}
                className="text-menu-fg font-body text-body focus-visible:outline-signal transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {t.links[key]}
              </Link>
            ))}
          </nav>


          <ul aria-label={t.social.label} className="mt-9 flex items-center gap-6 md:mt-5">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.key}>
                {s.href ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.social[s.key]}
                    className="focus-visible:outline-signal block transition-opacity duration-150 ease-gate hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    <Image src={s.icon} alt="" aria-hidden width={24} height={24} className="size-6" />
                  </a>
                ) : (
                  <Image src={s.icon} alt={t.social[s.key]} width={24} height={24} className="block size-6" />
                )}
              </li>
            ))}
          </ul>
          </div>

          <div className="mt-[4.5625rem] md:mt-0 md:pt-3 md:text-right">
            <p className="text-menu-fg/70 font-body text-body-sm">{t.createdBy}</p>
            {/* The studio's own site, in a new tab so the visitor keeps their place here. */}
            <a
              href="https://goondu.games"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-visible:outline-signal mx-auto mt-2.75 block w-fit transition-opacity duration-150 ease-gate hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 md:mt-2.5 md:mr-0 md:ml-auto"
            >
              <Image src="/assets/brand/goondu-logo.png" alt={t.studioAlt} width={240} height={40} className="h-6 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
