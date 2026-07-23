-- =============================================================
-- Argus · AI QA Engineer — initial schema
-- Run in Supabase SQL Editor (or auto-applied by docker-compose).
-- Multi-tenant: every row hangs off an organization.
-- =============================================================

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------- Tenancy ----------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'trial',            -- trial | team | enterprise
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key,                            -- mirrors auth.users.id
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table memberships (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',            -- owner | admin | member | viewer
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ---------- Projects & knowledge ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  repo_url text,
  health_score numeric(5,2) default 0,
  readiness_score numeric(5,2) default 0,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  kind text not null,                             -- prd | user_story | spec | openapi | schema | code | figma | test_cases | bug_report | changelog
  title text not null,
  source text,                                    -- upload | github | jira | url ...
  storage_path text,                              -- Supabase Storage object path
  content text,                                   -- extracted text
  status text not null default 'pending',         -- pending | processed | failed
  created_at timestamptz not null default now()
);

-- RAG chunks (1536-dim: OpenAI text-embedding-3-small)
create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  metadata jsonb not null default '{}',
  embedding vector(1536)
);
create index knowledge_chunks_embedding_idx on knowledge_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------- Test assets ----------
create table test_cases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  test_key text not null,                         -- e.g. TC-CHK-0042
  title text not null,
  description text,
  objective text,
  category text not null default 'functional',    -- functional | regression | smoke | sanity | integration | api | ui | e2e | boundary | negative | edge | performance | accessibility | security | compatibility | mobile
  preconditions jsonb default '[]',
  test_data jsonb default '{}',
  environment text,
  steps jsonb default '[]',                       -- [{step, action, expected}]
  expected_result text,
  postconditions jsonb default '[]',
  priority text default 'P2',                     -- P0..P3
  severity text default 'major',                  -- critical | major | minor | trivial
  risk_level text default 'medium',               -- high | medium | low
  automation_readiness numeric(5,2) default 0,    -- 0..100
  traceability jsonb default '[]',                -- linked requirement / story / doc ids
  status text not null default 'draft',           -- draft | in_review | approved | archived
  version int not null default 1,
  generated_by text default 'ai',                 -- ai | human
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, test_key)
);

create table automation_scripts (
  id uuid primary key default gen_random_uuid(),
  test_case_id uuid not null references test_cases(id) on delete cascade,
  framework text not null,                        -- playwright | selenium | cypress | pytest | junit | testng | restassured | postman
  language text not null,
  code text not null,
  created_at timestamptz not null default now()
);

-- ---------- Analysis outputs ----------
create table coverage_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  coverage_pct numeric(5,2),
  risk_pct numeric(5,2),
  confidence numeric(5,2),
  modules jsonb default '[]',                     -- [{name, coverage, risk, tests, gaps:[...]}]
  gaps jsonb default '[]',
  created_at timestamptz not null default now()
);

create table risk_predictions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  module text not null,
  probability numeric(5,2) not null,
  kind text not null,                             -- regression_hotspot | breaking_component | production_failure
  reasoning text,
  recommended_actions jsonb default '[]',
  created_at timestamptz not null default now()
);

create table bug_investigations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  input_text text not null,                       -- stack trace / log / crash report
  root_cause text,
  reproduction_steps jsonb default '[]',
  possible_fixes jsonb default '[]',
  affected_modules jsonb default '[]',
  recommended_tests jsonb default '[]',
  similar_bugs jsonb default '[]',
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id),
  role text not null,                             -- user | assistant
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------- Collaboration & governance ----------
create table audit_logs (
  id bigint generated always as identity primary key,
  org_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid references profiles(id),
  action text not null,                           -- test_case.approved, document.uploaded, ...
  entity_type text,
  entity_id text,
  detail jsonb default '{}',
  created_at timestamptz not null default now()
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  provider text not null,                         -- github | gitlab | bitbucket | jira | azure_devops | slack | teams | jenkins | figma
  config jsonb not null default '{}',
  status text not null default 'disconnected',
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table organizations enable row level security;
alter table memberships   enable row level security;
alter table projects      enable row level security;
alter table documents     enable row level security;
alter table test_cases    enable row level security;
alter table audit_logs    enable row level security;

create or replace function is_org_member(org uuid) returns boolean
language sql stable security definer as $$
  select exists (select 1 from memberships m where m.org_id = org and m.user_id = auth.uid());
$$;

create policy org_read   on organizations for select using (is_org_member(id));
create policy member_read on memberships  for select using (is_org_member(org_id));
create policy proj_rw    on projects      for all    using (is_org_member(org_id));
create policy doc_rw     on documents     for all    using (is_org_member(org_id));
create policy tc_rw      on test_cases    for all    using (is_org_member(org_id));
create policy audit_read on audit_logs    for select using (is_org_member(org_id));

-- Auto-create profile on signup (Supabase auth hook)
create or replace function handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

-- In Supabase, attach to auth.users; guarded so local docker (no auth schema) still boots.
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='auth' and table_name='users') then
    create trigger on_auth_user_created after insert on auth.users
      for each row execute function handle_new_user();
  end if;
end $$;
