# Louie Lite: improvements before the iOS build

From the App Store review board's run 1 (docs/APPSTORE-AUDIT.md), 2026-11-13. Graham's direction: improve the web
app first (cheaper than iterating in an iOS build), keep everything free for now, and leave lyrics as they are until
he decides. Store name: **Louie: Play Guitar Songs**.

All of it goes out as one release when Graham says ship. Each step: one commit, `eslint .`, the unit and API tests and
the browser tests for what changed.

## Decisions Graham needs to make

- None to start. Steps 9 to 12 change how screens look, so they get mockups first and wait for his go.

## Not in this plan (on purpose)

- Lyrics changes (LRCLIB, share links): Graham decides later.
- Payments, tiers and AI caps: everything stays free for now.
- Native work (MusicKit, audio session, storage, widgets): after the three-item iOS test build.

## Steps

1. [Done] Fix "Tell a friend": it shares the Road's address. Point it at louie-lite.tangomike.app.
2. [Done] Remove the old Cloudflare token service (`worker/`) from this repo.
3. [Done, ONBOARDING marked] Update CLAUDE.md (main is the live branch; the release is 3.x) and trim docs/ONBOARDING.md to Lite.
4. [Opus] Send feedback: a row in Settings that opens mail with the version and the diagnostics.
5. [Already built] Page-turner pedals and a keyboard while a song plays: Space or Enter plays and pauses, Right, Down and
   Page Down go to the next line, Left, Up and Page Up go back a line, and Shift with an arrow moves by section.
   Bluetooth pedals send these keys.
6. [Done] AI consent: before the first AI use on a phone, a sheet says what is sent (the song's text, a photo you
   scan), who gets it (Anthropic, through Louie's server) and why, with Allow and Not now. A switch in Settings turns
   AI help off. Needed for Apple's rule 5.1.2(i).
7. [Not needed] Cheaper AI: the groove lookup (strum and feel, a web search) runs the first time a song is played, not
   when it is added. Most added songs are never played the same day.
8. [Done] Starter songs: 8 to 10 public-domain songs (traditional or published before 1929) in easy keys, offered on
   a fresh install, so a new person can play something in the first minute without the AI.
9. [Opus, mockup first] First run: three steps on a fresh install (pick a song, press Play, see the line follow you),
   replacing nothing (Opening night is gone).
10. [Opus, mockup first] Visible buttons for features that are gestures today (swipe to favorite or delete, hold,
    tap the title), keeping the gestures as shortcuts.
11. [Opus, mockup first] Tools sheet: the most used rows on top, the rest under More.
12. [Opus, mockup first] Left-hand option: mirror the bar and Play's corner.
13. [Opus] Readable text: nothing under 12px; then text that grows with the phone's text size (Dynamic Type), screen by
    screen, checked at phone resolution.

## Surprises

- Step 5 was already built (4.x): the left pedal (or Space, Left, Up, Page Up) plays and pauses, the right pedal (Right,
  Down, Page Down) goes to the next section, and holding it goes back a section. The audit missed it. Nothing to do.
- Step 7 isn't needed: the groove lookup only runs when the drums are on, and the drums are off by default, so it costs
  almost nothing today. The audit's cost estimate counted it; corrected there.
- Settings already says timed lines keep only the times from LRCLIB, not its words.
- CI's browser job had been failing since 3.1.0: the old 4.30 button-size test (56px) and two contrast problems (the
  tuner in light, unpicked level buttons in Get the chords in dark). Fixed in this step's commit.
- Step 4 (Send feedback) waits for the address Graham wants mail sent to.
