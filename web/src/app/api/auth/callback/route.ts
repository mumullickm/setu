import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { allowed, cookieOpts, SESSION_COOKIE, sessionToken, sign, STATE_COOKIE, verify } from '@/lib/server/auth';
import { sql } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = (e: string, app = false) => {
    const res = NextResponse.redirect(app ? `setu://auth?e=${e}` : `${url.origin}/signin/?e=${e}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  };
  const raw = req.headers.get('cookie')?.match(new RegExp(`${STATE_COOKIE}=([^;]+)`))?.[1];
  const st = raw ? await verify(raw, 'state') : null;
  const app = st?.app === true;
  if (!st || st.state !== url.searchParams.get('state')) return fail('failed', app);
  const code = url.searchParams.get('code');
  if (!code) return fail('failed', app);

  // The id_token comes straight from Google's token endpoint over TLS, so its claims can be read without a JWKS check.
  const tr = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, grant_type: 'authorization_code', redirect_uri: `${url.origin}/api/auth/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '', client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  });
  if (!tr.ok) return fail('failed', app);
  const { id_token } = (await tr.json()) as { id_token?: string };
  if (!id_token) return fail('failed', app);
  const c = decodeJwt(id_token);
  const email = typeof c.email === 'string' ? c.email.toLowerCase() : '';
  if (c.aud !== process.env.GOOGLE_CLIENT_ID || c.email_verified !== true || !email) return fail('failed', app);
  if (!allowed(email)) return fail('denied', app);

  const name = typeof c.given_name === 'string' ? c.given_name : typeof c.name === 'string' ? c.name : '';
  const db = sql();
  const rows = (await db`insert into users (email, name) values (${email}, ${name})
    on conflict (email) do update set name = case when users.name = '' then excluded.name else users.name end
    returning id, email`) as { id: string; email: string }[];
  const user = rows[0];

  if (app) {
    const handoff = await sign({ sub: user.id, email: user.email }, 'handoff', 120);
    const res = NextResponse.redirect(`setu://auth?code=${encodeURIComponent(handoff)}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }
  const res = NextResponse.redirect(`${url.origin}/`);
  res.cookies.delete(STATE_COOKIE);
  res.cookies.set(SESSION_COOKIE, await sessionToken(user), cookieOpts(180 * 86400));
  return res;
}
