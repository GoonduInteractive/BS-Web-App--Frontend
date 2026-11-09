"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { NoteCard } from "@/components/community/NoteCard";
import { useGsapScene } from "@/hooks/useGsapScene";
import { WALL } from "@/lib/api/community";
import { toggleNoteLike } from "@/lib/api/notes";
import { COMMUNITY_SCENES } from "@/lib/animation/community-scenes";
import { authHref } from "@/lib/utils/auth-links";
import type { Locale } from "@/lib/utils/locales";
import type { Messages } from "@/lib/utils/messages";
import type { CommunityNote } from "@/types/community";

/** The part of the canvas in view, in canvas pixels - read by whoever places a note. */
export type WallView = { x: number; y: number; w: number; h: number };

/**
 * MEMOISED, AND IT MATTERS: the board re-renders on every tab switch and every
 * new place on the map, and 161 torn cards re-rendering with it cost ~850ms of
 * script on a switch - long enough to swallow the swap animation before its
 * first frame. With stable props (the notes, the copy, a ref) the wall skips
 * those renders entirely; its own state (the likes) still re-renders it.
 */
export const CommunityWall = memo(function CommunityWall({
  notes,
  fresh,
  viewRef,
  messages,
  locale,
  className,
}: {
  notes: readonly CommunityNote[];
  /** For Sign In, where a signed-out like goes. */
  locale: Locale;
  /** The id of a note just posted, so it arrives with a pop. */
  fresh?: string | null;
  /** Written on every paint with what the visitor can see. */
  viewRef?: MutableRefObject<WallView>;
  messages: Messages;
  className?: string;
}) {
  const t = messages.community.wall;
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  // The notes in view pin themselves to the board once it has a box - a
  // ripple from the middle. The scene reads the wrappers' boxes, so it builds
  // after `place()` has run (the gsap import resolves later than the mount
  // effect that places the canvas).
  useGsapScene(viewport, COMMUNITY_SCENES.wallDeal);

  // Position and gesture state live in refs; nothing here re-renders on a move.
  const pos = useRef({ x: -WALL.origin.x, y: -WALL.origin.y });
  const scale = useRef(1);
  const placed = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; travel: number; vx: number; vy: number; t: number; touch: boolean; dragging: boolean } | null>(null);
  const coast = useRef(0);
  const swallowClick = useRef(false);

  const clamp = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const s = scale.current;
    const minX = Math.min(0, el.clientWidth - WALL.width * s);
    const minY = Math.min(0, el.clientHeight - WALL.height * s);
    pos.current.x = Math.max(minX, Math.min(0, pos.current.x));
    pos.current.y = Math.max(minY, Math.min(0, pos.current.y));
  }, []);

  const paint = useCallback(() => {
    clamp();
    if (canvas.current) {
      canvas.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) scale(${scale.current})`;
    }
    const el = viewport.current;
    if (el && viewRef) {
      const s = scale.current;
      viewRef.current = { x: -pos.current.x / s, y: -pos.current.y / s, w: el.clientWidth / s, h: el.clientHeight / s };
    }
  }, [clamp, viewRef]);

  // The canvas is drawn at 0.62 below `md`, the phone frame's scale, and
  // opens on that frame's view; a fresh window is placed once, then kept
  // clamped as it resizes. The canvas is hidden until it is placed, so a phone
  // never flashes the desktop's corner of the wall.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const place = () => {
      // No box yet - the page face is still `hidden` behind its gate - so
      // nothing to place against; the observer fires again when it has one.
      if (el.clientWidth === 0) return;
      const narrow = el.clientWidth < 768;
      scale.current = narrow ? WALL.narrowScale : 1;
      if (!placed.current) {
        const origin = narrow ? WALL.narrowOrigin : WALL.origin;
        pos.current = { x: -origin.x, y: -origin.y };
        placed.current = true;
      }
      paint();
      if (canvas.current) canvas.current.dataset.ready = "";
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(coast.current);
    };
  }, [paint]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    window.cancelAnimationFrame(coast.current);
    // A fresh press is a fresh gesture; only the click that ends THIS one can
    // be swallowed, and only if it travelled.
    swallowClick.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, travel: 0, vx: 0, vy: 0, t: performance.now(), touch: event.pointerType === "touch", dragging: false };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    // On touch the page owns the vertical axis (see above).
    const dy = d.touch ? 0 : event.clientY - d.y;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    d.vx = dx / dt;
    d.vy = dy / dt;
    d.t = now;
    d.x = event.clientX;
    d.y = event.clientY;
    d.travel += Math.abs(dx) + Math.abs(dy);
    if (!d.dragging) {
      if (d.travel <= 6) return;
      d.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    pos.current.x += dx;
    pos.current.y += dy;
    paint();
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    swallowClick.current = d.dragging;
    if (!d.dragging) return;
    // Coast: the release velocity, decaying, for a beat. Reduced motion stops dead.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let vx = d.vx * 16;
    let vy = d.vy * 16;
    const step = () => {
      vx *= 0.9;
      vy *= 0.9;
      if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3) return;
      pos.current.x += vx;
      pos.current.y += vy;
      paint();
      coast.current = window.requestAnimationFrame(step);
    };
    coast.current = window.requestAnimationFrame(step);
  };

  const onClickCapture = (event: React.MouseEvent) => {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const stepBy = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }[event.key];
    if (!stepBy) return;
    event.preventDefault();
    pos.current.x += stepBy[0];
    pos.current.y += stepBy[1];
    paint();
  };

  // Stable, so a memoised card re-renders only when ITS like changes. The like
  // is the signed-in player's: shown at once, sent, and taken back if the
  // API refuses it; a signed-out visitor goes to Sign In and back.
  const { status } = useAuth();
  const router = useRouter();
  const toggleLike = useCallback(
    (id: string) => {
      if (status === "signed-out") {
        router.push(authHref(locale, "sign-in", window.location.pathname));
        return;
      }
      const flip = () =>
        setLiked((current) => {
          const next = new Set(current);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      flip();
      toggleNoteLike(id).catch(flip);
    },
    [status, router, locale],
  );

  return (
    <div
      ref={viewport}
      role="region"
      aria-label={t.label}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDown}
      className={`bg-paper-dots focus-visible:outline-signal relative overflow-hidden select-none [touch-action:pan-y] focus-visible:outline-2 focus-visible:-outline-offset-2 active:cursor-grabbing lg:cursor-grab ${className ?? ""}`}
    >
      <p className="sr-only">{t.hint}</p>
      <div
        ref={canvas}
        className="absolute top-0 left-0 origin-top-left opacity-0 transition-opacity duration-200 will-change-transform data-ready:opacity-100"
        style={{ width: WALL.width, height: WALL.height } as CSSProperties}
      >
        {/* A card that is pushed aside slides to its new place; the one just
            posted pops in; the deal tweens the wrapper. All of it is on the
            wrapper - the card itself lifts under the cursor and must not be
            transformed by anything else (the useGsapScene warning). */}
        {notes.map((note) => (
          <div
            key={note.id}
            data-note
            className={`ease-gate absolute transition-[left,top] duration-500 motion-reduce:transition-none ${note.id === fresh ? "note-in" : ""}`}
            style={{ left: note.x, top: note.y } as CSSProperties}
          >
            <NoteCard
              note={note}
              liked={liked.has(note.id)}
              onLike={toggleLike}
              messages={messages}
              className="ease-gate transition-[translate,filter] duration-300 hover:-translate-y-1 hover:drop-shadow-[0_10px_18px_rgba(0,0,0,0.12)] motion-reduce:transition-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
});
