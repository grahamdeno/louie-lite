// The weekly chart: you and nine computer players, by XP. No rival battles and no Friends board.
// The numbers are chartState and chartsSettle in core.js. Reached from Settings.
import { CHART_PROMOTE, CHART_DEMOTE, VENUES, Tabs, chartState, chartsSettle } from "./core.js";
import { app, esc, icon } from "./ui.js";
import { data, go } from "./app.js";

const ord = n => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");

export function renderCharts() {
  const moved = chartsSettle(data);
  if (moved) Tabs.save(data);
  const st = chartState(data);
  const row = x => `<li class="ch-row${x.you ? " you" : ""}${x.rank <= CHART_PROMOTE ? " up" : ""}">
      <span class="ch-rk">${x.rank}</span>
      <span class="ch-av" style="background:${x.you ? "var(--fg)" : "var(--accent)"}" aria-hidden="true">${esc((x.name || "?").slice(0, 1))}</span>
      <span class="ch-nm">${esc(x.name)}<small class="ch-note${x.today > 0 ? " hot" : ""}">${x.today > 0 ? `+${x.today} today` : x.you ? "nothing yet today" : x.quiet ? "quiet for a couple of days" : "not yet today"}</small></span>
      <span class="ch-xp">${x.xp} XP</span></li>`;
  const rows = st.rows.map(row);
  if (st.tier > 0) rows.splice(Math.max(0, rows.length - CHART_DEMOTE), 0, `<li class="ch-zone down" aria-hidden="true"><span>MOVE DOWN ZONE</span></li>`);
  rows.splice(Math.min(CHART_PROMOTE, rows.length), 0, `<li class="ch-zone" aria-hidden="true"><span>${st.next ? "PROMOTION ZONE" : "TOP 5"}</span></li>`);
  app.innerHTML = `<div class="ch">
    <div class="head"><button class="ib glass" id="back" aria-label="Back to Settings">${icon("back")}</button></div>
    ${st.last ? `<section class="ch-last"><p>${st.last.xp ? `Last week: <b>${ord(st.last.rank)}</b> on the ${esc(VENUES[st.last.tier])} chart${st.last.up ? `. Up to the <b>${esc(VENUES[st.last.tier + 1])}</b>.` : st.last.down ? `. Back down to the <b>${esc(VENUES[st.last.tier - 1])}</b>.` : "."}` : st.last.down ? `Last week went by without a play, so you're back at the <b>${esc(VENUES[st.last.tier - 1])}</b>.` : `Last week went by without a play. This week is a fresh chart.`}</p><button class="sb" id="ch-lastx" aria-label="Got it">OK</button></section>` : ""}
    <section class="ch-head" aria-label="${esc(st.name)} chart">
      <div><h1>${esc(st.name)} Chart</h1><small>${st.daysLeft} DAY${st.daysLeft === 1 ? "" : "S"} LEFT</small></div>
    </section>
    <p class="ch-sub">${st.next ? `Top ${CHART_PROMOTE} move up to the ${esc(st.next)}` : "The top of the charts"}${st.tier > 0 ? ` · bottom ${CHART_DEMOTE} move down` : ""}</p>
    <ol class="ch-list">${rows.join("")}</ol>
    <p class="ch-how">XP comes from songs you play through. The other nine players are made up for this phone.</p>
  </div>`;
  document.getElementById("back").onclick = () => go("#/settings");
  document.getElementById("ch-lastx")?.addEventListener("click", () => { data.charts.last.seen = true; Tabs.save(data); renderCharts(); });
  document.querySelector(".ch-row.you")?.scrollIntoView({ block: "nearest" });
}
