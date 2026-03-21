# Atlas Engine — Complete Full Stack Application

Build a complete, production-ready Next.js 14 web application called the **Atlas Engine**. 

Tagline: *"The World's Peptide Intelligence Platform"*

This is a physician-grade peptide protocol management platform, client CRM, and knowledge database for a wellness company with multiple franchise locations. Build every page, every component, every database migration, and every seed file from this single prompt. Do not stop until the entire application is complete and running.

---

## BRANDING

App Name: **Atlas Engine**
Tagline: The World's Peptide Intelligence Platform
Logo mark: A hexagon (⬡) containing the letter A, in gold
Color: Navy and Gold
Tone: Premium, clinical, authoritative — like a medical Bloomberg Terminal

Use "Atlas Engine" everywhere: page titles, emails, PDFs, sidebar logo, browser tab.
The favicon should be a gold hexagon on navy.

---

## TECH STACK

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Shadcn/ui (run: npx shadcn-ui@latest init with default config, then add: button card dialog sheet tabs table badge input select form toast textarea label separator scroll-area avatar dropdown-menu navigation-menu switch)
- Supabase (PostgreSQL + Auth + Storage)
- React Hook Form + Zod for all forms
- @react-pdf/renderer for PDF generation
- Recharts for charts and data visualization
- date-fns for all date and cycling math
- TipTap for rich text editing (articles)
- next-themes (always dark, never light)
- lucide-react for all icons
- resend for email

---

## DESIGN SYSTEM

Always dark mode. Never light mode. No white backgrounds anywhere.

```css
--bg:           #0b1120  /* page background, deep navy */
--surface:      #0f1a2e  /* cards, panels */
--surface2:     #142035  /* nested cards, table rows */
--border:       #1e3055  /* all borders */
--gold:         #e8c96e  /* primary accent, CTAs, highlights */
--gold2:        #c9a84c  /* secondary gold */
--text:         #ccd9ee  /* body text */
--text-dim:     #6e88b0  /* labels, secondary text */
--white:        #ffffff  /* headings, important numbers */
--success:      #54c7a2
--warning:      #e8b86d
--danger:       #e05a6a
```

Fonts (import from Google Fonts):
- **Playfair Display** — headings, large numbers, italic accents
- **DM Mono** — labels, badges, data, code, small caps
- **DM Sans** — body text, buttons, inputs

Visual style: premium medical intelligence platform. Think Bloomberg Terminal meets clinical software. Every card has a subtle gold top-border accent (2px). Data-dense but clean. Naval officer precision. The name Atlas Engine should feel earned — this holds everything.

---

## USER ROLES & PERMISSIONS

Three roles stored in user_profiles table:

**SUPER_ADMIN (Kat):**
- Full access to everything across all locations
- Sees every client at every location
- Can edit the peptide library, protocols, articles
- Can invite users and assign roles
- Sees all locations' data in one view
- Only one super_admin (first account created)

**LOCATION_ADMIN (e.g. Nyck):**
- Complete ownership over THEIR location only
- Sees and manages only their location's clients
- Has their own separate book of clients
- Can add/edit their own client notes and check-ins
- Views full peptide library (read only — cannot edit library)
- Can invite staff to their own location
- Controls what their clients see in generated PDFs
- Cannot see other locations' clients under any circumstance

**STAFF:**
- Views clients at their assigned location
- Can log check-ins
- Cannot edit library or protocols
- Cannot invite users

---

## DATABASE SCHEMA

Create all files in supabase/migrations/ folder.

### File: supabase/migrations/001_schema.sql

```sql
create extension if not exists "uuid-ossp";

-- Locations
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

-- User profiles
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('super_admin','location_admin','staff')) default 'staff',
  location_id uuid references locations(id),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients
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

-- Lab results
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

-- Peptides master
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

-- Peptide dosing schedules
create table peptide_dosing (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade,
  period text not null,
  dose text not null,
  notes text,
  sort_order integer default 0
);

-- Peptide benefits
create table peptide_benefits (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade,
  benefit_text text not null,
  sort_order integer default 0
);

-- Peptide warnings
create table peptide_warnings (
  id uuid primary key default gen_random_uuid(),
  peptide_id uuid references peptides(id) on delete cascade,
  warning_text text not null,
  sort_order integer default 0
);

-- Peptide research studies
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

-- Reconstitution library
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

-- Protocols
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

-- Protocol months
create table protocol_months (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid references protocols(id) on delete cascade,
  month_number integer not null check (month_number between 1 and 12),
  title text not null,
  clinical_note text,
  sort_order integer default 0
);

-- Protocol month peptide rows
create table protocol_month_rows (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references protocol_months(id) on delete cascade,
  peptide_name text not null,
  dose text not null,
  schedule text not null,
  sort_order integer default 0
);

-- Client assigned protocols
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

-- Client check-ins
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

-- Vial inventory
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

-- Knowledge base articles
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

-- Veterinary protocols
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

-- Indexes
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
```

### File: supabase/migrations/002_rls.sql

```sql
alter table locations enable row level security;
alter table user_profiles enable row level security;
alter table clients enable row level security;
alter table lab_results enable row level security;
alter table client_protocols enable row level security;
alter table client_checkins enable row level security;
alter table vial_inventory enable row level security;
alter table peptides enable row level security;
alter table peptide_dosing enable row level security;
alter table peptide_benefits enable row level security;
alter table peptide_warnings enable row level security;
alter table peptide_studies enable row level security;
alter table peptide_recon enable row level security;
alter table protocols enable row level security;
alter table protocol_months enable row level security;
alter table protocol_month_rows enable row level security;
alter table articles enable row level security;
alter table vet_protocols enable row level security;

create or replace function get_my_role()
returns text as $$
  select role from user_profiles where id = auth.uid();
$$ language sql security definer;

create or replace function get_my_location()
returns uuid as $$
  select location_id from user_profiles where id = auth.uid();
$$ language sql security definer;

-- Locations
create policy "locations_select" on locations for select
  using (get_my_role() = 'super_admin' or id = get_my_location());
create policy "locations_write_super" on locations for all
  using (get_my_role() = 'super_admin');

-- User profiles
create policy "profiles_select" on user_profiles for select
  using (id = auth.uid() or get_my_role() = 'super_admin');
create policy "profiles_update" on user_profiles for update
  using (id = auth.uid() or get_my_role() = 'super_admin');
create policy "profiles_insert" on user_profiles for insert
  with check (id = auth.uid() or get_my_role() = 'super_admin');

-- Clients: strict location isolation
create policy "clients_select" on clients for select
  using (get_my_role() = 'super_admin' or location_id = get_my_location());
create policy "clients_insert" on clients for insert
  with check (get_my_role() = 'super_admin' or (location_id = get_my_location() and get_my_role() in ('location_admin','staff')));
create policy "clients_update" on clients for update
  using (get_my_role() = 'super_admin' or location_id = get_my_location());

-- Lab results (scoped through clients)
create policy "lab_select" on lab_results for select
  using (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = lab_results.client_id and c.location_id = get_my_location()));
create policy "lab_insert" on lab_results for insert
  with check (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = lab_results.client_id and c.location_id = get_my_location()));

-- Client protocols
create policy "cp_select" on client_protocols for select
  using (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = client_protocols.client_id and c.location_id = get_my_location()));
create policy "cp_insert" on client_protocols for insert
  with check (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = client_protocols.client_id and c.location_id = get_my_location()));
create policy "cp_update" on client_protocols for update
  using (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = client_protocols.client_id and c.location_id = get_my_location()));

-- Check-ins
create policy "checkins_select" on client_checkins for select
  using (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = client_checkins.client_id and c.location_id = get_my_location()));
create policy "checkins_insert" on client_checkins for insert
  with check (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = client_checkins.client_id and c.location_id = get_my_location()));

-- Vials
create policy "vials_all" on vial_inventory for all
  using (get_my_role() = 'super_admin' or exists (select 1 from clients c where c.id = vial_inventory.client_id and c.location_id = get_my_location()));

-- Peptide library: all auth users read, super_admin writes
create policy "peptides_read" on peptides for select using (auth.uid() is not null);
create policy "peptides_write" on peptides for all using (get_my_role() = 'super_admin');
create policy "dosing_read" on peptide_dosing for select using (auth.uid() is not null);
create policy "dosing_write" on peptide_dosing for all using (get_my_role() = 'super_admin');
create policy "benefits_read" on peptide_benefits for select using (auth.uid() is not null);
create policy "benefits_write" on peptide_benefits for all using (get_my_role() = 'super_admin');
create policy "warnings_read" on peptide_warnings for select using (auth.uid() is not null);
create policy "warnings_write" on peptide_warnings for all using (get_my_role() = 'super_admin');
create policy "studies_read" on peptide_studies for select using (auth.uid() is not null);
create policy "studies_write" on peptide_studies for all using (get_my_role() = 'super_admin');
create policy "recon_read" on peptide_recon for select using (auth.uid() is not null);
create policy "recon_write" on peptide_recon for all using (get_my_role() = 'super_admin');

-- Protocols
create policy "protocols_read" on protocols for select using (auth.uid() is not null);
create policy "protocols_write" on protocols for all using (get_my_role() = 'super_admin');
create policy "pm_read" on protocol_months for select using (auth.uid() is not null);
create policy "pm_write" on protocol_months for all using (get_my_role() = 'super_admin');
create policy "pmr_read" on protocol_month_rows for select using (auth.uid() is not null);
create policy "pmr_write" on protocol_month_rows for all using (get_my_role() = 'super_admin');

-- Articles
create policy "articles_read" on articles for select
  using (auth.uid() is not null and (is_published = true or get_my_role() in ('super_admin','location_admin')));
create policy "articles_write" on articles for all
  using (get_my_role() in ('super_admin','location_admin'));

-- Vet protocols
create policy "vet_read" on vet_protocols for select using (auth.uid() is not null);
create policy "vet_write" on vet_protocols for all using (get_my_role() = 'super_admin');
```

---

## SEED DATA

File: supabase/seed.sql

Write complete INSERT statements for every row listed below.

### LOCATIONS
```sql
insert into locations (name, city, state, owner_name, owner_email) values
  ('Elev8 Performance Costa Mesa', 'Costa Mesa', 'CA', 'Kat', 'kat@elev8performance.com'),
  ('House of Power Westminster', 'Westminster', 'CA', 'Nyck', 'nyck@houseofpower.com');
```

### PEPTIDES — Seed all 15 with complete data in every related table

For each peptide below, write INSERT statements for:
peptides, peptide_dosing (multiple rows), peptide_benefits (5+ rows), peptide_warnings (4+ rows), peptide_studies (2+ rows), peptide_recon (1 row)

**1. BPC-157**
- slug: bpc-157
- full_name: Body Protection Compound-157
- category: Musculoskeletal / GI
- tags: {Recovery,Healing,"GI Health",Neuroprotection}
- route: subcutaneous
- half_life: ~30 min injectable; gastric stable orally
- cycle_length: 4–8 weeks on, 2–4 weeks off
- summary: A 15-amino acid peptide derived from human gastric juice. Most researched healing peptide with documented effects on tendons, ligaments, gut mucosa, and nerve tissue.
- mechanism_of_action: Upregulates VEGF/EGF/TGF-β for angiogenesis. Modulates nitric oxide pathways. Activates FAK-paxillin pathway for fibroblast migration and collagen deposition. Cytoprotective on GI mucosa. Stabilizes dopamine/serotonin systems.
- microdose_notes: 100 mcg/day for maintenance phases or sensitive individuals
- Dosing rows: (Days 1–7, 250 mcg/day, Starting dose near injury or abdominal SC), (Days 8–28, 500 mcg/day, Standard healing dose — can split AM/PM), (Days 29–56, 500 mcg/day, Continue until healed; inject near injury site when possible)
- Benefits: Accelerates tendon/ligament/muscle healing | Heals gut lining — leaky gut/IBD/ulcers/NSAID damage | Reduces systemic and local inflammation | Promotes angiogenesis (new blood vessel formation) | Neuroprotective — supports dopamine and serotonin systems | Enhances collagen synthesis and fibroblast activity
- Warnings: Not FDA-approved — investigational only | Limited human clinical trial data; most evidence from animal models | Theoretical cancer concern via angiogenesis mechanism (unproven in humans) | Quality and purity vary significantly between sources | WADA prohibited in competitive sports | Injection vs oral bioavailability differs significantly
- Studies: (BPC-157: The Healing Peptide, Sikiric P et al, Current Pharmaceutical Design, 2018, Comprehensive review covering tendon/ligament/muscle/gut healing with 100+ referenced studies) | (Emerging Use in Orthopaedic Sports Medicine, Vasireddi N et al, HSS Journal, 2025, Systematic review confirming anti-inflammatory/vasculogenic/structural repair effects) | (BPC-157 and Tendon Healing, Staresinic M et al, Journal of Orthopaedic Research, 2003, Significantly accelerated Achilles tendon healing with improved biomechanical properties)
- Recon: default_vial_mg=5, default_bac_ml=3.0, default_dose_mcg=250, is_premixed=false, steps={"Draw 3.0 mL bacteriostatic water into sterile syringe","Inject slowly down inner vial wall — avoid foaming","Swirl gently until dissolved — do not shake","Label with date, refrigerate at 2–8°C away from light"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 14–28 days. No freeze-thaw.", vials_needed_display="~6 vials per 8-week course at 500 mcg/day", concentration_display="1.67 mg/mL", unit_calc_display="1 unit (0.01 mL) ≈ 16.7 mcg on U-100 syringe"

**2. TB-500**
- slug: tb-500
- full_name: Thymosin Beta-4
- category: Musculoskeletal / Systemic Repair
- tags: {Recovery,Healing,"Anti-Fibrotic","Systemic Repair"}
- route: subcutaneous
- half_life: Several hours (SC injection)
- cycle_length: Loading 4–6 weeks, then monthly maintenance
- summary: A 43-amino acid naturally occurring peptide that regulates actin polymerization, reduces fibrosis, and promotes systemic tissue repair.
- mechanism_of_action: Regulates actin polymerization — sequesters actin monomers facilitating cell migration. Upregulates VEGF for new vessel formation. Reduces TNF-α and IL-6. Activates fibroblasts and keratinocytes for collagen synthesis.
- Dosing rows: (Loading Weeks 1–4, 5–10 mg/week SC, Split into 2 injections for doses >5 mg), (Maintenance, 2–5 mg/week SC, Continue weekly or reduce to biweekly once healed)
- Benefits: Promotes systemic tissue repair — tendons/ligaments/muscles/skin | Reduces fibrosis and scar tissue formation | Supports angiogenesis and wound healing | Anti-inflammatory — reduces cytokine-driven tissue damage | Cardiac protective effects in preclinical models | Synergistic with BPC-157 for musculoskeletal healing
- Warnings: Not FDA-approved — investigational | WADA prohibited in competitive sports | Limited long-term human safety data | Theoretical concern in active cancers due to angiogenic properties | Loading doses may cause transient fatigue or mild nausea
- Studies: (Thymosin β4: Roles in Development Repair and Regeneration, various, Annals of the New York Academy of Sciences, 2007, Foundational paper establishing TB-500 role in actin regulation wound healing and tissue regeneration) | (Thymosin β4: Multi-Functional Regenerative Peptide, various, Expert Opinion on Biological Therapy, 2018, Review of clinical applications including cardiac repair corneal healing and musculoskeletal regeneration)
- Recon: default_vial_mg=5, default_bac_ml=2.0, default_dose_mcg=2500, is_premixed=false, steps={"Draw 2.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — TB-500 is fragile avoid agitation","Swirl gently to dissolve — solution should be clear","Label and refrigerate at 2–8°C; use within 14 days"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 14 days. No freeze-thaw.", vials_needed_display="~4–6 vials (5 mg) per 12-week course at maintenance dosing", concentration_display="2.5 mg/mL", unit_calc_display="1 unit (0.01 mL) = 25 mcg on U-100 syringe"

**3. CJC-1295 / Ipamorelin**
- slug: cjc-ipamorelin
- full_name: CJC-1295 (No DAC) + Ipamorelin Blend
- category: GH Optimization / Recovery
- tags: {"GH Optimization",Recovery,"Body Composition",Sleep}
- route: subcutaneous
- half_life: CJC-1295 ~30 min; Ipamorelin ~2 hours
- cycle_length: 8–12 weeks on; 4-week break; can repeat
- summary: A synergistic GH secretagogue blend combining GHRH analog CJC-1295 with selective GHS Ipamorelin. Produces pulsatile GH release mimicking natural physiology.
- mechanism_of_action: CJC-1295 (No DAC) binds GHRH receptors stimulating pulsatile GH release from anterior pituitary. Ipamorelin binds ghrelin receptors (GHSR) triggering a separate GH pulse. Combined they act on complementary receptor pathways producing synergistic GH release without cortisol or ACTH elevation.
- microdose_notes: N/A — minimum effective dose is ~100 mcg each peptide
- Dosing rows: (Weeks 1–2, 100 mcg each SC nightly, PM fasted — inject 2–3 hrs after last meal before sleep), (Weeks 3–4, 150 mcg each SC nightly, Increase if well tolerated), (Weeks 5–12, 200–300 mcg each SC nightly, Target therapeutic dose PM fasted)
- Benefits: Stimulates pulsatile GH release mirroring natural rhythm | Increases IGF-1 — promotes tissue repair and muscle recovery | Ipamorelin is selective — does not raise cortisol or ACTH | Supports fat metabolism and lean body composition | Improves sleep quality through GH pulse timing | Synergistic GHRH + GHS mechanism produces additive effect
- Warnings: Must inject fasted — food blunts GH release significantly | Avoid in active malignancy (GH is growth-promoting) | May cause transient water retention tingling or headache | Long-term suppression of endogenous GH axis possible with extended use | Not FDA-approved for GH optimization in healthy adults
- Studies: (Prolonged Stimulation of GH and IGF-1 by CJC-1295, Ionescu M et al, Journal of Clinical Endocrinology, 2006, Human study demonstrating sustained dose-dependent GH and IGF-1 increases) | (Ipamorelin: The First Selective GH Secretagogue, Raun K et al, European Journal of Endocrinology, 1998, Established selectivity for GH release without cortisol or ACTH elevation)
- Recon: default_vial_mg=10, default_bac_ml=3.0, default_dose_mcg=200, is_premixed=false, steps={"Draw 3.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — do not aim stream directly at powder","Swirl gently until fully dissolved — do not shake","Label with date, refrigerate at 2–8°C away from light"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 28 days. No freeze-thaw.", vials_needed_display="~3 vials per 8-week · ~4 vials per 12-week course", concentration_display="3.33 mg/mL total (1.67 mg/mL each)", unit_calc_display="1 unit (0.01 mL) ≈ 33.3 mcg total (~16.7 mcg each) on U-100 syringe"

**4. Epitalon**
- slug: epitalon
- full_name: Epithalon (Ala-Glu-Asp-Gly Tetrapeptide)
- category: Longevity / Circadian Reset
- tags: {Longevity,"Circadian Reset","Telomere Support","Anti-Aging"}
- route: subcutaneous
- half_life: Short (~minutes); effects persist well beyond half-life
- cycle_length: 20 days ON → 4–6 months OFF → repeat (2x per year)
- summary: A synthetic tetrapeptide developed from pineal gland research. Activates telomerase for cellular longevity and restores melatonin production for circadian rhythm optimization.
- mechanism_of_action: Activates telomerase enzyme promoting telomere elongation allowing cells to divide beyond the Hayflick limit. Stimulates nocturnal melatonin synthesis from the pineal gland normalizing HPA axis circadian rhythms. Additional effects include genomic regulatory activity and antioxidant enzyme upregulation.
- microdose_notes: N/A — standard protocol is 5 mg nightly for 20 consecutive days
- Dosing rows: (20-Day Cycle, 5–10 mg SC nightly at bedtime, 10 mg vial + 2 mL BAC = 5 mg/mL. 5 mg = 100 units on U-100 syringe), (Off Cycle, None — full rest, 4–6 months off between cycles. Repeat 2× per year for longevity.)
- Benefits: Activates telomerase — supports telomere elongation and cellular longevity | Restores pineal melatonin production — improves sleep and circadian rhythm | Geroprotective — lifespan extension observed in multiple animal models | Antioxidant and anti-inflammatory properties | Cardiovascular health — improved outcomes in 12-year human follow-up study | Immune modulation and potential cancer-protective effects
- Warnings: Cycle only — not for continuous use | Avoid in active malignancy (telomerase activation may promote cancer cell growth) | Reconstituted vials must be used within 2 days — highly sensitive peptide | Limited long-term Western human data; most evidence from Russian clinical studies
- Studies: (Epitalon Increases Telomere Length via Telomerase, Khavinson V et al, Biogerontology, 2025, In vitro and in vivo evidence of telomerase activation and telomere elongation in human cell lines) | (Epitalon Restores Melatonin Production, various, Neuroendocrinology Letters, 2002, Human study showing normalization of nocturnal melatonin secretion in elderly subjects) | (12-Year Cardiovascular Follow-up, various, Bulletin of Experimental Biology and Medicine, 2010, Reduced cardiovascular mortality and improved physiological function over 12 years)
- Recon: default_vial_mg=10, default_bac_ml=2.0, default_dose_mcg=5000, is_premixed=false, steps={"Draw 2.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — each 10 mg vial yields 2 doses of 5 mg","Swirl gently until dissolved — solution should be clear","Label with date, refrigerate — use each reconstituted vial within 2 days"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 2 days. No freeze-thaw.", vials_needed_display="10 × 10 mg vials per 20-day cycle (each vial = 2 nightly doses)", concentration_display="5 mg/mL", unit_calc_display="1 unit (0.01 mL) = 50 mcg on U-100 syringe | 5 mg dose = 100 units (full syringe)"

**5. Thymosin Alpha-1**
- slug: thymosin-alpha-1
- full_name: Thymosin Alpha-1 (TA-1)
- category: Immune / Autoimmune
- tags: {"Immune Modulation",Antiviral,"Autoimmune Support","T-Cell"}
- route: subcutaneous
- half_life: ~2 hours (SC injection)
- cycle_length: 12 weeks; 4-week break; repeat quarterly as needed
- summary: A 28-amino acid naturally occurring thymic peptide that acts as a biological response modifier. Approved in 40+ countries for hepatitis B/C. Activates T-cells NK cells and dendritic cells.
- mechanism_of_action: Activates dendritic cells T-helper cells and NK cells through TLR9 signaling. Upregulates MHC class II expression and enhances cytokine production (IL-2, IFN-γ). Promotes Th1 immune dominance — shifting from tolerogenic to active surveillance. Essential for chronic infections and immune reconstitution.
- Dosing rows: (Standard Dose, 1.5 mg SC, 2–3× per week. 5 mg vial + 1 mL BAC = 5 mg/mL. 1.5 mg = 30 units.), (Escalated Dose, 3 mg SC, For active autoimmune or chronic viral load — only if 1.5 mg well tolerated)
- Benefits: Potent T-cell and NK cell immune modulator | Antiviral — active against EBV Lyme disease chronic infections | Reduces immune dysfunction in autoimmune conditions | Thymic reconstitution — restores immune surveillance | Approved in 40+ countries for hepatitis B and C | Synergistic with BPC-157 for gut-immune axis support
- Warnings: Avoid overstimulation in autoimmune conditions — cycle carefully | Transient fatigue possible in first 1–2 weeks (immune activation) | Not FDA-approved in the United States | Monitor CBC and inflammatory markers during use
- Studies: (Thymosin Alpha-1 in Hepatitis B Treatment, various, Hepatology, 1993, Randomized controlled trial showing sustained viral suppression) | (TA-1 Immune Modulation in Sepsis, various, Critical Care Medicine, 2013, Reduced 28-day mortality in immunocompromised sepsis patients)
- Recon: default_vial_mg=5, default_bac_ml=1.0, default_dose_mcg=1500, is_premixed=false, steps={"Draw 1.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — TA-1 is delicate minimize agitation","Swirl gently — do not shake — solution should be clear","Label and refrigerate; use within 14 days"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 14 days. No freeze-thaw.", vials_needed_display="~6–8 vials per 12-week course at 1.5 mg 2–3×/week", concentration_display="5 mg/mL", unit_calc_display="1 unit (0.01 mL) = 50 mcg on U-100 syringe | 1.5 mg = 30 units"

**6. KPV**
- slug: kpv
- full_name: Lysine-Proline-Valine (α-MSH C-terminal fragment)
- category: Anti-Inflammatory / GI
- tags: {"Anti-Inflammatory","GI Healing","Cytokine Control","IBD"}
- route: subcutaneous (also effective orally)
- half_life: Short; PO and SC both effective
- cycle_length: 8–12 weeks; extend to 16 weeks for chronic GI conditions
- summary: A tripeptide fragment of α-MSH retaining full anti-inflammatory activity without melanotropic effects. Uniquely effective both orally and by injection. NF-κB pathway inhibitor.
- mechanism_of_action: Inhibits NF-κB nuclear translocation blocking transcription of pro-inflammatory cytokines. Directly interacts with macrophages and dendritic cells to downregulate TNF-α/IL-6/IL-1β. Uniquely stable in gastric acid making oral administration effective for GI conditions.
- microdose_notes: 100–150 mcg/day for maintenance or sensitive patients
- Dosing rows: (Week 1, 200 mcg/day SC or PO, Start low to assess response), (Week 2, 300 mcg/day, Increase if well tolerated), (Weeks 3+, 400–500 mcg/day, Maintenance dose — PO effective for GI conditions)
- Benefits: Potent anti-inflammatory — reduces TNF-α IL-6 IL-1β | Gut barrier repair — effective for IBD Crohn's colitis | No melanotropic effects unlike full α-MSH | NF-κB pathway inhibition — broad systemic anti-inflammatory | Wound healing support through inflammatory resolution | Uniquely effective both orally and subcutaneously
- Warnings: Limited human clinical trial data | PO bioavailability is lower than SC — dose accordingly | Mild injection site reactions possible | Monitor inflammatory markers (CRP, calprotectin) during use
- Studies: (KPV Anti-Inflammatory Activity in IBD, various, Journal of Pharmacology and Experimental Therapeutics, 2006, KPV significantly reduced colitis severity and inflammatory markers in murine IBD models) | (α-MSH C-Terminal Peptides Mechanism, various, Annals of the New York Academy of Sciences, 1999, Established KPV mechanism of NF-κB inhibition and cytokine suppression without melanotropic effects)
- Recon: default_vial_mg=10, default_bac_ml=3.0, default_dose_mcg=300, is_premixed=false, steps={"Draw 3.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — avoid direct stream onto powder","Swirl gently until dissolved","Label and refrigerate at 2–8°C; use within 30 days"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 30 days. No freeze-thaw.", vials_needed_display="~3 vials per 8-week · ~4 vials per 12-week at 500 mcg/day", concentration_display="3.33 mg/mL", unit_calc_display="1 unit (0.01 mL) ≈ 33.3 mcg on U-100 syringe"

**7. DSIP**
- slug: dsip
- full_name: Delta Sleep-Inducing Peptide
- category: Sleep / Stress Modulation
- tags: {"Sleep Architecture","HPA Axis","Stress Modulation",Circadian}
- route: subcutaneous
- half_life: ~30 min; effects persist significantly longer
- cycle_length: 4–8 weeks; periodic breaks recommended
- summary: A naturally occurring nonapeptide that promotes delta-wave deep sleep and modulates the HPA axis. Does not induce tolerance. Effects can persist for multiple nights after a single dose.
- mechanism_of_action: Promotes delta-wave sleep by modulating GABAergic transmission and interacting with opioid receptor systems. Modulates the hypothalamic-pituitary-adrenal (HPA) axis reducing cortisol and ACTH secretion in stress states. Normalizes dysregulated circadian neuroendocrine rhythms through limbic system modulation.
- microdose_notes: 50–75 mcg for very sensitive individuals
- Dosing rows: (Week 1, 100 mcg SC, 30 min before bed. Titrate slowly — sensitivity varies.), (Week 2, 150 mcg SC, Increase if sleep quality not improving.), (Weeks 3+, 250–300 mcg SC, Target therapeutic dose for delta-wave sleep promotion))
- Benefits: Promotes delta-wave (slow-wave) deep sleep | Reduces cortisol and ACTH — stress-protective and adaptogenic | Does not induce pharmacological tolerance with continued use | Effects may persist for multiple nights after a single dose | Pairs with Epitalon for full circadian reset | Anxiolytic-like effects through HPA axis modulation
- Warnings: Do not drive after injection — sedating effect | Start at very low dose — sensitivity varies widely | Limited formal human safety data beyond 8 weeks | Avoid combining with alcohol or sedative medications
- Studies: (DSIP and Slow-Wave Sleep Enhancement, various, Pharmacology Biochemistry and Behavior, 1985, Human study demonstrating increased delta-wave sleep without significant REM alteration) | (Stress-Protective Effects of DSIP, various, Peptides, 1992, Evidence of adaptogenic and HPA axis-modulating properties under stress conditions)
- Recon: default_vial_mg=5, default_bac_ml=3.0, default_dose_mcg=200, is_premixed=false, steps={"Draw 3.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — avoid foaming","Swirl gently until fully dissolved","Label and refrigerate; use within 4 weeks of reconstitution"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 4 weeks. No freeze-thaw.", vials_needed_display="~2–3 vials per 8-week · ~5–6 vials per 12-week at 300 mcg/day", concentration_display="1.67 mg/mL", unit_calc_display="1 unit (0.01 mL) ≈ 16.7 mcg on U-100 syringe"

**8. GHK-Cu**
- slug: ghk-cu
- full_name: Copper Peptide GHK-Cu (Glycyl-L-histidyl-L-lysine)
- category: Tissue Remodeling / Anti-Aging
- tags: {"Tissue Remodeling","Collagen","Anti-Aging","Wound Healing"}
- route: subcutaneous (also topical)
- half_life: SC: hours; Topical: slow sustained release
- cycle_length: SC: 8–16 weeks; Topical: ongoing
- summary: A naturally occurring copper complex that upregulates 4000+ genes involved in tissue repair collagen synthesis and cellular rejuvenation. One of the most versatile peptides available.
- mechanism_of_action: Copper is essential for lysyl oxidase activity — cross-linking collagen and elastin. GHK-Cu upregulates TGF-β pathways for wound healing, stimulates angiogenesis, and resets gene expression profiles in aged tissues toward younger patterns. Has been shown to reverse age-related gene expression changes across multiple tissue types.
- microdose_notes: Topical application alone may be sufficient for skin and superficial tissue goals
- Dosing rows: (SC Injection, 2–5 mg/day SC, 50 mg vial + 5 mL BAC = 10 mg/mL. 2 mg = 20 units.), (Topical, BID application, Apply over target area (scar joint wound) twice daily — ongoing))
- Benefits: Stimulates collagen and elastin synthesis | Promotes wound healing and scar remodeling | Anti-inflammatory and antioxidant effects | Activates stem cell differentiation for tissue repair | Skin rejuvenation — reduces fine lines and improves texture | Synergistic with BPC-157 and TB-500 for musculoskeletal repair
- Warnings: SC injections may cause temporary blue/green skin tint (copper pigment — resolves) | Excessive systemic copper problematic in Wilson's disease | Topical application is very safe; systemic use requires more caution | Do not combine with high-dose zinc supplementation (copper antagonist)
- Studies: (GHK-Cu and Skin Wound Healing, various, Archives of Biochemistry and Biophysics, 1985, Pioneer study establishing GHK-Cu role in accelerated wound healing and collagen synthesis) | (GHK-Cu Gene Expression Reset, various, Annals of the New York Academy of Sciences, 2014, Analysis showing GHK-Cu reverses age-related gene expression changes across multiple tissue types)
- Recon: default_vial_mg=50, default_bac_ml=5.0, default_dose_mcg=2000, is_premixed=false, steps={"Draw 5.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall to reconstitute","Swirl gently until dissolved — solution may have light blue tint (normal from copper)","Label and refrigerate; use within 30 days"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 30 days.", vials_needed_display="1 × 50 mg vial lasts ~10–25 days at 2–5 mg/day", concentration_display="10 mg/mL", unit_calc_display="1 unit (0.01 mL) = 100 mcg on U-100 syringe"

**9. LL-37**
- slug: ll-37
- full_name: Cathelicidin Antimicrobial Peptide LL-37
- category: Antimicrobial / Immune
- tags: {Antimicrobial,Immune,Antiviral,"Innate Immunity"}
- route: subcutaneous (pulsed dosing only — never daily)
- half_life: Short (~minutes in serum); local tissue effects longer
- cycle_length: 6–8 weeks pulsed; never daily
- summary: A 37-amino acid human cathelicidin peptide providing broad-spectrum antimicrobial activity and innate immune modulation. Critical adjunct in Lyme disease EBV and mold protocols. Must be pulsed — never dosed daily.
- mechanism_of_action: Direct membrane disruption of bacterial and viral envelopes through amphipathic helix insertion. Modulates immune responses through TLR signaling modulation and chemokine receptor activation. Has anti-biofilm properties relevant to chronic Lyme and polymicrobial infections.
- microdose_notes: 50 mcg — for Herx-sensitive patients (Lyme mold)
- Dosing rows: (Initial Pulse, 100 mcg SC, 2× per week ONLY. 5 mg vial + 2.5 mL BAC = 2 mg/mL. 100 mcg = 5 units.), (Escalated, 200 mcg SC, Only if 100 mcg tolerated. Still 2× per week maximum.))
- Benefits: Broad-spectrum antimicrobial — bacteria viruses fungi | Activates innate immunity | Antiviral activity against enveloped viruses | Wound healing and anti-biofilm properties | Essential adjunct in Lyme EBV and mold protocols | Synergistic with Thymosin Alpha-1 for infection clearance
- Warnings: NEVER dose daily — immune overstimulation risk | Pulse dosing only — 2–3× per week maximum | Herxheimer reaction possible in Lyme patients — start at 50 mcg | May cause transient fatigue fever or flu-like symptoms in first 2 weeks | Limited human clinical trial data
- Studies: (LL-37 Antimicrobial and Immunomodulatory Functions, various, Journal of Leukocyte Biology, 2009, Comprehensive review of LL-37 dual roles in direct pathogen killing and immune signaling) | (LL-37 in Wound Healing, various, Journal of Investigative Dermatology, 2008, LL-37 accelerates keratinocyte migration and wound closure through EGFR activation)
- Recon: default_vial_mg=5, default_bac_ml=2.5, default_dose_mcg=100, is_premixed=false, steps={"Draw 2.5 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — LL-37 requires gentle handling","Swirl until dissolved — solution should be clear to slightly opalescent","Label and refrigerate; use within 14 days — do NOT freeze reconstituted"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 14 days. Do NOT freeze reconstituted.", vials_needed_display="~2 vials per 8-week course at 100–200 mcg 2×/week", concentration_display="2 mg/mL", unit_calc_display="1 unit (0.01 mL) = 20 mcg on U-100 syringe | 100 mcg = 5 units"

**10. AOD-9604**
- slug: aod-9604
- full_name: Anti-Obesity Drug 9604 (GH Fragment 177–191)
- category: Metabolic / Fat Loss
- tags: {"Fat Metabolism",Metabolic,"Body Composition","GH Fragment"}
- route: subcutaneous (fasted AM)
- half_life: ~30–60 min (SC injection)
- cycle_length: 12–16 weeks; reassess at 3 months
- summary: A modified fragment of human growth hormone (amino acids 177–191) that stimulates lipolysis and inhibits lipogenesis without the growth-promoting or IGF-1-stimulating effects of full GH.
- mechanism_of_action: Activates fat cell beta-3 adrenergic receptors to stimulate lipolysis and inhibit lipogenesis. Does not bind the GH receptor — therefore does not promote tissue growth or affect blood glucose. Targets visceral and subcutaneous fat depots.
- microdose_notes: 250 mcg — entry dose; some respond well at this level without increasing
- Dosing rows: (Daily AM Fasted, 250–500 mcg SC, Inject 30–60 min before first meal for maximal fat oxidation effect))
- Benefits: Stimulates lipolysis (fat breakdown) without GH receptor activation | Does not affect blood glucose or IGF-1 — safer than full GH | Synergistic with GLP-1 agents for body composition | Targets visceral and subcutaneous fat depots | Does not cause the growth or proliferative effects of GH
- Warnings: Must inject fasted — food significantly reduces effect | Not a replacement for diet and exercise | Limited human long-term data | Mild injection site reactions possible | Not FDA-approved for weight management
- Studies: (AOD-9604 Phase II Clinical Trial, various, Obesity Research, 2004, Human trial demonstrating significant fat reduction without GH side effects) | (GH Fragment 177-191 Mechanism, various, Endocrinology, 2001, Established beta-3 adrenergic receptor mechanism for fat-specific lipolytic activity)
- Recon: default_vial_mg=5, default_bac_ml=2.0, default_dose_mcg=300, is_premixed=false, steps={"Draw 2.0 mL bacteriostatic water into sterile syringe","Inject slowly down vial wall — avoid foaming","Swirl gently until dissolved — clear solution expected","Label and refrigerate; use within 14 days"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 14 days.", vials_needed_display="~1 vial (5 mg) per 10–20 days at 250–500 mcg/day", concentration_display="2.5 mg/mL", unit_calc_display="1 unit (0.01 mL) = 25 mcg on U-100 syringe"

**11. Cerebrolysin**
- slug: cerebrolysin
- full_name: Cerebrolysin — Porcine Brain Peptide Extract
- category: Neurologic / Cognitive
- tags: {Neuroprotection,Neuroplasticity,Cognitive,"Brain Recovery"}
- route: pre-mixed
- is_premixed: TRUE
- is_injectable: TRUE
- half_life: Pre-mixed solution; use immediately after opening ampoule
- cycle_length: 10–20 day intensive cycle; repeat every 3–4 months
- summary: A standardized mixture of low-molecular-weight neuropeptides derived from porcine brain. PRE-MIXED — no reconstitution needed. Mimics BDNF/NGF/CNTF effects. Most evidence-backed peptide for neurological recovery.
- mechanism_of_action: Contains approximately 25% peptide fraction and 75% free amino acids. Neurotrophic activity mimics BDNF/NGF/CNTF/GDNF through MAPK/ERK and PI3K/Akt pathways. Promotes synaptogenesis and axonal sprouting. Reduces amyloid precursor protein processing and tau hyperphosphorylation.
- Dosing rows: (Standard Dose, 5 mL IM or IV daily, 5-on/2-off schedule. IM into deltoid or gluteal muscle.), (High Dose, 10 mL IM or IV daily, For TBI stroke recovery or severe neurodegeneration. Can dilute in 100 mL NS for IV drip.))
- Benefits: Neurotrophic — mimics BDNF NGF and CNTF effects | Promotes neuroplasticity and synaptogenesis | Neuroprotective — reduces excitotoxicity and oxidative damage | Evidence-based for stroke recovery TBI Alzheimers and Parkinsons | Crosses the blood-brain barrier effectively | Anti-apoptotic — prevents programmed neuronal death
- Warnings: PRE-MIXED solution — open ampoule must be used immediately | DO NOT reconstitute — it is already a liquid | Should be prescribed and administered under physician supervision | Rare seizures reported at very high doses | Contraindicated in renal failure and status epilepticus | Store at room temperature away from light — do NOT freeze
- Studies: (Cerebrolysin in Acute Ischemic Stroke, various, Stroke, 2012, Multicenter RCT showing improved neurological outcomes at 90 days) | (Cerebrolysin in Alzheimers Disease, various, Journal of Neural Transmission, 2014, Systematic review confirming cognitive and functional benefits with 24-week treatment)
- Recon: default_vial_mg=NULL, default_bac_ml=0, default_dose_mcg=NULL, is_premixed=TRUE, premixed_notes="Cerebrolysin is a pre-mixed porcine brain peptide extract supplied as a ready-to-inject solution in 5 mL or 10 mL ampoules. NO reconstitution is needed. For IM: draw 5–10 mL from ampoule using sterile syringe and inject into deltoid or gluteal muscle. For IV: dilute in 100 mL normal saline and infuse over 15–60 minutes. CRITICAL: Opened ampoules must be used immediately — do not store after opening. Store unopened ampoules at room temperature away from light. Do NOT freeze."

**12. Semax**
- slug: semax
- full_name: Semax — Synthetic ACTH(4-7) Pro-Gly-Pro Analog
- category: Cognitive / Neuroprotection
- route: intranasal
- is_injectable: FALSE
- tags: {"Cognitive Enhancement",BDNF,Neuroprotection,"Intranasal"}
- half_life: ~2–8 hours (intranasal); effects may last longer
- cycle_length: 4–8 weeks; can use with periodic off-weeks
- summary: A synthetic heptapeptide analog of ACTH(4-7) administered as intranasal drops. Upregulates BDNF for neurogenesis. Rapid onset 5–15 minutes. Synergistic with Selank.
- mechanism_of_action: Upregulates BDNF (Brain-Derived Neurotrophic Factor) and NGF promoting neurogenesis synaptic plasticity and neuroprotection. Modulates dopaminergic and serotonergic transmission enhancing executive function. Nasal administration provides rapid CNS delivery via olfactory neurons.
- microdose_notes: 100 mcg — for very sensitive individuals
- Dosing rows: (Standard AM Dose, 300 mcg intranasal, 3 drops per nostril at 1 mg/mL concentration. Sniff gently after application.), (Advanced Dose, 600 mcg intranasal AM, 6 drops per nostril. Use for acute cognitive demands or TBI recovery.))
- Benefits: Upregulates BDNF — promotes neurogenesis and synaptic plasticity | Enhances focus memory consolidation and cognitive clarity | Neuroprotective — reduces ischemic brain damage | Anti-anxiety effects through serotonin system modulation | Rapid onset via intranasal route — 5–15 min to effect | Synergistic with Selank for combined cognitive and anxiolytic effect
- Warnings: Stimulating — avoid PM dosing (may impair sleep) | Tolerance may develop with daily use — use 5-days-on/2-off | Mild anxiety or irritability possible at higher doses | Not FDA-approved; primarily used in Russia and Eastern Europe
- Studies: (Semax and BDNF Upregulation, various, Bulletin of Experimental Biology and Medicine, 2001, Demonstrated significant BDNF increase in rat cortex following Semax administration) | (Semax in Ischemic Stroke Recovery, various, CNS Drug Reviews, 2002, Clinical evidence of neuroprotection and improved recovery in stroke patients)
- Recon: default_vial_mg=NULL, default_bac_ml=0, default_dose_mcg=300, is_premixed=TRUE, premixed_notes="Semax is supplied as a pre-made intranasal solution (typically 0.1% = 1 mg/mL). No reconstitution needed. Administer as nasal drops — tilt head back, apply 3 drops per nostril for 300 mcg dose (at 1 mg/mL). Sniff gently after application to ensure mucosal contact. Refrigerate at 2–8°C; use within 30 days of opening."

**13. Selank**
- slug: selank
- full_name: Selank — Tuftsin Analog Anxiolytic
- category: Anxiolytic / Cognitive
- route: intranasal
- is_injectable: FALSE
- tags: {Anxiolytic,"HPA Axis",Cognitive,"Intranasal","Stress Relief"}
- half_life: ~1–3 hours (intranasal)
- cycle_length: 4–8 weeks; may use longer with breaks
- summary: A synthetic hexapeptide analog of Tuftsin administered as intranasal drops. Anxiolytic without sedation or dependence. No withdrawal syndrome. Reduces cortisol and HPA hyperactivation.
- mechanism_of_action: Modulates GABAergic transmission producing anxiolytic effects without tolerance or dependence of benzodiazepines. Normalizes monoamine neurotransmitters (serotonin dopamine) and reduces HPA axis activation. Anti-inflammatory through IL-6 reduction and innate immune cytokine modulation.
- microdose_notes: 150 mcg — entry dose for anxiety-sensitive patients
- Dosing rows: (AM Dose, 300 mcg intranasal, For daytime cortisol and anxiety reduction. ~2 drops per nostril.), (PM Dose, 300 mcg intranasal, Pre-sleep HPA axis downregulation. Pairs with DSIP for sleep optimization.))
- Benefits: Anxiolytic without sedation or dependence (unlike benzodiazepines) | Reduces cortisol and stress-induced HPA hyperactivation | Enhances GABA transmission — calming without sedation | Mild nootropic — improves focus without stimulation | Anti-inflammatory — reduces pro-inflammatory cytokines | No withdrawal syndrome upon discontinuation
- Warnings: May cause mild sedation at higher doses — assess before driving | Avoid combining with CNS depressants at high doses | Not FDA-approved; primarily used in Russia | Long-term safety data limited beyond 8 weeks
- Studies: (Selank Anxiolytic Activity, various, Bulletin of Experimental Biology and Medicine, 2005, Demonstrated significant anxiolytic activity comparable to fenazepam without sedation or dependence) | (Selank and Immune Modulation, various, Russian Journal of Bioorganic Chemistry, 2009, Evidence of IL-6 reduction and innate immune cytokine modulation)
- Recon: default_vial_mg=NULL, default_bac_ml=0, default_dose_mcg=300, is_premixed=TRUE, premixed_notes="Selank is supplied as a pre-made intranasal solution (typically 0.15% = 1.5 mg/mL). No reconstitution needed. Administer as nasal drops — 2 drops per nostril for ~300 mcg dose (at 1.5 mg/mL). Breathe in gently to ensure mucosal absorption. Refrigerate at 2–8°C; use within 30 days of opening."

**14. Dihexa**
- slug: dihexa
- full_name: Dihexa — Angiotensin IV Analog (PNB-0408)
- category: Cognitive / Synaptogenesis
- route: oral
- is_injectable: FALSE
- tags: {"Cognitive Enhancement",Synaptogenesis,Neurologic,"Oral"}
- half_life: Long — estimated days due to high lipophilicity (effects accumulate)
- cycle_length: 8–12 weeks; long half-life means effects accumulate over time
- summary: A potent angiotensin IV analog that promotes synaptogenesis through HGF/c-Met signaling. Oral administration. Reported to be 7 million times more potent than BDNF for synapse formation. Start very low — long half-life.
- mechanism_of_action: Acts as agonist at HGF receptor (c-Met). HGF/c-Met signaling is critical for synaptogenesis neuronal survival and cognitive function. Crosses blood-brain barrier efficiently due to high lipophilicity. Promotes dendritic spine formation and synaptic density in hippocampal and cortical neurons.
- microdose_notes: 5 mg — start here to assess tolerance; effects may take 2–4 weeks
- Dosing rows: (Standard Oral, 10–20 mg PO daily, Oral capsule or dissolved powder. AM or PM — no food restriction.))
- Benefits: Promotes synaptogenesis — formation of new synaptic connections | Enhances HGF/c-Met brain signaling | Reported 7 million times more potent than BDNF for synapse formation | Cognitive enhancement — learning memory executive function | Potential for Alzheimers and cognitive decline protocols
- Warnings: Very limited human data — most research is preclinical | Long half-life — dosing errors persist; start very low at 5 mg | Avoid in active malignancy (HGF/c-Met promotes cell growth) | Effects may take 2–4 weeks to become apparent | Research chemical — not approved anywhere for clinical use
- Studies: (Dihexa as a Cognitive Enhancer, various, Journal of Pharmacology and Experimental Therapeutics, 2013, Established synaptogenic mechanism via HGF/c-Met and cognitive enhancement in animal models) | (HGF/c-Met Signaling in Neuroplasticity, various, Neuron, 2010, Foundational research establishing HGF receptor role in synaptogenesis and memory formation)
- Recon: default_vial_mg=NULL, default_bac_ml=0, default_dose_mcg=NULL, is_premixed=TRUE, premixed_notes="Dihexa is taken orally as capsules or dissolved powder. No injection or reconstitution needed. Standard dose: 10–20 mg PO daily. If using powder: weigh on a milligram scale and mix with water or juice. Take at a consistent time daily. Store capsules or powder in an airtight container away from heat and moisture."

**15. Semaglutide / GLP-1**
- slug: semaglutide-glp1
- full_name: GLP-1 Receptor Agonist (Semaglutide / Tirzepatide)
- category: Metabolic / Weight Management
- tags: {"Weight Loss","GLP-1","Metabolic","Insulin Sensitivity"}
- route: subcutaneous
- half_life: Semaglutide ~7 days; Tirzepatide ~5 days
- cycle_length: Ongoing — reassess at 3 months; hold if GI intolerance
- summary: Weekly subcutaneous GLP-1 receptor agonists for appetite suppression and metabolic optimization. Most evidence-based weight loss peptide class available. Titrate slowly to minimize GI side effects.
- mechanism_of_action: Binds GLP-1 receptors in pancreas brain and GI tract. Reduces appetite through hypothalamic GLP-1 receptor activation. Slows gastric emptying. Improves insulin sensitivity and reduces hepatic glucose output. Tirzepatide additionally activates GIP receptors for enhanced fat loss.
- Dosing rows: (Weeks 1–4 Titration, 0.25 mg/week SC, Starting dose — same day each week. Minimize GI side effects.), (Weeks 5–8, 0.5 mg/week SC, Titrate up if 0.25 mg tolerated without significant nausea.), (Weeks 9+ Maintenance, 1.0–2.4 mg/week SC, Titrate to effective dose based on tolerance and weight loss response.))
- Benefits: Significant appetite suppression and improved satiety | Substantial fat loss while preserving lean mass | Cardiovascular risk reduction — FDA-approved indication | Weekly dosing — highest compliance of any weight loss peptide | Synergistic with AOD-9604 and CJC/Ipamorelin for body composition
- Warnings: GI side effects common — nausea vomiting diarrhea at higher doses | Titrate slowly — rush titration causes most side effects | Monitor glucose levels in diabetic patients | Pancreatitis risk (rare) — stop if severe abdominal pain | Not for personal or family history of medullary thyroid cancer | Monitor lean mass — combine with resistance training
- Studies: (SUSTAIN-6 Cardiovascular Outcomes Trial, various, NEJM, 2016, Semaglutide reduced cardiovascular death and non-fatal MI/stroke by 26% in high-risk patients) | (STEP 1 Weight Management Trial, various, NEJM, 2021, 2.4 mg semaglutide produced average 14.9% body weight reduction over 68 weeks)
- Recon: default_vial_mg=3, default_bac_ml=1.5, default_dose_mcg=250, is_premixed=false, steps={"Draw 1.0–2.0 mL bacteriostatic water per vial size","Inject slowly down vial wall — GLP-1 peptides require gentle handling","Swirl VERY gently — do not vortex or shake; solution is fragile","Label refrigerate use within 28 days — draw weekly dose each week"}, storage="Lyophilized: −20°C. Reconstituted: 2–8°C, use within 28 days. Never shake — very fragile peptide.", vials_needed_display="1 vial per 2–4 weeks depending on dose; plan 12-week initial supply", concentration_display="Variable by vial/BAC ratio", unit_calc_display="Dose by weight: 0.25 mg/wk titrate → 0.5 → 1.0 → up to 2.4 mg/wk"

### VETERINARY PROTOCOLS

```sql
insert into vet_protocols (condition_name, animal_type, primary_peptide, adjunct_peptides, dosing_notes, weight_based_dosing, dose_per_kg_mcg, clinical_notes, cycle_length) values
('Joint Pain / Arthritis', 'dog', 'BPC-157', ARRAY['TB-500'], '10 mcg/kg SC daily (BPC-157) near affected joint. TB-500 10 mcg/kg SC weekly.', 'BPC-157: 10 mcg/kg/day SC near joint. TB-500: 10 mcg/kg/week SC.', 10, 'Inject near affected joint when anatomically possible. Works well alongside veterinary anti-inflammatories. Monitor response at 2 weeks.', '6 weeks on / 2 weeks off'),
('Post-Surgical Recovery', 'dog', 'TB-500', ARRAY['BPC-157'], 'TB-500: 10 mcg/kg SC weekly. BPC-157: 10 mcg/kg SC daily near surgical site. Begin Day 3–5 post-op when cleared by vet.', 'TB-500: 10 mcg/kg/week SC. BPC-157: 10 mcg/kg/day SC.', 10, 'Begin when surgical site is closed and stable. Avoid injecting directly at incision site — inject nearby SC tissue.', '8 weeks'),
('GI Issues / IBD', 'dog', 'BPC-157', NULL, 'BPC-157: 10 mcg/kg PO daily in water or food — empty stomach preferred for maximal GI mucosal contact.', 'BPC-157: 10 mcg/kg/day PO.', 10, 'Oral route targets GI mucosa directly. Mix into small amount of water given before meals. Monitor stool quality and appetite.', '4–8 weeks'),
('Wound Healing', 'dog', 'BPC-157', NULL, 'BPC-157: 10 mcg/kg SC daily near wound margin or topical application diluted in saline.', 'BPC-157: 10 mcg/kg/day SC near wound or topical.', 10, 'Topical: dilute reconstituted BPC-157 in sterile saline and apply directly to wound with sterile gauze. Alternatively inject SC around wound margin.', '4–6 weeks'),
('Cognitive Dysfunction (CCD)', 'dog', 'Cerebrolysin', NULL, 'Cerebrolysin: 0.5–1 mL IM or slow IV diluted in saline. 5 days on / 2 days off. 2-week cycles.', 'Cerebrolysin: 0.1 mL/kg IM up to 1 mL maximum per dose.', NULL, 'Must be administered by veterinarian. Dilute in 5–10 mL normal saline for IV use. Monitor for seizure activity. Best results with 2–3 cycles over 6 weeks.', '2-week cycles; 2–3 cycles total');
```

### PROTOCOLS

Seed all 28 protocols with complete data. For each protocol write INSERT statements for: protocols, then protocol_months (3 rows per protocol — month 1/2/3), then protocol_month_rows (3–4 rows per month per protocol).

Protocols to seed (use the complete data from our v9 selector):
1. Stroke Recovery (Neurologic/Cognitive) — primary: Cerebrolysin, adjuncts: Semax, Dihexa
2. Traumatic Brain Injury (Neurologic/Cognitive) — primary: Cerebrolysin, adjuncts: Semax, Selank, Dihexa
3. Dementia/Cognitive Decline (Neurologic/Cognitive) — primary: Cerebrolysin, adjuncts: Dihexa, Epitalon
4. Parkinson's Disease (Neurologic/Cognitive) — primary: Cerebrolysin, adjuncts: Dihexa, Selank
5. Cerebral Palsy (Neurologic/Cognitive) — primary: Cerebrolysin, adjuncts: Dihexa, BPC-157
6. Lyme Disease (Autoimmune/Immune) — primary: Thymosin Alpha-1, adjuncts: LL-37, BPC-157
7. Epstein-Barr Virus (Autoimmune/Immune) — primary: Thymosin Alpha-1, adjuncts: LL-37, BPC-157
8. Multiple Sclerosis (Autoimmune/Immune) — primary: Thymosin Alpha-1, adjuncts: TB-500, BPC-157
9. Rheumatoid Arthritis (Autoimmune/Immune) — primary: TB-500, adjuncts: BPC-157, KPV, Thymosin Alpha-1
10. Mold Toxicity (Autoimmune/Immune) — primary: Thymosin Alpha-1, adjuncts: LL-37, BPC-157
11. Muscle/Tendon Injury (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, GHK-Cu
12. Joint Degeneration (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, GHK-Cu
13. Post-Surgical Recovery (Musculoskeletal) — primary: TB-500, adjuncts: BPC-157, GHK-Cu
14. Chronic Pain (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500
15. Rotator Cuff Injury (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, GHK-Cu, CJC/Ipamorelin
16. Frozen Shoulder (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, KPV
17. ACL Injury (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, CJC/Ipamorelin
18. Meniscus Injury (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, GHK-Cu
19. Hip Labrum Injury (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, CJC/Ipamorelin
20. Ankle Sprain Grade 1-3 (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500
21. Stress Fracture/Bone Bruise (Musculoskeletal) — primary: BPC-157, adjuncts: TB-500, CJC/Ipamorelin
22. Weight Loss/Metabolic (Metabolic/Longevity) — primary: Semaglutide/GLP-1, adjuncts: AOD-9604, CJC/Ipamorelin
23. Anti-Aging/Longevity (Metabolic/Longevity) — primary: Epitalon, adjuncts: GHK-Cu, CJC/Ipamorelin, TB-500
24. Sleep Optimization (Metabolic/Longevity) — primary: DSIP, adjuncts: Epitalon, Selank
25. Inflammatory Bowel Disease (GI/Inflammatory) — primary: BPC-157, adjuncts: KPV, Thymosin Alpha-1
26. Leaky Gut/GI Inflammation (GI/Inflammatory) — primary: BPC-157, adjuncts: KPV
27. Joint Inflammation Systemic (GI/Inflammatory) — primary: BPC-157, adjuncts: TB-500, KPV
28. Sleep & Cognitive Health (Sleep/Cognitive) — primary: DSIP, adjuncts: Epitalon, Selank, Semax

For each protocol include:
- cycle_intro: 2–3 sentence clinical rationale for the protocol
- Month 1 title: "Induction — [Phase Name]", clinical_note with monitoring guidance
- Month 2 title: "Consolidation — [Phase Name]", clinical_note
- Month 3 title: "Maintenance — [Phase Name]", clinical_note
- Each month: 3–4 peptide rows with specific dose (mcg or mg) and schedule (Daily/Weekly/3x week/Nightly/etc.)

---

## APPLICATION PAGES

### Authentication
- /login — Navy centered login form. Gold "Sign In" button. Email + password. "Contact your administrator for access" — NO self-signup.
- /auth/callback — Supabase auth callback handler
- Middleware: protect all routes except /login and /auth/callback. Redirect to /login if no session.

### Sidebar Layout
Left sidebar always visible desktop. Hamburger mobile.

Top: ⬡ Atlas Engine logo in gold Playfair Display

Nav items with lucide-react icons:
- Dashboard (LayoutDashboard)
- Clients (Users) — badge showing overdue check-in count
- Protocol Selector (FlaskConical)
- Peptide Library (BookOpen)
- Calculator (Calculator)
- Knowledge Base (Newspaper)
- Vet Protocols (PawPrint)
- Settings (Settings) — pinned to bottom

Bottom of sidebar: current user avatar initials + name + role badge + location name

### /dashboard — Command Center

Stats row: Total Active Clients | Protocols Running | Clients Overdue for Check-in (orange) | Vials Needing Refill (red)

Two columns:
LEFT: Clients table — Name, Protocol, Month, Last Check-in, Next Injection, Status. Click → profile. "+ New Client" button.
RIGHT: Overdue check-ins list + Refill alerts list.

Super admin only: location summary cards at very top (each location: client count, alerts, protocols running).

### /clients — Client List

Searchable filterable sortable table.
Columns: Name, Age, Weight, Status, Protocol, Month, Last Check-in, Next Injection, Actions.
Filters: Status, Location (super_admin), Protocol, Goal.

"+ New Client" → 5-step intake modal:

STEP 1 — Personal Info: First Name*, Last Name*, DOB*, Sex*, Email, Phone, Weight lbs*

STEP 2 — Health Profile:
Goals multi-select: Weight Loss | Injury Recovery | Longevity/Anti-Aging | Sleep Optimization | Cognitive Enhancement | Immune Support | GI Health | Hormone Optimization | Other
Conditions multi-select: all 28 protocol conditions
Current Medications (text)
Allergies (text)

STEP 3 — Lab Work (skippable):
Manual entry fields with reference ranges: Testosterone, IGF-1, CRP (flag >3.0), Fasting Insulin (flag >10), Cortisol, TSH, Free T3, Free T4
Upload PDF option
Auto-flag out-of-range values in red

STEP 4 — Protocol Recommendation:
Match goals + conditions to top 3 protocols from database
Show each as a card with assign button
Set start_date and total_months (3/4/5/6/9/12)
Show weight-adjusted doses for their weight

STEP 5 — PDF Controls & Review:
Full summary
PDF visibility toggles (gold switches):
- Protocol overview (ON)
- Cycling schedule (ON)
- Reconstitution instructions (ON)
- Weight-adjusted doses (ON)
- Clinical notes (OFF — physician only)
- Research studies (OFF)
- Warnings section (OFF)

"Create Client & Generate PDF" → creates all records → generates PDF → sends welcome email if email provided

### /clients/[id] — Client Profile

Header: Name, age, weight (lbs/kg), status badge, location, assigned to, quick actions row

Protocol progress bar: Month 1 → 2 → 3 → [extended months] with current month gold

SIX TABS:

Tab 1 Overview: Current protocol card + weight-adjusted doses table + flagged labs + last check-in note + next injection countdown

Tab 2 Protocol & Cycling:
Full timeline all months. Current month gold border.
Each month expands: title, clinical note, peptide table.
"Mark Month Complete" advances current_month.
"Extend Protocol" button: +1mo / +3mo / +6mo / to 12 months.
Supply summary at bottom: total vials per peptide, total BAC water, total syringes.

Tab 3 Lab Work:
Table with flag indicators. Trend charts (Recharts LineChart) for repeat markers.
Upload Labs + Manual Entry buttons.

Tab 4 Check-in Log:
Reverse chronological. Each entry: date, month/week, compliance stars (1-5), subjective response, side effects, weight, notes.
"+ New Check-in" inline form.

Tab 5 Vial Inventory:
Table: Peptide | Dispensed | Remaining | Dispense Date | Refill Date.
Color: ≥3=green, 2=yellow, ≤1=red.
Update and Dispense buttons.

Tab 6 Documents:
Grid: intake PDF, protocol PDFs, lab uploads.
"Generate New PDF" with visibility toggles.
Download on each document.

### /protocol-selector

Condition dropdown grouped by category (all 28).
Protocol card 4 tabs: Overview | 3-Month Cycling | Reconstitution | Calculator

Overview: primary peptide (clickable) + adjunct pills (all clickable) + clinical notes
3-Month Cycling: Month 1/2/3 blocks with peptide rows
Reconstitution: per-peptide cards. PRE-MIXED banner for Cerebrolysin. INTRANASAL DROPS for Semax/Selank. ORAL for Dihexa.
Calculator: peptide dropdown, vial size, BAC water buttons, dose input → live math. Formula: doses_per_vial = floor((vialMg * 1000) / doseMcg)

Clicking peptide → Shadcn Sheet from right: Protocol/Benefits/Warnings/Science tabs
"Assign to Client" button → modal to select client + dates

### /peptides

Search + filter by category/route/tags. Human/Vet toggle.
Grid of cards: name, full name, category badge, route badge, tags, half-life, summary preview.

### /peptides/[slug]

Two-column: detail (left) + sticky recon card (right desktop)
Header: name, full name, badges, tags
4 tabs: Protocol | Benefits | Warnings | Science
Show: PRE-MIXED banner (Cerebrolysin), drop count (Semax/Selank), mg capsule (Dihexa), units (SC/IM)
Related peptides at bottom

### /calculator

SECTION 1 — Reconstitution Calculator:
Peptide dropdown (SC/IM only — excludes intranasal/oral).
Auto-fills defaults from database when peptide selected.
Vial size (mg) editable. BAC water 1/2/3mL buttons + custom. Dose (mcg) editable.
Live results: Concentration | DRAW THIS (large white units) | Volume mL | Doses per vial
CORRECT FORMULA: doses_per_vial = Math.floor((vialMg * 1000) / doseMcg)
Gold syringe fill bar. Red warning >100 units.

SECTION 2 — Weight-Based Dose Adjuster:
Weight (lbs, auto shows kg). Dose per kg (mcg/kg) input.
Results: recommended dose for this weight + units to draw.
Comparison table: 100/125/150/175/200/225/250 lbs → dose mcg + units

SECTION 3 — Cycling Timeline Generator:
Protocol dropdown. Start date. Duration 3/4/5/6/9/12 months.
Generates: full month timeline table + supply summary (vials/BAC water/syringes per peptide) + Export PDF button

### /knowledge-base

Grid: title, source badge (Substack=orange/Internal=gold/Research=blue), author, date, summary, tags.
Filters: All/Substack/Internal/Research/Guide. Filter by peptide. Search.

"+ Add Article" (location_admin + super_admin):
Source type selector.
If Substack: paste URL → API route /api/fetch-substack fetches og metadata (title/author/date/summary/image) → auto-fills form → stores URL and summary only (NOT full text — legal) → displays as summary + "Read Full Article on Substack →" link
If Internal: TipTap rich text editor
If Research: title/authors/journal/year/description/URL fields
Related peptides multi-select. Tags. Published toggle.

Article reader /knowledge-base/[slug]:
Substack: title, author, date, summary, prominent "Read Full Article on Substack →" gold button
Internal: full rendered TipTap content
Related peptides as chips

### /vet-protocols

Disclaimer banner: "Veterinary Reference Only — Consult a Licensed Veterinarian"
Animal tabs: All / Dogs / Cats / Horses
Protocol cards: condition, animal badge, peptides, dosing notes
Weight-based calculator: animal weight input → recommended dose for that weight

### /settings

Super admin: Locations | Users | Peptide Library | Protocols | Articles
Location admin: My Location | My Staff | Articles
All users: Profile | Notifications

---

## CYCLING MATH ENGINE

File: lib/cycling.ts

CRITICAL: doses_per_vial = Math.floor((vialMg * 1000) / doseMcg)
BAC water NEVER affects total doses — only concentration and units to draw.

```typescript
export function calcDosesPerVial(vialMg: number, doseMcg: number): number {
  return Math.floor((vialMg * 1000) / doseMcg);
}
export function calcConcentration(vialMg: number, bacMl: number): number {
  return vialMg / bacMl;
}
export function calcUnitsToDrawU100(vialMg: number, bacMl: number, doseMcg: number): number {
  const concMcgMl = (vialMg / bacMl) * 1000;
  return (doseMcg / concMcgMl) * 100;
}
export function calcVolumeMl(vialMg: number, bacMl: number, doseMcg: number): number {
  const concMcgMl = (vialMg / bacMl) * 1000;
  return doseMcg / concMcgMl;
}
export function calcWeightBasedDose(weightLbs: number, dosePerKgMcg: number): number {
  return Math.round((weightLbs / 2.20462) * dosePerKgMcg);
}
export function calcVialsNeeded(doseMcg: number, vialMg: number, doseFrequency: 'daily'|'weekly'|'twice_weekly'|'three_times_weekly', totalDays: number): number {
  const dosesPerDay = { daily:1, weekly:1/7, twice_weekly:2/7, three_times_weekly:3/7 }[doseFrequency];
  return Math.ceil((dosesPerDay * totalDays) / calcDosesPerVial(vialMg, doseMcg));
}
export function getCurrentCycleMonth(startDate: Date): number {
  return Math.min(Math.floor((Date.now() - startDate.getTime()) / (1000*60*60*24*30)) + 1, 12);
}
export function generateCyclingTimeline(startDate: Date, totalMonths: number) {
  return Array.from({length: totalMonths}, (_, i) => {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + i);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { monthNumber: i+1, startDate: start, endDate: end, label: start.toLocaleDateString('en-US', {month:'long', year:'numeric'}) };
  });
}
```

---

## PDF TEMPLATES

File: lib/pdf/ClientProtocolPDF.tsx using @react-pdf/renderer

Navy (#0b1120) background. Gold (#e8c96e) accents. White text.
Atlas Engine branding on every page.

Pages:
1. Cover: Atlas Engine logo, "Peptide Protocol Guide", client name, protocol name, start date, prepared by, date
2. Client info + weight-adjusted doses table
3+. Month-by-month cycling (respect total_months)
Last: Reconstitution instructions for each peptide

Respect all show_* visibility toggles from client_protocols table.

Physician disclaimer footer: "Prepared by Atlas Engine. For physician use only. All protocols are decision-support frameworks. Final dosing and administration at physician discretion."

---

## EMAIL

File: lib/email.ts using Resend

Welcome email on new client creation (if email provided):
Subject: "Your Peptide Protocol is Ready — [Protocol Name] | Atlas Engine"
From: Atlas Engine <noreply@atlasengine.com> (or APP_URL domain)
Body: Welcome [first name], protocol summary, start date, practitioner name and location, "Your personalized protocol guide is attached.", Attach PDF
Footer: Atlas Engine | [location name]

---

## API ROUTES

/api/generate-pdf — POST — generates client protocol PDF, returns PDF blob
/api/send-welcome-email — POST — sends welcome email with PDF attachment via Resend
/api/fetch-substack — POST — accepts {url}, fetches og metadata from URL, returns {title, author, date, summary, image} — does NOT copy full article content

---

## ENVIRONMENT VARIABLES

File: .env.local.example
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Atlas Engine
```

---

## DEPLOYMENT

File: vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

## README.md

Write a complete README with:
1. What Atlas Engine is (3 sentences)
2. Prerequisites (Node 18+, Supabase account, Resend account)
3. Step-by-step local setup
4. Creating your first admin account
5. Inviting a franchise partner
6. Deploying to Vercel
7. Troubleshooting

---

## BUILD ORDER — FOLLOW EXACTLY

1. npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false
2. npm install @supabase/supabase-js @supabase/ssr @react-pdf/renderer recharts date-fns @tiptap/react @tiptap/pm @tiptap/starter-kit resend react-hook-form @hookform/resolvers zod lucide-react next-themes
3. npx shadcn-ui@latest init + add all components
4. Configure tailwind.config.ts with Atlas Engine colors and Google Fonts
5. Create lib/supabase/client.ts and lib/supabase/server.ts
6. Create supabase/migrations/001_schema.sql
7. Create supabase/migrations/002_rls.sql
8. Create supabase/seed.sql with ALL 15 peptides + 28 protocols + 5 vet protocols + 2 locations
9. Create lib/cycling.ts
10. Build middleware.ts for auth route protection
11. Build /login page and /auth/callback
12. Build root layout with Atlas Engine sidebar
13. Build /dashboard
14. Build /clients with 5-step intake modal
15. Build /clients/[id] with all 6 tabs
16. Build /protocol-selector
17. Build /peptides grid
18. Build /peptides/[slug]
19. Build /calculator (all 3 sections)
20. Build /knowledge-base and /knowledge-base/[slug]
21. Build /vet-protocols
22. Build /settings
23. Build lib/pdf/ClientProtocolPDF.tsx
24. Build lib/email.ts
25. Build API routes: /api/generate-pdf, /api/send-welcome-email, /api/fetch-substack
26. Create .env.local.example and vercel.json
27. Write README.md

---

## ABSOLUTE RULES — NEVER VIOLATE

1. App name is Atlas Engine everywhere — PDFs, emails, sidebar, browser title, README
2. NEVER white or light backgrounds. Always #0b1120 navy.
3. doses_per_vial = floor((vialMg * 1000) / doseMcg) — BAC water does NOT change total doses
4. Cerebrolysin: PRE-MIXED — no BAC water form, no vial mg input, special pre-mixed info card only
5. Semax + Selank: INTRANASAL DROPS — show drop count not syringe units
6. Dihexa: ORAL — show mg capsule dose not injection units
7. All forms: React Hook Form + Zod validation
8. All DB queries: loading state + error state + empty state
9. Location admins CANNOT see other locations' clients — enforced at DB level via RLS
10. PDF content controlled by show_* toggles on client_protocols table
11. Substack integration: metadata + summary + link ONLY — never copies full article text
12. Mobile responsive on every page
13. First user account created = super_admin automatically
14. Seed all 28 protocols with full 3-month breakdowns
15. Build the entire application — do not stop partway through

Start building now. Work through the build order. Do not ask for confirmation between steps — build continuously. Print a brief status line after each step completes.
```
