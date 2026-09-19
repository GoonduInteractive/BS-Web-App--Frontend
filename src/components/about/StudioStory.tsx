"use client";

import Image from "next/image";
import { useRef } from "react";

import { BracketButton } from "@/components/ui/BracketButton";
import { Chip } from "@/components/ui/Chip";
import { useGsapScene, type SceneBuilder } from "@/hooks/useGsapScene";
import type { Messages } from "@/lib/utils/messages";


export function StudioStory({ messages }: { messages: Messages }) {
  const t = messages.about.story;
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, storyScene);

  return (
    <section ref={root} className="relative overflow-x-clip">
      <div className="mx-auto max-w-360 px-6 pt-24 pb-24 md:px-27 md:pt-46 md:pb-68.25">
        <header
          data-story-head
          className="flex flex-col items-start text-left md:items-center md:text-center"
        >
          <Chip>{t.chip}</Chip>

          <h2 className="font-display text-menu-fg text-story-title mt-4.5 font-semibold tracking-[-0.051em] uppercase md:mt-5">
            {t.title.split("\n").map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </header>

        <div className="mx-auto mt-12 grid max-w-[65.9375rem] grid-cols-1 gap-10 md:mt-20 lg:mt-33.25 lg:grid-cols-[46.9%_40.5%] lg:justify-between lg:gap-0">
          <div data-story-photo>
            <div data-story-photo-inner>
              <Image
                src="/assets/about/story.png"
                alt={t.photoAlt}
                width={1122}
                height={1402}
                sizes="(max-width: 767px) 90vw, 47vw"
                className="h-auto w-full select-none"
              />
            </div>
          </div>

          <div className="lg:pt-6">
            <div data-story-copy>
              {[t.body1, t.body2, t.body3, t.body4].map((paragraph, i) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className={`text-menu-fg font-body text-body ${i ? "mt-6" : ""}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div data-story-cta className="mt-6.75 -ml-2.75">
              <BracketButton className="text-body px-4.5 leading-none tracking-[0.04em]">
                {t.cta}
              </BracketButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/*Chip */
const storyScene: SceneBuilder = (gsap, q, section) => {
  const head = q("[data-story-head]");
  const photo = q("[data-story-photo]");
  const photoInner = q("[data-story-photo-inner]");
  const copy = q("[data-story-copy] p");
  const cta = q("[data-story-cta]");

  gsap.matchMedia().add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { motion } = context.conditions as { motion: boolean };

      if (!motion) {
        gsap.set([head, photo, photoInner, copy, cta], { clearProps: "all" });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      });

      tl.from(head, { y: 26, opacity: 0, duration: 0.8 })
        .from(photoInner, { y: 34, opacity: 0, duration: 0.9 }, 0.15)
        .from(copy, { y: 22, opacity: 0, duration: 0.7, stagger: 0.09 }, 0.32)
        .from(cta, { y: 18, opacity: 0, duration: 0.6 }, 0.6);

      // The rise. Tied to scroll, not to time.
      gsap.fromTo(
        photo,
        { y: 38 },
        {
          y: -38,
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
