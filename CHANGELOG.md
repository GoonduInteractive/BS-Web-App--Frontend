# Changelog

All notable changes to the Beyond Service web app are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions are tagged per
delivery chunk: `0.1.0` for the shell, `0.2.0` for content pages, `0.3.0` for the remainder, and
`1.0.0` at launch.

Entries describe what changed from the outside. Internal reasoning, design token values and open
blockers live in local working notes and are deliberately not repeated here.

---

## [Unreleased]

### Added

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
- Entry screen at `/en` and `/ig`: the Goondu Games wordmark, the Beyond Service lockup, the
  Nsibidi pattern ground, the language button and the sound toggle.
- Localised routing. The site opens at `/en` by default and `/ig` serves the Igbo entry.
- Project structure and design system foundation: palette, type scale and motion tokens in
  `src/app/globals.css`.
- Teko and Host Grotesk, self-hosted at build time.
- The Nsibidi symbols behind the entry screen now drift continuously, four rows deep, each row
  moving against the one above it. They hold still for anyone who has asked for reduced motion.

- The arrow at the foot of every gate now rises and falls gently, so it reads as something you
  can follow rather than a marking. It sits still for anyone who has asked for reduced motion.

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

---

## Release history

<!--
  Move entries out of Unreleased and under a version heading when a chunk ships.

  ## [0.1.0] - YYYY-MM-DD

  ### Added
  - Entry screen with English and Igbo language selection
  - Gate sequence covering The Game, The Characters, Community and Competition
  - Site header, menu overlay and sound toggle
  - Page transition system

  ### Changed
  ### Fixed
  ### Removed
-->
