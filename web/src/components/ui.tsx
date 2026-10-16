'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Lang, Seg } from '@/lib/content';
import { useApp } from './boot';

// Pronunciation: syllables split on hyphens, amber where the sound is missing from the reader's language.
export function Pron({ segs, className = '' }: { segs: Seg[]; className?: string }) {
  return (
    <span className={className}>
      {segs.map(([t, s], i) => <span key={i} className={s ? 'text-sound' : undefined}>{t}</span>)}
    </span>
  );
}
export function Syllables({ segs, className = '' }: { segs: Seg[]; className?: string }) {
  const out: Seg[] = [];
  segs.forEach(([t, s]) => t.split('-').forEach((y) => y && out.push([y, s])));
  return (
    <span className={className}>
      {out.map(([t, s], i) => (
        <span key={i}>{i > 0 && <span className="font-normal text-ink-3"> · </span>}<span className={s ? 'text-sound' : undefined}>{t}</span></span>
      ))}
    </span>
  );
}

export function LangSwitch() {
  const { lang, setLang, t } = useApp();
  const b = (l: Lang, label: string) => (
    <button type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
      className={`min-h-[38px] min-w-[58px] rounded-[8px] text-[14px] font-semibold transition-colors ${lang === l ? 'bg-card text-ink shadow-[0_1px_3px_rgba(0,0,0,.12)]' : 'text-ink-2'}`}>
      {label}
    </button>
  );
  return <div role="group" aria-label={t.langLabel} className="flex gap-[2px] rounded-[10px] bg-fill p-[3px]">{b('bn', 'বাংলা')}{b('en', 'English')}</div>;
}

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-[18px] bg-card shadow-card ${className}`}>{children}</div>
);

export function Screen({ children, tabs = true, className = '' }: { children: React.ReactNode; tabs?: boolean; className?: string }) {
  return (
    <div className={`mx-auto flex min-h-dvh max-w-[440px] flex-col gap-4 px-5 pt-[calc(14px+env(safe-area-inset-top))] ${tabs ? 'pb-[calc(100px+env(safe-area-inset-bottom))]' : 'pb-[calc(24px+env(safe-area-inset-bottom))]'} ${className}`}>
      {children}
      {tabs && <TabBar />}
    </div>
  );
}

export function TopBar({ title, right }: { title: string; right?: React.ReactNode }) {
  const { t } = useApp();
  return (
    <div className="flex min-h-12 items-center gap-[14px]">
      <Link href="/" aria-label={t.back} className="flex size-9 flex-none items-center justify-center rounded-full bg-fill text-tint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </Link>
      <span className="flex-1 text-center text-[17px] font-semibold">{title}</span>
      <span className="min-w-9 text-right text-[13px] text-ink-3 tabular-nums">{right}</span>
    </div>
  );
}

export const Chevron = () => (
  <svg className="flex-none text-ink-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
export const Speaker = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9.5v5c0 .6.4 1 1 1h3l4.3 3.7c.6.5 1.7.1 1.7-.8V5.6c0-.9-1.1-1.3-1.7-.8L7 8.5H4c-.6 0-1 .4-1 1z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
);

// Three tabs for the modules that exist today; roots, sounds, salah and couple join as they are built.
function TabBar() {
  const { t } = useApp();
  const path = usePathname() ?? '/';
  const tab = (href: string, label: string, icon: React.ReactNode) => {
    const on = href === '/' ? path === '/' : path.startsWith(href);
    return (
      <Link href={href} aria-current={on ? 'page' : undefined}
        className={`flex min-h-12 min-w-16 flex-col items-center gap-[2px] text-[11px] ${on ? 'font-semibold text-tint' : 'font-medium text-[#8E8E93]'}`}>
        {icon}{label}
      </Link>
    );
  };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t-[0.5px] border-[rgba(60,60,67,.18)] bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[440px] items-start justify-around pt-[6px]">
        {tab('/', t.tToday, <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /></svg>)}
        {tab('/lessons', t.tLessons, <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" /></svg>)}
        {tab('/review', t.tReview, <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="6" width="13" height="15" rx="2" /><path d="M8 3h10a2 2 0 0 1 2 2v12" /></svg>)}
      </div>
    </nav>
  );
}

// One shared Audio element; clips ship with the app in /audio.
let cur: HTMLAudioElement | null = null;
export function playClip(lang: 'ar' | Lang, id: string) {
  try { cur?.pause(); } catch {}
  cur = new Audio(`/audio/${lang}-${id}.mp3`);
  cur.play().catch(() => {});
}
