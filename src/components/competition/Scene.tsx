"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { useGsapScene } from "@/hooks/useGsapScene";
import { COMPETITION_SCENES, type CompetitionScene } from "@/lib/animation/competition-scenes";

/**
 * A box that runs one of the Competition scenes over whatever it wraps.
 *
 * The sections of the tournament page and the leaderboard are Server
 * Components, and a scene is a function, which cannot cross that boundary. A
 * NAME can, so this is the one client component between the two: it takes the
 * scene by name, hangs `useGsapScene` on its own element, and renders the
 * server-rendered children untouched. The scene finds its targets by the
 * `data-*` attributes the section already carries.
 */
export function Scene({
  scene,
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  scene: CompetitionScene;
  /** Rendered element - the semantic tag the section would have used. */
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
  "aria-label"?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useGsapScene(root, COMPETITION_SCENES[scene]);

  return (
    <Tag ref={root} className={className} {...rest}>
      {children}
    </Tag>
  );
}
