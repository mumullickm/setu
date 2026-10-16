import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'setu_s';
export const STATE_COOKIE = 'setu_oauth';
const SESSION_DAYS = 180;

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters');
  return new TextEncoder().encode(s);
}

// Two emails, set in ALLOWED_EMAILS (comma separated). Nobody else gets a session.
export function allowed(email: string) {
  const list = (process.env.ALLOWED_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

type Typ = 'session' | 'handoff' | 'state';
export async function sign(claims: Record<string, unknown>, typ: Typ, seconds: number) {
  return new SignJWT({ ...claims, typ })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + seconds)
    .setJti(crypto.randomUUID())
    .sign(key());
}
export async function verify(token: string, typ: Typ) {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    return payload.typ === typ ? payload : null;
  } catch {
    return null;
  }
}
export const sessionToken = (u: { id: string; email: string }) => sign({ sub: u.id, email: u.email }, 'session', SESSION_DAYS * 86400);

export const cookieOpts = (maxAge: number) => ({ httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge });

// Session from the cookie (web) or a bearer token (APK). Re-checks the allowlist on every call.
export async function session(req: Request) {
  const auth = req.headers.get('authorization');
  const raw = auth?.startsWith('Bearer ') ? auth.slice(7) : (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const p = await verify(raw, 'session');
  if (!p?.sub || typeof p.email !== 'string' || !allowed(p.email)) return null;
  return { id: p.sub, email: p.email };
}

// The APK's WebView runs at https://localhost (Capacitor). Only that origin gets CORS.
const APP_ORIGINS = ['https://localhost', 'capacitor://localhost'];
export function cors(req: Request, res: Response) {
  const o = req.headers.get('origin');
  if (o && APP_ORIGINS.includes(o)) {
    res.headers.set('Access-Control-Allow-Origin', o);
    res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers.set('Access-Control-Max-Age', '600');
    res.headers.set('Vary', 'Origin');
  }
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
export const preflight = (req: Request) => cors(req, new Response(null, { status: 204 }));
