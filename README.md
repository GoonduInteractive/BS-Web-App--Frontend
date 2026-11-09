# Beyond Service: Web App

The official web app for **Beyond Service: Trial of the Gods**, a game by
**Goondu Games Studio**. The frontend only: game data comes from Goondu's Beyond Service API,
through the typed adapters in `src/lib/api/`. One thing keeps sample data: the Active Player Map
on Community, until the API has player locations.

## Getting started

```bash
npm install
npm run dev
```

The app runs on http://localhost:3000 and redirects to the default locale at `/en`.

### The game backend

Copy `.env.example` to `.env`. `NEXT_PUBLIC_API_URL` (the Beyond Service API,
`https://backend-a5um.onrender.com`) is required: `next.config.ts` stops the dev server and the
build without it. Set it in the host's environment (Vercel) too. Every call goes through
`src/lib/api/client.ts`.

Connected so far:

- **Regional Leagues** on Competition reads `GET /v1/regions`, the list admins manage in the
  admin's Regions page. The page is prerendered and refreshed at most hourly, so a new region
  shows without a redeploy.
- **Accounts**: sign up, sign in, confirm email, resend, forgot and reset password
  (`/v1/auth/*`), and who is signed in (`GET /v1/player/profile`). Tokens live in this browser
  (`src/lib/api/session.ts`); `authedRequest` sends them and refreshes once on a 401. Create
  Account also asks for the Gamer ID and region the API requires. There is no Google sign-in: the
  API has none.
- **Profile**: the player's profile, Edit Profile (name, username, region) and the avatar upload
  (`/v1/player/*`, `/v1/files/upload`).
- **Competition**: tournaments, a tournament's page and bracket (`/v1/tournaments/*`), the
  leaderboard (`/v1/leaderboards`), and, as the player, their own row and registering.
- **Community**: the wall's approved notes (`/v1/notes`); posting and liking as the player.
- **Store and comics**: products (`/v1/products`, by category), the player's cart, their saved
  delivery details, the shipping quote for a place, checkout with where it goes, payment and order
  summary (`/v1/cart`, `/v1/shipping/*`, `/v1/orders/*`, `/v1/payments/init`), their comics library
  and a chapter's pages (`/v1/comics`).

What anyone sees is read on the server, at build and again when a page revalidates (hourly; five
minutes for a tournament's page and the Community Wall). What belongs to the player is read in the
browser with their token, through TanStack Query.

Uploads go to the API's public storage (since 2026-10-27). Anything uploaded before then sits on the
old private storage, which no browser can load: upload it again. Waiting on the backend: notes carry
no like count. See `context/current-feature.md`.

Since 2026-10-28 the account emails carry a 6-digit code rather than a link: the player enters it
on `/<locale>/confirm-email` or `/<locale>/reset-password`. An old `/<locale>/verify-email` link
goes to Confirm Email. The API sleeps when idle, so a build after a quiet spell can take a minute
longer while it wakes.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run cms` | Local Decap proxy, for editing content without logging in (see below) |

## Stack

Next.js 16 (App Router, static generation) · TypeScript strict · Tailwind CSS v4 ·
next-intl (English and Igbo) · Lenis · GSAP with ScrollTrigger · Decap CMS.
Teko for display, Host Grotesk for body.

All theme tokens live in `src/app/globals.css` under `@theme`. This is Tailwind v4, so there is
no `tailwind.config.ts`.

## Content editing

Decap CMS at `/admin` edits **news articles**, the **characters** (the roster, each detail page
and the cards on The Game page), the **team** and **partners** on the About page, the **legal**
pages, and the **Hall of Ascension** (the season champions on Competition).
Everything game-side (leaderboards, tournaments, community, merch, players) comes from the
adapters in `src/lib/api/` and is not editable here.

A character, team member, partner or champion has a **Show on the site** switch. With no
champion switched on, the Hall of Ascension shows Coming Soon. Off, they have no card and no
page; on the Characters it is how the six set-aside characters wait for their profiles from the
character bible. How a portrait is cropped is set per picture file in code (`src/lib/characters.ts`,
`src/lib/team.ts`), not in the editor. A new picture gets a sensible default crop.

A news article's cover is either the picture on its own or a **torn banner**: a coloured band
carrying a volume tag, a cover title and an author line, torn down its edge, with the picture
beside it. Choose under *Cover style*; *Band colour* picks from the site's palette. The News
page reads these articles directly; it shows only its heading until the first one is published.

Every entry is written in both English and Igbo, side by side, and lands as markdown in
`src/content/<collection>/en/` and `src/content/<collection>/ig/`. Pictures go to
`public/assets/news/`, `public/assets/characters/`, `public/assets/about/`,
`public/assets/partners/` and `public/assets/hall/`. Publishing opens a
pull request against `main`, which is production, and the site rebuilds on Vercel when it merges.

### Login

The site is on Vercel, so editors sign in with **GitHub** rather than Netlify Identity. Anyone
with write access to this repository can edit. The GitHub sign-in needs a small OAuth gateway
that runs as its own Vercel project; this repository holds no server code for it. To set it up
once:

1. Fork [daresaydigital/decap-cms-oauth](https://github.com/daresaydigital/decap-cms-oauth) and
   deploy the fork to Vercel as a new project. Note its URL, e.g. `https://bs-cms-auth.vercel.app`.
2. On GitHub, create an OAuth App (Settings → Developer settings → OAuth Apps, on the
   GoonduInteractive organisation). Homepage URL: the site. **Authorization callback URL:
   `https://<gateway>/callback`.**
3. In the gateway's Vercel project, set the environment variables `OAUTH_GITHUB_CLIENT_ID` and
   `OAUTH_GITHUB_CLIENT_SECRET` from that OAuth App, then redeploy it.
4. In `public/admin/config.yml`, set `backend.base_url` to the gateway's URL.

### Editing locally

```bash
npm run dev   # the site, in one terminal
npm run cms   # the local proxy, in another
```

Open http://localhost:3000/admin and choose the local login. Entries are written straight into
the working tree, so commit them like any other change. Nothing touches GitHub.

### The Igbo tab

Every entry has an English and an Igbo tab, and Decap will not publish until both are filled.
Write the English, then on the Igbo tab click **Fill in from another locale** and publish. The
Igbo is machine-translated after the publish lands (see below). Anything you write or correct
in Igbo yourself is kept and never overwritten.

## Igbo translation

`npm run translate` machine-translates the Igbo locale from the English with Google's Cloud
Translation API: both `src/messages/ig.json` and the CMS content under `src/content/*/ig/`.
It is incremental: only what is untranslated is sent. In `ig.json` that means a key that is
missing or still carries the `TODO ig:` placeholder; in CMS content it means an Igbo field that
is empty or identical to the English. A committed ledger (`scripts/translate/ledger.json`)
records every string the machine wrote, so a hand-edited string is recognised and left alone,
and a string whose English changed is translated again.

The ledger doubles as the review list: everything in it is machine output. Google's Igbo is
rough on tone marks and idiom, so an Igbo speaker should read through it and correct in place.
Corrections stick.

| Command | Does |
|---|---|
| `npm run translate` | Translate whatever is untranslated, messages and content |
| `npm run translate -- --messages` / `--content` | One or the other |
| `npm run translate -- --dry-run` | List what would be sent, without calling the API |
| `npm run translate -- --check` | Exit 1 if anything is untranslated |

**Setup, once:** in Google Cloud, create a project, enable the *Cloud Translation API*, and
create an API key restricted to it. Put it in `.env` as `GOOGLE_TRANSLATE_API_KEY=…` for local
runs, and add it as the repository secret `GOOGLE_TRANSLATE_API_KEY` on GitHub. The free tier
covers 500,000 characters a month; the whole English message file is about 61,000.

**Automatically:** the `Translate Igbo` workflow (`.github/workflows/translate.yml`) runs on
every push to `main` or `dev` that touches `src/messages/en.json` or `src/content/`, and commits
the Igbo back. Editors publish to `main`, so an article's Igbo follows its publish without anyone
asking for it; `dev` is covered too, for copy changed in development.

## Sound

The site plays in two layers. One background bed runs under every page and never changes; while
the visitor is in one of the four gates, that gate's own track plays **on top of** it — the two are
composed to be heard together. Everywhere else hears the bed alone. The toggle (bottom left, and on
the entry screen) turns it on or off everywhere.

Sound is **off by default and never autoplays**, and nothing under `public/audio/` is downloaded
until someone turns it on. A visitor who never touches the toggle pays nothing for it.

| File | Where it plays |
|---|---|
| `public/audio/bgs.mp3` | Everywhere, always |
| `public/audio/gate-1.mp3` | Over the bed: Ọnụ Ụzọ 1 and The Game |
| `public/audio/gate-2.mp3` | Over the bed: Ọnụ Ụzọ 2 and The Characters |
| `public/audio/gate-3.mp3` | Over the bed: Ọnụ Ụzọ 3 and Community |
| `public/audio/gate-4.mp3` | Over the bed: Ọnụ Ụzọ 4 and Competition |

