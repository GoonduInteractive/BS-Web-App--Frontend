# Beyond Service: Web App

The official web app for **Beyond Service: Trial of the Gods**, a game by
**Goondu Games Studio**. Frontend only — there is no backend in this phase.

## Getting started

```bash
npm install
npm run dev
```

The app runs on http://localhost:3000 and redirects to the default locale at `/en`.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Stack

Next.js 16 (App Router, static generation) · TypeScript strict · Tailwind CSS v4 ·
next-intl (English and Igbo) · Lenis · GSAP with ScrollTrigger · Decap CMS.
Teko for display, Host Grotesk for body.

All theme tokens live in `src/app/globals.css` under `@theme`. This is Tailwind v4 —
there is no `tailwind.config.ts`.
