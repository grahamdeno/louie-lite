// GET /api/musickit/preview?u=<Apple preview URL>: that 30-second preview, readable by the app,
// so it can measure the tempo and key. Only Apple's preview hosts are fetched.
import { cors, fail } from "../_lib.js";
import { previewAllowed } from "../_music.js";

export default async function handler(req, res) {
  if (!cors(req, res)) return fail(res, 403, "Not allowed from this site.");
  if (req.method !== "GET") return fail(res, 405, "GET only.");
  const u = new URL(req.url, "http://x").searchParams.get("u");
  if (!previewAllowed(u)) return fail(res, 400, "Not an Apple preview.");
  const r = await fetch(u);
  if (!r.ok) return fail(res, 502, "The preview couldn't be fetched.");
  res.setHeader("content-type", r.headers.get("content-type") || "audio/mp4");
  res.setHeader("cache-control", "public, max-age=86400");
  res.end(Buffer.from(await r.arrayBuffer()));
}
