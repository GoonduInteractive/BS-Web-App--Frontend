"use client";

import Image from "next/image";
import { useRef } from "react";

import { useLocaleMessages } from "@/components/chrome/LocaleProvider";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { BracketButton } from "@/components/ui/BracketButton";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";

export function NotFoundView() {
  const { locale, messages } = useLocaleMessages();
  const t = messages.notFound;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, slashScene);

  return (
    <main ref={root} className="bg-roster flex min-h-dvh flex-col">
      <section className="flex flex-1 items-center px-6 pt-[11.6875rem] pb-[8.5rem] md:px-20 lg:pt-[16.6875rem] lg:pb-[11.1875rem]">
        <div className="mx-auto w-full max-w-360 lg:px-[5.375rem]">
          <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-between">
                {/* ---- The copy: second on the phone, the left column from lg ---- */}
            <div
              data-404-copy
              className="order-2 mt-[5.8125rem] flex flex-col items-center text-center lg:order-none lg:-mt-0.75 lg:items-start lg:text-left"
            >
              <h1 className="font-display text-menu-fg text-[2rem] leading-none font-semibold tracking-[-0.045em] uppercase lg:text-[3rem] lg:tracking-[-0.07em]">
                {t.title}
              </h1>
              <p className="text-menu-fg font-body text-body-sm mt-2.5 max-w-60 lg:text-body lg:mt-3 lg:max-w-[17.25rem]">{t.body}</p>
              <div className="mt-8.5">
                <BracketButton href={`/${locale}`} className="px-4.5 py-[1.15rem] leading-none tracking-normal">
                  {t.cta}
                </BracketButton>
              </div>
            </div>

            {/* ---- The art: first on the phone, the right column from lg ---- */}
            <div data-404-stage className="relative order-1 aspect-678/367 w-[67.5vw] max-w-[42.375rem] shrink-0 lg:order-none lg:w-[61%]">
              <Image src="/assets/404/404-text-tear.svg" alt={t.artAlt} fill sizes="(max-width: 1023px) 68vw, 678px" className="select-none" priority />
              {/* The healed tear, for the moment before the blade: the slots
                  filled, on top, clipped to the band the scene shrinks. */}
              <div data-404-patch aria-hidden className="pointer-events-none absolute inset-0">
                <Image src="/assets/404/404-tear-patch.svg" alt="" fill sizes="(max-width: 1023px) 68vw, 678px" className="select-none" />
              </div>
              <Image
                data-404-sword
                src="/assets/404/sword.png"
                alt=""
                aria-hidden
                width={477}
                height={655}
                sizes="(max-width: 1023px) 48vw, 477px"
                className="absolute top-[-31.9%] left-[-40.7%] w-[70.35%] max-w-none select-none"
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter messages={messages} locale={locale} />
    </main>
  );
}


const TEAR = { cx: 120, cy: 257, dx: 0.9205, dy: -0.3907, half: 30 };
/** Where the blade's tip rests, in the same units - the tear's lower-left end. */
const TIP = { x: 34, y: 250 };

const slashScene: SceneBuilder = (gsap, q, root) => {
  const stage = q("[data-404-stage]")[0] as HTMLElement | undefined;
  const patch = q("[data-404-patch]")[0] as HTMLElement | undefined;
  const sword = q("[data-404-sword]")[0] as HTMLElement | undefined;
  const copy = q("[data-404-copy]")[0] as HTMLElement | undefined;
  if (!stage || !patch || !sword) return;

  const along = (p: { x: number; y: number }) => p.x * TEAR.dx + p.y * TEAR.dy;
  const sCentre = along({ x: TEAR.cx, y: TEAR.cy });
  const nx = -TEAR.dy;
  const ny = TEAR.dx;
  /** A point at distance `s` along the tear and `k` across it, as a % pair of the box. */
  const at = (s: number, k: number) => {
    const x = TEAR.cx + TEAR.dx * (s - sCentre) + nx * k;
    const y = TEAR.cy + TEAR.dy * (s - sCentre) + ny * k;
    return `${((x / 678) * 100).toFixed(2)}% ${((y / 367) * 100).toFixed(2)}%`;
  };
  /** The band from far below the tear's start up to `s`. */
  const band = (s: number) =>
    `polygon(${at(-400, -TEAR.half)}, ${at(s, -TEAR.half)}, ${at(s, TEAR.half)}, ${at(-400, TEAR.half)})`;

  const sTip = along(TIP);
  const sStart = 1100;
  const scale = root.getBoundingClientRect().width > 0 ? stage.clientWidth / 678 : 1;

  gsap.matchMedia().add(
    { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
    (ctx) => {
      if ((ctx.conditions as { reduced: boolean }).reduced) {
        gsap.set(patch, { autoAlpha: 0 });
        gsap.set([sword, copy].filter(Boolean) as HTMLElement[], { clearProps: "opacity,transform" });
        return;
      }

      const progress = { s: sStart };
      const paint = () => {
        gsap.set(patch, { clipPath: band(progress.s) });
        const d = progress.s - sTip;
        gsap.set(sword, { x: d * TEAR.dx * scale, y: d * TEAR.dy * scale });
      };
      paint();

      // Paused until the art has decoded and a frame has painted: built during
      // the page's load, a running timeline would spend its whole length inside
      // the load's block and land finished on the first frame anyone sees.
      const tl = gsap.timeline({ paused: true, delay: 0.35 });
      const imgs = [...stage.querySelectorAll("img")];
      void Promise.allSettled(imgs.map((img) => img.decode())).then(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => tl.play()));
      });
      // The swipe: fast in, settling as it lands. The slash opens with it.
      tl.to(progress, { s: sTip, duration: 0.95, ease: "power3.out", onUpdate: paint });
      // A last-moment shiver as the blade stops.
      tl.fromTo(stage, { x: 0 }, { x: 4 * scale, duration: 0.06, yoyo: true, repeat: 3, ease: "sine.inOut", clearProps: "transform" }, "-=0.1");
      // The patch has nothing left to cover; drop it, filter and all.
      tl.set(patch, { autoAlpha: 0 });
      if (copy) tl.from(copy, { opacity: 0, y: 18, duration: 0.7, ease: "power3.out", clearProps: "opacity,transform" }, 0.2);
    },
  );
};
