-- Atlas Engine Database Schema
-- Migration 001: Core Tables

create extension if not exists "uuid-ossp";

-- ============================================================
-- Locations
-- ============================================================
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  state text,
  owner_name text,
  owner_email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- User profiles
-- ============================================================
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('super_admin','location_admin','staff')) default 'staff',
  location_id uuid references locations(id),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Clients
-- ============================================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,
  sex text check (sex in ('male','female','other')),
  weight_lbs numeric,
  weight_kg numeric generated always as (round(weight_lbs / 2.20462, 2)) stored,
  goals text[],
  health_conditions text[],
  current_medications text[],
  allergies text,
  notes text,
  status text check (status in ('active','inactive','onboarding')) default 'onboarding',
  assigned_to uuid references user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Lab results
-- ============================================================
create table lab_results (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  test_name text not null,
  result_value text,
  unit text,
  reference_range text,
  is_flagged boolean default false,
  test_date date,
  notes text,
  file_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- Peptides master
-- ============================================================
create table peptides (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  full_name text,
  category text,
  tags text[],
  summary text,
  half_life text,
  cycle_length text,
  mechanism_of_action text,
  microdose_notes text,
  is_veterinary boolean default false,
  is_injectable boolean default true,
  route text check (route in ('subcutaneous','intramuscular','intranasal','oral','topical','intravenous','pre-mixed')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Peptide dosing schedules
-- ============================================================
create table peptide_dosing (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade,
  period text not null,
  dose text not null,
  notes text,
  sort_order integer default 0
);

-- ============================================================
-- Peptide benefits
-- ============================================================
create table peptide_benefits (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade,
  benefit_text text not null,
  sort_order integer default 0
);

-- ============================================================
-- Peptide warnings
-- ============================================================
create table peptide_warnings (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade,
  warning_text text not null,
  sort_order integer default 0
);

-- ============================================================
-- Peptide research studies
-- ============================================================
create table peptide_studies (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade,
  title text not null,
  authors text,
  journal text,
  year integer,
  description text,
  url text,
  sort_order integer default 0
);

-- ============================================================
-- Reconstitution library
-- ============================================================
create table peptide_recon (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade unique,
  vial_size_display text,
  default_vial_mg numeric,
  default_bac_ml numeric,
  default_dose_mcg numeric,
  concentration_display text,
  unit_calc_display text,
  dose_range_display text,
  timing_display text,
  cycle_length_display text,
  storage_instructions text,
  reconstitution_steps text[],
  vials_needed_display text,
  is_premixed boolean default false,
  premixed_notes text
);

-- ============================================================
-- Protocols
-- ============================================================
create table protocols (
  id uuid primary key default gen_random_uuid(),
  condition_name text not null,
  slug text not null unique,
  category text not null,
  primary_peptide text not null,
  adjunct_peptides text[],
  clinical_notes text,
  cycle_intro text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Protocol months
-- ============================================================
create table protocol_months (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid references protocols(id) on delete cascade,
  month_number integer not null check (month_number between 1 and 12),
  title text not null,
  clinical_note text,
  sort_order integer default 0
);

-- ============================================================
-- Protocol month peptide rows
-- ============================================================
create table protocol_month_rows (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references protocol_months(id) on delete cascade,
  peptide_name text not null,
  dose text not null,
  schedule text not null,
  sort_order integer default 0
);

-- ============================================================
-- Client assigned protocols
-- ============================================================
create table client_protocols (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  protocol_id uuid references protocols(id),
  start_date date not null,
  end_date date,
  total_months integer default 3,
  current_month integer default 1,
  status text check (status in ('active','completed','paused','cancelled')) default 'active',
  assigned_by uuid references user_profiles(id),
  weight_at_assignment_lbs numeric,
  custom_notes text,
  show_protocol_overview boolean default true,
  show_cycling_schedule boolean default true,
  show_reconstitution boolean default true,
  show_weight_adjusted_doses boolean default true,
  show_clinical_notes boolean default false,
  show_research_studies boolean default false,
  show_warnings boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Client check-ins
-- ============================================================
create table client_checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  client_protocol_id uuid references client_protocols(id),
  checkin_date date default current_date,
  month_number integer,
  week_number integer,
  subjective_response text,
  side_effects text,
  compliance_rating integer check (compliance_rating between 1 and 5),
  weight_lbs numeric,
  notes text,
  logged_by uuid references user_profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- Vial inventory
-- ============================================================
create table vial_inventory (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  client_protocol_id uuid references client_protocols(id),
  peptide_name text not null,
  vials_dispensed integer default 0,
  vials_remaining integer default 0,
  dispense_date date,
  next_refill_date date,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ============================================================
-- Knowledge base articles
-- ============================================================
create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  summary text,
  category text,
  tags text[],
  author_name text,
  source_url text,
  source_type text check (source_type in ('substack','internal','research','guide')) default 'internal',
  substack_rss_url text,
  published_at timestamptz,
  is_published boolean default false,
  related_peptide_slugs text[],
  created_by uuid references user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Veterinary protocols
-- ============================================================
create table vet_protocols (
  id uuid primary key default gen_random_uuid(),
  condition_name text not null,
  animal_type text check (animal_type in ('dog','cat','horse','other')) default 'dog',
  primary_peptide text not null,
  adjunct_peptides text[],
  dosing_notes text,
  weight_based_dosing text,
  dose_per_kg_mcg numeric,
  clinical_notes text,
  cycle_length text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index on clients(location_id);
create index on clients(status);
create index on client_protocols(client_id);
create index on client_protocols(status);
create index on client_checkins(client_id);
create index on vial_inventory(client_id);
create index on lab_results(client_id);
create index on peptides(slug);
create index on protocols(slug);
create index on articles(slug);
create index on articles(is_published);

-- ============================================================
-- Auto-update triggers
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_clients_updated_at before update on clients
  for each row execute function update_updated_at_column();

create trigger update_peptides_updated_at before update on peptides
  for each row execute function update_updated_at_column();

create trigger update_protocols_updated_at before update on protocols
  for each row execute function update_updated_at_column();

create trigger update_client_protocols_updated_at before update on client_protocols
  for each row execute function update_updated_at_column();

create trigger update_articles_updated_at before update on articles
  for each row execute function update_updated_at_column();
