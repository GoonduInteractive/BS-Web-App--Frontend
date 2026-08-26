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

- Entry screen at `/en` and `/ig`: the Goondu Games wordmark, the Beyond Service lockup, the
  Nsibidi pattern ground, the language button and the sound toggle.
- Localised routing. The site opens at `/en` by default and `/ig` serves the Igbo entry.
- Project structure and design system foundation: palette, type scale and motion tokens in
  `src/app/globals.css`.
- Teko and Host Grotesk, self-hosted at build time.
- The Nsibidi symbols behind the entry screen now drift continuously, four rows deep, each row
  moving against the one above it. They hold still for anyone who has asked for reduced motion.

### Changed

- The body typeface is Host Grotesk. It was previously Manrope.

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
