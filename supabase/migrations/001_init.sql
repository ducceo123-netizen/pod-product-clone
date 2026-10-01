create extension if not exists pgcrypto;

create table if not exists pod_clone_cases (
  id uuid primary key default gen_random_uuid(),
  title text,
  status text not null default 'draft' check (status in ('draft','analyzed','reviewed','packaged','archived')),
  competitor_url text,
  store_url text not null default 'https://af1xsf-ny.myshopify.com/',
  product_type text,
  niche text,
  source_truth jsonb not null default '{}'::jsonb,
  opportunity_map jsonb not null default '{}'::jsonb,
  variant_directions jsonb not null default '[]'::jsonb,
  asset_blueprint jsonb not null default '[]'::jsonb,
  variant_matrix jsonb not null default '{}'::jsonb,
  thumbnail_plan jsonb not null default '[]'::jsonb,
  ad_angle_bridge jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pod_clone_sources (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references pod_clone_cases(id) on delete cascade,
  kind text not null,
  source_url text,
  storage_path text,
  reference_id text,
  caption text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists pod_clone_knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  branch text not null,
  title text not null,
  content jsonb not null,
  source_case_id uuid references pod_clone_cases(id) on delete set null,
  evidence jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pod_clone_proposals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references pod_clone_cases(id) on delete cascade,
  branch text not null,
  raw_feedback text not null,
  training_spec jsonb not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','merged')),
  submitted_by text,
  reviewed_by text,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  merged_at timestamptz
);

create table if not exists pod_clone_case_versions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references pod_clone_cases(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique(case_id, version)
);

create index if not exists idx_pod_clone_cases_status on pod_clone_cases(status);
create index if not exists idx_pod_clone_sources_case on pod_clone_sources(case_id);
create index if not exists idx_pod_clone_knowledge_branch on pod_clone_knowledge_nodes(branch) where is_active = true;
create index if not exists idx_pod_clone_proposals_status on pod_clone_proposals(status);
