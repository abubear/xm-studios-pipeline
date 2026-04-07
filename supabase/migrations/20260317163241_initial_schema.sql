-- ============================================================
-- XM Studios AI Production Pipeline — Initial Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type user_role as enum (
  'admin',
  'creative_director',
  'sculptor',
  'reviewer',
  'licensing',
  'factory_coordinator'
);

create type session_status as enum (
  'draft',
  'active',
  'voting',
  'completed',
  'archived'
);

create type vote_value as enum ('approve', 'reject');

create type content_type as enum (
  'turntable_video',
  'hero_shot',
  'detail_closeup',
  'animated_gif',
  'preorder_poster',
  'content_package'
);

create type package_status as enum (
  'pending',
  'generating',
  'review',
  'approved',
  'published'
);

create type submission_status as enum (
  'pending',
  'approved',
  'rejected',
  'revision_requested'
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null default 'reviewer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);
create index idx_profiles_email on profiles(email);

-- ============================================================
-- IP ROSTER (characters / IPs being produced)
-- ============================================================

create table ip_roster (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  universe text not null,
  description text,
  thumbnail_url text,
  status text not null default 'active',
  metadata jsonb default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ip_roster_universe on ip_roster(universe);
create index idx_ip_roster_status on ip_roster(status);
create index idx_ip_roster_name on ip_roster(name);

-- ============================================================
-- SESSIONS (production pipeline sessions per IP)
-- ============================================================

create table sessions (
  id uuid primary key default uuid_generate_v4(),
  ip_roster_id uuid not null references ip_roster(id) on delete cascade,
  name text not null,
  stage integer not null default 1,
  status session_status not null default 'draft',
  config jsonb default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sessions_ip on sessions(ip_roster_id);
create index idx_sessions_status on sessions(status);
create index idx_sessions_stage on sessions(stage);

-- ============================================================
-- REFERENCE IMAGES (gathered in Scene Composer)
-- ============================================================

create table reference_images (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  url text not null,
  source text not null,
  source_id text,
  caption text,
  tags text[] default '{}',
  width integer,
  height integer,
  metadata jsonb default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_ref_images_session on reference_images(session_id);
create index idx_ref_images_source on reference_images(source);
create index idx_ref_images_tags on reference_images using gin(tags);

-- ============================================================
-- GENERATED IMAGES (from ComfyUI workflows)
-- ============================================================

create table generated_images (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  url text not null,
  thumbnail_url text,
  prompt text,
  negative_prompt text,
  workflow text not null,
  seed bigint,
  width integer,
  height integer,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_gen_images_session on generated_images(session_id);
create index idx_gen_images_workflow on generated_images(workflow);

-- ============================================================
-- VOTES (Jury app voting)
-- ============================================================

create table votes (
  id uuid primary key default uuid_generate_v4(),
  generated_image_id uuid not null references generated_images(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  vote vote_value not null,
  notes text,
  created_at timestamptz not null default now(),
  unique(generated_image_id, user_id)
);

create index idx_votes_image on votes(generated_image_id);
create index idx_votes_user on votes(user_id);

-- ============================================================
-- FINALISTS (selected from voting)
-- ============================================================

create table finalists (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  generated_image_id uuid not null references generated_images(id) on delete cascade,
  rank integer not null,
  notes text,
  selected_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique(session_id, rank)
);

create index idx_finalists_session on finalists(session_id);

-- ============================================================
-- IP SUBMISSIONS (gate reviews)
-- ============================================================

create table ip_submissions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  ip_roster_id uuid not null references ip_roster(id) on delete cascade,
  gate_number integer not null,
  status submission_status not null default 'pending',
  submission_data jsonb default '{}',
  feedback text,
  submitted_by uuid references profiles(id),
  reviewed_by uuid references profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index idx_submissions_session on ip_submissions(session_id);
create index idx_submissions_ip on ip_submissions(ip_roster_id);
create index idx_submissions_status on ip_submissions(status);

-- ============================================================
-- 3D MODELS
-- ============================================================

create table models_3d (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  session_id uuid references sessions(id) on delete set null,
  file_url text not null,
  thumbnail_url text,
  format text not null,
  file_size_bytes bigint,
  vertex_count integer,
  is_rigged boolean default false,
  metadata jsonb default '{}',
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_models_session on models_3d(session_id);
create index idx_models_format on models_3d(format);

-- ============================================================
-- CHARACTER LIBRARY (searchable archive with embeddings)
-- ============================================================

create table character_library (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  ip_roster_id uuid references ip_roster(id) on delete set null,
  model_id uuid references models_3d(id) on delete set null,
  thumbnail_url text,
  description text,
  tags text[] default '{}',
  embedding vector(1536),
  sketchfab_url text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_char_lib_ip on character_library(ip_roster_id);
create index idx_char_lib_tags on character_library using gin(tags);
create index idx_char_lib_name on character_library(name);

-- ============================================================
-- STYLE GUIDE RULES (for Claude API checking)
-- ============================================================

create table style_guide_rules (
  id uuid primary key default uuid_generate_v4(),
  ip_roster_id uuid references ip_roster(id) on delete cascade,
  universe text,
  rule text not null,
  category text not null,
  severity text not null default 'warning',
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_style_rules_ip on style_guide_rules(ip_roster_id);
create index idx_style_rules_universe on style_guide_rules(universe);
create index idx_style_rules_category on style_guide_rules(category);

-- ============================================================
-- FACTORY PACKAGES (export for manufacturing)
-- ============================================================

create table factory_packages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  ip_roster_id uuid not null references ip_roster(id) on delete cascade,
  name text not null,
  status package_status not null default 'pending',
  package_url text,
  contents jsonb default '{}',
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_factory_session on factory_packages(session_id);
create index idx_factory_status on factory_packages(status);

-- ============================================================
-- STORE CONTENT (individual content pieces)
-- ============================================================

create table store_content (
  id uuid primary key default uuid_generate_v4(),
  ip_roster_id uuid not null references ip_roster(id) on delete cascade,
  content_type content_type not null,
  title text,
  url text not null,
  thumbnail_url text,
  width integer,
  height integer,
  duration_seconds numeric,
  file_size_bytes bigint,
  metadata jsonb default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_store_content_ip on store_content(ip_roster_id);
create index idx_store_content_type on store_content(content_type);

-- ============================================================
-- STORE CONTENT PACKAGES (bundled content for product pages)
-- ============================================================

create table store_content_packages (
  id uuid primary key default uuid_generate_v4(),
  ip_roster_id uuid not null references ip_roster(id) on delete cascade,
  name text not null,
  status package_status not null default 'pending',
  contents uuid[] default '{}',
  description text,
  published_url text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_store_pkg_ip on store_content_packages(ip_roster_id);
create index idx_store_pkg_status on store_content_packages(status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at
  before update on profiles for each row execute function update_updated_at();
create trigger tr_ip_roster_updated_at
  before update on ip_roster for each row execute function update_updated_at();
create trigger tr_sessions_updated_at
  before update on sessions for each row execute function update_updated_at();
create trigger tr_character_library_updated_at
  before update on character_library for each row execute function update_updated_at();
create trigger tr_style_guide_rules_updated_at
  before update on style_guide_rules for each row execute function update_updated_at();
create trigger tr_factory_packages_updated_at
  before update on factory_packages for each row execute function update_updated_at();
create trigger tr_store_content_packages_updated_at
  before update on store_content_packages for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table ip_roster enable row level security;
alter table sessions enable row level security;
alter table reference_images enable row level security;
alter table generated_images enable row level security;
alter table votes enable row level security;
alter table finalists enable row level security;
alter table ip_submissions enable row level security;
alter table models_3d enable row level security;
alter table character_library enable row level security;
alter table style_guide_rules enable row level security;
alter table factory_packages enable row level security;
alter table store_content enable row level security;
alter table store_content_packages enable row level security;

-- Helper: check if user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Helper: get user role
create or replace function get_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer;

-- PROFILES
create policy "Profiles are viewable by authenticated users"
  on profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on profiles for update to authenticated using (id = auth.uid());

create policy "Admins can insert profiles"
  on profiles for insert to authenticated with check (is_admin() or id = auth.uid());

create policy "Admins can delete profiles"
  on profiles for delete to authenticated using (is_admin());

-- IP ROSTER
create policy "IP roster viewable by authenticated"
  on ip_roster for select to authenticated using (true);

create policy "IP roster writable by admins and creative directors"
  on ip_roster for insert to authenticated
  with check (get_user_role() in ('admin', 'creative_director'));

create policy "IP roster updatable by admins and creative directors"
  on ip_roster for update to authenticated
  using (get_user_role() in ('admin', 'creative_director'));

create policy "IP roster deletable by admins"
  on ip_roster for delete to authenticated using (is_admin());

-- SESSIONS
create policy "Sessions viewable by authenticated"
  on sessions for select to authenticated using (true);

create policy "Sessions writable by team leads"
  on sessions for insert to authenticated
  with check (get_user_role() in ('admin', 'creative_director', 'sculptor'));

create policy "Sessions updatable by team leads"
  on sessions for update to authenticated
  using (get_user_role() in ('admin', 'creative_director', 'sculptor'));

create policy "Sessions deletable by admins"
  on sessions for delete to authenticated using (is_admin());

-- REFERENCE IMAGES
create policy "Reference images viewable by authenticated"
  on reference_images for select to authenticated using (true);

create policy "Reference images insertable by authenticated"
  on reference_images for insert to authenticated with check (true);

create policy "Reference images deletable by creator or admin"
  on reference_images for delete to authenticated
  using (created_by = auth.uid() or is_admin());

-- GENERATED IMAGES
create policy "Generated images viewable by authenticated"
  on generated_images for select to authenticated using (true);

create policy "Generated images insertable by authenticated"
  on generated_images for insert to authenticated with check (true);

create policy "Generated images deletable by admin"
  on generated_images for delete to authenticated using (is_admin());

-- VOTES
create policy "Votes viewable by authenticated"
  on votes for select to authenticated using (true);

create policy "Users can insert own votes"
  on votes for insert to authenticated with check (user_id = auth.uid());

create policy "Users can update own votes"
  on votes for update to authenticated using (user_id = auth.uid());

create policy "Users can delete own votes"
  on votes for delete to authenticated using (user_id = auth.uid());

-- FINALISTS
create policy "Finalists viewable by authenticated"
  on finalists for select to authenticated using (true);

create policy "Finalists manageable by leads"
  on finalists for insert to authenticated
  with check (get_user_role() in ('admin', 'creative_director'));

create policy "Finalists updatable by leads"
  on finalists for update to authenticated
  using (get_user_role() in ('admin', 'creative_director'));

create policy "Finalists deletable by leads"
  on finalists for delete to authenticated
  using (get_user_role() in ('admin', 'creative_director'));

-- IP SUBMISSIONS
create policy "Submissions viewable by authenticated"
  on ip_submissions for select to authenticated using (true);

create policy "Submissions insertable by team"
  on ip_submissions for insert to authenticated with check (true);

create policy "Submissions updatable by reviewers"
  on ip_submissions for update to authenticated
  using (get_user_role() in ('admin', 'creative_director', 'licensing'));

-- MODELS 3D
create policy "Models viewable by authenticated"
  on models_3d for select to authenticated using (true);

create policy "Models insertable by sculptors"
  on models_3d for insert to authenticated
  with check (get_user_role() in ('admin', 'sculptor'));

create policy "Models updatable by owner or admin"
  on models_3d for update to authenticated
  using (uploaded_by = auth.uid() or is_admin());

-- CHARACTER LIBRARY
create policy "Character library viewable by authenticated"
  on character_library for select to authenticated using (true);

create policy "Character library insertable"
  on character_library for insert to authenticated
  with check (get_user_role() in ('admin', 'sculptor', 'creative_director'));

create policy "Character library updatable"
  on character_library for update to authenticated
  using (get_user_role() in ('admin', 'sculptor', 'creative_director'));

-- STYLE GUIDE RULES
create policy "Style rules viewable by authenticated"
  on style_guide_rules for select to authenticated using (true);

create policy "Style rules manageable by licensing"
  on style_guide_rules for insert to authenticated
  with check (get_user_role() in ('admin', 'licensing', 'creative_director'));

create policy "Style rules updatable by licensing"
  on style_guide_rules for update to authenticated
  using (get_user_role() in ('admin', 'licensing', 'creative_director'));

-- FACTORY PACKAGES
create policy "Factory packages viewable by authenticated"
  on factory_packages for select to authenticated using (true);

create policy "Factory packages manageable"
  on factory_packages for insert to authenticated
  with check (get_user_role() in ('admin', 'factory_coordinator'));

create policy "Factory packages updatable"
  on factory_packages for update to authenticated
  using (get_user_role() in ('admin', 'factory_coordinator'));

-- STORE CONTENT
create policy "Store content viewable by authenticated"
  on store_content for select to authenticated using (true);

create policy "Store content insertable"
  on store_content for insert to authenticated with check (true);

create policy "Store content deletable by admin"
  on store_content for delete to authenticated using (is_admin());

-- STORE CONTENT PACKAGES
create policy "Store packages viewable by authenticated"
  on store_content_packages for select to authenticated using (true);

create policy "Store packages insertable"
  on store_content_packages for insert to authenticated
  with check (get_user_role() in ('admin', 'creative_director'));

create policy "Store packages updatable"
  on store_content_packages for update to authenticated
  using (get_user_role() in ('admin', 'creative_director'));

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'reviewer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('reference-images', 'reference-images', true),
  ('generated-images', 'generated-images', true),
  ('models-3d', 'models-3d', true),
  ('store-content', 'store-content', true),
  ('avatars', 'avatars', true);

-- Storage policies
create policy "Public read access" on storage.objects
  for select using (bucket_id in ('reference-images', 'generated-images', 'models-3d', 'store-content', 'avatars'));

create policy "Authenticated upload" on storage.objects
  for insert to authenticated with check (bucket_id in ('reference-images', 'generated-images', 'models-3d', 'store-content', 'avatars'));

create policy "Owner delete" on storage.objects
  for delete to authenticated using (auth.uid() = owner);
