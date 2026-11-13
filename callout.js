// Achievement callouts (4.44.0, #77, #78 to #80): a big word bursts over the screen for a moment and
// clears itself. It takes no taps (they go to the screen underneath), animates only transform and
// opacity so a Gig's timing isn't touched, shows one at a time (the rest wait their turn), and is
// read out once, politely, by a screen reader. Reduce Motion shows it still and fades it.
// Each kind has a few looks (pickLook) and Louie brings one of your band who has joined (castFor).
import { pickLook } from "./core.js";
import { esc, haptic } from "./ui.js";
import { louie } from "./louie.js";

export const CALLOUT_MS = 1600;
/* a 14-point comic burst, its points a little uneven so it looks hand drawn */
const POW = (R, r) => Array.from({ length: 28 }, (_, i) => { const a = Math.PI * i / 14, k = i % 2 ? r * (0.9 + 0.2 * ((i * 7) % 5) / 4) : R * (0.86 + 0.14 * ((i * 3) % 4) / 3); return `${Math.round(Math.cos(a) * k)},${Math.round(Math.sin(a) * k)}`; }).join(" ");
const queue = [], lastLook = {};
let showing = false;
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The words a screen reader hears, in a region made once */
function say(text) {
  let r = document.getElementById("co-say");
  if (!r) { r = document.createElement("div"); r.id = "co-say"; r.className = "sr-only"; r.setAttribute("aria-live", "polite"); document.body.appendChild(r); }
  r.textContent = ""; requestAnimationFrame(() => { r.textContent = text; });
}

/**
 * callout(data, { kind, word, big, who })
 *   kind  chord | level | badge | lesson | earn (picks the look).
 *         Combo callouts, band joins, and POW for fans or tips are not in Louie Lite.
 *   word  the small line (COMBO, NEW CHORD, LEVEL UP)
 *   big   the big part (x20, F, 7)
 *   who   a friend's id who must be the one shown (a new band member)
 */
export function callout(data, c) {
  if (!c || c.kind === "combo" || c.kind === "join") return;
  if (c.kind === "earn" && /fan|tip|merch/i.test(`${c.word || ""} ${c.big || ""}`)) return;
  if (queue.length >= 3) return; /* a burst of them: the first three, the rest are on Your playing */
  queue.push(c);
  if (!showing) next();
}

function next() {
  const c = queue.shift();
  if (!c) { showing = false; return; }
  showing = true;
  const look = pickLook(c.kind, lastLook[c.kind]); lastLook[c.kind] = look;
  const still = calm();
  const el = document.createElement("div");
  el.className = `co co-${look}${still ? " still" : ""}`;
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<div class="co-fx"></div>
    <div class="co-badge"><small>${esc(c.word)}</small>${c.big ? `<b>${esc(c.big)}</b>` : ""}</div>
    <div class="co-cast">${look === "pow" ? `<span class="co-amp">${louie("cheer", { pose: "hornsUp", size: 66 })}<i></i><i></i><i></i></span>` : louie("cheer", { pose: "hornsUp", size: 58 })}</div>`;
  /* 4.71.0: POW, a jagged comic-book burst behind the badge, its word stamped on top */
  if (look === "pow") el.querySelector(".co-fx").innerHTML = `<svg viewBox="-120 -120 240 240" aria-hidden="true"><polygon class="co-star2" points="${POW(116, 70)}"/><polygon class="co-star" points="${POW(104, 62)}"/></svg><b class="co-powt">${esc(c.pow || "POW!")}</b>`;
  if (look === "bolt") el.querySelector(".co-fx").innerHTML = `<svg viewBox="0 0 120 220"><path d="M70 0 L30 100 L62 100 L38 220 L96 82 L62 82 L88 0 Z"/></svg>`;
  if (look === "burst" && !still) el.querySelector(".co-fx").innerHTML = Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg;--d:${(i % 3) * 40}ms"></i>`).join("");
  document.body.appendChild(el);
  say(`${c.word} ${c.big || ""}`.trim());
  if (!still) haptic(1);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => { el.remove(); next(); }, still ? 300 : 260);
  }, CALLOUT_MS);
}
