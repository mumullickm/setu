'use client';
import Link from 'next/link';
import { Card, Chevron, Screen, TopBar } from '@/components/ui';
import { useApp, useStore } from '@/components/boot';
import { LESSONS } from '@/lib/content';
import { lessonDone } from '@/lib/store';
import { num } from '@/lib/i18n';

// Canvas board Build 2 (Lesson picker).
export default function Lessons() {
  useStore();
  const { lang, t } = useApp();
  return (
    <Screen>
      <TopBar title={t.tLessons} />
      <span className="text-[15px] text-ink-2">{t.lessonsSub}</span>
      <Card className="flex flex-col overflow-hidden">
        {LESSONS.map((l, i) => {
          const done = lessonDone(l.id);
          return (
            <Link key={l.id} href={`/lessons/${l.id}/`}
              className={`flex min-h-[68px] items-center gap-3 px-4 py-[10px] text-ink ${i < LESSONS.length - 1 ? 'border-b-[0.5px] border-sep' : ''}`}>
              <span className={`flex size-9 flex-none items-center justify-center rounded-full text-[15px] font-bold ${done ? 'bg-tint text-on-tint' : 'bg-fill text-ink-2'}`}>
                {done ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : num(l.n, lang)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <strong className="text-[16px] font-semibold">{l.title[lang]}</strong>
                <small className="text-[13px] text-ink-2">{t.lesson(num(l.n, lang))} · {t.words(num(l.words.length, lang))}{done ? ` · ${t.done}` : ''}</small>
              </span>
              <Chevron />
            </Link>
          );
        })}
      </Card>
      <span className="text-center text-[12px] text-ink-3">{t.credit}</span>
    </Screen>
  );
}
