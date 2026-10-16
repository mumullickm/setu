import { cors, preflight, session } from '@/lib/server/auth';
import { sql } from '@/lib/server/db';

export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

export async function GET(req: Request) {
  const s = await session(req);
  if (!s) return cors(req, Response.json({ error: 'signed out' }, { status: 401 }));
  const db = sql();
  const rows = (await db`select id, email, name, household_id from users where id = ${s.id}`) as { id: string; email: string; name: string; household_id: string }[];
  const u = rows[0];
  if (!u) return cors(req, Response.json({ error: 'signed out' }, { status: 401 }));
  const others = (await db`select name from users where household_id = ${u.household_id} and id <> ${u.id} order by created_at limit 1`) as { name: string }[];
  return cors(req, Response.json({ id: u.id, email: u.email, name: u.name, partner: others[0] ?? null }));
}
