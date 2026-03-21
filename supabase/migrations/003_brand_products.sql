-- ============================================================
-- Migration 003: Brand Products & Signature Stacks
-- Adds Tier 1 CA Peptide Labs branded products and Signature Stack protocols
-- ============================================================


-- ============================================================
-- SECTION 1: ALTER TABLES
-- ============================================================

alter table peptides add column if not exists is_brand_product boolean default false;
alter table peptides add column if not exists brand text;
alter table protocols add column if not exists is_featured boolean default false;
alter table protocols add column if not exists tagline text;


-- ============================================================
-- SECTION 2: UPDATE EXISTING TIER 2 PEPTIDES (Partner Sourced)
-- ============================================================

update peptides set is_brand_product = false, brand = 'Partner Sourced'
where slug in (
  'bpc-157',
  'tb-500',
  'cjc-ipamorelin',
  'epitalon',
  'thymosin-alpha-1',
  'kpv',
  'dsip',
  'ghk-cu',
  'll-37',
  'aod-9604',
  'cerebrolysin',
  'semax',
  'selank',
  'dihexa',
  'semaglutide-glp1'
);


-- ============================================================
-- SECTION 3: INSERT TIER 1 BRANDED PEPTIDES (CA Peptide Labs)
-- ============================================================

insert into peptides (id, name, slug, full_name, category, tags, summary, half_life, cycle_length, mechanism_of_action, is_veterinary, is_injectable, route, is_brand_product, brand) values

-- 1. Wolverine Blend
('bbbbbbbb-0000-0000-0000-000000000001',
 'Wolverine Blend',
 'wolverine-blend',
 'BPC-157 + TB-500 Combo Blend',
 'Recovery/Performance',
 array['healing','recovery','inflammation','tissue repair','combo'],
 'Wolverine Blend combines BPC-157 (10mg) and TB-500 (10mg) in a single vial for maximum tissue repair, injury recovery, and systemic healing. This synergistic duo accelerates healing from the cellular level up — BPC-157 targets local tissue repair while TB-500 mobilizes systemic regeneration.',
 'BPC-157: ~4 hours; TB-500: ~2-3 days',
 '4-8 weeks on, 4 weeks off',
 'BPC-157 upregulates growth hormone receptors and promotes angiogenesis; TB-500 promotes actin polymerization and mobilizes stem cells to injury sites. Together they provide local and systemic tissue repair.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 2. NAD+
('bbbbbbbb-0000-0000-0000-000000000002',
 'NAD+',
 'nad-plus',
 'Nicotinamide Adenine Dinucleotide 500mg',
 'Longevity/Energy',
 array['longevity','energy','mitochondria','anti-aging','cellular repair'],
 'NAD+ is a critical coenzyme found in every cell of the body that declines significantly with age. Supplementing with NAD+ restores cellular energy production, activates longevity pathways (sirtuins), and supports DNA repair — one of the most foundational anti-aging interventions available.',
 '~1-2 hours (intravenous); longer tissue retention',
 'Ongoing — 2-3x weekly',
 'Serves as essential coenzyme in redox reactions, activates SIRT1/PARP longevity enzymes, supports mitochondrial biogenesis, promotes DNA repair, and modulates circadian rhythm through NAMPT pathway.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 3. CJC-1295 / Ipamorelin Blend
('bbbbbbbb-0000-0000-0000-000000000003',
 'CJC-1295 / Ipamorelin Blend',
 'cjc-ipa-blend-cap',
 'CJC-1295 + Ipamorelin Combo 5mg+5mg',
 'GH Optimization/Recovery',
 array['growth hormone','sleep','recovery','body composition','anti-aging','GH'],
 'Our signature CJC-1295/Ipamorelin blend delivers 5mg of each peptide in a single vial for the gold standard of growth hormone optimization. CJC-1295 extends GH release duration while Ipamorelin triggers clean GH pulses — together producing optimal GH levels without cortisol or prolactin elevation.',
 'CJC-1295: ~8 days; Ipamorelin: ~2 hours',
 '3 months on, 1 month off',
 'CJC-1295 binds GHRH receptors with extended half-life via DAC technology; Ipamorelin selectively agonizes ghrelin receptors for clean GH pulses with minimal off-target effects.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 4. Tesamorelin
('bbbbbbbb-0000-0000-0000-000000000004',
 'Tesamorelin',
 'tesamorelin',
 'Tesamorelin GHRH Analog 10mg',
 'GH Optimization/Body Composition',
 array['GH','visceral fat','body composition','muscle','anti-aging'],
 'Tesamorelin is an FDA-approved synthetic analog of growth hormone-releasing hormone (GHRH) that specifically targets visceral (belly) fat reduction while promoting lean muscle mass. It is one of the most clinically validated peptides for body composition improvement.',
 '~26-38 minutes',
 '3-6 months continuous',
 'Binds GHRH receptors in the pituitary to stimulate GH secretion in a pulsatile, physiologic manner. Specifically reduces visceral adipose tissue through GH-mediated lipolysis without significantly affecting subcutaneous fat or blood glucose.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 5. Retatrutide 10mg
('bbbbbbbb-0000-0000-0000-000000000005',
 'Retatrutide 10mg',
 'retatrutide-10mg',
 'Retatrutide Triple Agonist 10mg Vial',
 'Metabolic/Weight Management',
 array['weight loss','GLP-1','GIP','glucagon','metabolic','fat loss'],
 'Retatrutide is a next-generation triple agonist targeting GLP-1, GIP, and glucagon receptors simultaneously — delivering superior fat loss compared to any single or dual agonist. Clinical trials show average weight loss of 24% body weight, outperforming semaglutide and tirzepatide.',
 '~6 days',
 'Continuous with gradual dose titration over 6-12 months',
 'Simultaneously activates GLP-1 receptors (appetite suppression), GIP receptors (enhanced insulin response), and glucagon receptors (increased energy expenditure and fat mobilization). The triple agonism produces additive and synergistic metabolic effects.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 6. Retatrutide 60mg
('bbbbbbbb-0000-0000-0000-000000000006',
 'Retatrutide 60mg',
 'retatrutide-60mg',
 'Retatrutide Triple Agonist 60mg Vial',
 'Metabolic/Weight Management',
 array['weight loss','GLP-1','GIP','glucagon','metabolic','fat loss','extended'],
 'Our 60mg Retatrutide vial provides an extended supply for clients established on their maintenance dose. Same next-generation triple agonist formula targeting GLP-1, GIP, and glucagon receptors — in a larger format for extended use and fewer reconstitutions.',
 '~6 days',
 'Long-term maintenance after titration',
 'Same mechanism as Retatrutide 10mg: triple agonism of GLP-1, GIP, and glucagon receptors for superior metabolic and weight management outcomes. Designed for clients who have completed titration and are on stable maintenance dosing.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 7. Glow Blend
('bbbbbbbb-0000-0000-0000-000000000007',
 'Glow Blend',
 'glow-blend',
 'GHK-Cu + BPC-157 + TB-500 Skin & Repair Blend',
 'Anti-Aging/Skin',
 array['anti-aging','collagen','skin','hair','healing','regeneration'],
 'Glow Blend combines GHK-Cu (50mg), BPC-157 (10mg), and TB-500 (10mg) for comprehensive skin rejuvenation and tissue repair. GHK-Cu stimulates collagen synthesis and activates regenerative genes; BPC-157 and TB-500 accelerate tissue repair and reduce inflammation for a multi-target anti-aging effect.',
 'GHK-Cu: ~30-60 min; BPC-157: ~4 hours; TB-500: ~2-3 days',
 '8-12 weeks',
 'GHK-Cu activates over 4,000 regenerative genes and stimulates collagen production; BPC-157 promotes angiogenesis and wound healing; TB-500 reduces inflammation and mobilizes stem cells. Combined, they address aging at the cellular, structural, and vascular levels.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 8. Klow Blend
('bbbbbbbb-0000-0000-0000-000000000008',
 'Klow Blend',
 'klow-blend',
 'GHK-Cu + BPC-157 + TB-500 + KPV Longevity Blend',
 'Longevity/Anti-Inflammatory',
 array['longevity','anti-aging','anti-inflammatory','gut','skin','healing'],
 'Klow Blend adds KPV (10mg) to the Glow Blend formula — creating the ultimate longevity and anti-inflammatory stack with GHK-Cu (50mg), BPC-157 (10mg), TB-500 (10mg), and KPV (10mg). KPV brings powerful gut-protective and systemic anti-inflammatory action to complement the regenerative effects of the other three peptides.',
 'Multiple peptides — range from 30 minutes to 3 days',
 '8-12 weeks',
 'Combines the regenerative genetics activation of GHK-Cu, local tissue repair of BPC-157, systemic mobilization of TB-500, and the NF-kB inhibiting anti-inflammatory power of KPV for comprehensive longevity support.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 9. GHK-Cu 100mg
('bbbbbbbb-0000-0000-0000-000000000009',
 'GHK-Cu 100mg',
 'ghk-cu-100mg',
 'Copper Peptide GHK-Cu 100mg Standalone',
 'Anti-Aging/Tissue Remodeling',
 array['collagen','anti-aging','skin','hair','wound healing','genes'],
 'Our 100mg standalone GHK-Cu vial delivers the highest concentration copper peptide available for intensive anti-aging and tissue remodeling protocols. GHK-Cu is one of the most researched anti-aging compounds — it declines 60% from age 20 to 60 — and replacement dramatically upregulates regenerative gene expression.',
 '~30-60 minutes',
 '8-12 weeks continuous',
 'Activates over 4,000 human genes involved in tissue regeneration, stimulates collagen, elastin, and glycosaminoglycan synthesis, promotes angiogenesis, reduces oxidative stress, and activates antioxidant enzymes through copper chelation.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 10. MOTS-C 10mg
('bbbbbbbb-0000-0000-0000-000000000010',
 'MOTS-C 10mg',
 'mots-c-10mg',
 'Mitochondrial Open Reading Frame Peptide C 10mg',
 'Metabolic/Performance',
 array['mitochondria','energy','exercise','insulin','metabolic'],
 'MOTS-C is a mitochondria-derived peptide that acts as a metabolic regulator — improving insulin sensitivity, increasing fat utilization, and enhancing exercise performance. It communicates between mitochondria and the nucleus to coordinate whole-body metabolic adaptation.',
 '~3-4 hours',
 '8-12 weeks',
 'Activates AMPK pathway to improve insulin sensitivity and glucose uptake, inhibits the folate cycle to redirect cellular resources toward fat oxidation, and upregulates genes involved in mitochondrial biogenesis and exercise adaptation.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs'),

-- 11. BPC-157 10mg
('bbbbbbbb-0000-0000-0000-000000000011',
 'BPC-157 10mg',
 'bpc-157-10mg',
 'Body Protection Compound 157 — 10mg Standalone',
 'Musculoskeletal/GI',
 array['healing','gut','tendon','ligament','anti-inflammatory','recovery'],
 'Our 10mg standalone BPC-157 vial is double the standard dose for clients who require higher concentrations for serious injuries, post-surgical recovery, or intensive GI healing protocols. BPC-157 is one of the most versatile healing peptides, effective for tendons, ligaments, muscle, nerves, and GI tissue.',
 '~4 hours',
 '4-12 weeks on, 4 weeks off',
 'Upregulates growth hormone receptors at injury sites, promotes angiogenesis, modulates nitric oxide pathways, accelerates tendon-to-bone healing, and acts as a cytoprotective agent for GI mucosa through multiple complementary mechanisms.',
 false, true, 'subcutaneous', true, 'CA Peptide Labs');


-- ============================================================
-- SECTION 4: INSERT PEPTIDE DOSING FOR TIER 1 PEPTIDES
-- ============================================================

insert into peptide_dosing (peptide_id, period, dose, notes, sort_order) values
-- Wolverine Blend
('bbbbbbbb-0000-0000-0000-000000000001', 'Loading (Weeks 1-4)', '250 mcg/day', 'Inject subcutaneously near injury site or abdomen', 0),
('bbbbbbbb-0000-0000-0000-000000000001', 'Standard (Weeks 5+)', '500 mcg/day', 'Once daily subcutaneous', 1),
-- NAD+
('bbbbbbbb-0000-0000-0000-000000000002', 'Starting Protocol', '500 mg, 2x/week', 'Subcutaneous injection; IV push optional for faster onset', 0),
('bbbbbbbb-0000-0000-0000-000000000002', 'Maintenance', '500 mg, 3x/week', 'Increase frequency as tolerated', 1),
-- CJC/Ipa Blend
('bbbbbbbb-0000-0000-0000-000000000003', 'Standard Protocol', '100 mcg/100 mcg per peptide', 'Inject at bedtime on empty stomach, 5x per week', 0),
('bbbbbbbb-0000-0000-0000-000000000003', 'Enhanced Protocol', '200 mcg/200 mcg per peptide', 'For advanced users, nightly dosing', 1),
-- Tesamorelin
('bbbbbbbb-0000-0000-0000-000000000004', 'Standard Dose', '1 mg/day', 'Subcutaneous injection in the morning on empty stomach', 0),
('bbbbbbbb-0000-0000-0000-000000000004', 'Extended Protocol', '2 mg/day', 'For significant body composition goals, with medical oversight', 1),
-- Retatrutide 10mg
('bbbbbbbb-0000-0000-0000-000000000005', 'Titration Week 1-4', '0.5 mg/week', 'Subcutaneous injection once weekly', 0),
('bbbbbbbb-0000-0000-0000-000000000005', 'Titration Week 5-8', '1 mg/week', 'Increase as tolerated', 1),
('bbbbbbbb-0000-0000-0000-000000000005', 'Titration Week 9-12', '2 mg/week', 'Target dose for most clients', 2),
-- Retatrutide 60mg
('bbbbbbbb-0000-0000-0000-000000000006', 'Maintenance Dose', '2-4 mg/week', 'Subcutaneous injection once weekly, once established on titration', 0),
-- Glow Blend
('bbbbbbbb-0000-0000-0000-000000000007', 'Starting Dose', '2 mg/day', 'Subcutaneous injection daily', 0),
('bbbbbbbb-0000-0000-0000-000000000007', 'Standard Dose', '3 mg/day', 'After first month, increase to full dose', 1),
-- Klow Blend
('bbbbbbbb-0000-0000-0000-000000000008', 'Starting Dose', '2 mg/day', 'Subcutaneous injection daily', 0),
('bbbbbbbb-0000-0000-0000-000000000008', 'Standard Dose', '3 mg/day', 'After first month, increase to full dose', 1),
-- GHK-Cu 100mg
('bbbbbbbb-0000-0000-0000-000000000009', 'Standard Dose', '2 mg/day', 'Subcutaneous injection daily', 0),
('bbbbbbbb-0000-0000-0000-000000000009', 'Intensive Dose', '3 mg/day', 'For advanced anti-aging protocols', 1),
-- MOTS-C 10mg
('bbbbbbbb-0000-0000-0000-000000000010', 'Standard Protocol', '10 mg, 2x/week', 'Subcutaneous injection twice weekly', 0),
('bbbbbbbb-0000-0000-0000-000000000010', 'Performance Protocol', '10 mg, 3x/week', 'Increase frequency for performance goals', 1),
-- BPC-157 10mg
('bbbbbbbb-0000-0000-0000-000000000011', 'Loading (Weeks 1-4)', '500 mcg/day', 'Near injury site or abdomen subcutaneous', 0),
('bbbbbbbb-0000-0000-0000-000000000011', 'Maintenance', '250 mcg/day', 'Continue at reduced dose', 1);


-- ============================================================
-- SECTION 5: INSERT PEPTIDE BENEFITS FOR TIER 1 PEPTIDES
-- ============================================================

insert into peptide_benefits (peptide_id, benefit_text, sort_order) values
-- Wolverine Blend
('bbbbbbbb-0000-0000-0000-000000000001', 'Accelerates healing of tendons, ligaments, and muscles', 0),
('bbbbbbbb-0000-0000-0000-000000000001', 'Reduces inflammation at injury sites and systemically', 1),
('bbbbbbbb-0000-0000-0000-000000000001', 'Promotes new blood vessel formation for tissue repair', 2),
('bbbbbbbb-0000-0000-0000-000000000001', 'Mobilizes stem cells to sites of injury', 3),
('bbbbbbbb-0000-0000-0000-000000000001', 'Heals GI tissue and gut lining', 4),
-- NAD+
('bbbbbbbb-0000-0000-0000-000000000002', 'Restores cellular energy production (ATP)', 0),
('bbbbbbbb-0000-0000-0000-000000000002', 'Activates sirtuin longevity proteins (SIRT1, SIRT3)', 1),
('bbbbbbbb-0000-0000-0000-000000000002', 'Supports DNA repair mechanisms', 2),
('bbbbbbbb-0000-0000-0000-000000000002', 'Improves cognitive clarity and mental energy', 3),
('bbbbbbbb-0000-0000-0000-000000000002', 'Enhances exercise performance and recovery', 4),
-- CJC/Ipa Blend
('bbbbbbbb-0000-0000-0000-000000000003', 'Optimizes growth hormone levels naturally', 0),
('bbbbbbbb-0000-0000-0000-000000000003', 'Dramatically improves deep sleep quality', 1),
('bbbbbbbb-0000-0000-0000-000000000003', 'Supports lean muscle building and fat loss', 2),
('bbbbbbbb-0000-0000-0000-000000000003', 'Improves skin elasticity and collagen production', 3),
('bbbbbbbb-0000-0000-0000-000000000003', 'Accelerates injury and surgical recovery', 4),
-- Tesamorelin
('bbbbbbbb-0000-0000-0000-000000000004', 'FDA-approved reduction in visceral (belly) fat', 0),
('bbbbbbbb-0000-0000-0000-000000000004', 'Supports lean muscle mass preservation and growth', 1),
('bbbbbbbb-0000-0000-0000-000000000004', 'Improves body composition without blood sugar impact', 2),
('bbbbbbbb-0000-0000-0000-000000000004', 'Enhances exercise performance through GH optimization', 3),
-- Retatrutide 10mg
('bbbbbbbb-0000-0000-0000-000000000005', 'Superior weight loss — average 24% body weight in trials', 0),
('bbbbbbbb-0000-0000-0000-000000000005', 'Triple receptor agonism for maximum metabolic effect', 1),
('bbbbbbbb-0000-0000-0000-000000000005', 'Improves insulin sensitivity and blood sugar control', 2),
('bbbbbbbb-0000-0000-0000-000000000005', 'Reduces appetite and increases satiety between meals', 3),
('bbbbbbbb-0000-0000-0000-000000000005', 'Increases metabolic rate through glucagon receptor activation', 4),
-- Retatrutide 60mg
('bbbbbbbb-0000-0000-0000-000000000006', 'Extended supply for established maintenance dosing', 0),
('bbbbbbbb-0000-0000-0000-000000000006', 'Same triple agonist benefits as 10mg vial', 1),
('bbbbbbbb-0000-0000-0000-000000000006', 'Fewer reconstitutions for long-term clients', 2),
-- Glow Blend
('bbbbbbbb-0000-0000-0000-000000000007', 'Stimulates collagen and elastin production for firmer skin', 0),
('bbbbbbbb-0000-0000-0000-000000000007', 'Activates over 4,000 regenerative genes (GHK-Cu)', 1),
('bbbbbbbb-0000-0000-0000-000000000007', 'Reduces fine lines, wrinkles, and skin laxity', 2),
('bbbbbbbb-0000-0000-0000-000000000007', 'Promotes thicker, stronger hair and nails', 3),
('bbbbbbbb-0000-0000-0000-000000000007', 'Accelerates skin and tissue healing', 4),
-- Klow Blend
('bbbbbbbb-0000-0000-0000-000000000008', 'All benefits of Glow Blend plus systemic anti-inflammation', 0),
('bbbbbbbb-0000-0000-0000-000000000008', 'KPV reduces gut inflammation and supports IBD', 1),
('bbbbbbbb-0000-0000-0000-000000000008', 'Comprehensive longevity and regeneration support', 2),
('bbbbbbbb-0000-0000-0000-000000000008', 'Reduces inflammatory cytokines throughout the body', 3),
-- GHK-Cu 100mg
('bbbbbbbb-0000-0000-0000-000000000009', 'Highest concentration collagen stimulation available', 0),
('bbbbbbbb-0000-0000-0000-000000000009', 'Activates stem cell and regenerative gene pathways', 1),
('bbbbbbbb-0000-0000-0000-000000000009', 'Significantly reduces fine lines and improves skin texture', 2),
('bbbbbbbb-0000-0000-0000-000000000009', 'Promotes hair follicle stimulation and growth', 3),
('bbbbbbbb-0000-0000-0000-000000000009', 'Powerful antioxidant via copper chelation', 4),
-- MOTS-C 10mg
('bbbbbbbb-0000-0000-0000-000000000010', 'Dramatically improves insulin sensitivity', 0),
('bbbbbbbb-0000-0000-0000-000000000010', 'Increases fat burning and metabolic efficiency', 1),
('bbbbbbbb-0000-0000-0000-000000000010', 'Enhances exercise capacity and endurance', 2),
('bbbbbbbb-0000-0000-0000-000000000010', 'Supports mitochondrial health and energy production', 3),
-- BPC-157 10mg
('bbbbbbbb-0000-0000-0000-000000000011', 'High-dose healing for serious injuries and post-surgical recovery', 0),
('bbbbbbbb-0000-0000-0000-000000000011', 'Accelerates tendon, ligament, and muscle repair', 1),
('bbbbbbbb-0000-0000-0000-000000000011', 'Reduces pain and inflammation at injury sites', 2),
('bbbbbbbb-0000-0000-0000-000000000011', 'Heals GI ulcers, leaky gut, and IBD', 3),
('bbbbbbbb-0000-0000-0000-000000000011', 'Protects and regenerates nerve tissue', 4);


-- ============================================================
-- SECTION 6: INSERT PEPTIDE RECON FOR TIER 1 PEPTIDES
-- ============================================================

insert into peptide_recon (peptide_id, vial_size_display, default_vial_mg, default_bac_ml, default_dose_mcg, concentration_display, unit_calc_display, dose_range_display, timing_display, cycle_length_display, storage_instructions, reconstitution_steps, vials_needed_display) values

('bbbbbbbb-0000-0000-0000-000000000001',
 'BPC-157 10mg + TB-500 10mg combo vial', 10, 2, 250,
 '5 mg/mL (each peptide)',
 '10 units on U-100 syringe = 250 mcg each peptide',
 '250–500 mcg/day',
 'Once daily subcutaneous',
 '4–8 weeks',
 'Refrigerate after reconstitution. Use within 30 days. Keep away from light.',
 array['Reconstitute with 2 mL bacteriostatic water', 'Inject water slowly down the vial wall — do not spray on the powder', 'Gently swirl — do not shake or vortex', 'Let sit 2 minutes until fully dissolved', 'Refrigerate immediately at 35–46°F'],
 '~1-2 vials per month'),

('bbbbbbbb-0000-0000-0000-000000000002',
 '500 mg vial', 500, 5, 500000,
 '100 mg/mL',
 '0.05 mL = 500 mg dose on 1 mL syringe',
 '500 mg per injection',
 '2–3 times per week',
 'Ongoing',
 'Refrigerate reconstituted vial. Use within 30 days. Protect from light and heat.',
 array['Reconstitute with 5 mL bacteriostatic water', 'Inject water slowly down the vial wall', 'Gently swirl until fully dissolved — do not shake', 'Refrigerate immediately', 'Draw 0.05 mL for a 500 mg dose'],
 '~1 vial per month (2x/week dosing)'),

('bbbbbbbb-0000-0000-0000-000000000003',
 '5 mg CJC + 5 mg Ipamorelin combo vial', 5, 2, 200,
 '2.5 mg/mL each peptide',
 '8 units on U-100 syringe = 200 mcg each peptide',
 '100–200 mcg each peptide',
 'Bedtime, 5x per week on empty stomach',
 '3 months on, 1 month off',
 'Refrigerate reconstituted vial. Use within 30 days. Keep away from light.',
 array['Reconstitute with 2 mL bacteriostatic water', 'Inject water slowly down the vial wall', 'Gently swirl — do not shake or vortex', 'Let sit 2 minutes until fully dissolved', 'Refrigerate immediately'],
 '~2–3 vials per month'),

('bbbbbbbb-0000-0000-0000-000000000004',
 '10 mg vial', 10, 2, 1000,
 '5 mg/mL',
 '20 units on U-100 syringe = 1 mg',
 '1–2 mg/day',
 'Morning on empty stomach',
 '3–6 months continuous',
 'Refrigerate after reconstitution. Use within 30 days. Do not freeze.',
 array['Reconstitute with 2 mL bacteriostatic water', 'Inject water slowly down the vial wall', 'Gently swirl until dissolved — do not shake', 'Refrigerate immediately at 35–46°F', 'Draw 20 units on U-100 syringe for 1 mg dose'],
 '~1 vial per 10 days (1mg/day)'),

('bbbbbbbb-0000-0000-0000-000000000005',
 '10 mg vial', 10, 1, 500,
 '10 mg/mL',
 '5 units on U-100 syringe = 0.5 mg',
 '0.5–4 mg/week',
 'Once weekly subcutaneous injection',
 '6–12 months titration + maintenance',
 'Refrigerate after reconstitution. Use within 28 days. Do not freeze or shake.',
 array['Reconstitute with 1 mL bacteriostatic water', 'Inject water slowly down the vial wall', 'Gently swirl — do not shake', 'Let sit 2 minutes until fully dissolved', 'Refrigerate immediately', 'Draw the appropriate volume for your weekly dose'],
 '~1 vial per 2–3 months (titration phase)'),

('bbbbbbbb-0000-0000-0000-000000000006',
 '60 mg vial', 60, 6, 2000,
 '10 mg/mL',
 '20 units on U-100 syringe = 2 mg',
 '2–4 mg/week',
 'Once weekly subcutaneous injection',
 'Long-term maintenance',
 'Refrigerate after reconstitution. Use within 28 days. Do not freeze or shake.',
 array['Reconstitute with 6 mL bacteriostatic water', 'Inject water slowly down the vial wall — add in 2 mL increments', 'Gently swirl between additions — do not shake', 'Let sit until fully dissolved', 'Refrigerate immediately', 'Draw appropriate volume for weekly maintenance dose'],
 '~1 vial per 3–4 months (maintenance)'),

('bbbbbbbb-0000-0000-0000-000000000007',
 'GHK-Cu 50mg + BPC-157 10mg + TB-500 10mg combo vial', 50, 5, 2000,
 '10 mg/mL GHK-Cu; 2 mg/mL BPC+TB each',
 '20 units on U-100 syringe ≈ 2 mg blend',
 '2–3 mg/day (blend)',
 'Once daily subcutaneous',
 '8–12 weeks',
 'Refrigerate after reconstitution. Use within 30 days. Protect from light — GHK-Cu is light sensitive.',
 array['Reconstitute with 5 mL bacteriostatic water', 'Inject water slowly down the vial wall', 'Gently swirl until fully dissolved — do not shake', 'Wrap vial in foil or store in dark bag to protect GHK-Cu from light', 'Refrigerate immediately at 35–46°F'],
 '~1 vial per 25 days (2mg/day)'),

('bbbbbbbb-0000-0000-0000-000000000008',
 'GHK-Cu 50mg + BPC-157 10mg + TB-500 10mg + KPV 10mg combo vial', 50, 5, 2000,
 '10 mg/mL GHK-Cu; 2 mg/mL each other',
 '20 units on U-100 syringe ≈ 2 mg blend',
 '2–3 mg/day (blend)',
 'Once daily subcutaneous',
 '8–12 weeks',
 'Refrigerate after reconstitution. Use within 30 days. Protect from light.',
 array['Reconstitute with 5 mL bacteriostatic water', 'Inject water slowly down the vial wall', 'Gently swirl until fully dissolved — do not shake', 'Wrap vial in foil or store in dark bag to protect GHK-Cu from light', 'Refrigerate immediately at 35–46°F'],
 '~1 vial per 25 days (2mg/day)'),

('bbbbbbbb-0000-0000-0000-000000000009',
 '100 mg vial', 100, 10, 2000,
 '10 mg/mL',
 '20 units on U-100 syringe = 2 mg',
 '2–3 mg/day',
 'Once daily subcutaneous',
 '8–12 weeks continuous',
 'Refrigerate after reconstitution. Use within 30 days. Store in dark — GHK-Cu degrades with light exposure.',
 array['Reconstitute with 10 mL bacteriostatic water', 'Inject water slowly down the vial wall in 2 mL increments', 'Gently swirl between additions — do not shake', 'Wrap in foil or dark bag to protect from light', 'Refrigerate immediately at 35–46°F'],
 '~1 vial per 33 days (3mg/day)'),

('bbbbbbbb-0000-0000-0000-000000000010',
 '10 mg vial', 10, 1, 10000,
 '10 mg/mL',
 '100 units on U-100 syringe = 10 mg (or use 1 mL syringe)',
 '10 mg per injection',
 '2–3 times per week subcutaneous',
 '8–12 weeks',
 'Refrigerate after reconstitution. Use within 30 days. Do not freeze.',
 array['Reconstitute with 1 mL bacteriostatic water', 'Inject water slowly down the vial wall', 'Gently swirl until fully dissolved — do not shake', 'Refrigerate immediately', 'Draw full 1 mL for 10 mg dose (or use insulin syringe: 100 units = 10 mg)'],
 '~1 vial per injection (10mg/injection)'),

('bbbbbbbb-0000-0000-0000-000000000011',
 '10 mg vial', 10, 2, 500,
 '5 mg/mL',
 '10 units on U-100 syringe = 500 mcg',
 '250–500 mcg/day',
 'Once daily subcutaneous near injury or abdomen',
 '4–12 weeks',
 'Refrigerate after reconstitution. Use within 30 days. Keep away from light and heat.',
 array['Reconstitute with 2 mL bacteriostatic water', 'Inject water slowly down the vial wall — do not spray on powder', 'Gently swirl — do not shake or vortex', 'Let sit 2 minutes until fully dissolved', 'Refrigerate immediately at 35–46°F'],
 '~1–2 vials per month');


-- ============================================================
-- SECTION 7: INSERT SIGNATURE STACK PROTOCOLS
-- ============================================================

insert into protocols (id, condition_name, slug, category, primary_peptide, adjunct_peptides, cycle_intro, clinical_notes, is_active, is_featured, tagline) values

('cccccccc-0000-0000-0000-000000000001',
 'Anti-Aging, Skin & Hair',
 'anti-aging-skin-hair',
 'Signature Stack',
 'Glow Blend',
 array['GHK-Cu 100mg', 'NAD+'],
 'This signature stack targets the most visible and felt signs of aging — skin quality, hair strength, and cellular energy. The combination of our proprietary Glow Blend, high-concentration GHK-Cu, and NAD+ addresses aging at the structural (collagen), genetic (regenerative genes), and cellular energy (mitochondrial) levels simultaneously.',
 'GHK-Cu is light-sensitive — advise clients to store reconstituted vials wrapped in foil. Monitor for injection site reactions with daily dosing. NAD+ injections may cause mild flushing — normal and transient. Results typically visible at 6-8 weeks for skin, 10-12 weeks for hair changes.',
 true, true,
 'Reduce fine lines and wrinkles, improve skin texture, strengthen hair and nails, restore a youthful glow'),

('cccccccc-0000-0000-0000-000000000002',
 'Recovery & Performance',
 'recovery-performance',
 'Signature Stack',
 'Wolverine Blend',
 array['CJC-1295 / Ipamorelin Blend', 'MOTS-C 10mg'],
 'The Recovery & Performance stack accelerates healing from injury, reduces inflammation, and optimizes growth hormone for superior recovery. Wolverine Blend provides direct tissue repair, CJC-1295/Ipamorelin optimizes GH for systemic recovery and sleep, and MOTS-C enhances metabolic efficiency and exercise adaptation.',
 'Inject Wolverine Blend as close to the injury site as safely possible for localized effect. CJC/Ipa must be injected on an empty stomach (no food 2 hours prior or 30 min after). MOTS-C added in Month 2 when base healing is established. Monitor energy levels — some clients report significant energy increase in Month 2.',
 true, true,
 'Heal faster from injury, reduce inflammation, improve mobility and bounce back stronger'),

('cccccccc-0000-0000-0000-000000000003',
 'Weight Loss & Metabolic Health',
 'weight-loss-metabolic',
 'Signature Stack',
 'Retatrutide 10mg',
 array['NAD+', 'CJC-1295 / Ipamorelin Blend'],
 'The Weight Loss & Metabolic stack combines the most powerful fat loss peptide available (Retatrutide) with cellular energy restoration (NAD+) and GH optimization (CJC/Ipa). This triple approach addresses fat loss through appetite suppression, metabolic rate increase, and GH-mediated lipolysis simultaneously.',
 'Retatrutide titration is critical — do not rush the dose increase. GI side effects (nausea, loose stools) are common in the first 4 weeks and resolve with proper titration. NAD+ may cause temporary injection site discomfort. CJC/Ipa added in Month 2 after GI adaptation. Track weight weekly and adjust if loss exceeds 2 lbs/week.',
 true, true,
 'Support fat loss, improve energy, balance blood sugar and metabolism'),

('cccccccc-0000-0000-0000-000000000004',
 'Muscle & Build',
 'muscle-build',
 'Signature Stack',
 'CJC-1295 / Ipamorelin Blend',
 array['Tesamorelin', 'MOTS-C 10mg', 'Wolverine Blend'],
 'The Muscle & Build stack is designed for clients seeking lean muscle development, improved body composition, and performance enhancement. Starting with GH optimization and visceral fat reduction, then layering in metabolic enhancement and tissue repair support — each month adds another anabolic and recovery mechanism.',
 'CJC/Ipa and Tesamorelin must both be injected fasted for maximum GH response. Avoid combining with high-carb meals within 1 hour of injection. Tesamorelin is best in the morning; CJC/Ipa at bedtime. MOTS-C works synergistically with exercise — time injections 2-4 hours before training when possible. Wolverine Blend added in Month 3 for connective tissue support during increased training load.',
 true, true,
 'Build lean muscle, improve body composition, increase strength and performance'),

('cccccccc-0000-0000-0000-000000000005',
 'Longevity',
 'longevity-stack',
 'Signature Stack',
 'NAD+',
 array['Klow Blend', 'GHK-Cu 100mg'],
 'The Longevity stack is our most comprehensive cellular renewal protocol — addressing energy (NAD+), regeneration and inflammation (Klow Blend), and structural repair (GHK-Cu 100mg). It targets the three core mechanisms of biological aging: mitochondrial dysfunction, chronic inflammation, and collagen/tissue decline.',
 'NAD+ injections may cause brief flushing or warmth — normal and subsides with repeated dosing. Klow Blend contains GHK-Cu which is light-sensitive — wrap in foil. GHK-Cu 100mg added in Month 2 for intensified collagen and regenerative gene activation. Consider ordering baseline inflammatory markers (CRP, IL-6) before starting to track objective improvement at 3 months.',
 true, true,
 'Support immune function, brain health, cellular repair and long-term vitality');


-- ============================================================
-- SECTION 8: INSERT PROTOCOL MONTHS FOR SIGNATURE STACKS
-- ============================================================

insert into protocol_months (id, protocol_id, month_number, title, clinical_note, sort_order) values

-- Stack 1: Anti-Aging, Skin & Hair
('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 1, 'Foundation — Activate & Stimulate', 'Begin with conservative doses to assess tolerance. Some clients notice skin hydration improvement in weeks 2-3. Monitor injection sites for reaction.', 0),
('dddddddd-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 2, 'Intensify — Full Protocol Dose', 'Increase to full protocol doses. Most clients report visible skin improvements by now. Hair changes begin around week 8-10.', 1),
('dddddddd-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000001', 3, 'Maintenance — Sustain Results', 'Continue full doses to consolidate and maintain results. Consider repeat 3-month cycle after 4 weeks off.', 2),

-- Stack 2: Recovery & Performance
('dddddddd-0000-0000-0000-000000000004', 'cccccccc-0000-0000-0000-000000000002', 1, 'Injury Focus — Direct Repair', 'Prioritize Wolverine Blend near injury site. GH optimization begins immediately for systemic recovery support.', 0),
('dddddddd-0000-0000-0000-000000000005', 'cccccccc-0000-0000-0000-000000000002', 2, 'Layering — Full Stack Activation', 'Increase Wolverine dose and add MOTS-C for metabolic and exercise adaptation. Most clients report significant mobility improvement.', 1),
('dddddddd-0000-0000-0000-000000000006', 'cccccccc-0000-0000-0000-000000000002', 3, 'Maintenance — Lock In Performance', 'Maintain all doses. Focus shifts from acute healing to performance optimization and injury prevention.', 2),

-- Stack 3: Weight Loss & Metabolic Health
('dddddddd-0000-0000-0000-000000000007', 'cccccccc-0000-0000-0000-000000000003', 1, 'Titration — Establish Tolerance', 'Start Retatrutide at lowest dose. NAD+ restores energy as caloric deficit begins. GI adaptation phase — mild nausea is normal.', 0),
('dddddddd-0000-0000-0000-000000000008', 'cccccccc-0000-0000-0000-000000000003', 2, 'Acceleration — Add GH Optimization', 'Increase Retatrutide to 1mg and add CJC/Ipa for GH-mediated fat loss. Most significant fat loss month.', 1),
('dddddddd-0000-0000-0000-000000000009', 'cccccccc-0000-0000-0000-000000000003', 3, 'Full Protocol — Target Dose', 'Retatrutide at 2mg — maximum fat loss effect. Continue NAD+ and CJC/Ipa to preserve muscle during weight loss.', 2),

-- Stack 4: Muscle & Build
('dddddddd-0000-0000-0000-000000000010', 'cccccccc-0000-0000-0000-000000000004', 1, 'GH Foundation — Optimize & Prime', 'Establish GH optimization with CJC/Ipa and Tesamorelin. Begin visceral fat reduction and GH pulse optimization.', 0),
('dddddddd-0000-0000-0000-000000000011', 'cccccccc-0000-0000-0000-000000000004', 2, 'Metabolic Boost — Add MOTS-C', 'Layer in MOTS-C for insulin sensitivity and exercise adaptation. Training performance typically increases noticeably this month.', 1),
('dddddddd-0000-0000-0000-000000000012', 'cccccccc-0000-0000-0000-000000000004', 3, 'Full Stack — Add Connective Tissue Support', 'Add Wolverine Blend for connective tissue repair under increased training load. Full anabolic stack now active.', 2),

-- Stack 5: Longevity
('dddddddd-0000-0000-0000-000000000013', 'cccccccc-0000-0000-0000-000000000005', 1, 'Cellular Reset — Energy & Inflammation', 'NAD+ restores mitochondrial energy. Klow Blend begins systemic anti-inflammatory and regenerative action.', 0),
('dddddddd-0000-0000-0000-000000000014', 'cccccccc-0000-0000-0000-000000000005', 2, 'Intensify — Add Structural Repair', 'Add GHK-Cu 100mg for intensive collagen and regenerative gene activation. Full longevity protocol active.', 1),
('dddddddd-0000-0000-0000-000000000015', 'cccccccc-0000-0000-0000-000000000005', 3, 'Maintenance — Sustain Longevity Gains', 'Continue all three at full doses. Consider inflammatory marker testing (CRP, IL-6) to document objective improvements.', 2);


-- ============================================================
-- SECTION 9: INSERT PROTOCOL MONTH ROWS
-- ============================================================

insert into protocol_month_rows (id, month_id, peptide_name, dose, schedule, sort_order) values

-- Stack 1 Month 1 (Foundation)
('eeeeeeee-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'Glow Blend', '2 mg', 'SC daily', 0),
('eeeeeeee-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000001', 'GHK-Cu 100mg', '2 mg', 'SC daily', 1),
('eeeeeeee-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000001', 'NAD+', '500 mg', 'SC 2x/week', 2),

-- Stack 1 Month 2 (Intensify)
('eeeeeeee-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000002', 'Glow Blend', '3 mg', 'SC daily', 0),
('eeeeeeee-0000-0000-0000-000000000005', 'dddddddd-0000-0000-0000-000000000002', 'GHK-Cu 100mg', '3 mg', 'SC daily', 1),
('eeeeeeee-0000-0000-0000-000000000006', 'dddddddd-0000-0000-0000-000000000002', 'NAD+', '500 mg', 'SC 3x/week', 2),

-- Stack 1 Month 3 (Maintenance)
('eeeeeeee-0000-0000-0000-000000000007', 'dddddddd-0000-0000-0000-000000000003', 'Glow Blend', '3 mg', 'SC daily', 0),
('eeeeeeee-0000-0000-0000-000000000008', 'dddddddd-0000-0000-0000-000000000003', 'GHK-Cu 100mg', '3 mg', 'SC daily', 1),
('eeeeeeee-0000-0000-0000-000000000009', 'dddddddd-0000-0000-0000-000000000003', 'NAD+', '500 mg', 'SC 3x/week', 2),

-- Stack 2 Month 1 (Injury Focus)
('eeeeeeee-0000-0000-0000-000000000010', 'dddddddd-0000-0000-0000-000000000004', 'Wolverine Blend', '250 mcg', 'SC daily near injury site', 0),
('eeeeeeee-0000-0000-0000-000000000011', 'dddddddd-0000-0000-0000-000000000004', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 1),

-- Stack 2 Month 2 (Layering)
('eeeeeeee-0000-0000-0000-000000000012', 'dddddddd-0000-0000-0000-000000000005', 'Wolverine Blend', '500 mcg', 'SC daily', 0),
('eeeeeeee-0000-0000-0000-000000000013', 'dddddddd-0000-0000-0000-000000000005', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 1),
('eeeeeeee-0000-0000-0000-000000000014', 'dddddddd-0000-0000-0000-000000000005', 'MOTS-C 10mg', '10 mg', 'SC 2x/week', 2),

-- Stack 2 Month 3 (Maintenance)
('eeeeeeee-0000-0000-0000-000000000015', 'dddddddd-0000-0000-0000-000000000006', 'Wolverine Blend', '500 mcg', 'SC daily', 0),
('eeeeeeee-0000-0000-0000-000000000016', 'dddddddd-0000-0000-0000-000000000006', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 1),
('eeeeeeee-0000-0000-0000-000000000017', 'dddddddd-0000-0000-0000-000000000006', 'MOTS-C 10mg', '10 mg', 'SC 2x/week', 2),

-- Stack 3 Month 1 (Titration)
('eeeeeeee-0000-0000-0000-000000000018', 'dddddddd-0000-0000-0000-000000000007', 'Retatrutide 10mg', '0.5 mg', 'SC weekly', 0),
('eeeeeeee-0000-0000-0000-000000000019', 'dddddddd-0000-0000-0000-000000000007', 'NAD+', '500 mg', 'SC 2x/week', 1),

-- Stack 3 Month 2 (Acceleration)
('eeeeeeee-0000-0000-0000-000000000020', 'dddddddd-0000-0000-0000-000000000008', 'Retatrutide 10mg', '1 mg', 'SC weekly', 0),
('eeeeeeee-0000-0000-0000-000000000021', 'dddddddd-0000-0000-0000-000000000008', 'NAD+', '500 mg', 'SC 3x/week', 1),
('eeeeeeee-0000-0000-0000-000000000022', 'dddddddd-0000-0000-0000-000000000008', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 2),

-- Stack 3 Month 3 (Full Protocol)
('eeeeeeee-0000-0000-0000-000000000023', 'dddddddd-0000-0000-0000-000000000009', 'Retatrutide 10mg', '2 mg', 'SC weekly', 0),
('eeeeeeee-0000-0000-0000-000000000024', 'dddddddd-0000-0000-0000-000000000009', 'NAD+', '500 mg', 'SC 3x/week', 1),
('eeeeeeee-0000-0000-0000-000000000025', 'dddddddd-0000-0000-0000-000000000009', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 2),

-- Stack 4 Month 1 (GH Foundation)
('eeeeeeee-0000-0000-0000-000000000026', 'dddddddd-0000-0000-0000-000000000010', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 0),
('eeeeeeee-0000-0000-0000-000000000027', 'dddddddd-0000-0000-0000-000000000010', 'Tesamorelin', '1 mg', 'SC daily AM fasted', 1),

-- Stack 4 Month 2 (Metabolic Boost)
('eeeeeeee-0000-0000-0000-000000000028', 'dddddddd-0000-0000-0000-000000000011', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 0),
('eeeeeeee-0000-0000-0000-000000000029', 'dddddddd-0000-0000-0000-000000000011', 'Tesamorelin', '1 mg', 'SC daily AM fasted', 1),
('eeeeeeee-0000-0000-0000-000000000030', 'dddddddd-0000-0000-0000-000000000011', 'MOTS-C 10mg', '10 mg', 'SC 2x/week', 2),

-- Stack 4 Month 3 (Full Stack)
('eeeeeeee-0000-0000-0000-000000000031', 'dddddddd-0000-0000-0000-000000000012', 'CJC-1295 / Ipamorelin Blend', '200 mcg each', 'SC nightly, fasted', 0),
('eeeeeeee-0000-0000-0000-000000000032', 'dddddddd-0000-0000-0000-000000000012', 'Tesamorelin', '1 mg', 'SC daily AM fasted', 1),
('eeeeeeee-0000-0000-0000-000000000033', 'dddddddd-0000-0000-0000-000000000012', 'MOTS-C 10mg', '10 mg', 'SC 2x/week', 2),
('eeeeeeee-0000-0000-0000-000000000034', 'dddddddd-0000-0000-0000-000000000012', 'Wolverine Blend', '250 mcg', 'SC daily', 3),

-- Stack 5 Month 1 (Cellular Reset)
('eeeeeeee-0000-0000-0000-000000000035', 'dddddddd-0000-0000-0000-000000000013', 'NAD+', '500 mg', 'SC 3x/week', 0),
('eeeeeeee-0000-0000-0000-000000000036', 'dddddddd-0000-0000-0000-000000000013', 'Klow Blend', '2 mg', 'SC daily', 1),

-- Stack 5 Month 2 (Intensify)
('eeeeeeee-0000-0000-0000-000000000037', 'dddddddd-0000-0000-0000-000000000014', 'NAD+', '500 mg', 'SC 3x/week', 0),
('eeeeeeee-0000-0000-0000-000000000038', 'dddddddd-0000-0000-0000-000000000014', 'Klow Blend', '3 mg', 'SC daily', 1),
('eeeeeeee-0000-0000-0000-000000000039', 'dddddddd-0000-0000-0000-000000000014', 'GHK-Cu 100mg', '2 mg', 'SC daily', 2),

-- Stack 5 Month 3 (Maintenance)
('eeeeeeee-0000-0000-0000-000000000040', 'dddddddd-0000-0000-0000-000000000015', 'NAD+', '500 mg', 'SC 3x/week', 0),
('eeeeeeee-0000-0000-0000-000000000041', 'dddddddd-0000-0000-0000-000000000015', 'Klow Blend', '3 mg', 'SC daily', 1),
('eeeeeeee-0000-0000-0000-000000000042', 'dddddddd-0000-0000-0000-000000000015', 'GHK-Cu 100mg', '2 mg', 'SC daily', 2);
