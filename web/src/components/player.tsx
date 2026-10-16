'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mountPlayer } from '@/lib/player-engine';
import { finishLesson, recordAnswer } from '@/lib/store';
import { sync } from '@/lib/api';
import { useApp } from './boot';

// Canvas board App 2: the approved player, with its answers feeding FSRS and the word counter.
export function Player({ id }: { id: string }) {
  const router = useRouter();
  const { lang } = useApp();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const off = mountPlayer(id, lang, {
      answer: (w: string, ok: boolean) => recordAnswer(w, ok),
      finish: (l: string, first: string[], started: string) => { finishLesson(l, first, started); sync(); },
      go: (next: string) => router.push(`/lessons/${next}/`),
      exit: () => router.push('/lessons/'),
    });
    return () => { off(); document.body.style.overflow = ''; };
  }, [id, lang, router]);

  return (
    <div className="player">
      <div className="app" id="app">
        <div className="nav" id="navbar">
          <button className="close" id="restart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <div className="bar" aria-hidden="true"><i id="bar" /></div>
          <span className="step" id="num" />
        </div>
        <main className="stage" id="stage" aria-live="polite" />
        <p className="toast" id="toast" />
        <div className="dock" id="dock" />
        <section className="sheet" id="sheet" aria-live="polite" />
      </div>
    </div>
  );
}
