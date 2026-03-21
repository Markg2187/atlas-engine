// ============================================================
// Atlas Engine - TypeScript Database Types
// ============================================================

export type UserRole = 'super_admin' | 'location_admin' | 'staff'
export type ClientStatus = 'active' | 'inactive' | 'onboarding'
export type ClientSex = 'male' | 'female' | 'other'
export type PeptideRoute = 'subcutaneous' | 'intramuscular' | 'intranasal' | 'oral' | 'topical' | 'intravenous' | 'pre-mixed'
export type ProtocolStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type ArticleSourceType = 'substack' | 'internal' | 'research' | 'guide'
export type AnimalType = 'dog' | 'cat' | 'horse' | 'other'
export type DoseFrequency = 'daily' | 'weekly' | 'twice_weekly' | 'three_times_weekly'

export interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  owner_name: string | null
  owner_email: string | null
  is_active: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string | null
  role: UserRole
  location_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  // joined
  location?: Location
}

export interface Client {
  id: string
  location_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  sex: ClientSex | null
  weight_lbs: number | null
  weight_kg: number | null
  goals: string[] | null
  health_conditions: string[] | null
  current_medications: string[] | null
  allergies: string | null
  notes: string | null
  status: ClientStatus
  assigned_to: string | null
  created_at: string
  updated_at: string
  // joined
  location?: Location
  assigned_staff?: UserProfile
}

export interface LabResult {
  id: string
  client_id: string
  test_name: string
  result_value: string | null
  unit: string | null
  reference_range: string | null
  is_flagged: boolean
  test_date: string | null
  notes: string | null
  file_url: string | null
  created_at: string
}

export interface Peptide {
  id: string
  name: string
  slug: string
  full_name: string | null
  category: string | null
  tags: string[] | null
  summary: string | null
  half_life: string | null
  cycle_length: string | null
  mechanism_of_action: string | null
  microdose_notes: string | null
  is_veterinary: boolean
  is_injectable: boolean
  route: PeptideRoute | null
  is_active: boolean
  is_brand_product: boolean
  brand: string | null
  created_at: string
  updated_at: string
  // joined
  dosing?: PeptideDosing[]
  benefits?: PeptideBenefit[]
  warnings?: PeptideWarning[]
  studies?: PeptideStudy[]
  recon?: PeptideRecon
}

export interface PeptideDosing {
  id: string
  peptide_id: string
  period: string
  dose: string
  notes: string | null
  sort_order: number
}

export interface PeptideBenefit {
  id: string
  peptide_id: string
  benefit_text: string
  sort_order: number
}

export interface PeptideWarning {
  id: string
  peptide_id: string
  warning_text: string
  sort_order: number
}

export interface PeptideStudy {
  id: string
  peptide_id: string
  title: string
  authors: string | null
  journal: string | null
  year: number | null
  description: string | null
  url: string | null
  sort_order: number
}

export interface PeptideRecon {
  id: string
  peptide_id: string
  vial_size_display: string | null
  default_vial_mg: number | null
  default_bac_ml: number | null
  default_dose_mcg: number | null
  concentration_display: string | null
  unit_calc_display: string | null
  dose_range_display: string | null
  timing_display: string | null
  cycle_length_display: string | null
  storage_instructions: string | null
  reconstitution_steps: string[] | null
  vials_needed_display: string | null
  is_premixed: boolean
  premixed_notes: string | null
}

export interface Protocol {
  id: string
  condition_name: string
  slug: string
  category: string
  primary_peptide: string
  adjunct_peptides: string[] | null
  clinical_notes: string | null
  cycle_intro: string | null
  is_active: boolean
  is_featured: boolean
  tagline: string | null
  created_at: string
  updated_at: string
  // joined
  months?: ProtocolMonth[]
}

export interface ProtocolMonth {
  id: string
  protocol_id: string
  month_number: number
  title: string
  clinical_note: string | null
  sort_order: number
  // joined
  rows?: ProtocolMonthRow[]
}

export interface ProtocolMonthRow {
  id: string
  month_id: string
  peptide_name: string
  dose: string
  schedule: string
  sort_order: number
}

export interface ClientProtocol {
  id: string
  client_id: string
  protocol_id: string | null
  start_date: string
  end_date: string | null
  total_months: number
  current_month: number
  status: ProtocolStatus
  assigned_by: string | null
  weight_at_assignment_lbs: number | null
  custom_notes: string | null
  show_protocol_overview: boolean
  show_cycling_schedule: boolean
  show_reconstitution: boolean
  show_weight_adjusted_doses: boolean
  show_clinical_notes: boolean
  show_research_studies: boolean
  show_warnings: boolean
  created_at: string
  updated_at: string
  // joined
  protocol?: Protocol
  client?: Client
  assigned_by_profile?: UserProfile
}

export interface ClientCheckin {
  id: string
  client_id: string
  client_protocol_id: string | null
  checkin_date: string
  month_number: number | null
  week_number: number | null
  subjective_response: string | null
  side_effects: string | null
  compliance_rating: number | null
  weight_lbs: number | null
  notes: string | null
  logged_by: string | null
  created_at: string
}

export interface VialInventory {
  id: string
  client_id: string
  client_protocol_id: string | null
  peptide_name: string
  vials_dispensed: number
  vials_remaining: number
  dispense_date: string | null
  next_refill_date: string | null
  notes: string | null
  updated_at: string
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string | null
  summary: string | null
  category: string | null
  tags: string[] | null
  author_name: string | null
  source_url: string | null
  source_type: ArticleSourceType
  substack_rss_url: string | null
  published_at: string | null
  is_published: boolean
  related_peptide_slugs: string[] | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface VetProtocol {
  id: string
  condition_name: string
  animal_type: AnimalType
  primary_peptide: string
  adjunct_peptides: string[] | null
  dosing_notes: string | null
  weight_based_dosing: string | null
  dose_per_kg_mcg: number | null
  clinical_notes: string | null
  cycle_length: string | null
  is_active: boolean
  created_at: string
}

// ============================================================
// Dashboard / API helper types
// ============================================================

export interface DashboardStats {
  totalActiveClients: number
  protocolsRunning: number
  overdueCheckins: number
  vialsNeedingRefill: number
}

export interface LocationSummary {
  location: Location
  activeClients: number
  activeProtocols: number
  overdueCheckins: number
}

export interface ClientWithProtocol extends Client {
  active_protocol?: ClientProtocol & { protocol?: Protocol }
  last_checkin?: ClientCheckin
  days_since_checkin?: number
}

export interface CalcResult {
  dosesPerVial: number
  concentration: string
  unitsU100: number
  volumeMl: number
  vialsNeeded: number
}
