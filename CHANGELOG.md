# Changelog

All notable changes to the Beyond Service web app are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions are tagged per
delivery chunk: `0.1.0` for the shell, `0.2.0` for content pages, `0.3.0` for the remainder, and
`1.0.0` at launch.

Entries describe what changed from the outside. Internal reasoning, design token values and open
blockers live in local working notes and are deliberately not repeated here.

---

## [Unreleased]

Chunk 2, content pages. The Game page is built; The Characters page, the character detail route
and the News CMS are still to come.

### Added

- The Game page, reached by opening Ọnụ Ụzọ 1. Six sections in sequence: the hero with ASCEND.
  SURVIVE. COMPETE. and Watch Trailer, The Story, Two Paths. One Ascension., Master Your Chi,
  Souls of the Arena, and Answer the Summons with the cue on to The Characters.
- The Story. The chip, the heading, Soma's account either side of him, and JOIN THE TRIAL. Soma
  stands in the middle of the field with the torn ground cutting across him, and rises against the
  scroll as you read, so he reads as climbing out of it. The heading, the two columns of copy and
  the button arrive in turn as the section comes into view.
- Two Paths. One Ascension., with Survive the Trials and Dominate the Arena either side of the red
  rule. The rule turns on its side and sits between the two on a phone.
- Master Your Chi. The fighter, the machete and the spear each drift at their own speed as you
  scroll, and the two weapons turn slowly against one another, so the group reads as having depth.
- Souls of the Arena is a carousel. On a phone one card fills the screen with the next peeking past
  the edge; swipe to move through the roster. On a laptop the three cards sit in a row as before.
- Pointing at either end of the Souls carousel turns the cursor into an arrow, and clicking there
  moves to the next card. The arrow only appears when there is somewhere to go.

Every animation on this page holds still for anyone who has asked for reduced motion.

### Changed

- The Souls of the Arena heading now breaks over two lines on a phone, at the size the design gives
  it. It was running small on one line.
- The Story now runs the full height the design gives it, with the torn edges above and below in
  the right places. The section previously began and ended on a straight line, and Soma stood
  clear of the ground rather than being cut by it.
- Soma is much larger in The Story, and the heading, copy columns and button sit where the design
  puts them at both desktop and phone widths.

---

## Release history

## [0.1.0] - 2026-08-29

Chunk 1, the shell. The landing experience is navigable end to end.

### Added

- Entry screen at `/en` and `/ig`: the Goondu Games wordmark, the Beyond Service lockup, the
  Nsibidi pattern ground, the language button and the sound toggle.
- Localised routing. The site opens at `/en` by default and `/ig` serves the Igbo entry.
- All four gates are live: The Game, The Characters, Community and Competition, each on its own
  page with its environment plate, the Ọnụ Ụzọ chip, the title, the call to action and the cue to
  the next gate. Competition leads back round to The Game.
- The gate rail. A stack on the left of every gate naming all four and marking where you are.
  Any gate can be reached from any other, and every jump plays the red tear. It steps aside once
  you scroll past the gate into the page.
- The site header: the menu button, the Beyond Service wordmark, links to Comics, News and Merch
  Store, and the account button.
- The menu overlay. Opens from the left with the five main destinations and the three utility
  links, each underlining as you point at it. Closes with the button, the Escape key, or a click
  outside. It is the way to reach a gate on a phone.
- The gate plates now drift slowly and continuously, and the character and the scene behind him
  move by different amounts as you move the cursor, so the gate reads as having depth. Both hold
  still for anyone who has asked for reduced motion.
- The Nsibidi symbols behind the entry screen now drift continuously, four rows deep, each row
  moving against the one above it. They hold still for anyone who has asked for reduced motion.
- The arrow at the foot of every gate now rises and falls gently, so it reads as something you
  can follow rather than a marking. It sits still for anyone who has asked for reduced motion.
- Project structure and design system foundation: palette, type scale and motion tokens in
  `src/app/globals.css`.
- Teko and Host Grotesk, self-hosted at build time.

### Changed

- The body typeface is Host Grotesk. It was previously Manrope.
- Gate titles are larger, matching the Figma frames.
- The gate scenes sit under an even wash instead of a top-to-bottom fade, so the artwork reads
  the same from the horizon to the foreground.
- The gate rail is roomier, with more space around and between the four names.
- The top navigation sits slightly clear of the top edge.

### Fixed

- Links no longer skip the red tear. Following any link on the site now plays the transition, not
  only the entry button.
- Pages no longer flash solid red before they finish loading.
- The character no longer fills the screen on a tablet. He now keeps roughly the same presence at
  every size, and is cropped the same way whatever the shape of the window.
- Comics, News and Merch Store no longer overlap the Beyond Service wordmark on a tablet. Between
  those widths they live in the menu instead.
- Menu items no longer run onto two lines and push the Comics, News and Merch Store links off the
  bottom of the screen on tablets and small laptops.
