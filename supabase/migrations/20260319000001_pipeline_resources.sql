-- ============================================================
-- Pipeline Resources & Stage Transitions
-- ============================================================

-- Resource types produced/consumed by pipeline stages
create type resource_type as enum (
  'reference_image',
  'generated_image',
  'filtered_image',
  'finalist_image',
  'submission_pack',
  'turnaround_sheet',
  'model_3d',
  'rigged_model',
  'texture_map',
  'paint_guide',
  'factory_package',
  'store_content'
);

-- Pipeline resources: tracks every artifact produced by a stage
create table pipeline_resources (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  stage_produced integer not null,
  stage_consumed_by integer,
  resource_type resource_type not null,
  file_url text not null,
  filename text not null,
  metadata_json jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_pipeline_resources_session on pipeline_resources(session_id);
create index idx_pipeline_resources_stage on pipeline_resources(session_id, stage_produced);

-- Stage transitions: audit log of stage advancement
create table stage_transitions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  from_stage integer not null,
  to_stage integer not null,
  resource_ids uuid[] default '{}',
  transitioned_at timestamptz default now(),
  transitioned_by uuid references profiles(id)
);

create index idx_stage_transitions_session on stage_transitions(session_id);

-- Add logo_url to ip_roster for IP logo support
alter table ip_roster add column if not exists logo_url text;

-- RLS policies
alter table pipeline_resources enable row level security;
alter table stage_transitions enable row level security;

create policy "Authenticated users can read pipeline_resources"
  on pipeline_resources for select
  to authenticated
  using (true);

create policy "Authenticated users can insert pipeline_resources"
  on pipeline_resources for insert
  to authenticated
  with check (true);

create policy "Authenticated users can read stage_transitions"
  on stage_transitions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert stage_transitions"
  on stage_transitions for insert
  to authenticated
  with check (true);
