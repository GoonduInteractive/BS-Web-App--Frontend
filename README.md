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
| `npm run cms` | Local Decap proxy, for editing content without logging in (see below) |

## Stack

Next.js 16 (App Router, static generation) · TypeScript strict · Tailwind CSS v4 ·
next-intl (English and Igbo) · Lenis · GSAP with ScrollTrigger · Decap CMS.
Teko for display, Host Grotesk for body.

All theme tokens live in `src/app/globals.css` under `@theme`. This is Tailwind v4 —
there is no `tailwind.config.ts`.

## Content editing

Three things are edited in Decap CMS at `/admin`: **news articles**, the **characters** (the
roster, each detail page and the cards on The Game page) and the **team** on the About page.
Everything game-side — leaderboards, tournaments, community, merch, players — comes from the
adapters in `src/lib/api/` and is not editable here.

A character or team member has a **Show on the site** switch. Off, they have no card and no
page; on the Characters it is how the six set-aside characters wait for their profiles from the
character bible. How a portrait is cropped is set per picture file in code (`src/lib/characters.ts`,
`src/lib/team.ts`), not in the editor — a new picture gets a sensible default crop.

A news article's cover is either the picture on its own or a **torn banner** — a coloured band
carrying a volume tag, a cover title and an author line, its edge torn, with the picture beside
it. Choose under *Cover style*; *Band colour* picks from the site's palette. The News page reads
these articles directly; it shows only its heading until the first one is published.

Every entry is written in both English and Igbo, side by side, and lands as markdown in
`src/content/<collection>/en/` and `src/content/<collection>/ig/`. Pictures go to
`public/assets/news/`, `public/assets/characters/` and `public/assets/about/`. Publishing opens a
pull request against `main`, and the site rebuilds on Vercel when it merges.

### Login

The site is on Vercel, so editors sign in with **GitHub** rather than Netlify Identity. Anyone
with write access to this repository can edit. The GitHub sign-in needs a small OAuth gateway
that runs as its own Vercel project — this repository holds no server code for it. To set it up
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
the working tree — commit them like any other change. Nothing touches GitHub.

### The Igbo tab

Every entry has an English and an Igbo tab, and Decap will not publish until both are filled.
Write the English, then on the Igbo tab click **Fill in from another locale** and publish. The
Igbo is machine-translated after the publish lands (see below). Anything you write or correct
in Igbo yourself is kept and never overwritten.

## Igbo translation

`npm run translate` machine-translates the Igbo locale from the English with Google's Cloud
Translation API — both `src/messages/ig.json` and the CMS content under `src/content/*/ig/`.
It is incremental: only what is untranslated is sent. In `ig.json` that means a key that is
missing or still carries the `TODO ig:` placeholder; in CMS content it means an Igbo field that
is empty or identical to the English. A committed ledger (`scripts/translate/ledger.json`)
records every string the machine wrote, so a hand-edited string is recognised and left alone,
and a string whose English changed is translated again.

The ledger doubles as the review list: everything in it is machine output. Google's Igbo is
rough on tone marks and idiom, so an Igbo speaker should read through it and correct in place
— corrections stick.

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
every push to `main` that touches `src/messages/en.json` or `src/content/`, and commits the
Igbo back. Because it only runs on `main`, run `npm run translate` on `dev` before merging so the
two branches do not both translate the same strings.

## Sound

The site plays one ambient bed at a time, chosen by where the visitor is: each gate has its own,
a gate's page keeps the same bed as its door, and every other page shares a default. The toggle
(bottom left, and on the entry screen) turns it on or off everywhere.

Sound is **off by default and never autoplays**, and nothing under `public/audio/` is downloaded
until someone turns it on — a visitor who never touches the toggle pays nothing for it.

**The five files are placeholders.** No sound design has been delivered, so they are synthesised
by `npm run audio` ([scripts/audio/make-placeholders.mjs](scripts/audio/make-placeholders.mjs)),
each built to match what its gate's plate shows. Replace them by dropping real files at the same
paths — nothing else changes:

| File | Where it plays |
|---|---|
| `public/audio/gate-1-grove.mp3` | Ọnụ Ụzọ 1 and The Game |
| `public/audio/gate-2-shrine.mp3` | Ọnụ Ụzọ 2 and The Characters |
| `public/audio/gate-3-canyon.mp3` | Ọnụ Ụzọ 3 and Community |
| `public/audio/gate-4-arena.mp3` | Ọnụ Ụzọ 4 and Competition |
| `public/audio/default.mp3` | About, News, Comics, Merch, everything else |

When the real files land, this script and its `@breezystack/lamejs` devDependency can be deleted.

## Working notes

Project context, design references and the per-feature workflow live in `context/`,
which is gitignored and shared out of band. `CLAUDE.md` at the root carries the
short version.
