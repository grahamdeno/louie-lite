// Browser tests, part 3 of app.e2e (split so files run side by side).
// Run: node --test tests/e2e/   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// They catch what unit tests can't: the app failing to load, screens not
// rendering, taps doing the wrong thing.

import test from "node:test";
import assert from "node:assert/strict";
import { chromium, base, phone, skip, LIB, FAKE_MIC, useBrowser, until, settled, openSpeed, speedText, tool } from "./harness.mjs";

useBrowser();


test("3.19.0 in a set, 4 of 9 is in the bar; playing folds it away with the rest; iPad keeps the bar", { skip: skip() }, async t => {
  const songs = [...LIB.songs.map(x => x.id === "a" ? { ...x, duration: 900 } : x), { id: "x0", title: "One", artist: "Y", format: "chords", body: "[Verse]\nG C\nla" }];
  const page = await phone(t, { ...LIB, songs, sets: [{ id: "s", name: "Gig", songIds: ["a", "x0"] }], settings: { ...LIB.settings, countIn: false } });
  await page.goto(base + "#/set/s"); await page.waitForSelector("[data-open='0']");
  await page.click("[data-open='0']"); await page.waitForSelector('#setdial'); await settled(page);
  assert.match(await page.innerText("#setdial"), /1 of 2/, "4 of 9 sits in the bar");
  assert.ok(await page.locator("#setdial").isVisible());
  await page.click("#play"); await page.waitForFunction(() => document.body.classList.contains('fold'));
  assert.equal(await page.locator("#setdial").isVisible(), false, "folded away while playing");
  assert.match(await page.innerText("#fp-nav"), /One\s*2 of 2/, "3.20.0: beside Play, the next song in the set");
  await page.click("#fp-nav"); await page.waitForFunction(() => /One/.test(document.querySelector('.song-title')?.innerText || ''));
  assert.match(await page.innerText(".song-title"), /One/, "a tap moves on to it");

  const pad = await phone(t, { ...LIB, settings: { ...LIB.settings, countIn: false } }, { viewport: { width: 1180, height: 820 } });
  await pad.goto(base + "#/song/a"); await pad.waitForSelector("#play"); await settled(pad);
  await pad.click("#play"); await pad.waitForFunction(() => document.getElementById("play").getAttribute("aria-label") === "Pause auto-scroll");
  assert.equal(await pad.evaluate(() => document.body.classList.contains("fold")), false, "iPad: the bar stays");
  assert.equal(await pad.evaluate(() => document.getElementById("play").closest(".player") !== null), true, "iPad: Play in the bar");
});
test("4.15.0: the section rail is always there; Stage mode and the old toggles are gone from Settings", { skip: skip() }, async t => {
  const page = await phone(t, { ...LIB, settings: { ...LIB.settings, songMap: false, stage: true, pauseDiagrams: false } });
  await page.goto(base + "#/song/a"); await page.waitForSelector(".smap");
  assert.equal(await page.evaluate(() => document.body.classList.contains("stage")), false, "no stage look");
  await page.goto(base + "#/settings/playing"); await page.waitForSelector("#s-focus");
  assert.equal(await page.locator("#s-stage, #s-map, #s-pause, #s-diagrams").count(), 0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("louielite-v1")).settings);
  assert.equal("stage" in saved || "songMap" in saved || "pauseDiagrams" in saved, false, "dropped from saves");
});

test("2.5 Back: beside the title (4.2.0); pull down at the top; the library opens at its top", { skip: skip() }, async t => {
  const songs = Array.from({ length: 30 }, (_, i) => ({ id: "s" + i, title: "Song " + String(i).padStart(2, "0"), artist: "A", format: "chords", body: "[Verse]\nG C\nla" }));
  const page = await phone(t, { ...LIB, songs: [...LIB.songs, ...songs] }, { isMobile: true });
  await page.evaluate(() => scrollTo(0, 1500)); await page.waitForFunction(() => scrollY >= 1000);
  await page.evaluate(() => { location.hash = "#/song/s25"; }); await page.waitForSelector('.shead .sh-back');
  const b = await page.evaluate(() => { const el = document.querySelector(".shead .sh-back"), r = el.getBoundingClientRect(); return { x: r.left, y: r.top, v: getComputedStyle(el).display }; });
  assert.ok(b.y < 100 && b.v !== "none", `4.2.0: Back sits beside the title (${JSON.stringify(b)})`);
  await page.click(".shead .sh-back"); await page.waitForFunction(() => location.hash === '#/library' && scrollY === 0);
  assert.equal(await page.evaluate(() => location.hash), "#/library");
  assert.equal(await page.evaluate(() => scrollY), 0, "the library opens at its top");
  /* Pull down at the top of a song. */
  await page.evaluate(() => { location.hash = "#/song/a"; }); await page.waitForSelector('.metarow'); await settled(page);
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y == null ? [] : [{ x: 150, y }] });
  await touch("touchStart", 300);
  for (let y = 300; y <= 360; y += 10) { await touch("touchMove", y); await page.waitForTimeout(16); /* real timer */ }
  await touch("touchEnd"); await page.waitForTimeout(400); /* real timer */
  assert.equal(await page.evaluate(() => location.hash), "#/song/a", "a short pull springs back");
  await touch("touchStart", 300);
  for (let y = 300; y <= 420; y += 10) { await touch("touchMove", y); await page.waitForTimeout(16); /* real timer */ }
  assert.match(await page.textContent(".fp-pull"), /Release for Songbook/);
  assert.equal(await page.evaluate(() => document.querySelector(".fp-pull").classList.contains("go")), true);
  await touch("touchEnd"); await page.waitForFunction(() => location.hash === '#/library');
  assert.equal(await page.evaluate(() => location.hash), "#/library", "a full pull goes back");
});


test("Add the words: paste lyrics on a chord chart and the chords go over them", { skip: skip() }, async t => {
  const chart = "[Verse]\nG   D   Em   C\n\n[Chorus]\nC   G   D";
  const page = await phone(t, { ...LIB, songs: [{ id: "c", title: "Chart Song", artist: "X", format: "chords", ai: "chart", body: chart }, ...LIB.songs] });
  await page.goto(base + "#/song/c"); await page.waitForSelector('.metarow');
  await tool(page, "words"); await page.waitForSelector('#ws-text');
  assert.equal(await page.isDisabled("#ws-ok"), true, "nothing to save before words");
  await page.fill("#ws-text", "first line of the verse here\nsecond line goes on\n\n[Chorus]\nthis is the chorus line");
  await page.waitForFunction(() => /first line of the verse here/.test(document.getElementById('ws-prev')?.textContent || ''));
  assert.match(await page.textContent("#ws-prev"), /\[Verse\]\nG\s+D\nfirst line of the verse here/);
  await page.click("#ws-ok"); await page.waitForFunction(() => /this is the chorus line/.test(JSON.parse(localStorage.getItem('louielite-v1')).songs.find(s => s.id === 'c').body));
  const body = JSON.parse(await page.evaluate(() => localStorage.getItem("louielite-v1"))).songs.find(s => s.id === "c").body;
  assert.match(body, /\[Chorus\]\nC\s+G\nthis is the chorus line/);
  assert.match(await page.textContent("#sheet"), /first line of.*chorus line/, "the song page shows the words");
  await page.click("#toast .tact"); await page.waitForFunction(c => JSON.parse(localStorage.getItem('louielite-v1')).songs.find(s => s.id === 'c').body === c, chart);
  assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem("louielite-v1"))).songs.find(s => s.id === "c").body, chart, "Undo");
});

test("typing in Text on a phone opens writing mode; the editor fills the top and the bar rides above", { skip: skip() }, async t => {
  const page = await phone(t, LIB, { isMobile: true });
  await page.click("#add"); await page.waitForSelector("#sr-write"); await page.click("#sr-write"); /* 4.45.0: "What song?" first */
  await page.waitForSelector('#ed-body'); await settled(page);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.focus("#ed-body");
  await page.waitForFunction(() => document.body.classList.contains('writing'));
  assert.ok(await page.evaluate(() => document.body.classList.contains("writing")), "writing mode on");
  const box = await page.locator(".ed-tx").boundingBox(), bar = await page.locator(".cebar").boundingBox();
  assert.ok(box.y >= 0 && box.y < 70, `editor at the top, under the title strip (y=${box.y})`);
  assert.ok(bar.y >= box.y + box.height, "bar sits below the editor, not over it");
  assert.ok(await page.locator("#ce-done").isVisible(), "Save stays one tap away while typing");
  await page.keyboard.type("[Verse]\nG\nHello" + "\nline".repeat(60));
  const st = await page.evaluate(() => document.querySelector(".ed-tx").scrollTop);
  assert.ok(st > 0, "the editor follows the caret down");
  await page.evaluate(() => document.activeElement.blur());
  await page.waitForFunction(() => !document.body.classList.contains('writing'));
  assert.ok(!(await page.evaluate(() => document.body.classList.contains("writing"))), "writing mode off when the keyboard closes");
});

test("2.13/2.16.4 Library: no Key or Tuning chip in a big library", { skip: skip() }, async t => {
  const keys = ["G", "C", "D", "A", "E", "F"];
  const songs = Array.from({ length: 14 }, (_, i) => ({ id: "k" + i, title: "Song " + i, artist: "A", format: "chords", key: keys[i % 6], tuning: i % 2 ? "dropd" : undefined, body: `[Verse]\n${keys[i % 6]}\nla` }));
  const page = await phone(t, { ...LIB, songs });
  assert.equal(await page.locator("#f-key").count(), 0, "no Key chip");
  assert.equal(await page.locator("#f-tune").count(), 0, "no Tuning chip (2.16.4)");
});


test("2.19.1 Library: the Recent cards show (the ring's styles had been hiding them)", { skip: skip() }, async t => {
  const now = Date.now();
  const songs = ["One", "Two", "Three", "Four"].map((title, i) => ({ id: "r" + i, title, artist: "A", format: "chords", body: "[Verse]\nG C\nla", opened: now - i * 60000 }));
  const page = await phone(t, { ...LIB, songs, sets: [], settings: { ...LIB.settings } }, { isMobile: true });
  const shown = await page.evaluate(() => [...document.querySelectorAll(".recent .rc")].map(el => el.offsetParent !== null && el.getBoundingClientRect().height > 20));
  assert.deepEqual(shown, [true, true], "two Recent cards, visible");
});

test("2.30.1: editing or adding a song hides Play", { skip: skip() }, async t => {
  const page = await phone(t, LIB, { isMobile: true });
  await page.click("#add"); await page.waitForSelector("#sr-write"); await page.click("#sr-write"); /* 4.45.0: "What song?" first */ await page.waitForSelector('#ed-body'); await settled(page);
  await page.mouse.click(200, 300); await page.evaluate(() => new Promise(ok => requestAnimationFrame(() => requestAnimationFrame(ok))));
  assert.equal(await page.evaluate(() => { const f = document.getElementById("fp"); return !f || getComputedStyle(f).display === "none"; }), true, "no Play on the new song page");
  assert.equal(await page.locator("#play").isVisible(), false);
});

test("2.33.0: writing mode keeps the song in view: a strip with title, artist and key; Return comes back to the pad", { skip: skip() }, async t => {
  const page = await phone(t, LIB, { isMobile: true });
  await page.click("#add"); await page.waitForSelector("#sr-write"); await page.click("#sr-write"); /* 4.45.0: "What song?" first */ await page.waitForSelector('#ed-body'); await settled(page);
  await page.focus("#ed-body"); await page.waitForSelector('#ed-strip'); await page.waitForFunction(() => document.body.classList.contains('writing'));
  assert.ok(await page.locator("#ed-strip").isVisible(), "the strip shows while writing");
  assert.match(await page.innerText("#ed-strip"), /Add a title/);
  const s = await page.locator("#ed-strip").boundingBox(), p = await page.locator(".ed-tx").boundingBox();
  assert.ok(p.y >= s.y + s.height, "the pad sits below the strip");
  await page.keyboard.type("[Verse]\nG       C\nHello there");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('louielite-v1')).songs.some(s => /Hello there/.test(s.body || '')));
  await page.click("#ed-strip"); await page.waitForFunction(() => document.activeElement.id === 'ed-title');
  assert.equal(await page.evaluate(() => document.activeElement.id), "ed-title", "tap the strip: the title");
  await page.keyboard.type("Porch Light"); await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "ed-artist", "Return: the artist");
  await page.keyboard.type("Me"); await page.keyboard.press("Enter"); await page.waitForFunction(() => document.activeElement.id === 'ed-body');
  assert.equal(await page.evaluate(() => document.activeElement.id), "ed-body", "Return again: back to the pad");
  await page.waitForFunction(() => /Porch Light\s*·\s*Me\s*·\s*Key G/.test(document.getElementById('ed-strip').innerText));
  assert.match(await page.innerText("#ed-strip"), /Porch Light\s*·\s*Me\s*·\s*Key G/);
});

test("4.69.0 the beat: a bass drum on every beat, or the click; no snare or hi-hat", { skip: skip() }, async t => {
  const page = await phone(t, { ...LIB, settings: { ...LIB.settings, metronome: true, countIn: false, controls: "bar" } });
  await page.evaluate(() => {
    window.__hits = { osc: 0, tri: 0 };
    const C = window.AudioContext || window.webkitAudioContext;
    const o = C.prototype.createOscillator;
    C.prototype.createOscillator = function () { const x = o.call(this); window.__hits.osc++; const d = Object.getOwnPropertyDescriptor(OscillatorNode.prototype, "type"); Object.defineProperty(x, "type", { set(v) { if (v === "triangle") window.__hits.tri++; d.set.call(this, v); }, get() { return d.get.call(this); } }); return x; };
  });
  const errors = []; page.on("pageerror", e => errors.push(String(e)));
  await page.click(".list .row"); await page.waitForSelector("#play");
  await page.click("#play"); await page.waitForFunction(() => window.__hits.osc >= 3, null, { timeout: 8000 });
  assert.equal(await page.evaluate(() => window.__hits.tri), 0, "no snare (its body is a triangle wave)");
  assert.equal(await page.evaluate(() => import("/audio.js").then(m => m.beatMode())), "kick", "an old drums setting plays the bass drum");
  assert.deepEqual(errors, []);
});

test("a song's groove is found once, used for the song, and changed in Edit", { skip: skip() || "4.69.0: the drum kit sits out until Beat comes back with a part (the code stays)" }, async t => {
  const song = { id: "gv", title: "Slow Blues", artist: "Me", key: "G", format: "chords", bpm: 100, body: "[Verse]\nG   C   G   D" };
  const page = await phone(t, { ...LIB, songs: [...LIB.songs, song], settings: { ...LIB.settings, metronome: true, countIn: false, controls: "bar" } });
  let asks = 0;
  await page.route("https://api.anthropic.com/**", r => {
    if (!/session drummer/.test(r.request().postData() || "")) asks++;
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ content: [{ type: "text", text: '{"beat": "half", "swing": "light", "bass": "walk"}' }], stop_reason: "end_turn" }) });
  });
  await page.evaluate(() => localStorage.setItem("louielite.apikey.v1", "sk-test"));
  const groove = () => page.evaluate(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "gv").groove);
  await page.evaluate(() => { location.hash = "#/song/gv"; }); await page.waitForSelector("#play");
  await page.click("#play");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "gv").groove, null, { timeout: 5000 });
  assert.deepEqual(await groove(), { src: "ai", beat: "half", swing: "light" }, "4.42.0: a bass in the answer is dropped");
  assert.match(await page.innerText("#toast"), /Groove: Half time, light swing/);
  await page.click("#play"); await page.click("#play"); await page.click("#play");
  assert.equal(asks, 1, "asked once; a song with a groove is not looked up again");
  await tool(page, "edit"); await page.waitForSelector("#ed-g-beat");
  assert.match(await page.innerText(".ed-chips"), /Drums\s*Half time\s*Found/);
  const saved = src => page.waitForFunction(w => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "gv").groove?.src === w, src);
  await page.selectOption("#ed-g-beat", "rock"); await saved("you");
  assert.deepEqual(await groove(), { src: "you", beat: "rock", swing: "light" });
  assert.equal(await page.locator("#ed-g-bass").count(), 0, "4.42.0: no bass chip");
  await page.selectOption("#ed-g-swing", ""); await page.waitForSelector("#ed-g-beat");
  await page.selectOption("#ed-g-beat", "");
  await page.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "gv").groove).length === 1);
  assert.deepEqual(await groove(), { src: "you" }, "all defaults: kept, and not looked up again");
  assert.match(await page.innerText(".ed-chips"), /Drums\s*Default/);
  assert.ok(await page.$("#ed-g-find"), "Find again is there with a key");
});

test("drums that fit the song: written once by the AI, played per section, busier or simpler in Practice", { skip: skip() || "4.69.0: the drum kit sits out until Beat comes back with a part (the code stays)" }, async t => {
  const song = { id: "dr1", title: "Drum Song", artist: "Me", key: "G", format: "chords", bpm: 120, status: "learning", body: "[Verse]\nG   C   G   D\n\n[Chorus]\nC   G   D   G" };
  const page = await phone(t, { ...LIB, songs: [...LIB.songs, song], settings: { ...LIB.settings, metronome: true, countIn: false, controls: "bar" } });
  const bars = { verse: { kick: "x.......x.......", snare: "....x.......x...", hat: "x.x.x.x.x.x.x.x." }, chorus: { kick: "X.x.....X.x.....", snare: "....X.......X...", hat: "xxxxxxxxxxxxxxxx" }, fill: { kick: "x...............", snare: "....x.x.xxxxXXXX", hat: "x..............." } };
  let drumAsks = 0, sent = "";
  await page.route("https://api.anthropic.com/**", r => {
    const body = r.request().postData() || "";
    if (/session drummer/.test(body)) { drumAsks++; sent = body; }
    const text = /session drummer/.test(body) ? (drumAsks === 1 ? "sorry, no" : JSON.stringify(bars)) : "{}";
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ content: [{ type: "text", text }], stop_reason: "end_turn" }) });
  });
  await page.evaluate(() => localStorage.setItem("louielite.apikey.v1", "sk-test"));
  const errors = []; page.on("pageerror", e => errors.push(String(e)));
  await page.evaluate(() => { location.hash = "#/song/dr1"; }); await page.waitForSelector("#play");
  assert.equal(await page.$("#lp-drums"), null, "no Drums chip before they are written");
  await page.click("#play");
  await until(() => drumAsks >= 1);
  await page.click("#play"); await page.waitForFunction(() => !document.body.classList.contains('playing'));
  assert.ok(!(await page.evaluate(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "dr1").drums)), "the first answer was unusable");
  await page.waitForSelector("#lp-drums-new");
  assert.match(await page.innerText("#lp-drums-new"), /Write drums/, "the Practice row offers to write them");
  await page.click("#lp-drums-new");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "dr1").drums, null, { timeout: 5000 });
  assert.match(sent, /Parts: verse, chorus/, "the sheet's sections are sent");
  assert.doesNotMatch(sent, /G   C   G   D/, "the sheet itself is not sent");
  const d = () => page.evaluate(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "dr1").drums);
  assert.deepEqual((await d()).chorus, bars.chorus);
  await page.waitForFunction(() => !document.body.classList.contains('playing'));
  await page.click("#play"); await page.waitForFunction(() => document.body.classList.contains('playing'));
  await page.waitForSelector("#lp-drums");
  assert.match(await page.innerText("#lp-drums"), /Drums: as written/);
  await page.click("#lp-drums"); await page.waitForFunction(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "dr1").drums.level === 1);
  assert.match(await page.innerText("#lp-drums"), /busier/);
  await page.click("#lp-drums"); await page.waitForFunction(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "dr1").drums.level === -1);
  await page.click("#lp-drums"); await page.waitForFunction(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === "dr1").drums.level === undefined);
  await page.click("#play"); await page.waitForTimeout(400); /* real timer */ await page.click("#play");
  assert.equal(drumAsks, 2, "one miss, then written once");
  assert.deepEqual(errors, []);
});

test("Settings: the beat (Off, Bass drum, Metronome) and its volume; a song with no tempo gets one", { skip: skip() }, async t => {
  const page = await phone(t, { ...LIB, settings: { ...LIB.settings, countIn: false, controls: "bar" } });
  await page.route("https://api.anthropic.com/**", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ content: [{ type: "text", text: '{"bpm": 120, "beats": 4}' }], stop_reason: "end_turn" }) }));
  await page.evaluate(() => localStorage.setItem("louielite.apikey.v1", "sk-test"));
  await page.evaluate(() => { location.hash = "#/settings/playing"; }); await page.waitForSelector("#s-beat");
  assert.equal(await page.getAttribute("#s-beat [data-m='off']", "aria-pressed"), "true", "off by default");
  await page.click("#s-beat [data-m='click']");
  await page.$eval("#s-metvol", el => { el.value = 40; el.dispatchEvent(new Event("input")); el.dispatchEvent(new Event("change")); });
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("louielite-v1")).settings.metroSound === "click");
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem("louielite-v1")).settings);
  assert.equal(s.metronome, true); assert.equal(s.metroVol, 0.4); assert.equal(s.metroSound, "click");
  assert.equal(await page.getAttribute("#s-beat [data-m='click']", "aria-pressed"), "true");
  assert.equal(await page.locator("#s-metbeat, #s-metswing, #s-bass").count(), 0, "no drum beat, swing or bass while the drum kit sits out");
  await page.click("#s-beat [data-m='kick']");
  await page.waitForFunction(() => { const x = JSON.parse(localStorage.getItem("louielite-v1")).settings; return x.metronome === true && x.metroSound === "kick"; });
  await page.click("#s-beat [data-m='click']"); await page.click("#s-metdrop");
  await page.waitForFunction(() => { const x = JSON.parse(localStorage.getItem("louielite-v1")).settings; return x.metroDrop === true && x.metroSound === "click"; });
  const id = await page.evaluate(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => !x.bpm)?.id);
  assert.ok(id, "a test song without a tempo");
  await page.evaluate(i => { location.hash = "#/song/" + encodeURIComponent(i); }, id); await page.waitForSelector("#play");
  await page.click("#play");
  await page.waitForFunction(i => JSON.parse(localStorage.getItem("louielite-v1")).songs.find(x => x.id === i).bpm === 120, id, { timeout: 5000 });
  assert.match(await page.innerText("#toast"), /Tempo found: 120 BPM/);
});

test("Remove the capo: a chart's capo comes off and the chords move to the key it sounds in", { skip: skip() }, async t => {
  const song = { id: "cp", title: "Capo Song", artist: "Me", key: "A", format: "chords", body: "Capo 2 · Strum: D-DU-UDU\n\n[Verse]\nG   D   Em   C" };
  const page = await phone(t, { ...LIB, songs: [...LIB.songs, song], settings: { ...LIB.settings, controls: "bar" } });
  await page.evaluate(() => { location.hash = "#/song/cp"; }); await page.waitForSelector("#sheet");
  const chords = () => page.$$eval("#sheet .c", els => els.map(e => e.textContent.trim()).filter(Boolean));
  const before = await chords();
  await tool(page, "capo"); await page.waitForFunction(() => /No capo \(Capo 2 taken off\)/.test(document.getElementById('sheet').innerText));
  const after = await chords();
  assert.match(await page.innerText("#sheet"), /No capo \(Capo 2 taken off\)/);
  assert.ok(before.includes("G") && after.includes("A") && after.includes("F#m"), `G D Em C becomes A E F#m D (${before} → ${after})`);
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('louielite-v1')).songs.find(s => s.id === 'cp').capoOff === true);
  assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem("louielite-v1"))).songs.find(s => s.id === "cp").capoOff, true);
  await tool(page, "capo"); await page.waitForFunction(() => !/No capo/.test(document.getElementById('sheet').innerText));
  assert.deepEqual(await chords(), before, "and back");
});

test("Tour Map: on by default on plain ground, no location or map pictures until you plant your flag; pinch and drag go to the map", { skip: skip() }, async t => {
  const day = new Date().toISOString().slice(0, 10);
  const songs = LIB.songs.map(s => ({ ...s, playLog: { total: 5, last: Date.now(), days: { [day]: 5 } } }));
  const page = await phone(t, { ...LIB, songs }, { geolocation: { latitude: 40.71278, longitude: -74.00594 }, permissions: [] });
  const tiles = []; const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==", "base64");
  await page.route(/tile\.openstreetmap\.org/, r => { tiles.push(r.request().url()); r.fulfill({ contentType: "image/png", body: png }); });
  await page.evaluate(() => { window.__asked = 0; const g = navigator.geolocation, f = g.getCurrentPosition.bind(g); g.getCurrentPosition = (...a) => { window.__asked++; return f(...a); }; });
  await page.evaluate(() => { location.hash = "#/playmap"; });
  await page.waitForSelector(".tm-map svg path", { state: "attached" });
  assert.equal(await page.evaluate(() => document.body.classList.contains("tm-open")), true, "the page is locked while the map is open");
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".tm-page")).touchAction), "none");
  await page.waitForSelector(".tm-bd.you");
  assert.equal(await page.locator(".tm-bd.you").count(), 1, "the scene board ranks you with the rivals");
  assert.match(await page.textContent("#tm-sbody"), /\d+HEXAGONS? YOU HOLD/);
  assert.ok(await page.locator(".tm-rival").count() >= 4, "rival players have turf around you");
  /* 4.18.0: the venue and the fine print are behind About the map */
  await page.click("#tm-info"); await page.waitForSelector("#mi-x");
  assert.match(await page.innerText("[role=dialog][aria-label='About the map']"), /Open mic: \d+ plays? to the Coffeehouse[\s\S]*simulated/);
  await page.click("#mi-x"); await page.waitForSelector("#mi-x", { state: "detached" });
  assert.ok(await page.locator(".tm-map path").count() >= 3, "fog, glow and outline are drawn");
  assert.equal(tiles.length, 0, "no map pictures before a spot");
  assert.equal(await page.evaluate(() => window.__asked), 0, "no location asked");
  const z0 = await page.evaluate(() => document.querySelector(".tm-map .leaflet-proxy")?.style.transform);
  await page.click("#tm-in"); await page.waitForFunction(z => document.querySelector('.tm-map .leaflet-proxy')?.style.transform !== z, z0);
  assert.notEqual(await page.evaluate(() => document.querySelector(".tm-map .leaflet-proxy")?.style.transform), z0, "zoom buttons move the map");
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + "/tm-plain.png" });
  await page.click("#tm-flag"); await page.waitForSelector("#pf-go");
  assert.equal(await page.evaluate(() => window.__asked), 0, "the explanation comes first");
  await page.context().grantPermissions(["geolocation"], { origin: new URL(page.url()).origin });
  await page.click("#pf-go");
  await page.waitForFunction(() => !!localStorage.getItem("louielite.spot.v1")); await page.waitForSelector("#tm-flag", { state: "detached" });
  await page.waitForFunction(n => window.__asked > 0, 0);
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("louielite.spot.v1"))), { lat: 40.71, lon: -74.01 });
  assert.equal(await page.evaluate(() => localStorage.getItem("louielite-v1").includes("40.71")), false, "not in the library");
  await page.waitForFunction(() => document.querySelectorAll(".tm-map img.leaflet-tile").length > 0);
  assert.ok(tiles.every(u => /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(u)));
  /* 4.20.0: the sheet's number tiles once shared the map layer's class and hid the map */
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".tm-map .leaflet-layer")).display), "block", "the map pictures show");
  if (process.env.SHOT) { await page.waitForTimeout(500); /* real timer */ await page.screenshot({ path: process.env.SHOT + "/tm-spot.png" }); }
  await page.waitForSelector("#tm-take-go"); await page.waitForFunction(() => !document.querySelector("[role=dialog][aria-label='About the map']"));
  await page.click("#tm-info"); await page.waitForSelector("#tm-forget");
  await page.click("#tm-forget"); await page.waitForSelector("#tm-flag");
  assert.equal(await page.evaluate(() => localStorage.getItem("louielite.spot.v1")), null);
  await page.click("#back"); await page.waitForFunction(() => !document.body.classList.contains("tm-open"));
});

test("A run that stops early is not a play", { skip: skip() }, async t => {
  const page = await phone(t, { ...LIB, settings: { ...LIB.settings, countIn: false } });
  await page.click(".list .row"); await page.waitForSelector("#play");
  await page.click("#play"); await page.waitForTimeout(1500); /* real timer */ await page.click("#play");
  await page.waitForFunction(() => document.getElementById("play")?.getAttribute("aria-label") === "Start auto-scroll");
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("louielite-v1")).songs.every(s => !s.playLog?.total)), true);
});

test("Tour Map (4.18.0): the sheet gives one goal in minutes of playing, pulls up for the scene, and Play starts the song", { skip: skip() }, async t => {
  const page = await phone(t, LIB);
  await page.evaluate(() => { location.hash = "#/playmap"; });
  await page.waitForSelector("#tm-take-go");
  assert.match(await page.innerText("#tm-take"), /NEXT CORNER TO TAKE\s*\S+ \S+'s corner[\s\S]*About \d+ min of playing takes it[\s\S]*START WITH/);
  assert.equal(await page.getAttribute("#tm-sheet", "data-state"), "closed");
  assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("tm-sbody")).opacity), "0", "the details stay hidden until the sheet is pulled up");
  await page.click(".tm-sh-t"); await page.waitForFunction(() => document.getElementById("tm-sheet").dataset.state === "open");
  assert.match(await page.innerText("#tm-sbody"), /Your scene this week[\s\S]*min a day[\s\S]*NEXT[\s\S]*HEXAGONS? YOU HOLD[\s\S]*CORNERS? TAKEN/i);
  if (process.env.SHOT) { await page.waitForTimeout(500); /* real timer */ await page.screenshot({ path: process.env.SHOT + "/scene-open.png" }); }
  await page.click(".tm-sh-t"); await page.waitForFunction(() => document.getElementById("tm-sheet").dataset.state === "closed");
  if (process.env.SHOT) { await page.waitForTimeout(500); /* real timer */ await page.screenshot({ path: process.env.SHOT + "/scene-closed.png" }); }
  await page.click("#tm-take-go");
  await page.waitForFunction(() => /#\/song\//.test(location.hash));
});

test("4.0.1: one design system: buttons, chips, sheets and the editor's title field share one look (2.49's thin rims since 3.1.0)", { skip: skip() }, async t => {
  const page = await phone(t);
  const look = sel => page.evaluate(s => { const c = getComputedStyle(document.querySelector(s)); return { r: c.borderTopWidth, f: c.fontFamily }; }, sel);
  await page.evaluate(() => { location.hash = "#/settings"; }); await page.waitForSelector(".btn.primary");
  assert.match((await look(".btn.primary")).f, /system-ui|Helvetica|sans-serif/, "the main button is set in the system sans");
  await page.evaluate(() => { location.hash = "#/song/a"; }); await page.waitForSelector("#stat");
  assert.equal((await look("#stat")).r, "1px", "3.1.0: chips have 2.49's 1px rim");
  assert.match((await look("#stat")).f, /system-ui|Helvetica|sans-serif/);
  await page.evaluate(() => document.querySelector("#more").click()); await page.waitForSelector(".menu");
  assert.equal((await look(".menu")).r, "1px", "3.1.0: menus have 2.49's 1px rim");
  await page.evaluate(() => { location.hash = "#/edit/a"; }); await page.waitForSelector("#ed-title");
  assert.ok(await page.evaluate(() => document.getElementById("ed-title").getBoundingClientRect().width > 200), "the title field has room (the artist line sits below it)");
});

test("4.49.1 The search screen holds still before you type, and scrolls again once you do", { skip: skip() }, async t => {
  const page = await phone(t);
  await page.goto(base + "#/library"); await page.waitForSelector("#add"); await settled(page);
  await page.click("#add"); await page.waitForSelector("#sr-paste");
  assert.equal(await page.evaluate(() => document.body.classList.contains("sr-lock") && getComputedStyle(document.body).overflow), "hidden");
  await page.fill("#q", "river"); await page.waitForFunction(() => !document.body.classList.contains("sr-lock"));
  await page.click("#qcancel"); await page.waitForFunction(() => !document.body.classList.contains("searching") && !document.body.classList.contains("sr-lock"));
});

test("4.49.3 Closing the keyboard keeps the search screen; Cancel stays on the Library", { skip: skip() }, async t => {
  const page = await phone(t, LIB, { home: true });
  await page.waitForSelector("#add"); await settled(page);
  await page.click("#add"); await page.waitForSelector("#sr-paste");
  await page.evaluate(() => document.activeElement.blur()); /* the keyboard's checkmark */
  await page.waitForTimeout(400); /* real timer: the old screen closed 200 ms after the keyboard did */
  assert.equal(await page.evaluate(() => document.body.classList.contains("searching")), true, "still on the search screen");
  await page.click("#qcancel"); await page.waitForSelector("#add");
  assert.equal(await page.evaluate(() => location.hash.endsWith("#/") || location.hash.endsWith("#/library") || location.hash === ""), true, "Cancel stays home");
  assert.equal(await page.evaluate(() => document.body.classList.contains("searching")), false);
});

test("4.49.5 Leaving search any way lets the page scroll again (Get the song from the empty search screen left it locked)", { skip: skip() }, async t => {
  const page = await phone(t);
  await page.goto(base + "#/library"); await page.waitForSelector("#add"); await settled(page);
  await page.click("#add"); await page.waitForSelector("#sr-paste");
  assert.equal(await page.evaluate(() => document.body.classList.contains("sr-lock")), true, "locked before typing");
  await page.evaluate(async () => (await import("./app.js")).leaveSearch()); /* what Get the song does when it opens */
  assert.equal(await page.evaluate(() => document.body.classList.contains("sr-lock")), false, "the lock goes with the search");
  assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflow), "hidden");
});

test("4.49.8 On an iPhone the search screen finds songs through Apple Music, since Apple closes its own search to web pages", { skip: skip() }, async t => {
  const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1";
  const lib = { ...LIB, settings: { ...LIB.settings, appleMusic: true, appleMusicToken: "https://tabs-musickit.example.workers.dev/token", countIn: false } };
  const page = await phone(t, lib, { userAgent: IPHONE });
  let itunesAsked = 0;
  await page.route(/itunes\.apple\.com/, r => { itunesAsked++; r.abort(); });
  await page.route("https://*.workers.dev/**", r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ token: "t.t.t", expires: 0 }) }));
  await page.route("https://js-cdn.music.apple.com/**", r => r.fulfill({ status: 200, contentType: "text/javascript", body: `
    window.mkMusic = { isAuthorized: false, storefrontId: "us", api: { music: async (path, p) => path.includes("/search")
      ? { data: { results: { songs: { data: [{ attributes: { name: "Harbor Lights", artistName: "The Cape Fear", releaseDate: "2015-03-01" } }] } } } }
      : { data: { data: [] } } } };
    window.MusicKit = { configure: async () => {}, getInstance: () => window.mkMusic };
    document.dispatchEvent(new Event("musickitloaded"));` }));
  await page.goto(base + "#/library"); await page.waitForSelector("#add"); await settled(page);
  await page.click("#add"); await page.waitForSelector("#q");
  await page.fill("#q", "harbor"); await page.dispatchEvent("#q", "input");
  await page.waitForFunction(() => /Harbor Lights/.test(document.getElementById("sr-cat")?.innerText || ""), null, { timeout: 5000 });
  assert.match(await page.innerText("#sr-cat"), /The Cape Fear · 2015/);
  assert.equal(itunesAsked, 0, "the closed iTunes search is not tried on an iPhone");
});

