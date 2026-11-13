// MusicKit developer tokens, signed on the server. Team and key IDs are not secret; the key is.
import crypto from "node:crypto";
import { ORIGINS } from "./_lib.js";

export const DAYS = 30;
const b64 = x => Buffer.from(x).toString("base64url");
export function signMusicToken(env, now = Math.floor(Date.now() / 1000)) {
  const pem = String(env.MUSICKIT_KEY || "").replace(/\\n/g, "\n");
  const header = { alg: "ES256", kid: env.MUSICKIT_KEY_ID || "KABHU54QBS" };
  const payload = { iss: env.APPLE_TEAM_ID || "7MHDTK68M2", iat: now, exp: now + DAYS * 86400, origin: [...ORIGINS].filter(o => o.startsWith("https://")) };
  const input = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(payload))}`;
  const sig = crypto.sign("sha256", Buffer.from(input), { key: pem, dsaEncoding: "ieee-p1363" });
  return { token: `${input}.${b64(sig)}`, expires: payload.exp };
}
export const previewAllowed = u => { try { const x = new URL(u); return x.protocol === "https:" && /(^|\.)(itunes\.apple\.com|mzstatic\.com)$/.test(x.hostname); } catch { return false; } };
