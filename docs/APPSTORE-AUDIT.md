# Louie Lite: App Store review board, run 1 (Phase 0 and Phase 1)

Written 2026-11-13 against Louie Lite 3.2.0 (commit 53e786f). Run 2 (decisions A to F, backlog, roadmap) waits until
Graham corrects this inventory. No code was changed for this report.

## Graham's answers (2026-11-13)

- 1 and 5: Louie Lite ships as **"Louie: Play Guitar Songs"** (24 characters; subtitle open).
- 2: Keep stitching chords and words from what the user provides, including text pasted from chord sites. No license
  for now. Open: what happens to the app's own LRCLIB lookups (see the reply of 2026-11-13).
- 3 and 4: Everything stays free until closer to submitting. Run 2 still models costs, but nothing is built for payments.

## Decisions only Graham can make (answer these before run 2)

1. **Which app ships?** Louie Lite alone, Louie: Learn Guitar (the gamified Road) alone, or one app with the game
   as an option. The board leans to **Lite as the store app**, with the Road kept as your personal build. Reason: Lite is
   simpler, has no fake crowd or rivals to explain, and its audit list is shorter.
2. **Lyrics.** Licensed lyrics (Musixmatch or LyricFind, paid, contract), or no lyrics from outside sources at all
   (chords only, plus words the user pastes or types). This decides cost, the pitch and the review risk more than any
   other choice.
3. **Apple Music's role.** A core feature (pushes a native MusicKit layer) or an extra for subscribers.
4. **Price model** (run 2 will model it): free with a capped AI allowance and one paid tier is the board's starting point.
5. **Name and listing.** "Louie: Learn Guitar" is the Road's listed name. If Lite ships, does it take that name?

## Assumptions (correct any that are wrong)

- A1. Prices: Claude Haiku 5.5 at $0.10 in and $0.50 out per million tokens; Sonnet 5.5 at $2 in and $10 out.
  Web search assumed at $10 per 1,000 searches (not re-checked for 5.5-era pricing).
- A2. Token counts below are estimates from the prompts and limits in the code, not measured from logs. Run 2
  should read real usage from the Anthropic console once the server has a few weeks of traffic.
- A3. "Active user" plays at least 3 days a month and adds about 6 songs a month.
- A4. Lite ships in a Shoebox-style shell with the web app bundled inside, not loading the live site.
- A5. Apple's Small Business Program rate (15%) applies.
- A6. The target user is in the US first; English only at launch.
- A7. The SUS score and heuristic scores are expert estimates from reading the code and screens. No users were tested.
- A8. Apple Foundation Models were not tested (they need a Mac or an iPhone). Anything about them is marked untested.

---

# Phase 0: Inventory

## 0.1 What the app does today (by area)

Full history: docs/CHANGES-SINCE-2.49.md (191 releases). Grouped:

| Area | Features |
|---|---|
| Songbook (home) | Search, filters (All, Can play, Learning, Favorites), sort, swipes (favorite, delete), Sets, Today strip (Up next set, one new chord, worth another try, Just heard it, streak nudge, weather mood), backup reminder, Recently deleted |
| Add a song | "What song?" search across your Songbook, Apple Music recents and the iTunes catalog; Get the chords (AI picks a chart page); Get the song (AI writes a chart, lyrics from LRCLIB, chords placed on words); paste with auto-clean; photo scan of a printed sheet; write your own; Sing it (record a sketch line by line); Play next ideas (AI) |
| Song page | Sheet with chord row, chord diagrams, About this song, cover art, learning status, tuning and capo, transpose, Easier version (AI), Tone (AI), language practice (German, Spanish, Russian, AI) |
| Playing | Auto scroll by tempo or song length, start at the first sung line, count-in, beat (bass drum, drums), Follow my tempo (strum detection), Apple Music recording with the page following the recording's clock, timed lines from LRCLIB, focus (dim and fade away from the current line), fold bar, Practice a section with Build up and slow speeds, end card with Share and Encore |
| Rehearse | Lesson of the day, lessons ladder, chord string check (mic), switch drill ("I got it"), Your changes, tuner with guided headstocks, Tune up first (weather) |
| Progress | XP, levels, 18 badges, chord passport, stats cards, weekly chart against computer players, Tour Map hexagons, callouts |
| Look | One amp look, light and dark, 8 Louie finishes |
| Data | On-device storage, JSON backup to Files or iCloud, import (including Road backups), share a song or set by link, diagnostics copy |
| Support | Ko-fi link, tell a friend |

## 0.2 Things tied to Graham (personal assumptions)

| Item | Where | For a public app |
|---|---|---|
| "Tell a friend" shares **grahamdeno.github.io/tabs** (the Road), not Lite | support.js line 10 | Bug today. Fix now |
| Your own Anthropic key field and GetSongBPM key field | Settings > Keys | Remove (no user keys) |
| Ko-fi tip link | Settings > Support | Remove in the iOS build (see 0.4) |
| Languages: German, Spanish, Russian only | german.js | Your three. Keep as a set to start, or offer more |
| Weather features (mood nudge, Tune up first) need a typed city; use Open-Meteo | library.js, tuneup.js | Open-Meteo's free API is for non-commercial use: needs a paid plan or removal |
| Right-hand, thumb-reach layout | throughout | Good default; add a left-hand option |
| Apple Music as the only whole-song player | listen.js | Spotify and YouTube users get links only |
| Import of Louie (Road) backups | store.js | Hide in the store build |
| Weekly chart ranks you against named computer players ("Neon Jen", "Basement Ray") | core/game.js | Label them as practice rivals, or drop the chart (it is game leftover) |
| Tour Map, XP, levels | profile.js, playmap.js | Game leftovers in an ungamified app; keep light or remove (run 2, F) |
| Sample song "Harbor Lights" | app.js | Original, fine. One song is too thin a start |
| docs/ONBOARDING.md still describes the Road's Opening night | docs | Rewrite for Lite |
| worker/musickit-token.js (old Cloudflare token service) | repo | Leftover; remove from the Lite repo |
| Diagnostics copy | Settings | Fine; keep it local |

## 0.3 Every AI call

All go through Louie's server (api/ai.js) unless the user typed a key. Server limits: 60 calls per device a day,
4 web-search calls per device a day, 300 per network address, 3,000 across everyone, 8,000 output tokens max,
5 searches per call. Cost per call uses A1 and A2.

| Feature | Model | Search | Trigger | Est. tokens in / out | Est. cost per call |
|---|---|---|---|---|---|
| Get the song (chart + chords on words) | Sonnet | up to 3 | user taps | 30k / 3k | $0.12 |
| Get the chords (pick one chart page) | Sonnet | up to 4 | user taps | 25k / 1.5k | $0.10 |
| Groove (strum and feel for a song) | Sonnet | up to 2 | after adding a song | 15k / 0.5k | $0.06 |
| Language practice (translate a song) | Sonnet | no | user opens it | 3k / 5k | $0.06 |
| Photo scan of a sheet | Sonnet (vision) | no | user takes a photo | 3.5k / 2.5k | $0.03 |
| Play next ideas | Haiku | no | user opens Ideas | 4k / 4k | under $0.01 |
| Paste clean-up | Haiku | no | user pastes | 3k / 2k | under $0.01 |
| Tempo guess | Haiku | no | new song with no tempo | 0.3k / 0.1k | under $0.01 |
| Drums pattern | Haiku | no | user asks | 1k / 2k | under $0.01 |
| Easier version | Haiku | no | user asks | 2k / 2k | under $0.01 |
| Tone (amp settings) | Haiku | no | user asks | 1k / 1.5k | under $0.01 |
| Key test | Haiku | no | saving an own key | tiny | under $0.01 |

**Cost per active user per month (A3):** about 6 songs added with a chart (about $0.65; the groove lookup only runs with
the drums on, which are off by default), 10 Play next, 2 photos, 1 translation and small calls (about $0.15). **About
$0.80 a month** (corrected 2026-11-13 from $1.10). Sonnet with web search is most of it.

**Worst case per device at today's limits:** 4 search calls a day for 30 days is about $14 a month, plus up to 56
Haiku calls a day (pennies). The free limits are too generous for a public free tier.

## 0.4 External services and what happens at 10,000 users

| Service | Used for | At scale |
|---|---|---|
| Anthropic API (via Louie's server) | all AI | Cost grows with use; needs per-user caps tied to the plan, and spend alerts |
| Vercel (louie-lite project) | web host, AI and token functions | Hobby plan limits and terms; move to Pro for commercial use |
| Upstash Redis (free) | daily counters | Free tier request cap; upgrade or count per day in fewer calls |
| Apple Music (MusicKit JS, server-signed token) | whole-song playback, recents, catalog search | Works per user; needs a subscription; MusicKit JS inside an app web view is unproven (see iOS) |
| iTunes Search API | catalog search, covers, previews | Rate limited per address (about 20 a minute); fine on device |
| LRCLIB | lyrics and timed lines | Free and crowd-sourced, **not licensed**; could block heavy traffic; licensing risk is the real issue |
| Ultimate Guitar, Chordify, e-chords and others | chart pages the AI picks, search links | Linking out is fine; the AI reading and rewriting their charts is a gray area |
| GetSongBPM (user key) | tempo lookup | Remove (user key); use the AI tempo guess or measure from the preview |
| Open-Meteo | weather mood, humidity tune-up | Free tier is non-commercial; pay or remove |
| Ko-fi | tips | Not allowed as an in-app tip path on iOS |
| Share links (#/import/...) | sharing songs and sets | Built from location.origin; inside a native app that is a local address, so shared links break. Needs a real web domain and universal links |

## 0.5 Likely App Store review problems

| # | Problem | Guideline | Severity |
|---|---|---|---|
| R1 | Shows song lyrics from an unlicensed source (LRCLIB) | 5.2.1, 5.2.2 (intellectual property, third-party content) | Critical |
| R2 | Ko-fi tip link (a payment for the app outside in-app purchase) | 3.1.1, 3.1.3 | Critical, easy fix |
| R3 | Sends song text, lyrics and photos to Anthropic without an in-app consent screen naming the provider | 5.1.2(i) (third-party AI, revised Nov 2025) | High |
| R4 | A web app in a thin shell may be judged a repackaged website | 4.2 (minimum functionality) | High |
| R5 | If the shell loads the live site, new features arrive without review | 2.5.2 | High (bundle the app instead) |
| R6 | No privacy policy, no microphone and photo purpose strings yet | 5.1.1 | High, easy |
| R7 | AI writes chord charts from other sites' pages | 5.2.1 | Medium |
| R8 | Album art used as a full-screen background | Apple Music identity guidelines | Medium |
| R9 | Lyrics can contain profanity; AI features | Age rating questionnaire (likely 13+) | Low |
| R10 | User-entered API keys in Settings | Not a guideline breach on its own, but against the goal | Low |

---

# Phase 1: Expert audits

Severity: C critical, H high, M medium, L low. Effort: S small (under a day), M medium (days), L large (a week or more).

## 1. Product strategist

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| Two apps with one name and one mascot | H | Ship Lite as the store app; keep the Road personal. Decide the name (Decision 5) | S |
| The store already has the big players: Ultimate Guitar (huge chart library, Pro subscription), Chordify (chords from any recording), Songsterr (tabs with playback), Yousician and Fender Play (lessons). Lite's edge is the **play-along page**: start at the first line, follow the recording, focus on the current line, practice a section, all without a game | H | Position as "your songbook that plays along with you," not as a lesson app or a chart library | S |
| Without licensed lyrics, the main promise ("chords and words, playing along") rests on an unlicensed source | C | Decision 2. If no license, sell it as chords plus your own words | M to L |
| 190+ features is far more than a new user needs | M | Pick a launch core (Songbook, add a song, play along, practice a section, tuner) and tuck the rest under Tools | M |
| AI is the cost center and also the main way songs get in | H | Make adding a song work without AI first (catalog plus paste plus photo), with AI as the shortcut | M |

## 2. UX researcher

Heuristic scores (1 to 5, expert estimate, A7):

| Heuristic | Score | Note |
|---|---|---|
| Visibility of system status | 4 | Clear busy states, the current line is obvious, toasts say what happened |
| Match with the real world | 3 | Guitar words are right; app words (Sets, Tour Map, XP, Can play, Build up) need learning |
| User control and freedom | 4 | Recently deleted, Cancel, Pause anywhere |
| Consistency and standards | 3 | Game leftovers in a non-game app; custom controls instead of iOS ones in places |
| Error prevention | 4 | Asks before deleting for good; AI checks |
| Recognition rather than recall | 2 | Many hidden gestures (swipes, holds, tap the title, drag to sync); Tools sheet has 17 rows across 3 tabs |
| Flexibility and efficiency | 4 | Lots of shortcuts for a power user |
| Aesthetic and minimal design | 3 | The amp look is distinctive; screens are dense |
| Help users recover from errors | 4 | AI errors say why and what to do |
| Help and documentation | 3 | Tips and gestures exists; 11 one-time tips; no first-run path |

**Estimated SUS: about 66** (below the 80 target). The gap is recognition (hidden features) and density, not broken flows.

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| Hidden gestures carry important features | H | Every important action gets a visible button; gestures become shortcuts | M |
| Tools sheet is long | M | Keep the 5 most used rows visible, the rest under More | S |
| Game words in an ungamified app | M | Rename or remove (Tour Map, XP); decide in run 2 (F) | S |
| No usability test with real players | H | Five-person test with the TestFlight beta (people who play casually) | M |

## 3. Onboarding and activation specialist

Goal: a new person plays a real song with chords and words in under 2 minutes.

Today's first run: the Songbook with one sample song and a backup reminder later. To get a song they know, they must
find the music-note button, search, then choose Get the chords (an AI search, up to 4 a day, a copy and paste) or
Get the song (an AI search, about 20 to 40 seconds). Estimated time to the first real song: **2 to 4 minutes when
everything works**, and it depends on AI and on the user copying from another site.

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| Opening night was removed and nothing replaced it | H | A three-step first run: pick a song you know (from Apple Music recents or a starter list), press Play, see the line follow you | M |
| One sample song | M | 8 to 12 starter songs that are public domain or written for the app, across easy keys | M |
| Activation depends on AI search | H | Starter songs plus paste plus photo get people playing without AI; AI is the shortcut | M |
| Permissions asked late and cold (mic) | M | Ask for the mic the first time a feature needs it, with one line on why (already mostly true; check each path) | S |
| docs/ONBOARDING.md describes the Road | L | Rewrite for Lite | S |

## 4. Visual and design-system designer (Apple HIG)

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| The amp look is distinctive and now consistent (3.1.2: one corner, 46px buttons) | L | Keep it; write it down as a design system | M |
| Fixed pixel font sizes do not follow the phone's text size | H | Base sizes on the system text size so Dynamic Type works (see accessibility) | M |
| Custom switches, sheets and menus instead of iOS ones | M | Fine for a branded app; keep standard behaviors (swipe down to close, back swipe) | M |
| Light theme was second-class until 3.1.x | M | Check every screen in light at phone resolution before the beta | S |
| App icon and launch screens are new (Grok, c9518e1) | L | Check the icon at small sizes and in the store's dark mode | S |

## 5. Accessibility specialist (WCAG 2.2 AA, Dynamic Type, VoiceOver, hands busy)

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| An automated check runs on every page and sheet in CI (a11yall, 42 checks pass) | L | Keep it | none |
| No Dynamic Type: fixed px text; 7 rules use 10 to 11px text | H | Scale with the system text size; nothing under 12px | M |
| VoiceOver: 260 labels in the code, but the playing page moves on its own | H | Announce the current line on request, not on every scroll; test the playing page with VoiceOver | M |
| Hands are on the guitar while playing | L | Already built (corrected): Bluetooth page-turner pedals play and pause, go to the next section, and back one with a hold. List it in the store text | none |
| Reduced motion is respected in 37 places | L | Keep it | none |
| Right-hand thumb layout only | M | A left-hand option that mirrors the bar | S |
| Focus fade lowers contrast on purpose | M | Keep the current line and the next line at AA contrast; dimmed lines are decorative | S |

## 6. iOS platform engineer

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| MusicKit JS sign-in uses a pop-up; inside WKWebView it may not work, and the music may not keep playing in the background | C (if Apple Music is core) | Native MusicKit in Swift, bridged to the page (play, pause, seek, clock, recents) | L |
| The mic (tuner, Follow my tempo, string check) runs through the web audio stack | H | Test in WKWebView on device; set the audio session for play-and-record so the mic and music work together | M |
| Metronome and drums timing in a web view can drift when the screen dims | M | Keep the screen awake while playing; consider a native click | M |
| Share links use the page's own address | H | A real web domain for links, universal links into the app | M |
| Data in WKWebView storage can be cleared by iOS under storage pressure | H | Move songs to native storage (file in the App Group) or mark storage persistent; keep backups | M |
| Shoebox's shell, Share Extension and widget carry over | M | Share Extension: share a chord page or a song link into Louie. Widget: Up next and the lesson of the day | M |

## 7. Audio engineer

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| Tuner accuracy depends on the phone mic and the web audio path | M | Check against a clip-on tuner on 3 iPhones; target within 2 cents | M |
| Follow my tempo listens for strums; it is capped at 3% per change | L | Fine; check it in a noisy room and with a recording playing | S |
| Recording plus mic at once (play along and Follow my tempo) | M | Echo cancellation on the mic can eat the guitar; test with it off | S |
| Metronome on Bluetooth headphones lags | M | A latency offset setting, or measure it once | S |

## 8. Music licensing and content counsel

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| LRCLIB lyrics are user-submitted with no publisher license; showing them in a commercial app is the main legal exposure | C | License (Musixmatch or LyricFind; paid tiers, prices by quote, full lyrics need a commercial plan), or remove outside lyrics | L |
| The AI reads chart pages and writes its own chart; chord progressions alone are generally not protected, but a copied arrangement can be | M | Keep the AI writing from its own reading, never pasting a page; keep the "check it" note; don't store the source page text | S |
| Users paste charts from other sites into their own Songbook | L | Personal use on device is the user's act; don't sync or share pasted third-party charts publicly | S |
| Share links can carry a pasted chart to other people | M | When sharing, send only songs the user wrote, or only chords and structure | S |
| Album art from Apple | M | Use it only alongside Apple Music, with Apple's attribution rules | S |
| Language practice translates lyric lines | M | Translating lyrics needs the same license as showing them | M |

## 9. App Store review and compliance specialist

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| R1 lyrics | C | See counsel | L |
| R2 Ko-fi link | C | Remove in the iOS build; use an in-app tip jar (consumable in-app purchases) if wanted | S |
| R3 third-party AI consent | H | A consent screen before the first AI use: what is sent (song text, photos), to whom (Anthropic), why; a Settings switch to turn AI off | S |
| R4 minimum functionality | H | Native MusicKit, native widget, Share Extension, pedal support and a bundled offline app make the case | M to L |
| R5 downloaded code | H | Bundle the web app; ship updates through the store | S |
| R6 privacy basics | H | Privacy policy page on tangomike.app, purpose strings for the mic and photos, App Privacy answers (no tracking, data on device, AI requests to Anthropic) | S |
| Age rating | L | Answer the questionnaire honestly; likely 13+ with lyrics | S |

## 10. AI architect

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| Server proxy with device tokens and limits is already in place | L | Good base. Tie limits to the plan (free vs paid), not just the device | M |
| Device tokens are easy to mint again (5 per network a day) | M | Bind tokens to App Attest (or DeviceCheck) in the iOS build | M |
| Sonnet with web search is 90% of cost | H | Cache results per song (same title and artist reuse one chart and groove for everyone); try Haiku with search first and fall back to Sonnet | M |
| Groove runs for every added song | M | Run it only when the song plays for the first time | S |
| Apple Foundation Models (on-device) | M | Untested here (A8). Candidates: paste clean-up, tempo guess, Easier version, Tone. Not for search or vision | M |
| Prompt rule "never write lyrics" is in the prompts | L | Keep; add a server-side check that drops replies containing long lyric runs | S |
| Spend alerts | H | Anthropic workspace cap is $20 now; add a daily alert and a kill switch per feature | S |

## 11. Monetization and pricing analyst

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| Cost about $1.10 per active user per month, worst case about $14 (A1 to A3) | H | Free tier with a small AI allowance (for example 3 song lookups a week), paid tier with a fair-use cap | M |
| No revenue today besides Ko-fi | H | Run 2 models subscription vs one-time plus credits; lyrics license cost may force a subscription | M |
| The competition charges: Ultimate Guitar Pro and Yousician run as subscriptions | M | Price against them; the play-along page is the paid value, not the AI | S |

## 12. Privacy, security and legal advisor

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| No account; songs stay on the phone | L | Strong privacy story; say it in the listing | none |
| Requests to Anthropic carry song text, sometimes photos, and a device token; no names | M | Say so in the policy; don't log request bodies on the server | S |
| Server logs: only counters in Upstash | L | Keep it that way; set a retention period | S |
| Terms of use missing | M | Short terms: AI charts can be wrong, user content is theirs, no copying others' work | S |
| A typed Anthropic key lives in local storage | L | Removed with the key field | S |

## 13. QA and release engineer

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| 228 unit tests and 26 browser test files run in CI on every push | L | Good. Add an iOS shell smoke test (launch, play, mic, MusicKit) in the TestFlight workflow | M |
| Versions bump automatically; Vercel deploys main straight to production | M | For iOS, the store build is a snapshot; add a release branch and a TestFlight lane like Shoebox | M |
| Visual references in CI are informational only | L | Remake them after the look settles | S |
| Real-device testing of audio and MusicKit | H | A short manual checklist per beta on 2 or 3 iPhones | S |

## 14. Analytics and retention analyst

| Finding | Sev | Recommendation | Effort |
|---|---|---|---|
| No analytics at all | M | Privacy-first counts only (no tracking, no ids): first song played, songs added per week, plays to the end, AI calls by feature. On-device first, opt-in upload | M |
| Retention hooks exist without pressure: Today strip, lesson of the day, Up next | L | Keep; no streaks you can lose (Lite already softened the streak) | none |
| The days-in-a-row number is still shown | L | Show it as a count, never as a loss | S |
| No way to hear from users | M | A "Send feedback" row that opens mail with the version and diagnostics | S |

---

## Scores by lens (1 to 5, how ready this lens is for a store release)

| Lens | Score | Biggest blocker |
|---|---|---|
| Product | 3 | Which app, and the lyrics question |
| UX | 3 | Hidden features, density (SUS about 66) |
| Onboarding | 2 | No first-run path; AI-dependent |
| Visual design | 4 | Dynamic Type |
| Accessibility | 3 | Dynamic Type, pedals, VoiceOver on the playing page |
| iOS platform | 2 | MusicKit and audio in WKWebView, storage, links |
| Audio | 3 | Unmeasured on device |
| Licensing | 1 | Unlicensed lyrics |
| App Store compliance | 2 | Lyrics, Ko-fi, AI consent |
| AI architecture | 4 | Cost control per plan |
| Monetization | 2 | No model yet |
| Privacy and legal | 4 | Policy and terms to write |
| QA and release | 4 | iOS lane |
| Analytics | 2 | Nothing measured |

## Fix now, whatever run 2 decides (small, safe)

1. "Tell a friend" points to the Road's address (support.js). Point it at louie-lite.tangomike.app.
2. Remove worker/ from the Lite repo.
3. Rewrite docs/ONBOARDING.md for Lite.
4. CLAUDE.md in this repo still says to push only to lite-3 and still describes 3.0.0; main is the live branch now. Update it.

These are code or doc changes, so they wait for Graham's go like everything else here.
