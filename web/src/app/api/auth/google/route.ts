import { NextResponse } from 'next/server';
import { sign, STATE_COOKIE, cookieOpts } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const app = url.searchParams.get('app') === '1';
  const state = crypto.randomUUID();
  const g = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  g.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID ?? '');
  g.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
  g.searchParams.set('response_type', 'code');
  g.searchParams.set('scope', 'openid email profile');
  g.searchParams.set('state', state);
  g.searchParams.set('prompt', 'select_account');
  const res = NextResponse.redirect(g);
  res.cookies.set(STATE_COOKIE, await sign({ state, app }, 'state', 600), cookieOpts(600));
  return res;
}
