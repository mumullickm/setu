import { allowed, cors, preflight, sessionToken, verify } from '@/lib/server/auth';
import { sql } from '@/lib/server/db';

export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

// The APK trades the two-minute, single-use code from setu://auth for its long-lived bearer token.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  const p = body?.code ? await verify(body.code, 'handoff') : null;
  if (!p?.sub || !p.jti || typeof p.email !== 'string' || !allowed(p.email))
    return cors(req, Response.json({ error: 'invalid' }, { status: 401 }));
  const used = (await sql()`insert into used_handoffs (jti) values (${p.jti}) on conflict do nothing returning jti`) as unknown[];
  if (!used.length) return cors(req, Response.json({ error: 'used' }, { status: 401 }));
  return cors(req, Response.json({ token: await sessionToken({ id: p.sub, email: p.email }) }));
}
