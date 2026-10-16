import { cors, preflight, session } from '@/lib/server/auth';
import { sql } from '@/lib/server/db';
import { BY_ID, lessonOf } from '@/lib/content';

export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

type P = { word_id: string; fsrs_state: unknown; seen: number; correct: number; last_seen: string | null; updated_at: string };
type R = { id: string; lesson_id: string; started_at: string; finished_at: string; score: number };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const int = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < 1e6;
const date = (s: unknown) => typeof s === 'string' && !Number.isNaN(Date.parse(s));
const okP = (p: P) => !!BY_ID[p.word_id] && int(p.seen) && int(p.correct) && date(p.updated_at)
  && (p.last_seen === null || date(p.last_seen)) && JSON.stringify(p.fsrs_state ?? null).length < 2000;
const okR = (r: R) => UUID.test(r.id) && !!lessonOf(r.lesson_id) && date(r.started_at) && date(r.finished_at) && int(r.score);

// Last write wins per word, by updated_at. Returns everything the account has, for the device to merge.
export async function POST(req: Request) {
  const s = await session(req);
  if (!s) return cors(req, Response.json({ error: 'signed out' }, { status: 401 }));
  const body = (await req.json().catch(() => null)) as { progress?: P[]; runs?: R[] } | null;
  const progress = Array.isArray(body?.progress) ? body.progress : [];
  const runs = Array.isArray(body?.runs) ? body.runs : [];
  if (progress.length > 500 || runs.length > 500 || !progress.every(okP) || !runs.every(okR))
    return cors(req, Response.json({ error: 'bad request' }, { status: 400 }));

  const db = sql();
  if (progress.length) {
    await db`insert into progress (user_id, word_id, fsrs_state, seen, correct, last_seen, updated_at)
      select ${s.id}::uuid, x.word_id, x.fsrs_state, x.seen, x.correct, x.last_seen, x.updated_at
      from jsonb_to_recordset(${JSON.stringify(progress)}::jsonb)
        as x(word_id text, fsrs_state jsonb, seen int, correct int, last_seen timestamptz, updated_at timestamptz)
      on conflict (user_id, word_id) do update set fsrs_state = excluded.fsrs_state, seen = excluded.seen,
        correct = excluded.correct, last_seen = excluded.last_seen, updated_at = excluded.updated_at
      where progress.updated_at < excluded.updated_at`;
  }
  if (runs.length) {
    await db`insert into lesson_runs (id, user_id, lesson_id, started_at, finished_at, score)
      select x.id, ${s.id}::uuid, x.lesson_id, x.started_at, x.finished_at, x.score
      from jsonb_to_recordset(${JSON.stringify(runs)}::jsonb)
        as x(id uuid, lesson_id text, started_at timestamptz, finished_at timestamptz, score int)
      on conflict (id) do nothing`;
  }
  const [p, r] = await Promise.all([
    db`select word_id, fsrs_state, seen, correct, last_seen, updated_at from progress where user_id = ${s.id}`,
    db`select id, lesson_id, started_at, finished_at, score from lesson_runs where user_id = ${s.id} order by finished_at`,
  ]);
  return cors(req, Response.json({ progress: p, runs: r }));
}
