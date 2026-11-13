// POST /api/token: a new device token for this install. A few per network address per day.
import { LIMITS, newToken, bump, ipOf, cors, fail } from "./_lib.js";

export default async function handler(req, res) {
  if (!cors(req, res)) return fail(res, 403, "Not allowed from this site.");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "POST") return fail(res, 405, "POST only.");
  if (!process.env.DEVICE_SECRET) return fail(res, 503, "The AI server isn't set up yet.");
  try {
    const [n] = await bump([`tok:ip:${ipOf(req)}`]);
    if (n > LIMITS.tokensPerIp) return fail(res, 429, "Too many new installs from this network today. Try again tomorrow.");
  } catch (e) { return fail(res, e.status || 503, e.message); }
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ token: newToken() }));
}
