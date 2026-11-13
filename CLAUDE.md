# Working on Louie Lite

Louie Lite (version 3.0.0) is the song app: chord sheets, playing along and practice. The listed name is Louie. The full title is Louie: Learn Guitar. Louie is a cartoon amp, never an assistant.

It is plain ES modules, no build step. Songs stay on the phone under storage keys that start with `louielite` (`louielite-v1`, `louielite.apikey.v1`). Louie's own app uses `tabs`. Never read or write those.

The Library is home. Routes `""` and `"road"` open the Library. There is no tab bar, no Opening night and no scored show. `canGig` stays false. `openingOn()` stays false.

This release is built on branch `lite-3`. Push only to `lite-3`. Do not push to `main`, and do not merge into `main` unless Graham says ship. Do not commit or push on `lite-3-ai`.

The README is the map of what the app does now. `docs/LITE-PLAN.md` is the build plan, including Surprises. `docs/DATA.md` describes stored fields. `docs/lite-mockups` holds the approved screens (pictures and `mockups.html` with the exact colours).

## Standing rules

- Versions: a feature is a minor release, a fix is a patch, numbered from the release where the defect was found. Bump `VERSION` in `core.js` and `CACHE` in `sw.js` together. A test checks they match.
- When Graham asks for mockups or an explanation first, give those and wait before building.
- Lyrics and the AI: the AI may read a song's lyrics, from LRCLIB or his sheet, to place chords or to translate. It answers with positions and translations, never with the lyrics themselves. The phone puts the words and chords together.
- Keys: the shared Anthropic key lives only on the server (`ANTHROPIC_API_KEY` in `api/ai.js`). A key typed in Settings > Keys stays on the phone, is never in the code or a backup, and is sent only to api.anthropic.com. Don't change how phone keys are stored.
- He uses the phone one-handed, mostly the right hand. Put actions he reaches for mid-song in thumb reach (the bottom of sheets, the gold plate bar).
- No ring controls. The rectangular bar is out while paused and folds into Play's corner while playing.
- Writing he sees (UI text, README, commit messages, replies): plain and direct, no em dashes.
- A new app `.js` file (root or `core/`) must be added to `SHELL` in `sw.js`. Topic files in `core/` must not read another file's values while loading, only inside functions.
- The search bar stays as it is. Don't change how it opens or clears.

## Look

One theme family, `amp`. Dark is the default. Light uses the same materials on warm paper. Buttons are copper and chrome, chips have lamps, cards have bronze piping, sheets are frosted, the song bar is the gold plate. Titles use New York (or the system serif). Body text uses the system sans. Festival, Neon, Green Room and Headliner are not offered.

Louie's finishes are all free. Amp is the default: black tolex, gold face, copper cheeks. Stock blue, Pink, Teal, Tweed, Black, Mint and Gold are the others. Colours are in `docs/lite-mockups/mockups.html`.

## Where things are

| Area | File |
|---|---|
| Pure logic, re-exported | `core.js` |
| Chords, recording, sketch, playing, groove, turf, neck, game numbers | `core/*.js` (import from `core.js`) |
| Song page, playback, router | `app.js` |
| Library | `library.js` |
| Metronome and drums | `audio.js` |
| AI request, errors, own key or server | `aihelp.js` |
| Search, paste, Get the song | `findai.js` |
| AI server (token, limits, proxy) | `api/token.js`, `api/_lib.js`, `api/ai.js` |
| Share links, Play together | `share.js` |
| Recordings and previews | `listen.js` |
| Bar folding into Play | `fold.js` |
| Settings, Look, Recently deleted | `settings.js` |
| Tips | `coach.js` |
| Tuner | `tuner.js`, `heads.js` |
| Your playing | `profile.js` |
| Language practice | `german.js` |
| Rehearse and lessons | `practice.js` |
| Weekly chart | `charts.js` |
| Tour Map | `playmap.js`, `drawer.js` |
| Stage drawing on the sheet | `stage.js` |
| Louie the amp | `louie.js` |
| Support | `support.js` |
| Callouts | `callout.js` |
| Editor | `editor.js` |
| Offline copy | `sw.js` |

`core/game.js` still has the old game numbers because unit tests and light progress (XP, the weekly chart, finishes, lessons) use them. No screen draws the Road, the band, duels, merch or the guitarist.

## Tests

- Before a push: `eslint .` and `node tests/quick.mjs`. Both must pass. Do not run the full suite locally. CI runs it on every push.
- The AI server: `node --test tests/api.test.mjs`.
- Browser tests use `phone()` from `tests/e2e/harness.mjs`. Wait for the next thing the test checks. A sleep that tests a real timer stays, marked `/* real timer */`.
- After a screen change, `settled(page)` before a tap. Saves land after the screen changes: wait on the saved value itself.
- `quick.mjs` compares the diff with `origin/main`, so on `lite-3` it runs essentially every browser test that still exists.
- Delete tests for a screen you remove.
- ESLint is `eslint.config.mjs`. Tests and `sw.js` are ignored by it.

## AI server

`api/ai.js` proxies Messages. `api/token.js` issues a device token. `api/_lib.js` holds `LIMITS` and the Upstash counters. `aiFetch` in `aihelp.js` sends a personal key straight to Anthropic, and everything else to `/api/ai` with the device token.

Someone else sets, on Vercel: `ANTHROPIC_API_KEY`, `DEVICE_SECRET`, and the Upstash `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Do not put those values in the repo. Do not rewrite the server to work around a missing variable.

## Not in this app

The Road, Opening night, Chord Catch, scored shows, Wait for me, What I hear, the band, friends, duels, the Merch table, the guitarist maker, cover requests, rival battles, Sing it's guitar and strum modes, and the Festival, Neon, Green Room and Headliner palettes.
