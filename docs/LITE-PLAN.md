# Louie Lite plan: Louie's features in the amp look, without the game

Status: approved by Graham 2026-11-13. Nothing here is built yet. One release at the end, shipped when Graham says ship.

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

## Build order (one branch, one release)
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

