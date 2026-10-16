'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { exchange, me as fetchMe, native, sync, type Me } from '@/lib/api';
import { getLang, setLang, snapshot, subscribe } from '@/lib/store';
import { UI, type Strings } from '@/lib/i18n';
import type { Lang } from '@/lib/content';

type Ctx = { me: Me | null; lang: Lang; t: Strings; setLang: (l: Lang) => void; authError: string | null; refresh: () => Promise<void> };
const C = createContext<Ctx | null>(null);
export const useApp = () => useContext(C)!;
// Re-render whenever local progress changes.
export const useStore = () => useSyncExternalStore(subscribe, snapshot, () => 0);

export function Boot({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  useStore();
  const lang = typeof window === 'undefined' ? 'bn' : getLang();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    const m = await fetchMe();
    setMe(m);
    setReady(true);
    if (m) sync();
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!ready) return;
    const onSignin = path?.startsWith('/signin');
    if (!me && !onSignin) router.replace('/signin/');
    if (me && onSignin) router.replace('/');
  }, [ready, me, path, router]);

  // Push local changes a few seconds after they happen, and whenever the app comes back.
  useEffect(() => {
    if (!me) return;
    const push = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => sync(), 3000); };
    const unsub = subscribe(push);
    const wake = () => { if (document.visibilityState === 'visible') sync(); };
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', wake);
    return () => { unsub(); window.removeEventListener('online', wake); document.removeEventListener('visibilitychange', wake); };
  }, [me]);

  // APK: the Custom Tab hands the session back on setu://auth.
  useEffect(() => {
    if (!native()) return;
    let off: (() => void) | undefined;
    (async () => {
      const { App } = await import('@capacitor/app');
      const { Browser } = await import('@capacitor/browser');
      const h = await App.addListener('appUrlOpen', async ({ url }) => {
        if (!url.startsWith('setu://auth')) return;
        Browser.close().catch(() => {});
        const q = new URL(url.replace('setu://auth', 'https://x/'));
        const code = q.searchParams.get('code');
        if (!code) { setAuthError(q.searchParams.get('e') ?? 'failed'); return; }
        if (await exchange(code)) { setAuthError(null); await refresh(); } else setAuthError('failed');
      });
      off = () => h.remove();
    })();
    return () => off?.();
  }, [refresh]);

  const ctx: Ctx = { me, lang, t: UI[lang], setLang, authError, refresh };
  const gated = !ready || (!me && !path?.startsWith('/signin'));
  return <C.Provider value={ctx}>{gated ? <div className="min-h-dvh bg-bg" /> : children}</C.Provider>;
}
