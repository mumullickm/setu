'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Rating, type Grade } from 'ts-fsrs';
import { Card, Screen, Speaker, Syllables, TopBar, playClip } from '@/components/ui';
import { useApp, useStore } from '@/components/boot';
import { BY_ID, rootPron } from '@/lib/content';
import { due, getData, grade, nextDue, scheduler } from '@/lib/store';
import { num, span } from '@/lib/i18n';

const GRADES: { g: Grade; key: 'gAgain' | 'gHard' | 'gGood' | 'gEasy'; cls: string; sub: string }[] = [
  { g: Rating.Again, key: 'gAgain', cls: 'bg-bad-bg text-bad', sub: '' },
  { g: Rating.Hard, key: 'gHard', cls: 'bg-fill text-ink', sub: 'text-ink-2' },
  { g: Rating.Good, key: 'gGood', cls: 'bg-tint-bg text-tint', sub: '' },
  { g: Rating.Easy, key: 'gEasy', cls: 'bg-tint text-on-tint', sub: '' },
];

// Canvas board App 6 (Review cards), FSRS over every word met.
export default function Review() {
  useStore();
  const { lang, t } = useApp();
  const queue = useMemo(() => due().map((w) => w.id), []);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const id = queue[i];
  const w = id ? BY_ID[id] : null;
  const card = id ? getData().progress[id]?.card : null;
  const preview = useMemo(() => (card ? scheduler.repeat(card, new Date()) : null), [card]);

  if (!w || !card || !preview) {
    const nd = nextDue();
    const met = Object.keys(getData().progress).length > 0;
    return (
      <Screen>
        <TopBar title={t.rTitle} />
        <Card className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="text-[21px] font-bold">{queue.length ? t.finished(num(queue.length, lang)) : t.none}</span>
          <span className="text-[16px] text-ink-2">{met ? (nd ? t.nextAt(span(+nd - Date.now(), lang)) : '') : t.noneYet}</span>
          <Link href="/" className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-tint text-[17px] font-semibold text-on-tint">{t.home}</Link>
        </Card>
      </Screen>
    );
  }

  const rate = (g: Grade) => { grade(w.id, g); setShown(false); setI(i + 1); };

  return (
    <Screen tabs={false}>
      <TopBar title={t.rTitle} right={`${num(i + 1, lang)}/${num(queue.length, lang)}`} />
      <Card className="flex flex-1 flex-col items-center gap-[6px] px-5 py-6 text-center">
        <span className="ar text-[68px] leading-[1.6]" lang="ar">{w.ar}</span>
        <div className="flex items-center gap-3">
          <Syllables segs={w.pr[lang]} className="text-[24px] font-semibold" />
          <button type="button" aria-label={t.play} onClick={() => playClip('ar', w.id)}
            className="flex size-11 items-center justify-center rounded-full bg-fill text-tint"><Speaker size={20} /></button>
        </div>
        {shown ? (
          <>
            <div aria-hidden="true" className="my-[14px] h-[0.5px] w-full bg-sep" />
            <span className="text-[34px] font-bold">{w.bn}</span>
            <span className="text-[16px] text-ink-2">{w.mean[lang]}</span>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <span className="flex items-center gap-[6px] rounded-full bg-bg px-3 py-[3px] text-[13px]">
                {t.root} <span className="ar text-[17px]" lang="ar">{w.root}</span>
                <Syllables segs={rootPron(w.root, lang)} className="font-semibold" />
              </span>
            </div>
            {w.ex && (
              <div className="mt-auto flex w-full flex-col gap-[2px] rounded-[14px] bg-bg px-[14px] py-3">
                <span className="ar text-[23px] leading-[1.7]" lang="ar">{w.ex.ar}</span>
                <span className="text-[14px] text-ink-2">{w.ex[lang]}</span>
              </div>
            )}
          </>
        ) : (
          <button type="button" onClick={() => { setShown(true); playClip(lang, w.id); }}
            className="mt-auto flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-tint text-[17px] font-semibold text-on-tint">{t.show}</button>
        )}
      </Card>
      {shown && (
        <>
          <span className="text-center text-[13px] font-semibold text-ink-2">{t.recall}</span>
          <div className="grid grid-cols-4 gap-2">
            {GRADES.map(({ g, key, cls, sub }) => (
              <button key={g} type="button" onClick={() => rate(g)} className={`flex min-h-[60px] flex-col items-center justify-center rounded-[14px] ${cls}`}>
                <span className="text-[15px] font-semibold">{t[key]}</span>
                <span className={`text-[12px] ${sub}`}>{span(+preview[g].card.due - Date.now(), lang)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </Screen>
  );
}
