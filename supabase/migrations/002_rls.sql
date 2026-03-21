-- Atlas Engine - Row Level Security Policies
-- Migration 002: RLS

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table locations enable row level security;
alter table user_profiles enable row level security;
alter table clients enable row level security;
alter table lab_results enable row level security;
alter table peptides enable row level security;
alter table peptide_dosing enable row level security;
alter table peptide_benefits enable row level security;
alter table peptide_warnings enable row level security;
alter table peptide_studies enable row level security;
alter table peptide_recon enable row level security;
alter table protocols enable row level security;
alter table protocol_months enable row level security;
alter table protocol_month_rows enable row level security;
alter table client_protocols enable row level security;
alter table client_checkins enable row level security;
alter table vial_inventory enable row level security;
alter table articles enable row level security;
alter table vet_protocols enable row level security;

-- ============================================================
-- Helper function: get current user role
-- ============================================================
create or replace function get_my_role()
returns text as $$
  select role from user_profiles where id = auth.uid();
$$ language sql security definer stable;

-- ============================================================
-- Helper function: get current user location_id
-- ============================================================
create or replace function get_my_location_id()
returns uuid as $$
  select location_id from user_profiles where id = auth.uid();
$$ language sql security definer stable;

-- ============================================================
-- Locations policies
-- ============================================================
create policy "Super admins can manage all locations"
  on locations for all
  using (get_my_role() = 'super_admin');

create policy "Location admins can view their location"
  on locations for select
  using (
    get_my_role() in ('location_admin', 'staff')
    and id = get_my_location_id()
  );

-- ============================================================
-- User profiles policies
-- ============================================================
create policy "Users can view their own profile"
  on user_profiles for select
  using (id = auth.uid());

create policy "Super admins can view all profiles"
  on user_profiles for select
  using (get_my_role() = 'super_admin');

create policy "Location admins can view their location's staff"
  on user_profiles for select
  using (
    get_my_role() = 'location_admin'
    and location_id = get_my_location_id()
  );

create policy "Users can update their own profile"
  on user_profiles for update
  using (id = auth.uid());

create policy "Super admins can manage all profiles"
  on user_profiles for all
  using (get_my_role() = 'super_admin');

-- ============================================================
-- Clients policies
-- ============================================================
create policy "Super admins can manage all clients"
  on clients for all
  using (get_my_role() = 'super_admin');

create policy "Location staff can manage their location clients"
  on clients for all
  using (
    get_my_role() in ('location_admin', 'staff')
    and location_id = get_my_location_id()
  );

-- ============================================================
-- Lab results policies
-- ============================================================
create policy "Super admins can manage all lab results"
  on lab_results for all
  using (get_my_role() = 'super_admin');

create policy "Staff can manage lab results for their location clients"
  on lab_results for all
  using (
    get_my_role() in ('location_admin', 'staff')
    and client_id in (
      select id from clients where location_id = get_my_location_id()
    )
  );

-- ============================================================
-- Peptides - Read only for all authenticated users
-- ============================================================
create policy "All authenticated users can view active peptides"
  on peptides for select
  using (auth.uid() is not null and is_active = true);

create policy "Super admins can manage peptides"
  on peptides for all
  using (get_my_role() = 'super_admin');

-- Peptide related tables - read for all authenticated
create policy "All authenticated users can view peptide dosing"
  on peptide_dosing for select
  using (auth.uid() is not null);

create policy "Super admins can manage peptide dosing"
  on peptide_dosing for all
  using (get_my_role() = 'super_admin');

create policy "All authenticated users can view peptide benefits"
  on peptide_benefits for select
  using (auth.uid() is not null);

create policy "Super admins can manage peptide benefits"
  on peptide_benefits for all
  using (get_my_role() = 'super_admin');

create policy "All authenticated users can view peptide warnings"
  on peptide_warnings for select
  using (auth.uid() is not null);

create policy "Super admins can manage peptide warnings"
  on peptide_warnings for all
  using (get_my_role() = 'super_admin');

create policy "All authenticated users can view peptide studies"
  on peptide_studies for select
  using (auth.uid() is not null);

create policy "Super admins can manage peptide studies"
  on peptide_studies for all
  using (get_my_role() = 'super_admin');

create policy "All authenticated users can view peptide recon"
  on peptide_recon for select
  using (auth.uid() is not null);

create policy "Super admins can manage peptide recon"
  on peptide_recon for all
  using (get_my_role() = 'super_admin');

-- ============================================================
-- Protocols - Read for all authenticated
-- ============================================================
create policy "All authenticated users can view active protocols"
  on protocols for select
  using (auth.uid() is not null and is_active = true);

create policy "Super admins can manage protocols"
  on protocols for all
  using (get_my_role() = 'super_admin');

create policy "All authenticated users can view protocol months"
  on protocol_months for select
  using (auth.uid() is not null);

create policy "Super admins can manage protocol months"
  on protocol_months for all
  using (get_my_role() = 'super_admin');

create policy "All authenticated users can view protocol month rows"
  on protocol_month_rows for select
  using (auth.uid() is not null);

create policy "Super admins can manage protocol month rows"
  on protocol_month_rows for all
  using (get_my_role() = 'super_admin');

-- ============================================================
-- Client protocols
-- ============================================================
create policy "Super admins can manage all client protocols"
  on client_protocols for all
  using (get_my_role() = 'super_admin');

create policy "Staff can manage client protocols for their location"
  on client_protocols for all
  using (
    get_my_role() in ('location_admin', 'staff')
    and client_id in (
      select id from clients where location_id = get_my_location_id()
    )
  );

-- ============================================================
-- Client check-ins
-- ============================================================
create policy "Super admins can manage all checkins"
  on client_checkins for all
  using (get_my_role() = 'super_admin');

create policy "Staff can manage checkins for their location clients"
  on client_checkins for all
  using (
    get_my_role() in ('location_admin', 'staff')
    and client_id in (
      select id from clients where location_id = get_my_location_id()
    )
  );

-- ============================================================
-- Vial inventory
-- ============================================================
create policy "Super admins can manage all vial inventory"
  on vial_inventory for all
  using (get_my_role() = 'super_admin');

create policy "Staff can manage vial inventory for their location clients"
  on vial_inventory for all
  using (
    get_my_role() in ('location_admin', 'staff')
    and client_id in (
      select id from clients where location_id = get_my_location_id()
    )
  );

-- ============================================================
-- Articles
-- ============================================================
create policy "All authenticated users can view published articles"
  on articles for select
  using (auth.uid() is not null and is_published = true);

create policy "Super admins can manage all articles"
  on articles for all
  using (get_my_role() = 'super_admin');

create policy "Location admins can manage articles"
  on articles for all
  using (get_my_role() = 'location_admin');

-- ============================================================
-- Vet protocols
-- ============================================================
create policy "All authenticated users can view active vet protocols"
  on vet_protocols for select
  using (auth.uid() is not null and is_active = true);

create policy "Super admins can manage vet protocols"
  on vet_protocols for all
  using (get_my_role() = 'super_admin');
