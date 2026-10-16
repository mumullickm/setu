-- Setu, SPEC section 8. Run once against the Neon database: psql "$DATABASE_URL" -f db/schema.sql
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  household_id text not null default 'home',
  created_at timestamptz not null default now()
);
create table if not exists progress (
  user_id uuid not null references users(id) on delete cascade,
  word_id text not null,
  fsrs_state jsonb,
  seen integer not null default 0,
  correct integer not null default 0,
  last_seen timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, word_id)
);
create table if not exists lesson_runs (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  lesson_id text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  score integer not null default 0
);
create index if not exists lesson_runs_user on lesson_runs(user_id);
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references users(id) on delete cascade,
  to_user uuid not null references users(id) on delete cascade,
  lesson_id text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create table if not exists speech_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  word_id text not null,
  target_sound text not null,
  score integer not null,
  created_at timestamptz not null default now()
);
-- one-time codes that hand a session from the Custom Tab back to the APK
create table if not exists used_handoffs (
  jti text primary key,
  used_at timestamptz not null default now()
);
