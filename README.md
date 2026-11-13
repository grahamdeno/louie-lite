# Louie: Learn Guitar

Louie Lite is a guitar app for chord sheets, playing along and practice. Songs stay on the phone. There is no account. Louie, the cartoon amp, is the mascot.

The listed name is Louie. The full title is Louie: Learn Guitar.

This is version 3.0.0. It started from Louie 4.89.1 and left the game behind: no Road, no Opening night, no scored show, no band, no duels, no Merch table and no guitarist maker. The Library is home.

## What you can do

### Library
While a song plays, the line you're on is full strength; lines further from it are dimmer and the words fade into the page toward the top and bottom of the screen.

A fresh install starts with the sample song and eight public-domain starter songs (Amazing Grace, Oh! Susanna, Red River Valley, Home on the Range, When the Saints, Down in the Valley, Clementine, Swing Low).

Home is the Library. The header has Louie (opens Your playing and shows your days in a row), Sets and Settings. Under that: the Today strip (Just heard it first for 3 hours after a song plays in Apple Music), one row of filters (All, Can play, Learning, Favorites), a count line, the search bar and a music-note button that opens Search or add. There is no tab bar and no back button on home.

### A song
The song page shows the sheet, the cover and About this song. The bar at the bottom is a gold plate with Back, Tools and Play. Play starts at the first sung line when you are not playing along with a recording. With a recording, it still waits through the intro.

While it plays, the bar folds into Play's corner and the line you are on sits on a band. Pause brings the bar back. There is no ring.

Follow my tempo, in Tools, listens for strums and nudges the scroll and the beat. It does not check which chord you played. A change is at most 3%, and the pace stays within a quarter of the song's tempo.

At the end of a play you get a card: what you played, the time, the sections, XP, a line from Louie, Share and Encore. There is no chord count and no score.

### Practice
Rehearse holds the lesson of the day, Your changes, All lessons and the tuner. The lesson's switch step is a click plus I got it. String checks still use the mic. Your changes lists songs that use the change, how many times you drilled it, and when you last practiced. It does not say landed.

The tuner uses the guided headstocks. Acoustic is wood. Electric follows Louie's finish. The face around them is the amp: dark tolex, the channel menu and a pilot lamp.

### Progress
Apple Music needs no setup in the app: Louie's server signs the MusicKit token (`api/musickit/token.js`, key in Vercel's MUSICKIT_KEY). An address typed in Settings > Apple Music still wins.

Your playing shows XP, your level, badges and the chord passport. The weekly chart ranks plays, not battles. The Tour Map still lights a hexagon for each song you play through. Callouts still mark a new chord, a level, a badge and the lesson. Combos and fan callouts are gone.

### Look
One look, the amp: dark glass, bronze, copper, chrome and a gold plate. Dark is the default. Light uses the same materials on warm paper. Auto follows the phone.

Louie's finishes are all free, in Settings > Look: Amp (the default, black tolex), Stock blue, Pink, Teal, Tweed, Black, Mint and Gold.

### Support and backups
Support is in Settings. It links to ko-fi.com/louieguitar and shows Louie in the Amp finish. Nothing unlocks. The payment happens on Ko-fi.

Songbook and backups can import a Louie backup. Songs, sets, recordings and timing come across. Game fields are dropped. A Louie look becomes Auto.

### AI help
Before the first AI request on a phone, Louie says what is sent (a song's title, chords and words, or a photo) and to whom (Anthropic's Claude, through Louie's server) and asks. Settings > Keys has an AI help switch.

Without a key of your own, AI help goes through Louie's server, which holds the shared key and the daily limits. A key typed in Settings > Keys stays on this phone and is sent only to Anthropic. The AI places chords and translates. It does not write the lyrics. The words come from your sheet or from LRCLIB.

## Lyrics and the AI (4.41.0)

The AI may read the lyrics on the sheet, or from LRCLIB, to put chords on the right words. It answers with line and word numbers. It does not write the lyrics back.

## Translation exception (language practice)

Language practice translates only the lines it is given. It does not add, complete or look up lyrics.

The server needs `ANTHROPIC_API_KEY`, `DEVICE_SECRET` and the Upstash counters set on Vercel. The app works without them. AI options wait until a key or the server answers.

## Development

Plain ES modules. No build step. `VERSION` in `core.js` and `CACHE` in `sw.js` must match.

Storage keys start with `louielite`, so Lite never reads or writes Louie's `tabs` data.

| Area | File |
|---|---|
| Songs, import, storage, re-exports | `core.js` and `core/*.js` |
| Song page, playback, routing | `app.js` |
| Library | `library.js` |
| Settings, Look, backups | `settings.js` |
| Tuner and headstocks | `tuner.js`, `heads.js` |
| Rehearse and lessons | `practice.js` |
| Your playing | `profile.js` |
| Weekly chart | `charts.js` |
| Tour Map | `playmap.js` |
| Support | `support.js` |
| AI request from the phone | `aihelp.js`, `findai.js` |
| AI server | `api/ai.js`, `api/token.js`, `api/_lib.js` |
| Louie drawings | `louie.js` |
| Offline copy | `sw.js` |

`core/game.js` still holds numbers the unit tests and the light progress use (XP, the chart, finishes, lessons). Nothing draws the old game screens.

Before a push: `eslint .` and `node tests/quick.mjs`. Do not run the full suite locally. CI runs it. The AI server tests are `node --test tests/api.test.mjs`.

Work for this release lives on `lite-3`. Shipping is a merge to `main` when Graham says so.
