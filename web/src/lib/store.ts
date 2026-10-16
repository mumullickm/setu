'use client';
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import { LESSONS, WORDS, type Lang } from './content';

export type Row = { card: Card | null; seen: number; correct: number; last_seen: string | null; updated_at: string; dirty?: boolean };
export type Run = { id: string; lesson_id: string; started_at: string; finished_at: string; score: number; dirty?: boolean };
type Data = { owner: string | null; progress: Record<string, Row>; runs: Run[] };

const KEY = 'setu-data';
const LANG_KEY = 'setu-lang';
export const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

const empty = (): Data => ({ owner: null, progress: {}, runs: [] });
let data: Data = empty();
let lang: Lang = 'bn';
let loaded = false;
const subs = new Set<() => void>();
let version = 0;

const revive = (c: Card | null): Card | null =>
  c ? { ...c, due: new Date(c.due), last_review: c.last_review ? new Date(c.last_review) : undefined } : null;

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Data;
      for (const k of Object.keys(d.progress)) d.progress[k].card = revive(d.progress[k].card);
      data = { ...empty(), ...d };
    }
    lang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'bn';
  } catch {}
}
function emit() {
  version++;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  subs.forEach((f) => f());
}
export function subscribe(f: () => void) { load(); subs.add(f); return () => { subs.delete(f); }; }
export const snapshot = () => { load(); return version; };
export const getData = () => { load(); return data; };
export const getLang = (): Lang => { load(); return lang; };
export function setLang(l: Lang) {
  lang = l;
  try { localStorage.setItem(LANG_KEY, l); } catch {}
  document.documentElement.lang = l;
  emit();
}

// A different account on the same device starts clean.
export function claim(owner: string) {
  load();
  if (data.owner && data.owner !== owner) data = empty();
  data.owner = owner;
  emit();
}
export function reset() { data = empty(); emit(); }

const now = () => new Date();
function row(id: string): Row {
  return data.progress[id] ?? { card: null, seen: 0, correct: 0, last_seen: null, updated_at: new Date(0).toISOString() };
}
function put(id: string, r: Row) { data.progress[id] = { ...r, updated_at: now().toISOString(), dirty: true }; }

export function recordAnswer(id: string, ok: boolean) {
  const r = row(id);
  put(id, { ...r, seen: r.seen + 1, correct: r.correct + (ok ? 1 : 0), last_seen: now().toISOString() });
  emit();
}

// Every word met in a lesson enters FSRS: right first time = Good, otherwise Again. A card already scheduled is left alone until due.
export function finishLesson(lessonId: string, firstTry: string[], startedAt: string) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return;
  const t = now();
  for (const w of lesson.words) {
    const r = row(w.id);
    if (r.card && r.card.due > t) continue;
    const grade = firstTry.includes(w.id) ? Rating.Good : Rating.Again;
    put(w.id, { ...r, card: scheduler.next(r.card ?? createEmptyCard(t), t, grade).card, last_seen: t.toISOString() });
  }
  data.runs.push({ id: crypto.randomUUID(), lesson_id: lessonId, started_at: startedAt, finished_at: t.toISOString(), score: firstTry.length, dirty: true });
  emit();
}

export function grade(id: string, g: Grade) {
  const r = row(id);
  if (!r.card) return;
  const t = now();
  put(id, {
    ...r, card: scheduler.next(r.card, t, g).card,
    seen: r.seen + 1, correct: r.correct + (g === Rating.Again ? 0 : 1), last_seen: t.toISOString(),
  });
  emit();
}

export function due(at = now()) {
  return WORDS.filter((w) => { const c = data.progress[w.id]?.card; return c && c.due <= at; })
    .sort((a, b) => +data.progress[a.id].card!.due - +data.progress[b.id].card!.due);
}
export function nextDue() {
  const ds = Object.values(data.progress).map((r) => r.card?.due).filter(Boolean) as Date[];
  return ds.length ? new Date(Math.min(...ds.map(Number))) : null;
}

// SPEC 4: a word counts once it has been seen and answered right twice.
export const isKnown = (id: string) => (data.progress[id]?.correct ?? 0) >= 2;
export const known = () => WORDS.filter((w) => isKnown(w.id));
export const lessonDone = (id: string) => data.runs.some((r) => r.lesson_id === id);
export const nextLesson = () => LESSONS.find((l) => !lessonDone(l.id)) ?? null;

// Consecutive days, ending today or yesterday, with a finished lesson or a review.
export function streak() {
  const day = (s: string) => { const d = new Date(s); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
  const days = new Set<string>([...data.runs.map((r) => day(r.finished_at)), ...Object.values(data.progress).flatMap((r) => (r.last_seen ? [day(r.last_seen)] : []))]);
  const d = new Date();
  if (!days.has(day(d.toISOString()))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(day(d.toISOString()))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// Sync: send what changed, take back the server's rows where they are newer.
export function dirty() {
  return {
    progress: Object.entries(data.progress).filter(([, r]) => r.dirty).map(([word_id, r]) => ({
      word_id, fsrs_state: r.card, seen: r.seen, correct: r.correct, last_seen: r.last_seen, updated_at: r.updated_at,
    })),
    runs: data.runs.filter((r) => r.dirty).map(({ dirty: _, ...r }) => r),
  };
}
export type ServerRow = { word_id: string; fsrs_state: Card | null; seen: number; correct: number; last_seen: string | null; updated_at: string };
export function merge(sent: ReturnType<typeof dirty>, server: { progress: ServerRow[]; runs: Run[] }) {
  for (const p of sent.progress) {
    const r = data.progress[p.word_id];
    if (r && r.updated_at === p.updated_at) r.dirty = false;
  }
  for (const s of server.progress) {
    const r = data.progress[s.word_id];
    if (r?.dirty) continue;
    if (!r || new Date(s.updated_at) > new Date(r.updated_at))
      data.progress[s.word_id] = { card: revive(s.fsrs_state), seen: s.seen, correct: s.correct, last_seen: s.last_seen, updated_at: s.updated_at };
  }
  const sentRuns = new Set(sent.runs.map((r) => r.id));
  for (const r of data.runs) if (sentRuns.has(r.id)) r.dirty = false;
  const have = new Set(data.runs.map((r) => r.id));
  for (const r of server.runs) if (!have.has(r.id)) data.runs.push(r);
  emit();
}
