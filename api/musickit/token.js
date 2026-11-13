// GET /api/musickit/token: a MusicKit developer token (ES256 JWT) for Louie Lite's own address.
// The MusicKit private key lives only in Vercel's environment (MUSICKIT_KEY, the .p8 file's text).
import { cors, fail } from "../_lib.js";
import { signMusicToken } from "../_music.js";

let cached = null; /* { token, expires } while this function instance lives */
export default async function handler(req, res) {
  if (!cors(req, res)) return fail(res, 403, "Not allowed from this site.");
  res.setHeader("access-control-allow-methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  if (req.method !== "GET") return fail(res, 405, "GET only.");
  if (!process.env.MUSICKIT_KEY) return fail(res, 503, "Apple Music isn't set up on the server yet.");
  try {
    const now = Math.floor(Date.now() / 1000);
    if (!cached || cached.expires - now < 86400) cached = signMusicToken(process.env, now);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(cached));
  } catch { fail(res, 500, "The Apple Music token couldn't be made."); }
}
