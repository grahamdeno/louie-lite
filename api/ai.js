// POST /api/ai: passes one Messages request to Anthropic with the shared key, after the abuse guard:
// a signed device token, daily caps per device, per network address and overall, a lower daily cap on
// web search (Get the song), a fixed list of models, a cap on reply size and on searches per call.
// The body is the same as Anthropic's Messages API; the reply (streamed or not) comes straight back.
import { LIMITS, MODELS, deviceOf, bump, ipOf, cors, fail, readJSON } from "./_lib.js";

export default async function handler(req, res) {
  if (!cors(req, res)) return fail(res, 403, "Not allowed from this site.");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST") return fail(res, 405, "POST only.");
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fail(res, 503, "The AI server isn't set up yet.");
  const device = deviceOf(req.headers["x-louie-device"]);
  if (!device) return fail(res, 401, "This install isn't signed in to the AI server. Reload the app to try again.");

  let body;
  try { body = await readJSON(req); } catch (e) { return fail(res, e.status || 400, "That request couldn't be read."); }
  if (!MODELS.has(body.model)) return fail(res, 400, "That model isn't allowed here.");
  if (!Array.isArray(body.messages) || !body.messages.length) return fail(res, 400, "Nothing to send.");
  const tools = Array.isArray(body.tools) ? body.tools : [];
  if (tools.some(t => t?.name !== "web_search")) return fail(res, 400, "Only web search is allowed as a tool.");
  const search = tools.length > 0;
  const out = {
    model: body.model,
    max_tokens: Math.min(Number(body.max_tokens) || 1024, LIMITS.maxTokens),
    messages: body.messages,
    ...(typeof body.system === "string" ? { system: body.system } : {}),
    ...(search ? { tools: tools.map(t => ({ type: t.type, name: "web_search", max_uses: Math.min(Number(t.max_uses) || 1, LIMITS.maxSearches) })) } : {}),
    ...(body.stream ? { stream: true } : {})
  };
  /* A Get the song continues its own search turns (pause_turn): only the first turn counts against the search cap. */
  const firstTurn = body.messages.length === 1;

  try {
    const keys = [`dev:${device}`, `ip:${ipOf(req)}`, "all"];
    if (search && firstTurn) keys.push(`search:${device}`);
    const [d, ip, all, s = 0] = await bump(keys);
    if (all > LIMITS.allDay) return fail(res, 429, "Louie's AI is resting for today. Try again tomorrow, or add your own key in Settings > Keys.");
    if (d > LIMITS.perDevice || ip > LIMITS.perIp) return fail(res, 429, "That's today's AI limit for this phone. It resets tomorrow, or add your own key in Settings > Keys.");
    if (s > LIMITS.searchPerDevice) return fail(res, 429, `Get the song can run ${LIMITS.searchPerDevice} times a day. Try again tomorrow, or add your own key in Settings > Keys.`);
  } catch (e) { return fail(res, e.status || 503, e.message); }

  let r;
  try {
    r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(out)
    });
  } catch { return fail(res, 502, "Couldn't reach Anthropic."); }
  res.statusCode = r.status;
  res.setHeader("content-type", r.headers.get("content-type") || "application/json");
  if (!r.body) return res.end(await r.text());
  const reader = r.body.getReader();
  for (;;) { const { done, value } = await reader.read(); if (done) break; res.write(Buffer.from(value)); }
  res.end();
}
