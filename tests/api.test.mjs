// The AI server's abuse guard: tokens, caps, the model list and passing the reply through.
import test from "node:test";
import assert from "node:assert/strict";

process.env.DEVICE_SECRET = "test-secret";
process.env.ANTHROPIC_API_KEY = "sk-ant-test";
process.env.KV_REST_API_URL = "https://kv.test";
process.env.KV_REST_API_TOKEN = "kv";
const { default: ai } = await import("../api/ai.js");
const { default: token } = await import("../api/token.js");
const { LIMITS } = await import("../api/_lib.js");

const counts = new Map();
let sent = null;
globalThis.fetch = async (url, opt) => {
  if (url === "https://kv.test/pipeline") {
    const cmds = JSON.parse(opt.body);
    return new Response(JSON.stringify(cmds.map(([op, k]) => op === "INCR" ? { result: counts.set(k, (counts.get(k) || 0) + 1).get(k) } : { result: 1 })));
  }
  if (url === "https://api.anthropic.com/v1/messages") { sent = { headers: opt.headers, body: JSON.parse(opt.body) }; return new Response(JSON.stringify({ content: [{ type: "text", text: "hi" }] }), { headers: { "content-type": "application/json" } }); }
  throw new Error("unexpected " + url);
};
const call = async (fn, { body = {}, headers = {} } = {}) => {
  const res = { statusCode: 200, headers: {}, out: "", setHeader(k, v) { this.headers[k] = v; }, write(b) { this.out += b; }, end(b = "") { this.out += b; } };
  await fn({ method: "POST", headers: { origin: "https://louie-lite.tangomike.app", "x-forwarded-for": "1.2.3.4", ...headers }, body }, res);
  return { ...res, json: () => JSON.parse(res.out) };
};
const msg = { model: "claude-haiku-5-5", max_tokens: 99999, messages: [{ role: "user", content: "hello" }] };

test("a device gets a token and the call goes through with the shared key", async () => {
  const t = (await call(token)).json().token;
  assert.match(t, /^[\w-]+\.[\w-]{32}$/);
  const r = await call(ai, { body: msg, headers: { "x-louie-device": t } });
  assert.equal(r.statusCode, 200);
  assert.equal(r.json().content[0].text, "hi");
  assert.equal(sent.headers["x-api-key"], "sk-ant-test");
  assert.equal(sent.body.max_tokens, LIMITS.maxTokens, "reply size is capped");
});

test("no token, a forged token, a model not on the list or another site are refused", async () => {
  assert.equal((await call(ai, { body: msg })).statusCode, 401);
  assert.equal((await call(ai, { body: msg, headers: { "x-louie-device": "abc.0123456789012345678901234567890x" } })).statusCode, 401);
  const t = (await call(token, { headers: { "x-forwarded-for": "5.5.5.5" } })).json().token;
  assert.equal((await call(ai, { body: { ...msg, model: "claude-opus-5-5" }, headers: { "x-louie-device": t } })).statusCode, 400);
  assert.equal((await call(ai, { body: { ...msg, tools: [{ type: "code", name: "code" }] }, headers: { "x-louie-device": t } })).statusCode, 400);
  assert.equal((await call(ai, { body: msg, headers: { "x-louie-device": t, origin: "https://evil.example" } })).statusCode, 403);
});

test("Get the song has its own daily cap, and its search turns count once", async () => {
  const t = (await call(token, { headers: { "x-forwarded-for": "6.6.6.6" } })).json().token;
  const search = { ...msg, tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 50 }] };
  for (let i = 0; i < LIMITS.searchPerDevice; i++) assert.equal((await call(ai, { body: search, headers: { "x-louie-device": t, "x-forwarded-for": "6.6.6.6" } })).statusCode, 200);
  assert.equal(sent.body.tools[0].max_uses, LIMITS.maxSearches, "searches per call are capped");
  const more = { ...search, messages: [...search.messages, { role: "assistant", content: [] }] };
  assert.equal((await call(ai, { body: more, headers: { "x-louie-device": t, "x-forwarded-for": "6.6.6.6" } })).statusCode, 200, "a continued search turn is not a new search");
  const over = await call(ai, { body: search, headers: { "x-louie-device": t, "x-forwarded-for": "6.6.6.6" } });
  assert.equal(over.statusCode, 429);
  assert.equal(over.json().error.type, "louie_limit");
});

test("a phone stops at its daily limit", async () => {
  const t = (await call(token, { headers: { "x-forwarded-for": "7.7.7.7" } })).json().token;
  let last;
  for (let i = 0; i <= LIMITS.perDevice; i++) last = await call(ai, { body: msg, headers: { "x-louie-device": t, "x-forwarded-for": "7.7.7.7" } });
  assert.equal(last.statusCode, 429);
});

test("new tokens are limited per network address", async () => {
  let last;
  for (let i = 0; i <= LIMITS.tokensPerIp; i++) last = await call(token, { headers: { "x-forwarded-for": "8.8.8.8" } });
  assert.equal(last.statusCode, 429);
});
