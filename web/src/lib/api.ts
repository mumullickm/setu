'use client';
import { Capacitor } from '@capacitor/core';
import { claim, dirty, merge } from './store';

// Web: same origin, session in an httpOnly cookie. APK: the deployed origin, session as a bearer token.
export const native = () => Capacitor.isNativePlatform();
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
const TOKEN = 'setu-token';
const ME = 'setu-me';

export type Me = { id: string; email: string; name: string; partner: { name: string } | null };

const token = () => { try { return localStorage.getItem(TOKEN); } catch { return null; } };
export function setToken(t: string | null) { try { t ? localStorage.setItem(TOKEN, t) : localStorage.removeItem(TOKEN); } catch {} }

async function call(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const t = native() ? token() : null;
  if (t) headers.set('Authorization', `Bearer ${t}`);
  if (init.body) headers.set('Content-Type', 'application/json');
  return fetch(BASE + path, { ...init, headers, credentials: native() ? 'omit' : 'same-origin' });
}

export function cachedMe(): Me | null { try { return JSON.parse(localStorage.getItem(ME) ?? 'null'); } catch { return null; } }

// Returns the account, the cached one when offline, or null when signed out.
export async function me(): Promise<Me | null> {
  if (native() && !token()) return null;
  try {
    const r = await call('/api/me');
    if (r.status === 401) { localStorage.removeItem(ME); setToken(null); return null; }
    if (!r.ok) return cachedMe();
    const m = (await r.json()) as Me;
    localStorage.setItem(ME, JSON.stringify(m));
    claim(m.email);
    return m;
  } catch {
    return cachedMe();
  }
}

let running: Promise<boolean> | null = null;
export function sync(): Promise<boolean> {
  if (running) return running;
  running = (async () => {
    try {
      const sent = dirty();
      const r = await call('/api/sync', { method: 'POST', body: JSON.stringify(sent) });
      if (!r.ok) return false;
      merge(sent, await r.json());
      return true;
    } catch {
      return false;
    } finally {
      running = null;
    }
  })();
  return running;
}

export async function signOut() {
  try { if (!native()) await call('/api/auth/signout', { method: 'POST' }); } catch {}
  setToken(null);
  try { localStorage.removeItem(ME); } catch {}
}

// APK only: Google refuses sign-in inside a WebView, so it runs in a Custom Tab and comes back on setu://auth.
export async function nativeSignIn() {
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url: `${BASE}/api/auth/google?app=1` });
}
export async function exchange(code: string) {
  const r = await call('/api/auth/exchange', { method: 'POST', body: JSON.stringify({ code }) });
  if (!r.ok) return false;
  const { token: t } = (await r.json()) as { token: string };
  setToken(t);
  return true;
}
