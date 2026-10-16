'use client';
import Link from 'next/link';
import { Card, Chevron, LangSwitch, Pron, Screen } from '@/components/ui';
import { useApp, useStore } from '@/components/boot';
import { LESSONS, LOANWORD_TARGET, WORDS } from '@/lib/content';
import { due, known, lessonDone, nextLesson, streak } from '@/lib/store';
import { num } from '@/lib/i18n';

const initial = (s: string) => (s.trim()[0] ?? '').toUpperCase();

// Canvas board App 1 (Home).
export default function Home() {
  useStore();
  const { me, lang, t } = useApp();
  const k = known();
  const chips = (k.length >= 4 ? k.slice(-4) : [...k, ...WORDS.filter((w) => !k.includes(w)).slice(0, 4 - k.length)]);
  const next = nextLesson();
  const lesson = next ?? LESSONS[LESSONS.length - 1];
  const nDue = due().length;
  const days = streak();

  return (
    <Screen>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center">
          <span className="flex size-[34px] items-center justify-center rounded-full bg-tint text-[13px] font-semibold text-on-tint">{initial(me?.name || me?.email || '')}</span>
          {me?.partner && (
            <span className="-ml-2 flex size-[34px] items-center justify-center rounded-full border-2 border-bg bg-[#8E5A86] text-[12px] font-semibold text-white">{initial(me.partner.name)}</span>
          )}
          <span className="ml-[10px] text-[14px] font-semibold text-ink-2">{t.days(num(days, lang))}</span>
        </div>
        <LangSwitch />
      </div>

      <div className="flex flex-col gap-[2px]">
        <span className="text-[14px] font-semibold text-ink-2">{t.greet}</span>
        <span className="text-[34px] leading-[1.15] font-bold tracking-[-0.01em]">{me?.name || ''}</span>
      </div>

      <Card className="flex flex-col gap-[10px] p-[18px]">
        <span className="text-[13px] font-semibold text-ink-2">{t.known}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[44px] leading-none font-bold tracking-[-0.02em] text-tint tabular-nums">{num(k.length, lang)}</span>
          <span className="text-[17px] font-semibold">{t.unit}</span>
        </div>
        <div className="h-[6px] overflow-hidden rounded-[3px] bg-fill">
          <div className="h-[6px] rounded-[3px] bg-tint transition-[width] duration-700" style={{ width: `${Math.max(1, (k.length / LOANWORD_TARGET) * 100)}%` }} />
        </div>
        <span className="text-[13px] text-ink-2">{t.of}</span>
        <div className="mt-1 grid grid-cols-4 gap-[6px]">
          {chips.map((w) => (
            <div key={w.id} className="flex flex-col items-center rounded-[12px] bg-bg px-[2px] pt-[6px] pb-2">
              <span className="ar text-[22px] leading-[1.6]" lang="ar">{w.ar}</span>
              <Pron segs={w.pr[lang]} className="text-[12px] font-semibold" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-[6px] p-[18px]">
        <span className="text-[13px] font-semibold text-ink-2">{next ? t.lessonEye(num(lesson.n, lang)) : t.allDone}</span>
        <span className="text-[21px] leading-[1.3] font-bold">{lesson.title[lang]}</span>
        <span className="text-[14px] text-ink-2">{t.lessonMeta(num(lesson.words.length, lang), lesson.words.slice(0, 3).map((w) => w.bn).join(', '))}</span>
        <Link href={`/lessons/${lesson.id}/`} className="mt-[10px] flex min-h-[52px] items-center justify-center rounded-[14px] bg-tint text-[17px] font-semibold text-on-tint">
          {next ? t.start : t.again}
        </Link>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        <Row href="/review/" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="6" width="13" height="15" rx="2" /><path d="M8 3h10a2 2 0 0 1 2 2v12" /></svg>}
          label={t.review} value={num(nDue, lang)} />
        <div className="ml-[58px] h-[0.5px] bg-sep" />
        <Row href="/lessons/" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13z" /></svg>}
          label={t.lessons} value={`${num(LESSONS.filter((l) => lessonDone(l.id)).length, lang)}/${num(LESSONS.length, lang)}`} />
      </Card>

      <span className="text-center text-[12px] text-ink-3">{t.hint}</span>
      <span className="text-center text-[12px] text-ink-3">{t.credit}</span>
    </Screen>
  );
}

function Row({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: string }) {
  return (
    <Link href={href} className="flex min-h-14 items-center gap-3 px-4 py-[10px] text-ink">
      <span className="flex size-[30px] flex-none items-center justify-center rounded-[8px] bg-tint-bg text-tint">{icon}</span>
      <span className="flex-1 text-[16px]">{label}</span>
      <span className="text-[15px] text-ink-2 tabular-nums">{value}</span>
      <Chevron />
    </Link>
  );
}
