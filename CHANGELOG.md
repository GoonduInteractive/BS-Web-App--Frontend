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

- On a character's page, the left and right edges of the opening section now lead to the
  previous and next character. With a mouse, the pointer turns into a torn cream plate that
  names who is next; click and the page wipes across to them. The roster wraps, so the last
  character leads back to the first. On a phone the same two links sit as chips at the foot of
  the section.
- A second version of the red torn wipe. The red drops from the top at a slant and crosses
  in from the right, then keeps going down and out to the left, uncovering the new page from
  the top right. It takes turns with the original wipe, which is unchanged, so no two page
  changes in a row look the same.
- On the gates, scrolling down moves to the next gate and scrolling up to the previous one,
  through the wipe. A swipe does the same on a phone, and so do the arrow and Page Up / Page
  Down keys. One scroll moves one gate, however long the trackpad glides, and nothing moves
  while the menu is open.
- The content editor has a Core abilities section setting on each character, Show or Hide.
  Hide takes the Core Abilities section off that character's page without deleting what was
  written, so choosing Show again restores it. (It was first an on/off switch, which the
  editor could not save as off.)
- Each core ability has its own action shot in the content editor, the picture on that
  ability's tile. The single action shot per character is gone; every ability starts on the
  picture that character's tiles already showed.
- The About page's opening section carries an ABOUT GOONDU chip above the headline, on the
  same torn plate as the back-to-gate chip.
- A Contact Support link in the footer on every page, which opens an email to the support
  inbox.
- "Need support?" with the support email, under the checkout's order summary and under the
  bank transfer details. The player profile shows the same line, with Log Out moved to the
  right.
- The order confirmation ends by saying where to get help.

- Payout Settings on the Edit Profile page: the bank, account number and account name a
  player wants tournament prize money paid into. The account number takes digits only and
  must be ten long. The profile shows a Payout Account line with a link to add the details.
  Nothing is saved yet.

- The Goondu Games logo in the footer links to goondu.games in a new tab.
- The online comic reader discourages copying: no right-click, dragging or long-press saving
  of pages, nothing when printed, and the pages are covered while the window is not being
  read or a screenshot key is pressed. A website cannot fully prevent screenshots or
  screen recording.

### Changed

- The Characters page opens with its name, THE CHARACTERS, as the title, and THE SOULS THAT
  SHAPE THE REALM moves above it as a smaller line, following the updated design.
- A character with no core abilities written no longer shows an empty Core Abilities heading.
- Partners are no longer a tab of the About page's team. They have their own PARTNERS band
  under it: a centred row of logos, each linking to the partner's site when one is given. They
  are edited as their own Partners collection in the content editor (name, logo, website,
  order, and a switch to hide one). The band stays hidden until the first partner is
  published. The team keeps two tabs, Core Team and Contributors.
- The bank transfer details sit closer together, with more room under the buttons.
- Checkout asks how the order should arrive before anything else: Home Delivery, to your
  address, or Pickup, to a partner collection centre near you. Home Delivery comes first and
  is chosen to begin with.
- Pickup asks only for your state and local government, never a home address, for anyone who
  would rather not share one.
- Checkout asks for your local government, from the full list for your state, and prices
  shipping from where you are and how it is coming. The total follows as you choose.
- A signed-in player finds their saved delivery details filled in, and can change any of them
  to send the order to someone else.
- Checkout has one payment step: PLACE ORDER, which opens Paystack to pay by card, bank
  transfer or USSD. This build does not take payment yet and goes straight to the
  confirmation.

- The header button reads JOIN BEYOND SERVICE, shortened to JOIN BS on phones and on
  screens where the header links leave it too little room.
- The support email everywhere on the site is support@beyondservicegame.com.

- The Game, The Characters and Competition pages now end with the site footer, after their
  last section and before the scroll cue and the pull-up to the next gate.

- Checkout never shows free shipping: every order pays the shipping price for where it is
  going.

- Comics are sold by the chapter. A chapter's page offers Online and Physical, each at its
  own price; online is one copy, so it has no quantity. The store labels each comic with its
  formats, volume and chapter, and the cart and checkout show which format each line is.
- A cart of online chapters only skips shipping at checkout: no delivery method, no address
  and no shipping charge, just contact details.
- A finished volume can be bought as one printed book. Each of its chapters' pages offers
  THE WHOLE VOLUME IN PRINT with its price, and the store shows the volume as its own card.
  It is print only and always ships. Online, a volume is still bought chapter by chapter.
- Free shipping is back as a promotion. While one is running, an order whose items reach the
  minimum ships free, and the cart and checkout show Shipping as FREE. Below the minimum they
  say how much more to add. With no promotion, the cart says shipping is calculated at
  checkout instead of always showing FREE.
- The footer has links to Goondu's social accounts, and its wordmark is the transparent
  footer version, lined up with the copyright under it.
- Sound plays in two layers, with the real tracks in place of the placeholders. One background
  track runs under every page and never stops between them. In each of the four gates, that
  gate's own track fades in on top of it and fades out on leaving. Every other page plays the
  background alone.

### Removed

- The choice between Paystack and Bank Transfer at checkout. The bank transfer page is no
  longer reached from the checkout.
- The bank transfer page itself (`/merch/checkout/transfer`) is gone. Every payment goes
  through Paystack, which offers bank transfer itself.

---

## [0.3.0] - 2026-09-23

Chunk 3. The Community and Competition pages, the merch store, the comics reader, the player
profile, News, and the content editor the team runs all of it from. Terms and Privacy are
written. Sound is wired but its five ambience files are not in the repo yet.

### Added

- Terms & Conditions and the Privacy Policy are written pages now, not Coming Soon. Each one
  lists its sections down the left on a wide screen; that list stays with you as you read and
  marks the section you are in, and clicking one takes you there. Sections rise in as you
  reach them. On a phone the list is dropped and the sections simply follow the title.
- Both legal pages are edited in the content editor, section by section. Changing, adding or
  reordering a section moves the list beside it too. Neither page can be deleted or duplicated
  by accident.
- Sound. Each gate has its own ambience, matched to the place its plate shows, and a gate's
  page keeps the same one as its door, so walking in from the portal does not break it; every
  other page shares a default. Moving between them crossfades. Sound stays off until you press
  the toggle, and nothing is downloaded until you do. The toggle now means the same thing on
  the entry screen and in the corner of every page.
- The About page's team is split across three tabs (Core Team, Contributors and Partners)
  using the same switcher as the Community Wall, with the marker, the sliding underline and
  arrow-key navigation. Each person's tab is set in the content editor; a tab with nobody in
  it yet says COMING SOON!.
- The Characters now come from the content editor: the roster, each character's page, the
  cards on The Game page's SOULS OF THE ARENA and the sitemap. A character switched off in the
  editor has no card, no page and no place in OTHER CHAMPIONS; the six set aside on 19
  September (Ogbun'abali, Lieutenant, The Beast, Oji Isi, Ogbuagu, Mkpume) wait there, switched
  off, with their name, group and portrait, for their profiles from the character bible. Before
  the first character is switched on the roster shows crossed swords and COMING SOON!.
- The team on the About page now comes from the content editor: name, role, portrait and
  order per person, plus a switch to keep someone off the page until their portrait is ready.
  The five people are there as they were. Before the first person is published the band shows
  a group glyph and COMING SOON! under THE TEAM, the way the empty News page does.
- The News page and every article now come from the content editor. An article's cover is the
  admin's choice: the picture on its own, or a torn banner. The banner is a coloured band carrying a
  volume tag, a title and an author line, torn down its edge, with the picture beside it, and the
  band can be any of ten colours from the site's palette. An article whose Igbo has not arrived yet
  reads in English rather than going missing.
- A content editor at `/admin`, built on Decap CMS. The content team signs in with GitHub and
  edits three things in English and Igbo side by side, with a draft, review and publish flow
  where publishing opens a pull request against the live branch: news articles (title, excerpt,
  date, tags, pictures, body), the characters (name, alias, group, portrait, bio, weapon and chi
  type, introduction, lore, core abilities, forms, action shot, gallery, and a switch to keep one
  off the site until it is ready) and the team on the About page (name, role, portrait, order).
  Entries land as markdown under `src/content/`, and the News page, the About page's team and
  the Characters all read the editor's entries.
- `npm run cms` runs a local proxy so articles can be edited on a developer's machine with no
  sign-in. The README explains both the login setup and local editing.
- The Igbo locale can now be machine-translated from the English with `npm run translate`, for
  both the site's copy and the editor's entries. Only what is still untranslated is sent, and
  Igbo that someone has written or corrected by hand is never overwritten. A workflow runs it
  automatically whenever English copy or new entries reach the live branch, so an editor writes
  in English, copies it to the Igbo tab and publishes; the Igbo follows on its own.
- The About page now names the team: Moses Onwe (COO), Michael Apeli (Lead Technical Environment
  Artist), Goodness Ndukwe (CTO & Lead Game Developer), Leslie Osinachi-Okok (CEO & Lead Game
  Designer) and Sophia Ahuoyiza (Product Engineering Lead), with new portraits of Michael and Sophia
  and a new team photograph behind the hero.
- Omalicha, The Sun Kin, joins Soma and Kaira among the CHAMPIONS on The Characters page, with
  her own card, modal and detail page: gun and dagger, divine golden sun chi, her four attacks,
  and two of her renders in the gallery.
- Every character's detail page now carries their official profile: the alias under the name
  (The Nightlit Fugitive, The Crimson Echo, The Sun Kin, Chief Priest), WEAPON and CHI TYPE on the
  two glyph tiles, personality, age and spiritual bond beside the portrait, the backstory under
  LORE, and the real attacks under CORE ABILITIES. Fast Punch, Charged Punch, Spirit Lock, Ije Mmụọ
  and Block for Soma; Kick Combo, Heel Kicks, Deadly Heels and Chaos Heels for Kaira; Sun and Steel,
  Solar Pierce, Anyanwu's Gaze and Anyanwu's Judgement for Omalicha; Mythic Fighting Combo,
  Ugwuoke's Decree, Hand of God and the ultimate for Nze Ugwuoke, whose Staff and Axe forms fill
  COMBAT VARIANTS. The galleries show the new 3D renders, one plate each, instead of one picture
  three times.
- A REGISTER button in the header, where the account avatar was. It opens JOIN THE COMMUNITY on the
  same torn paper as the tournament sign-up, asking for a first name, last name, WhatsApp number and
  email; SUBMIT sends them to Goondu's Google Sheet and the sheet says REGISTRATION SUCCESSFUL.
  Someone who registers again with the same email sees ALREADY REGISTERED instead, with the address
  named, and nothing is added twice. A field left empty or a malformed email or number is caught
  before anything is sent, and a failed send says so and lets you try again. Escape or the cross
  closes it.
- Terms of Use and Privacy Policy, linked from every footer, now open a Coming Soon page: the
  forest gate, the page's name on a torn chip, COMING SOON!, "This piece of our universe is
  still taking shape. Check back soon." and BACK TO HOME, until the real pages are written. The gate
  fills the screen; the footer is a scroll away, and the ground lags behind as you go, and leans
  gently against the cursor.
- A designed 404. A link that goes nowhere (a missing article, a mistyped address) lands on OOPS!
  PAGE NOT FOUND, with the 404 cut through by a sword and a BACK TO HOME button, under the site's
  header and above its footer, in the visitor's language. The 404 arrives whole; the sword sweeps in
  from the top right along the line of the cut, the tear opens behind the blade, and the page
  shivers as it lands. With reduced motion on, the cut is simply there.
- The Community page moves: the wall's notes pin themselves to the board when you arrive, rippling
  out from the middle; a note lifts under the cursor and the thumb pops when you like it; the map's
  pins drop into place, and LOCATION and ACTIVE PLAYERS re-deal when you pick a new place. All of it
  holds still for anyone who has asked for reduced motion.
- The comic reader's bar sits on a frosted band across the top of the screen, so the pages
  scrolling under it read as glass rather than passing through the gaps around the bar.
- The comic reader's bar and the SHARE THIS COMIC block under the pages share to Facebook,
  WhatsApp, X and Instagram or copy the comic's link, with the new marks; SHARE THIS COMIC now
  reads "Gain claimable community points by sharing this comic with friends." and the SUBSCRIBE
  button is gone. On a phone the reader's bar stacks BACK over the title, the pages sit closer
  together, and ANSWER THE SUMMONS puts its figure under the button.
- On a phone the footer is a centred stack, the wordmark, the links one under another, Created
  by and the studio mark, then the copyright, on every page.
- An article's title, date, byline and tags now stay in view beside the text as you read down a
  wide screen, and on a phone they lead the page above the picture, with the date and byline on
  one line. Under every article, SHARE VIA: Facebook, WhatsApp and X open a share of the article,
  and the link mark copies its address (Instagram, which offers no way to hand it a link, copies
  it too).
- Switching tabs. Community Wall / Active Player Map, and Tournaments / Leaderboards on the
  Competition page, is a swap: the underline slides across to the tab you chose, the title and the
  control beneath it change over, and the panel you were on slides away as the new one slides in
  from the other side.
- On the Active Player Map, zoom into a city and its one pin becomes one pin per player. Nairobi's
  15 ACTIVE PLAYERS are fifteen pins on Nairobi's streets, each where that player is. Zoom back out
  and the city pins return.
- The Active Player Map, the Community page's second tab: a dotted world in a disc with a pin
  wherever players are, and LOCATION / ACTIVE PLAYERS beside it for the place you have chosen. Drag
  it, zoom it, or search a location; tap a pin and the map flies down to that city's streets, names
  and all, then back out to the dotted world as you zoom away. Works from the keyboard too. On a
  phone the disc runs wider than the screen, one finger scrolls the page and two move the map, and
  INVITE FRIENDS follows below with your invite link and a COPY LINK button.
- The Community page behind Ọnụ Ụzọ 3: COMMUNITY WALL over the entry screen's ground and drifting
  glyphs, with a Community Wall / Active Player Map switch, and the wall itself
 , a board of over a hundred and sixty handwritten notes on torn paper in four colours that
  you drag around in every direction, like a pinboard bigger than the screen. Each note can be
  liked. SHARE YOUR THOUGHTS opens DROP YOUR FEEDBACK, and what you write is pinned in the middle
  of your view as your own note for the visit, the notes already there slide aside to make room
  for it, so nothing is ever covered. On a phone the same board is smaller and swipes sideways.
- An About Goondu Games page, reached from ABOUT GOONDU in the menu and from the footer's About
  link, both of which led nowhere until now. It opens on WE BRING LEGENDS TO LIFE. over a
  photograph of the studio and its players, with what Goondu is beside it and EXPLORE OUR WORLD.
  The photograph leans very slightly as the cursor moves and breathes over about twenty seconds.
- SOME LEGENDS DESERVE TO BE EXPERIENCED. below it: the studio's account of itself in four parts,
  beside a photograph that rises against the scroll as you read past it. The heading, the picture
  and each paragraph arrive in turn as the section comes up.
- BEHIND GOONDU GAMES closes the page on a deep red field, the team, six to a grid that steps
  from one across on a phone to four on a wide screen, the last row centred. The cards arrive one
  after another rather than all at once, and a portrait lifts slightly under the cursor. Placeholder
  names, pending the real ones.
- The page holds still for anyone who has asked for reduced motion, and reads down a 380px phone
  without sideways scroll.
- Every gate page now ends on a footer showing the next gate waiting underneath it, with its name
  across the join. Keep scrolling and it is drawn up over the page you are on, its top edge
  rounded like a sheet being lifted, squaring off as it arrives, and carrying enough weight that
  it settles rather than stops. When it covers the screen you are simply on it. The cue above it
  is still a link for anyone who would rather click, and that is what a phone and anyone who has
  asked for reduced motion get.
- The Competition page behind Ọnụ Ụzọ 4. It opens on RISE THROUGH THE TRIAL / COMPETITION with
  two Somas standing on a torn edge, the pair leaning gently against the cursor, and fills the
  screen at any height.
- Beneath it, FEATURED TOURNAMENT: a Tournaments / Leaderboards switch, the pitch with JOIN THE
  TRIAL, and the Wrath of Nze Ugwuoke card, status, days remaining, region, players and the
  rewards pool on a torn linen sheet, with Nze Ugwuoke on a red plate beside them and REGISTER NOW
  and VIEW DETAILS underneath. Days remaining count down from the closing date rather than sitting
  at a fixed number.
- ACTIVE TOURNAMENTS lists three: what each card shows follows its state, so a running league
  prints when it ends and offers details, an open cup prints when it starts and offers
  registration, and one that is coming soon prints its region and nothing more.
- EARN ACHIEVEMENTS: four emblems on parchment cards, each with what to do and what it earns.
- REGIONAL LEAGUES over a dotted map of the world, with the pitch and VIEW ACTIVE PLAYER MAP on the
  left and the five active regions listed on the right.
- HALL OF ASCENSION: three champion cards, portrait over a ringed field with the season on a red
  plate beneath.
- THE GODS ARE WATCHING closes the page with REGISTER FOR A TOURNAMENT and the scroll cue; keep
  scrolling and the next gate is drawn up over it, as on the other gate pages.
- Everything reads down a 380px phone without sideways scroll and holds still under reduced motion.
- The red CTA can now sit on a black fill or as an outlined button, and comes in a smaller size for
  cards.
- REGISTER NOW on the featured tournament opens a JOIN TOURNAMENT sheet, format, prize pool,
  region, deadline and open slots, two boxes to tick, and CONFIRM REGISTRATION, which hands on
  to a REGISTRATION SUCCESSFUL sheet with BACK TO PROFILE. Both close on Escape, on the backdrop
  and on the cross, and return you to where you were. Nothing is sent anywhere yet.
- The Leaderboards tab now opens a leaderboard: the season's top three on a gold, silver and
  bronze podium, the rankings beneath them, and two filters, region and season, that narrow
  both. Signed-in players also see YOUR JOURNEY, their own row with the points to the next rank.
  On a phone the podium stacks and the table scrolls sideways.
- On a phone the Competition hero now shows BACK TO ỤZỌ and lays its two figures out as the
  phone design draws them, and THE GODS ARE WATCHING keeps its glyphs at the right.
- Every tournament now has its own page under the Competition page, opening on its name, its
  pitch and Nze Ugwuoke over the same red ground, with BACK TO TOURNAMENTS above. Under it, the
  facts at a glance, status, dates, region, players, format, then FOLLOW THE JOURNEY TO
  ASCENSION, the six stages from registration to the finals with the one in progress lit, and
  TOURNAMENT RULES and REWARDS, each a bar that opens and closes. A tournament still taking
  registrations offers REGISTER FOR TOURNAMENT, which opens the same JOIN TOURNAMENT sheet.
- A tournament that is under way also shows CURRENT MATCHUPS, each match's two players and their
  points, with a clock counting down to the end of the round, four figures (registered, matches
  played, rounds remaining, days until the finals) and the full bracket from the round of 16 to
  the final, which scrolls sideways on a wide screen and stacks round by round on a phone.
- VIEW DETAILS on the featured tournament and the button on each tournament card now open that
  tournament's page; BACK TO TOURNAMENTS on it returns to the Competition page.

### Changed

- The sound control now shows its state: muted, the bell is struck through in red inside a
  plain square; with sound on, the red is gone, the plate is the torn one, and small marks
  drift up off the bell. They hold still for anyone who has asked for reduced motion.
- SOULS OF THE ARENA on The Game page now shows the first three characters from the roster,
  with their own portraits, and its button reads EXPLORE CHARACTERS and opens The Characters
  page. Reordering the characters in the editor changes which three appear.
- The News page is public again, and in the sitemap. Until the first article is published it
  shows a newspaper glyph, COMING SOON! and BACK TO HOME under its heading, the way the empty
  cart does.
- An article whose Igbo tab was left partly empty reads those parts in English rather than
  breaking, and a picture placed in the text of an article is drawn the same way as the
  article's body picture.
- An article's author is set in the editor: it appears as the byline under the title, and on
  the foot of a torn cover. Left empty, the byline reads By Goondu Staff as before.
- The editor always loads its current set of fields, so a tab left open across a change no
  longer offers fields that no longer exist.
- Every call to action on The Game and The Characters pages. WATCH TRAILER, JOIN THE TRIAL, EXPLORE
  CHARACTERS, reads DOWNLOAD GAME for now and opens the game's itch.io page in a new tab.
- The Characters page shows Soma, Kaira, Omalicha and Nze Ugwuoke for now. The GODS group and the
  other adversaries. Lieutenant, The Beast, Oji Isi, Ogbuagu, Mkpume, are set aside until their
  details are ready and their pages are not reachable in the meantime. On The Game page, SOULS OF
  THE ARENA shows Nze Ugwuoke in Ogbun'abali's place, and its three cards carry the same names and
  aliases as the Characters page.
- The hero's two stats read WEAPON and CHI TYPE rather than ROLE and DIFFICULTY.
- The account avatar and its dropdown are gone from the header for now; there is no account
  behind them yet. REGISTER stands in their place.
- News, the Merch Store, Comics and Competition are not public yet: every address under them, the
  news feed and its articles, the store, a product, the cart and checkout, the comics and the
  reader, the competition page and its tournaments, opens onto the Coming Soon page for now, with
  the section's name on the chip, the way Terms of Use and Privacy Policy do. The header's Comics,
  News and Merch Store links, the menu's COMPETITION and the fourth door's DISCOVER THE COMPETITION
  still go where they went and land there. Those pages are kept out of search and out of the sitemap
  while they are hidden; a link to an article or product that does not exist is still a 404.
- Hovering Comics, News or Merch Store in the header turns the word cream and draws a hand-drawn
  hairline under it; in the menu, the gate links turn the same cream and a flared rule draws in
  beneath them where a plain line used to grow.
- The footer on a wide screen sits a little tighter to the frames: the rule, wordmark, links and
  Created by line have moved by a few pixels on every page.
- The four gates now stand at the home address. `/en` is the portal: the entry screen, then
  whichever Ọnụ Ụzọ you are looking at. ENTER, the scroll cues, the gate rail and BACK TO ỤZỌ all
  move between the doors without changing the URL. A gate's page has its own address
  (`/en/the-game`, `/en/characters`, `/en/community`, `/en/competition`), reached through the door's
  DISCOVER button; a shared page link opens straight onto the page. The pull-up at the foot of a
  page lands on the next door at the home address.
- A character's modal no longer scrolls its whole column: the name and role stay at the top and
  SEE FULL DETAILS stays at the bottom, always in reach, while a long bio scrolls between them
  with a fade where there is more to read. The modal also grows to the screen before it scrolls,
  so most bios need no scrolling at all. Closing it returns focus to the card that opened it. On
  a phone the modal follows its phone design: the portrait sits square at the left with the name,
  role and bio beneath it.
- SOULS OF THE ARENA on The Game page is now live: each of the three cards opens that
  character's modal, the same one the Characters page shows, with SEE FULL DETAILS through to the
  character's page, and EXPLORE CHARACTERS goes to the Characters page.
- On a large screen the machete and the spear in MASTER YOUR CHI now turn, from the delivered
  animations; on a phone or tablet they stay the stills they were.
- The gate rail has moved to the lower right and taken its new form: the gate you are at sits in
  a dark pill with a red mark, the other three are listed beneath it with hollow rings, and each
  is still a link to its gate.
- The way one gate page hands over to the next has changed. Reaching the foot of The Game, The
  Characters or Competition now shows the foot as designed and stops there: SCROLL TO GO NEXT, the
  next gate's name across the seam, a strip of its plate beneath. Scrolling on from there draws the
  next gate up over the page, heavily, lagging the hand a little, as if something were pulling it.
  Stop, and it settles back down; keep going, and it draws itself the rest of the way and you are
  on the next gate. On a phone the same pull is a swipe. Nothing moves unless you move it.
- On a tournament page the bracket runs edge to edge across the screen rather than sitting inside
  the page's margins, on a wide screen its first and last rounds sit on the edges, on a narrower
  one it opens on its middle and scrolls either way, and VIEW FULL BRACKET fills red under the
  cursor instead of underlining.
- The six-stage journey row on a tournament page stacks vertically on screens narrower than
  1280px, where it no longer runs past the edge.
- A tournament page now moves as you read it: Nze Ugwuoke arrives on the hero, the facts and the
  six stages of the journey come in one after another with the path drawing itself between them,
  the current matchups rise, the four figures count up to their values, the bracket grows round
  by round with its lines drawing across, and TOURNAMENT RULES and REWARDS open and close
  smoothly. Match and figure cards lift under the cursor.
- The leaderboard does too: the podium rises from the ground with the champion last, the
  rankings arrive row by row, the filter menu pops from its chip, and choosing a filter re-deals
  the board. A ranking row lifts towards you with a thin ring under the cursor and podium
  portraits lift, and switching between Tournaments and Leaderboards settles the new panel in
  rather than swapping it.
- The tournament cards' and the featured tournament's artwork push in slightly under the
  cursor, as the character and product cards already do.
- The tournament page on a phone now follows its phone design: Nze Ugwuoke fills the width of
  the screen with REGISTER FOR TOURNAMENT laid over him, the facts sit in two left-aligned rows,
  the journey's six stages run down the screen full width with their status and the path between
  them centred, the current matchups and figures take the width the design gives them, and the
  bracket is the same tree as on desktop, the round of 16 in view with its lines leading off the
  right edge and the later rounds a swipe away. TOURNAMENT RULES and REWARDS and THE GODS ARE
  WATCHING take the phone design's sizes and spacing.
- The clocks on a running tournament's matches count down again, the sample matches had
  quietly run out.

### Removed

- The eleven placeholder news articles and their sample copy. Nothing is shown on the News
  page that the content team has not written.

### Fixed

- On the About page, a last row with fewer people than the row holds now sits centred at every
  screen size, instead of hugging the left.
- A torn news cover sizes its title to the band it sits in, so a long headline wraps and fits
  instead of running past the tear, and the volume tag keeps its shape on the article page.
- On a phone the leaderboard's tables scroll sideways the way the character sheet's story scrolls:
  a slim bar, and the edge with more behind it fades so it reads as "more this way".
- On the Competition page the Tournaments / Leaderboards underline sat well below its tab; it is
  under the tab again, and the leaderboard's filter menus open over the podium instead of behind it.
- On the Active Player Map, + and − now zoom into the place LOCATION names rather than the middle of
  the disc, the streets are fetched as a flight begins so they are drawn the moment it lands, and
  the street map is no longer darkened, sea and land read as the map style draws them.
- The leaderboard's podium frames now hold each player's own picture instead of a picture fixed in
  the frame, so whoever holds 1st, 2nd or 3rd is who appears there.
- On a phone, the Community Wall's notes drew their torn paper at little more than half the card,
  so the handwriting ran off the paper and the like count and time sat below it. The paper now
  fits the card.
- Every red button on the site had been resting in its darker hover shade; it is the bright red
  again, darkening only under the cursor.
- On the Community page, BACK TO ỤZỌ could not be clicked on a desktop screen, the tab row sat
  over it.
- With reduced motion on, the figure at the foot of The Game page and of a comic sat well left of
  centre on a phone.

- Scrolling with a dialog open, a character's card, the tournament registration sheet, the
  order confirmation, moved the page behind it and left the dialog where it was. The page now
  holds still and the dialog's own contents scroll under the wheel or a finger.
- With reduced motion on, a running tournament's bracket collapsed every card to the top of its
  column. It lays out correctly again.
- The torn edge where a tournament card's body meets its artwork now runs the full width of the
  card; it stopped short of both sides.
- The site has its icon: the favicon in the tab, the touch icon on a phone's home screen, and a
  web app manifest that names it Beyond Service and keeps the chrome black.
- Every page now describes itself properly to search engines and social networks: a title and
  description, a canonical address, its English and Igbo alternates, an Open Graph and Twitter
  card, the key art by default, a character's own render, a product's photo or an article's
  picture where the page has one, and structured data for the studio, the site, articles,
  products and tournaments. A sitemap lists every public page in both languages; the profile,
  cart and checkout are kept out of search.
- On a phone, the bank-transfer sheet and the ORDER CONFIRMED sheet in the merch store are now
  torn paper edge to edge, with the account details, the buttons and the confirmation all on the
  paper, the sheet used to cover only a band through the middle. The transfer sheet also follows
  its phone design: tighter heading, smaller values, the two buttons full width one above the
  other.
- Sections that were not behind a gate could load with their contents invisible, and the About page
  was the first to sit in front of one. Every scroll-driven section on the site shared the cause.


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
  lines and paragraphs ran hundreds of lines down a narrow gutter, one character page came out
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
