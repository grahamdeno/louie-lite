// Shared by the AI functions: device tokens, counters and limits.
// The Anthropic key lives only in Vercel's environment (ANTHROPIC_API_KEY), never in the app.
import crypto from "node:crypto";

export const LIMITS = {
  perDevice: 60,        // AI calls per device per day
  searchPerDevice: 4,   // Get the song (web search) per device per day
  tokensPerIp: 5,       // new device tokens per network address per day
  perIp: 300,           // AI calls per network address per day (a backstop)
  allDay: 3000,         // AI calls across everyone per day
  maxTokens: 8000,      // the longest reply a call may ask for
  maxSearches: 5        // web searches inside one Get the song
};
export const MODELS = new Set(["claude-haiku-5-5", "claude-sonnet-5-5"]);
export const ORIGINS = new Set(["https://louie-lite.tangomike.app", "http://localhost:8080", "http://127.0.0.1:8080"]);

const secret = () => process.env.DEVICE_SECRET || "";
const sign = id => crypto.createHmac("sha256", secret()).update(id).digest("base64url").slice(0, 32);
export function newToken() { const id = crypto.randomBytes(12).toString("base64url"); return `${id}.${sign(id)}`; }
export function deviceOf(token) {
  if (!secret() || typeof token !== "string") return null;
  const [id, mac] = token.split(".");
  if (!id || !mac || mac.length !== 32) return null;
  const want = sign(id);
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(want)) ? id : null;
}

// Counters in Upstash Redis (Vercel's KV integration sets one of these pairs).
const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const kvTok = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const day = () => new Date().toISOString().slice(0, 10);
/* Adds one to each counter and returns the new counts. Counters expire after two days. */
export async function bump(keys) {
  if (!kvUrl() || !kvTok()) throw Object.assign(new Error("Counters aren't set up on the server yet."), { status: 503 });
  const d = day();
  const cmds = keys.flatMap(k => [["INCR", `${k}:${d}`], ["EXPIRE", `${k}:${d}`, "172800"]]);
  const r = await fetch(`${kvUrl()}/pipeline`, { method: "POST", headers: { authorization: `Bearer ${kvTok()}`, "content-type": "application/json" }, body: JSON.stringify(cmds) });
  if (!r.ok) throw Object.assign(new Error("Counter store error"), { status: 503 });
  const out = await r.json();
  return keys.map((_, i) => Number(out[i * 2]?.result) || 0);
}

export const ipOf = req => String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim() || "unknown";
export function cors(req, res) {
  const o = req.headers.origin;
  if (o && ORIGINS.has(o)) { res.setHeader("access-control-allow-origin", o); res.setHeader("vary", "origin"); }
  res.setHeader("access-control-allow-headers", "content-type, x-louie-device");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("cache-control", "no-store");
  return !o || ORIGINS.has(o);
}
export function fail(res, status, message) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ type: "error", error: { type: "louie_limit", message } }));
}
export async function readJSON(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > 6_000_000) throw Object.assign(new Error("too large"), { status: 413 }); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
