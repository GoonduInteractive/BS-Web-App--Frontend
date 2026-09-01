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

- Every gate page now ends on a footer showing the next gate waiting underneath it, with its name
  across the join. Keep scrolling and it is drawn up over the page you are on — its top edge
  rounded like a sheet being lifted, squaring off as it arrives, and carrying enough weight that
  it settles rather than stops. When it covers the screen you are simply on it. The cue above it
  is still a link for anyone who would rather click, and that is what a phone and anyone who has
  asked for reduced motion get.

Next up: the News CMS, then the Community and Competition pages, both of which are waiting on
designs.

---

## Release history

## [0.2.0] - 2026-08-30

Chunk 2, content pages. The Game page, The Characters page and a page for every character are
built and navigable. The News CMS is still to come.

### Added

- A page for every character, reached by SEE FULL DETAILS on their card. It opens on their name at
  full height with their role, their standing in the arena and how hard they are to play, then
  their lore, their four core abilities, their two combat variants, a gallery, and a row of other
  champions to move on to. Each section arrives as you reach it, the headings drift against the
  scroll, and the gallery plates settle as they cross the screen. All of it holds still for anyone
  who has asked for reduced motion.
- A footer, on the character pages: the Beyond Service lockup, Terms of Use, Privacy Policy and
  About, and the Goondu Games credit.
- MORE CHAMPIONS ARE COMING closes The Characters page, over the hooded ascendant and his red
  wash, with what is still to come and JOIN THE TRIAL. The three lines of the heading rise one
  after another as you reach them and the artwork drifts against the scroll behind them. The cue
  on to Community follows.
- The Characters page opens on THE SOULS THAT SHAPE THE REALM, reached by opening Ọnụ Ụzọ 2. The
  chip, the heading, the account of who shapes the realm, the note on the right and JOIN THE TRIAL
  each arrive in turn as the page appears.
- The roster below it: CHAMPIONS, GODS, and LEGENDS & ADVERSARIES, nine cards in all. Each heading
  and its row arrive as you reach them, and the ground darkens as you read down the page. The
  boundary between the hero and the roster is torn rather than straight.
- Clicking any character opens their card on a torn parchment panel, with the portrait, name, role,
  their story and SEE FULL DETAILS. Close it with the ✕, the Escape key, or by clicking outside it;
  it is fully keyboard operable and the page behind it stays put.
- A machete hangs in front of the spirit tree on that hero. Move the cursor and the blade and the
  clearing behind it lean by different amounts, so the two read as standing apart. Both hold still
  for anyone who has asked for reduced motion.
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

- A character card opens on a panel that stays the same size however long their story is; the
  writing scrolls inside it.
- Kaira fills her card the way every other character does. She had been sitting small in the middle
  of hers.
- The rule under a character's role, and the one above the footer, are drawn with a turned tick at
  each end rather than as plain lines.
- The ROLE and DIFFICULTY tiles on a character page carry their marks.
- The Souls of the Arena heading now breaks over two lines on a phone, at the size the design gives
  it. It was running small on one line.
- The Story now runs the full height the design gives it, with the torn edges above and below in
  the right places. The section previously began and ended on a straight line, and Soma stood
  clear of the ground rather than being cut by it.
- Soma is much larger in The Story, and the heading, copy columns and button sit where the design
  puts them at both desktop and phone widths.

### Fixed

- The Characters page and the character pages now hold together on a tablet. Both used to hold
  their desktop layout down to 768, where headings broke mid-word, buttons wrapped onto three
  lines and paragraphs ran hundreds of lines down a narrow gutter — one character page came out
  more than twice its proper length. They now stack below 1024 and scale smoothly above it.
- Every character card is the same size as every other, at every screen width. Cards in the
  Champions, Gods and Legends rows used to come out three different widths on the same page.
- The Characters page no longer scrolls sideways on a small laptop.
- The Game page no longer scrolls sideways on a phone or a tablet. Soma, the Master Your Chi
  fighter and weapons, and the Souls cards all reached past the edge of the screen and dragged the
  page with them.
- Two Paths. One Ascension. stacks its two paths on a tablet, with the rule turned on its side
  between them. Below 1024 it had been holding the desktop arrangement, which ran the second path
  off the side of the screen.
- The artwork behind MORE CHAMPIONS ARE COMING fills the section on a phone and a tablet instead
  of sitting small in the corner, and is eased back so the writing over it stays legible.

---

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
