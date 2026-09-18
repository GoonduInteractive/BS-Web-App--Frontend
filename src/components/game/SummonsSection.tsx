"use client";

import Image from "next/image";
import { useRef } from "react";

import { ScrollCue } from "@/components/gates/ScrollCue";
import { BracketButton } from "@/components/ui/BracketButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TornDivider } from "@/components/ui/TornDivider";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";

export function SummonsSection({
  messages,
  nextHref,
  variant = "game",
}: {
  messages: Messages;

  nextHref?: string;

  variant?: "game" | "comics";
}) {
  const comics = variant === "comics";
  const image = comics
    ? { src: "/assets/comics/sommon.png", width: 640, height: 462 }
    : { src: "/assets/characters/black-legs.png", width: 1920, height: 1080 };
  const t = messages.theGame.summons;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, summonsScene);

  return (
    <section ref={root} className="bg-ink relative overflow-hidden">

      {comics ? null : (
        <TornDivider
          edge="bottom"
          seed={4102}
          className="text-bone absolute inset-x-0 -top-2 z-20"
        />
      )}

      <div className={comics ? "relative mx-auto flex max-w-360 flex-col px-5 md:block md:px-40" : "relative mx-auto flex max-w-360 flex-col px-6 md:block md:px-40"}>

        <div
          data-summons-figure
          className={
            comics
              ? "relative order-2 mt-28.5 aspect-473/445 w-[66vw] max-w-none self-center overflow-hidden md:absolute md:top-72.75 md:right-[9.8%] md:z-0 md:order-none md:mt-0 md:w-118.25 md:self-auto"
              : "w-[189vw] max-w-none self-center md:absolute md:-top-14 md:-right-41 md:z-0 md:w-282 md:self-auto"
          }
        >
          <div data-summons-figure-inner className={comics ? "absolute inset-0" : undefined}>

            <Image
              src={image.src}
              alt={t.imageAlt}
              width={image.width}
              height={image.height}
              sizes={comics ? "(max-width: 767px) 120vw, 711px" : "(max-width: 767px) 80vw, 71vw"}
              className={
                comics
                  ? "absolute top-[-3.6%] left-[-25.8%] w-[150.3%] max-w-none select-none"
                  : "w-full select-none"
              }
            />
          </div>
        </div>

        <div className={comics ? "relative z-10 pt-46.5 pb-0 md:pt-74.25 md:pb-85.5" : "relative z-10 pt-10 pb-16 md:pt-51.25 md:pb-42"}>

          <div data-summons-title className="overflow-hidden pb-1">
            <SectionTitle className="text-menu-fg text-[3rem] leading-[0.95] tracking-[-0.066em] md:text-[4.8125rem]">
              {t.title}
            </SectionTitle>
          </div>

          <p
            data-summons-body
            className={
              comics
                ? "text-menu-fg/85 font-body text-body mt-[1.15rem] max-w-full whitespace-pre-line md:max-w-108"
                : "text-menu-fg/85 font-body text-body mt-[1.15rem] max-w-108 whitespace-pre-line"
            }
          >
            {t.body}
          </p>

          <div data-summons-cta className="mt-12">
            <BracketButton className="inline-flex items-center gap-3 px-4.5 py-[1.15rem] leading-none tracking-normal">
              {t.cta}
            </BracketButton>
          </div>
        </div>
      </div>

      <div
        data-summons-cue
        className={comics ? "relative z-10 flex justify-center pb-28 md:pb-20" : "relative z-10 flex justify-center pb-14 md:pb-20"}
      >
        {nextHref ? <ScrollCue href={nextHref} label={t.cue} /> : null}
      </div>
    </section>
  );
}

/* The section's entrance and its parallax. */
const summonsScene: SceneBuilder = (gsap, q, section) => {
  const figure = q("[data-summons-figure]");
  const figureInner = q("[data-summons-figure-inner]");
  const title = q("[data-summons-title] h2");
  const body = q("[data-summons-body]");
  const cta = q("[data-summons-cta]");
  const cue = q("[data-summons-cue]");

  gsap.matchMedia().add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      if (!motion) {
        gsap.set([figure, figureInner, title, body, cta, cue], {
          clearProps: "all",
        });
        return;
      }

      // ---- Entrance. Once, on the way down. ----
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });

      tl.from(figureInner, { yPercent: -14, opacity: 0, duration: 1.1 })
        .from(title, { yPercent: 110, duration: 0.9, ease: "power4.out" }, 0.15)
        .from(body, { y: 22, opacity: 0, duration: 0.75 }, 0.42)
        .from(cta, { y: 18, opacity: 0, duration: 0.6 }, 0.58)
        .from(cue, { y: 14, opacity: 0, duration: 0.5 }, 0.82);

      // ---- Parallax. Tied to scroll, not to time. ----
      gsap.fromTo(
        figure,
        { y: -45 },
        {
          y: 45,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    },
  );
};
