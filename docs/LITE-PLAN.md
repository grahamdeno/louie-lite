# Louie Lite plan: Louie's features in the amp look, without the game

Status: approved by Graham 2026-11-13. Build in progress on branch lite-3. Nothing here is built yet. One release at the end, shipped when Graham says ship.

## Ground rules for whoever builds this

1. Read CLAUDE.md first. Plain writing, no em dashes, thumb reach, don't change how the search bar works.
2. Source of each feature: grahamdeno/tabs at 4.89.0 (Louie). Port the behavior, restyle it in Lite's amp materials (piping, plate, recess, copper, chrome, lamp, tolex). No purple flat Duolingo look anywhere.
3. No ring controls (Graham's rule since Louie 3.19.0). Lite's hold-Play ring, the arc, the gold island and Play following the hand all go.
4. Nothing may depend on the app hearing which exact chord is played. Single notes (tuner, a lesson's string check, a sung voice) are fine. Strum timing is fine.
5. The AI never writes lyrics. Words come from LRCLIB, the user's own paste or sheet, or (later, for the App Store) a licensed service such as Musixmatch.
6. Storage names keep the `louielite` prefix so Lite never touches Louie's data on the same phone.
7. Build on a branch. Don't merge to main or ship until Graham says ship.

## What comes over (numbers are from the list Graham picked from)

### Adding songs
- 1 Search or add screen: Paste, Scan, Sing it, Ideas, Write one from scratch. Search opens as a clean screen.
- 2 From Apple Music: songs listened to lately, each with Get the chords.
- 3 Chords for your level: Beginner, Intermediate, Advanced; Louie picks the best-rated chart (AI).
- 4 Paste on return: "Welcome back, paste the chords?" adds the song linked to its recording, with Undo. Copying the sheet on the chord site is how the words come in.
- 5 Get the song keeps its result when you tap away, with a "ready" bar to bring it back.
- 53 Get the song shows its progress and finds the recording.
- 6 Ideas (the newer What can I play next?): cards, fewest new chords first, A step up.
- 7 Sing it, full verse, Voice only. The Guitar and Both modes are left out, and so is Lite's Strum it, along with the Basic Pitch model they use.

### Editing
- 8 Chord chips in Edit. 9 Chords over wide spaces. 10 Line up from the chord sites (AI). 11 Add the words (AI). 12 Remove the capo (AI).
- 52 Smarter chart reading: "C-G" is two quick chords, "(hold)" is a note and not a chord, "Capo 2" and "Strum:" lines are read, not played.

### Song page and playing
- 13 Song header with cover and About this song (Tempo, Length, Key, Match it; genre, year, composer from Apple Music). Tapping the title opens it.
- 14 Album cover blurred behind the song, under a dark layer.
- 15 Text size fits the song. 16 Stage look: section colors, a band on the line you're on, words that fade by distance.
- 18 Controls fade while playing; the first touch only wakes them. 19 Leaving the app pauses.
- 20 Chord row fits; long titles scroll.
- 21 Tools as one sheet with Play, Practice and Song tabs at the bottom.
- 22 Practice mode: loop a section, slow to 50%, Build up.
- 23 Beat: Off, Bass drum or Metronome.
- 24 Readability: nothing under 12 px, sheets solid over album art, the accessibility check in CI.
- New: when not playing along with the recording, Play starts at the first line instead of waiting through the intro. With the recording it still waits so the words line up.
- Not coming: 17 the sections rail (not picked).

### The recording
- 34 Apple Music full playback, the page following the recording (needs the token Worker; its allowed sites must include louie-lite.tangomike.app).
- 48 Drag to sync: drag the page to where the song is, it remembers each fix and keeps learning; reset in About this song.
- 49 Line and chord timing from LRCLIB synced lyrics.
- 50 Count-in that lands on the recording (measures the phone's delay).
- 59 Recording speed per song, half to full (Graham: in).

### Tuner and practice
- 29 Guided headstock tuner: string ticks, chimes, the finish, "your low E drifts most". Use the headstocks from current Louie (heads.js and its styles at 4.89.0), not Lite's older ones (Graham, 2026-11-13); acoustic is wood, electric follows Louie's finish. Lite's amp tuner face (tolex, channel buttons, pilot lamp) stays around them.
- 30 Tune up first after a big humidity or temperature swing (city in Settings > Playing).
- 27 Follow my tempo, rebuilt on strum timing: the mic hears when you strum, not which chord, and the page eases toward your pace (at most 3% a change, within a quarter of the song's tempo).
- 31 Lesson of the day: warm up, learn a change against the click, then the song's section at 70%. The change step uses an "I got it" tap instead of the mic judging chords. String-by-string checks keep the mic.
- 32 Your changes on Rehearse: each change shows how many of your songs use it, drills done and when you last practiced it ("Am to F: in 6 of your songs · drilled 4 times · last Tuesday"). No "landed" numbers. Drill stays.
- Not coming: 54 Sit in with the band, 28 What I hear, 25 and 26 (chord hearing, Wait for me).

### Louie
- Louie comes over as the newest drawing, with every finish from the Merch table, all free in Settings > Look: Stock blue, Pink, Teal, Tweed, Black, Mint, Gold, plus a new Amp finish in black tolex, copper and gold (the default in Lite).
- 46 Louie's count-in. 56 The streak celebration with Louie, confetti and a share picture (replaces Lite's flame). 57 Louie's one-liners above Play and in tips.
- 38 Support page: Ko-fi and Tell a friend, linking to ko-fi.com/louieguitar (Graham, 2026-11-13).

### Light progress (no chord hearing)
- 44 The weekly chart only: you and nine computer players by XP from plays; top 5 up, bottom 3 down. No rival battles, no song duels, no Friends board or Friend quest.
- 45 XP from plays, levels, badges and callouts, minus anything built on combos or fans. POW shows XP.
- 47 Tour Map: hexagons from plays.
- 58 End card after a song: what you played, time, sections, Encore and Share. No chord count.
- XP, level and badges live on Lite's Your playing page next to the chord passport. No tab bar, no stat bar.
- Not coming: 39 Chord Catch, 40 the Road and Opening night, 41 fans, tips and venues, 42 the Merch table and earned looks, 43 the guitarist maker and the band.

### Other
- 33 Play together by clap (one clap starts both phones), alongside Lite's start time.
- 35 Language practice adds Spanish and Russian.
- 36 Spark tone.
- 37 Today strip that pages sideways.
- 51 Can play filter and the count of songs you can play.

### Bringing a library over
- New: Lite accepts a backup from Louie, keeping songs, sets, recordings and timing, and ignoring game fields. Graham's songs come across in one step.

## Usability changes from Louie, in the amp look
- The bar along the bottom while paused folds into Play's corner while playing (replaces the ring).
- Tools sheet replaces the ring's menu items.
- Pause hands back the song page: title, Tools, and Play reading Resume.
- One button system: main buttons 56 px, row actions 42, chips 32, one switch style, all in copper, gold and chrome.
- Filters in one row: All, Can play, Learning, Favorites. Sets becomes a header button.
- Kept from Lite: the Library as home, the music-note add button, Your playing with the chord passport, Bluetooth pedals, Recently deleted.

## AI on a server
- A small function on the louie-lite Vercel project holds the Anthropic key. The phone calls it instead of Anthropic.
- Abuse guard: each install gets a signed device token; a daily cap per device; a fixed list of allowed models and output sizes; a separate, lower daily cap on Get the song (it uses web search and costs the most). Counters live in a small key-value store on Vercel.
- A monthly spend limit set in the Anthropic console.
- "Use my own key" stays as a fallback in Settings > Keys. A key typed there stays on the phone, as now.
- CLAUDE.md's key rule changes to: the shared key lives only on the server; a personal key stays only on the phone.
- Later, for iOS: Apple's App Attest proves calls come from the app.
- Steps Claude can't do (Vercel environment variable, the key-value store, the Anthropic spend limit, the token Worker's allowed sites) go to Grok as one prompt when that stage starts.

## Approach change (Opus, 2026-11-13, for speed)

Graham asked for it in his hands as soon as possible. Rebuilding dozens of Louie features on the 2.49 code would take far longer than starting from Louie 4.89.1, where every feature already works and is tested, and taking the game out. So branch `lite-3` holds Louie 4.89.1's code with:
- storage keys renamed `tabs-*` / `tabs.*` to `louielite-*` / `louielite.*` (never shares Louie's data);
- the Library as home (`route()` maps "" and "road" to "library");
- no tab bar (`renderRoute`), no Opening night (`openingOn` returns false), no scored show (`canGig` returns false).
The 2.49 code on `main` is only the starting point that's live now; `lite-3` replaces it at ship.

## Build steps on `lite-3` (each [Sonnet] unless marked)

Rules: one task per commit, `eslint .` and `node tests/quick.mjs` before each push to `lite-3` (not main). Tests for removed game screens are deleted with the screen. When something doesn't match this plan, write it under Surprises at the end and move on.

1. Take out the game. Delete and unhook: road.js, fretboard.js, art/guitars, tour.js, charts.js (keep the weekly chart: see 6), duel.js, band.js, friends.js, guitarist.js, maker.js, art/guitarist.js, merch.js, opening.js, hud.js stat bar and tab bar (keep the More items as rows in Settings: Tuner, Rehearse, Your playing, Tour Map, Support), callout combo kinds, POW for fans and tips, fans/tips/venues and their fading, the Requested card, cover requests, rival battles, the Friend quest. Chord Catch: gig.js scoring, catchHear, combos, crowd, Show complete scoring, Wait for me, What I hear, the mic chord check in lessons. Sing it: drop the Guitar and Both modes; Strum it goes (and vendor/basic-pitch if nothing else uses it). Remove the matching README sections, docs and tests. SHELL in sw.js follows.
2. Start at the first line when not playing along with the recording (skip the intro wait); with the recording, keep the wait.
3. Follow my tempo on strum timing only (strumDetector onsets, no chord check); same limits as 4.80.0.
4. Lesson of the day: the switch step becomes the click plus an "I got it" tap; string checks keep the mic. Your changes: rows show songs that use the change, drills done, last practiced; no "landed".
5. End card (Show complete without scoring): what you played, time, sections, XP, Louie's line, Encore, Share.
6. Light progress: the weekly chart on XP from plays (no battles), XP, levels, badges without combo or fan badges, callouts without combos, on Your playing (profile.js); Tour Map stays.
7. Louie: all finishes free in Settings > Look (Stock blue, Pink, Teal, Tweed, Black, Mint, Gold) plus Amp (default): body black tolex (SVG pattern fill), shade #0f0f11, highlight #b8935a, face #d9bd85, face shade #b08b4f, grille #2e2116, slat #4a3524, pupil #1a120d, cheek and tongue #c8804f, lamp #ffb24a (values in the mockup canvas).
8. [Opus check after] The amp look: a new look `amp` as the only theme family (Dark default, Light), built from 2.49's amp materials (`--bronze`, `--plate`, `--recess`, `--copper`, `--chrome`, `--lamp-*`, tolex; copy from main's styles.css "amp theme" section) restyling the v4 components: buttons 56/42/32 in copper and chrome, chips with lamps, cards with bronze piping, sheets frosted, the song bar as the gold plate with Back, Tools and Play, title in New York serif, body in system sans (drop Fredoka/Nunito). Match the mockups in docs/lite-mockups (PNGs and mockups.html; same as the canvas). Palettes Festival, Neon, Green Room and Headliner go.
9. Library home to match mockup 2: title "Library" (not Songbook) with Sets and Settings buttons, Today strip, filters in one row (All, Can play, Learning, Favorites), count line, search bar plus the music-note add button. Back button removed on home.
10. Tuner: the guided headstocks from 4.89.1 inside 2.49's amp tuner face (tolex, channel button menu, pilot lamp).
11. Support: ko-fi.com/louieguitar, Louie in the Amp finish.
12. Accept a Louie backup on import (songs, sets, recordings, timing; game fields dropped).
13. AI on the server: Vercel function, device token, caps, Get the song cap, own-key fallback. Needs Grok's setup prompt first (Opus writes it).
13b. Icons and launch screens (Graham, 2026-11-13): Louie's current icon and launch screens (references: docs/lite-mockups/louie-icon-reference.png and louie-launch-reference.png) redrawn with Louie in the Amp finish (black tolex body, bronze trim; see mockup 01.png), and "Louie" in place of "The Road". Grok is making the art and will replace the files in icons/ and icons/splash/. Not the leather pick. Until then icons/ holds the original blue Louie.
14. App name Louie, version 3.0.0, README and CLAUDE.md rewritten for Louie Lite, then the check by a separate agent and screenshots for Graham. Ship = merge `lite-3` to main when Graham says ship (he said ship on 2026-11-13: ship when 1 to 12 are done and tested; 13 can follow).

## Build order (original, superseded by the steps above)
1. Mockups (Opus): done and approved 2026-11-13, on the Design canvas https://claude.ai/artifact/91PLusrfWHZJX87dDbbNBw. Build to match them.
2. Shell (Sonnet): remove the ring, folding bar, button system, Tools sheet, pause gives the page back, filters row, readability.
3. Song page (Sonnet): 13 to 16, 18 to 20, 22, 23, 52, start at the first line.
4. Recording (Sonnet): 34, 48, 49, 50, 59, 33.
5. Adding (Sonnet): 1 to 7, 53, 8 to 12.
6. Tuner and practice (Sonnet): 29, 30, 27, 31, 32.
7. Louie and extras (Sonnet, Opus check on feel): finishes, 46, 56, 57, 58, 38, 35, 36, 37, 51, Louie backup import.
8. Light progress (Sonnet): 44, 45, 47.
9. Server (Sonnet, after Grok's setup): the function, abuse guard, Keys settings.
10. Check (separate agent): quick tests, CI, screenshots of every main screen for Graham. Then wait for ship.

Version: Lite's release becomes 3.0.0.

## Surprises

- Step 1: the Road, Opening night, the band, duels, merch, the guitarist and Strum it are gone from the screens. The pure numbers for those (road path, fans, merch buys, guitarist parts) still sit in `core/game.js`, because the unit tests cover them and later steps still use XP, the weekly chart and Louie's finishes. Nothing in the app draws those screens.
- Step 1: `openingOn` was already hard-coded false. `openingView` can still say a new save is on a leg, but no screen reads it, and a step cannot advance.
- The design canvas at claude.ai was not opened for step 1. Steps 7 and 8 still need it.

