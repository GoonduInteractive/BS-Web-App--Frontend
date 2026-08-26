# Beyond Service

The official web app for **Beyond Service: Trial of the Gods**, a game by **Goondu Games Studio**.

Frontend only. There is no backend in this phase — anything that would need live game data is
built against typed mock adapters. The site's job is to drive mobile downloads and build a
community from scratch for a new studio. The audience is Nigeria-first, mobile-majority, on
metered data, so payload is a hard constraint, not a nice-to-have.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md — source of truth: scope, design direction, routes, design tokens, the seven motion moments, performance budgets
- @context/coding-standard.md — TypeScript, React, Next and Tailwind v4 conventions. Treat it as law.
- @context/ai-interaction.md — the per-feature workflow, changelog rules, asset and colour intake
- @context/current-feature.md — what is being built right now. Empty between features.

`context/` is local working memory and is meant to be gitignored (see `.gitignore`). The rules in
those files still apply whether or not the ignore lines are active.

## Commands

- **Dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`

Run `npm run build` and fix every error before proposing a commit.

## Stack

Next.js 16 App Router (static generation throughout) · TypeScript strict · Tailwind CSS v4 ·
shadcn/ui · next-intl with a `[locale]` segment (English and Igbo) · Lenis · GSAP with
ScrollTrigger · Decap CMS · Zod · TanStack Query · Axios via `src/lib/api/*` ·
Teko and Manrope through `next/font/google`.

## Hard rules

These are settled decisions. Do not reverse one without an explicit conversation.

- **No `tailwind.config.ts`.** This is Tailwind v4. Every theme token lives in
  `src/app/globals.css` under `@theme`.
- **No raw hex in components.** Use `--color-*` tokens only.
- **Never invent a colour.** Each section starts by asking the human for that section's hex values
  from Figma. Do not sample from a screenshot — this project has several near-identical reds.
- **Never invent copy.** If a string is not in `src/messages/`, ask for it in both English and Igbo.
- **Never substitute a placeholder asset.** If something is missing, say so and stop.
- **No 3D.** No three.js, no WebGL, no depth maps. The gates are static plates.
- **No backend.** No auth, no sessions, no server. Game data comes from mock adapters behind typed
  contracts in `src/types/`.
- **GSAP is the only animation library.** Do not add Framer Motion alongside it. Import GSAP
  plugins individually, never the full bundle.
- **Figma is binding.** Do not "improve" a designed screen. Screenshot at 1440px and 380px,
  compare against the reference, fix, re-screenshot — at least 2 rounds.
- **i18n is architectural.** The `NNỌỌ` / `WELCOME` entry choice is a language switch and has to be
  in routing from day one. Metadata is localised per route.
- **`prefers-reduced-motion` must degrade correctly** on every animated element.

## Performance budget

| Metric | Target | Ceiling |
|---|---|---|
| LCP on 4G, mid-tier Android | under 2.0s | 2.5s |
| CLS | under 0.05 | 0.1 |
| INP | under 150ms | 200ms |
| Initial JS, gzipped | under 150KB | 200KB |
| Initial total payload | under 800KB | 1MB |
| Lighthouse Performance, mobile | 90 or above | 85 |

## Workflow

Document in `context/current-feature.md` → branch (`feature/[name]` or `fix/[name]`) → implement →
`npm run build` → verify in the browser → iterate → ask before committing → merge → delete branch →
log it.

Two changelogs, and they are not the same file twice:

- **Root `CHANGELOG.md`** is tracked and team-facing. What shipped, in Keep a Changelog format,
  written from the reader's side of the screen. No token values, no reasoning.
- **`context/changelog.md`** is local working notes: why something was done, which colours and
  assets arrived, what is still open.

Both are written after the build passes and before the commit. Never rewrite past entries — if
something is undone, add a new entry saying so.

**IMPORTANT:** Do not add Claude to any commit messages. Use conventional commits (`feat:`, `fix:`,
`chore:`) and never auto-commit.

## When stuck

If something is not working after 2-3 attempts, stop and explain the issue. Do not try random
fixes. Ask when requirements are unclear.
