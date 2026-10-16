'use client';
import { useEffect, useState } from 'react';
import { Card, LangSwitch } from '@/components/ui';
import { useApp } from '@/components/boot';
import { native, nativeSignIn } from '@/lib/api';

// Canvas board Build 1 (Sign in): Google, two allowed accounts.
export default function SignIn() {
  const { t, authError } = useApp();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setErr(new URLSearchParams(location.search).get('e')); }, []);
  useEffect(() => { if (authError) { setErr(authError); setBusy(false); } }, [authError]);

  const go = async () => {
    setErr(null);
    if (native()) { setBusy(true); await nativeSignIn(); } else location.href = '/api/auth/google';
  };
  const msg = err === 'denied' ? t.denied : err ? t.failed : busy ? t.opening : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col gap-4 px-6 pt-[calc(20px+env(safe-area-inset-top))] pb-[calc(36px+env(safe-area-inset-bottom))]">
      <div className="flex justify-end"><LangSwitch /></div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[6px] text-center">
        <span className="ar text-[64px] leading-[1.5] text-tint" lang="ar">جِسْر</span>
        <span className="text-[15px] font-semibold">জিস<span className="font-normal text-ink-3"> · </span>র</span>
        <span className="mt-[18px] text-[34px] font-bold tracking-[-0.01em]">{t.app}</span>
        <span className="max-w-[290px] text-[17px] leading-[1.5] text-ink-2">{t.tag}</span>
      </div>
      <Card className="flex flex-col gap-3 p-[18px]">
        <button type="button" onClick={go} disabled={busy}
          className="flex min-h-[52px] items-center justify-center gap-[10px] rounded-[14px] border border-[rgba(60,60,67,.18)] bg-card text-[17px] font-semibold text-ink disabled:opacity-60">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
          {t.google}
        </button>
        <span className="text-center text-[13px] leading-[1.5] text-ink-2">{t.private}</span>
        {msg && <span role="status" className={`text-center text-[14px] font-semibold ${err ? 'text-bad' : 'text-ink-2'}`}>{msg}</span>}
      </Card>
      <span className="text-center text-[12px] text-ink-3">{t.credit}</span>
    </div>
  );
}
