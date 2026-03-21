-- Atlas Engine Seed Data

-- ============================================================
-- Locations
-- ============================================================
insert into locations (id, name, address, city, state, owner_name, owner_email) values
('11111111-0000-0000-0000-000000000001', 'Atlas Health - Beverly Hills', '9400 Brighton Way', 'Beverly Hills', 'CA', 'Dr. Marcus Reed', 'marcus@atlashealth.com'),
('11111111-0000-0000-0000-000000000002', 'Atlas Health - Scottsdale', '7200 E Camelback Rd', 'Scottsdale', 'AZ', 'Dr. Lena Vasquez', 'lena@atlashealth.com');

-- ============================================================
-- Peptides
-- ============================================================
insert into peptides (id, name, slug, full_name, category, tags, summary, half_life, cycle_length, mechanism_of_action, microdose_notes, is_veterinary, is_injectable, route) values
('aaaaaaaa-0000-0000-0000-000000000001', 'BPC-157', 'bpc-157', 'Body Protection Compound 157', 'Musculoskeletal/GI', array['healing','gut','tendon','ligament','anti-inflammatory'], 'BPC-157 is a synthetic peptide derived from a protein found in gastric juice. It accelerates healing of tendons, ligaments, muscles, and GI tissue through multiple pathways including angiogenesis and growth factor upregulation.', '~4 hours', '4–12 weeks on, 4 weeks off', 'Upregulates growth hormone receptors, promotes angiogenesis, modulates nitric oxide systems, and accelerates tendon-to-bone healing. Acts as a cytoprotective agent for GI mucosa.', 'Low doses (100–200 mcg/day) used for maintenance between cycles.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000002', 'TB-500', 'tb-500', 'Thymosin Beta-4 Synthetic Fragment', 'Musculoskeletal/Systemic Repair', array['healing','actin','inflammation','recovery','systemic'], 'TB-500 is a synthetic version of Thymosin Beta-4, a naturally occurring peptide that promotes actin polymerization, reduces inflammation, and enhances systemic tissue repair throughout the body.', '~2–3 days', '4–8 weeks on, 4 weeks off', 'Promotes actin polymerization, upregulates cell-building proteins, reduces pro-inflammatory cytokines, and mobilizes stem cells to sites of injury.', 'Low-dose loading 2–5 mg/week for the first 4 weeks, then 2 mg biweekly.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000003', 'CJC-1295/Ipamorelin', 'cjc-ipamorelin', 'CJC-1295 with Ipamorelin Blend', 'GH Optimization/Recovery', array['growth hormone','sleep','recovery','body composition','anti-aging'], 'A synergistic combination of CJC-1295 (GHRH analog) and Ipamorelin (GHRP), this blend maximizes pulsatile growth hormone release for improved recovery, body composition, and sleep quality.', 'CJC: ~8 days; Ipamorelin: ~2 hours', '3 months on, 1 month off', 'CJC-1295 binds GHRH receptors extending GH release; Ipamorelin selectively stimulates ghrelin receptors for clean GH pulses without cortisol or prolactin elevation.', 'Not typically microdosed — use full dose 5x/week or daily at bedtime.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000004', 'Epitalon', 'epitalon', 'Epithalamin Synthetic Tetrapeptide', 'Longevity/Circadian Reset', array['longevity','telomere','sleep','circadian','anti-aging'], 'Epitalon is a synthetic tetrapeptide that activates telomerase, lengthens telomeres, and regulates melatonin production. It is one of the most studied longevity peptides with decades of Russian research.', '~1–2 hours', '10–20 days, twice yearly', 'Activates telomerase enzyme to extend telomere length, regulates the pineal gland to normalize melatonin production, and exerts antioxidant and anti-tumor effects.', 'Typically used in short intensive cycles, not ongoing microdosing.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000005', 'Thymosin Alpha-1', 'thymosin-alpha-1', 'Thymalfasin (Thymosin Alpha-1)', 'Immune/Autoimmune', array['immune','autoimmune','viral','Lyme','thymus'], 'Thymosin Alpha-1 is a naturally occurring thymic peptide that modulates and enhances immune function. Used clinically in over 35 countries for viral hepatitis, cancer adjunct therapy, and immune deficiency.', '~2 hours', '4–12 weeks depending on indication', 'Stimulates T-cell maturation and differentiation, enhances NK cell activity, upregulates MHC class I expression, and modulates Th1/Th2 balance toward appropriate immune responses.', 'Low maintenance dose of 0.5 mg 2x/week between active cycles.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000006', 'KPV', 'kpv', 'Lysine-Proline-Valine Tripeptide', 'Anti-Inflammatory/GI', array['inflammation','IBD','gut','skin','autoimmune'], 'KPV is a tripeptide fragment of alpha-MSH with potent anti-inflammatory properties. It directly inhibits pro-inflammatory cytokine production and is particularly effective for GI inflammation and IBD.', '~2–4 hours', '4–8 weeks', 'Directly inhibits NF-κB pathway, reduces TNF-α and IL-6 production, and activates melanocortin receptors to suppress inflammation locally and systemically.', 'Can be used continuously at low dose (500 mcg/day) for IBD maintenance.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000007', 'DSIP', 'dsip', 'Delta Sleep-Inducing Peptide', 'Sleep/Stress Modulation', array['sleep','stress','cortisol','delta wave','circadian'], 'DSIP is an endogenous neuropeptide that promotes deep delta-wave sleep, reduces cortisol, and modulates the stress response. It naturally occurs in the hypothalamus and various peripheral tissues.', '~20–30 minutes', '2–4 weeks on, 2 weeks off', 'Induces slow-wave (delta) sleep by modulating hypothalamic activity, reduces basal cortisol and ACTH levels, and normalizes circadian rhythm disruptions.', 'Very low doses (100–200 mcg) taken 30 min before bed.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000008', 'GHK-Cu', 'ghk-cu', 'Copper Peptide GHK-Cu', 'Tissue Remodeling/Anti-Aging', array['collagen','wound healing','anti-aging','skin','hair'], 'GHK-Cu is a naturally occurring copper-binding peptide that declines with age. It stimulates collagen synthesis, promotes wound healing, activates antioxidant genes, and has broad tissue-regenerative effects.', '~30 minutes to 1 hour', '8–12 weeks', 'Activates over 4,000 genes involved in tissue remodeling, stimulates collagen and glycosaminoglycan synthesis, promotes angiogenesis, and acts as a potent antioxidant through copper chelation.', 'Lower doses (500 mcg) used for ongoing skin and collagen maintenance.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000009', 'LL-37', 'll-37', 'Cathelicidin Antimicrobial Peptide LL-37', 'Antimicrobial/Immune', array['antimicrobial','immune','biofilm','infection','Lyme'], 'LL-37 is an endogenous human cathelicidin with broad-spectrum antimicrobial activity. It disrupts bacterial membranes, breaks down biofilms (critical for Lyme/chronic infection), and modulates immune responses.', '~1–2 hours', '4–8 weeks', 'Directly disrupts bacterial and fungal cell membranes, breaks down biofilms that protect chronic pathogens like Borrelia, and activates innate immune pathways including toll-like receptors.', 'Not typically microdosed — used in active infection cycles.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000010', 'AOD-9604', 'aod-9604', 'Anti-Obesity Drug Fragment 9604', 'Metabolic/Fat Loss', array['fat loss','metabolic','lipolysis','weight','GH fragment'], 'AOD-9604 is a modified fragment of human growth hormone (HGH176-191) that stimulates lipolysis and inhibits lipogenesis without affecting blood sugar or IGF-1 levels. TGA-approved in Australia.', '~30 minutes', '12–16 weeks', 'Mimics the fat-metabolizing action of GH by stimulating beta-3 adrenergic receptors, activating lipolysis in adipose tissue, and inhibiting fat cell differentiation without systemic GH effects.', 'Can be used continuously at 300 mcg/day for metabolic maintenance.', false, true, 'subcutaneous'),
('aaaaaaaa-0000-0000-0000-000000000011', 'Cerebrolysin', 'cerebrolysin', 'Cerebrolysin Neuropeptide Complex', 'Neurologic/Cognitive', array['neuroprotection','stroke','TBI','dementia','BDNF'], 'Cerebrolysin is a porcine-derived neuropeptide mixture that mimics the action of endogenous neurotrophic factors including BDNF, NGF, and CNTF. Clinically approved in 50+ countries for stroke and dementia.', '~20–30 minutes (IV); longer CNS effects', '10–20 day cycles, 2–3x per year', 'Mimics endogenous neurotrophins (BDNF, NGF, CNTF), promotes neuroplasticity and neurogenesis, reduces excitotoxicity, and provides direct neuroprotective effects via metabolic regulation.', 'Not typically microdosed — requires structured injection cycles.', false, true, 'pre-mixed'),
('aaaaaaaa-0000-0000-0000-000000000012', 'Semax', 'semax', 'Synthetic ACTH(4-7) Analog', 'Cognitive/Neuroprotection', array['cognitive','BDNF','focus','neuroprotection','stroke'], 'Semax is a synthetic heptapeptide analog of ACTH(4-7) developed in Russia. It increases BDNF production, improves cognitive function, protects against ischemic damage, and reduces anxiety.', '~20 minutes (intranasal)', '1–3 months, or as needed', 'Increases BDNF and NGF expression, enhances dopaminergic and serotonergic transmission, reduces oxidative stress in neural tissue, and modulates the HPA axis stress response.', 'Typically used 2–3 drops per nostril 2x daily.', false, false, 'intranasal'),
('aaaaaaaa-0000-0000-0000-000000000013', 'Selank', 'selank', 'Synthetic Tuftsin Analog (Anxiolytic)', 'Anxiolytic/Cognitive', array['anxiety','cognitive','GABA','mood','neuroprotection'], 'Selank is a synthetic analog of the immunomodulatory peptide tuftsin. It produces anxiolytic effects without sedation, enhances cognitive function, and stabilizes mood through GABAergic modulation.', '~20 minutes (intranasal)', '1–3 months', 'Modulates GABA-A receptor activity similar to benzodiazepines without dependence, increases serotonin metabolism, reduces enkephalin degradation, and upregulates BDNF expression.', 'Typically 250–500 mcg per nostril 2x daily.', false, false, 'intranasal'),
('aaaaaaaa-0000-0000-0000-000000000014', 'Dihexa', 'dihexa', 'N-hexanoic-Tyr-Ile-(6) aminohexanoic amide', 'Cognitive/Synaptogenesis', array['cognitive','synapse','Alzheimer','dementia','HGF'], 'Dihexa is an extremely potent peptide (10 million times stronger than BDNF at synaptogenesis) that promotes new synapse formation. Originally developed by Washington State University for Alzheimer''s disease.', 'Long-acting — CNS retention ~1–2 weeks', '4–8 weeks on, 4–8 weeks off', 'Activates the HGF/MET signaling pathway to dramatically promote synaptogenesis, enhances memory formation, and shows potential for reversing cognitive decline in animal models.', 'Oral dosing typically 5–10 mg, 3–5x per week.', false, false, 'oral'),
('aaaaaaaa-0000-0000-0000-000000000015', 'Semaglutide/GLP-1', 'semaglutide-glp1', 'Semaglutide GLP-1 Receptor Agonist', 'Metabolic/Weight Management', array['weight loss','GLP-1','metabolic','insulin','appetite'], 'Semaglutide is a GLP-1 receptor agonist that reduces appetite, slows gastric emptying, improves insulin sensitivity, and produces significant sustained weight loss. Combined with AOD-9604 for enhanced fat loss protocols.', '~1 week', 'Continuous with dose titration over 4–6 months', 'Activates GLP-1 receptors in the hypothalamus to reduce appetite, slows gastric emptying to increase satiety, and enhances glucose-dependent insulin secretion to improve metabolic health.', 'Dose titration: 0.25 mg/week x4, then 0.5 mg, then 1 mg maintenance.', false, true, 'subcutaneous');

-- ============================================================
-- Peptide Dosing
-- ============================================================
insert into peptide_dosing (peptide_id, period, dose, notes, sort_order) values
-- BPC-157
('aaaaaaaa-0000-0000-0000-000000000001', 'Loading (Weeks 1–4)', '500 mcg/day', 'Inject subcutaneously near injury site or abdomen', 0),
('aaaaaaaa-0000-0000-0000-000000000001', 'Maintenance (Weeks 5–12)', '250 mcg/day', 'Once daily, continue near injury site', 1),
('aaaaaaaa-0000-0000-0000-000000000001', 'GI Protocol', '250 mcg twice daily', 'Oral use also effective for GI conditions', 2),
-- TB-500
('aaaaaaaa-0000-0000-0000-000000000002', 'Loading (Weeks 1–4)', '4–8 mg/week', 'Split into 2 injections per week', 0),
('aaaaaaaa-0000-0000-0000-000000000002', 'Maintenance (Weeks 5–8)', '2 mg/week', 'Single weekly injection', 1),
-- CJC/Ipamorelin
('aaaaaaaa-0000-0000-0000-000000000003', 'Standard Protocol', '100 mcg CJC / 100 mcg Ipamorelin', 'Inject at bedtime, 5x per week', 0),
('aaaaaaaa-0000-0000-0000-000000000003', 'Enhanced Protocol', '200 mcg / 200 mcg', 'For advanced users, bedtime dosing', 1),
-- Epitalon
('aaaaaaaa-0000-0000-0000-000000000004', 'Standard Cycle', '5–10 mg/day', '10–20 consecutive days', 0),
('aaaaaaaa-0000-0000-0000-000000000004', 'Short Intensive', '20 mg/day', '10 days, twice per year', 1),
-- Thymosin Alpha-1
('aaaaaaaa-0000-0000-0000-000000000005', 'Immune Activation', '1.5 mg twice weekly', 'Subcutaneous injection', 0),
('aaaaaaaa-0000-0000-0000-000000000005', 'Maintenance', '0.5 mg twice weekly', 'Between active cycles', 1),
-- KPV
('aaaaaaaa-0000-0000-0000-000000000006', 'Active Inflammation', '500–1000 mcg/day', 'Once daily subcutaneous', 0),
('aaaaaaaa-0000-0000-0000-000000000006', 'IBD Maintenance', '500 mcg/day', 'Continuous low dose', 1),
-- DSIP
('aaaaaaaa-0000-0000-0000-000000000007', 'Sleep Protocol', '200–400 mcg', '30 minutes before bed, subcutaneous', 0),
('aaaaaaaa-0000-0000-0000-000000000007', 'Stress Modulation', '100–200 mcg', 'Morning dosing for cortisol regulation', 1),
-- GHK-Cu
('aaaaaaaa-0000-0000-0000-000000000008', 'Standard', '1–2 mg/day', 'Subcutaneous injection', 0),
('aaaaaaaa-0000-0000-0000-000000000008', 'Wound Healing', '2 mg/day', 'Near wound site if accessible', 1),
-- LL-37
('aaaaaaaa-0000-0000-0000-000000000009', 'Antimicrobial Protocol', '100–200 mcg/day', 'Subcutaneous, daily during active cycle', 0),
('aaaaaaaa-0000-0000-0000-000000000009', 'Biofilm Protocol', '200 mcg twice daily', 'For chronic biofilm infections', 1),
-- AOD-9604
('aaaaaaaa-0000-0000-0000-000000000010', 'Standard Fat Loss', '300 mcg/day', 'Morning on empty stomach, subcutaneous', 0),
('aaaaaaaa-0000-0000-0000-000000000010', 'Enhanced', '500 mcg/day', 'Split AM/PM dosing', 1),
-- Cerebrolysin
('aaaaaaaa-0000-0000-0000-000000000011', 'Stroke/TBI Cycle', '10–30 mL IV or IM daily', '10–20 consecutive days', 0),
('aaaaaaaa-0000-0000-0000-000000000011', 'Cognitive Enhancement', '5–10 mL IM daily', '10 days per month', 1),
-- Semax
('aaaaaaaa-0000-0000-0000-000000000012', 'Cognitive', '600 mcg (3 drops/nostril)', 'Twice daily intranasal', 0),
('aaaaaaaa-0000-0000-0000-000000000012', 'Neuroprotective', '600–1200 mcg', 'Twice to three times daily', 1),
-- Selank
('aaaaaaaa-0000-0000-0000-000000000013', 'Anxiolytic', '250–500 mcg/nostril', 'Twice daily intranasal', 0),
('aaaaaaaa-0000-0000-0000-000000000013', 'Cognitive Enhancement', '500 mcg/nostril', 'Morning dose primary', 1),
-- Dihexa
('aaaaaaaa-0000-0000-0000-000000000014', 'Standard', '10 mg oral', '3–5 times per week', 0),
('aaaaaaaa-0000-0000-0000-000000000014', 'Intensive', '10 mg daily', 'For acute cognitive decline', 1),
-- Semaglutide
('aaaaaaaa-0000-0000-0000-000000000015', 'Titration Phase 1', '0.25 mg/week', 'Weeks 1–4 subcutaneous', 0),
('aaaaaaaa-0000-0000-0000-000000000015', 'Titration Phase 2', '0.5 mg/week', 'Weeks 5–8', 1),
('aaaaaaaa-0000-0000-0000-000000000015', 'Maintenance', '1.0 mg/week', 'Weeks 9+ as tolerated', 2);

-- ============================================================
-- Peptide Benefits
-- ============================================================
insert into peptide_benefits (peptide_id, benefit_text, sort_order) values
-- BPC-157
('aaaaaaaa-0000-0000-0000-000000000001', 'Accelerates tendon and ligament healing', 0),
('aaaaaaaa-0000-0000-0000-000000000001', 'Heals GI ulcers, IBD, and leaky gut', 1),
('aaaaaaaa-0000-0000-0000-000000000001', 'Reduces inflammation systemically', 2),
('aaaaaaaa-0000-0000-0000-000000000001', 'Promotes angiogenesis (new blood vessel formation)', 3),
('aaaaaaaa-0000-0000-0000-000000000001', 'Protects and heals nerve tissue', 4),
('aaaaaaaa-0000-0000-0000-000000000001', 'Counteracts NSAID-induced GI damage', 5),
-- TB-500
('aaaaaaaa-0000-0000-0000-000000000002', 'Systemic tissue repair and regeneration', 0),
('aaaaaaaa-0000-0000-0000-000000000002', 'Reduces muscle inflammation', 1),
('aaaaaaaa-0000-0000-0000-000000000002', 'Promotes flexibility and range of motion', 2),
('aaaaaaaa-0000-0000-0000-000000000002', 'Mobilizes endogenous stem cells', 3),
('aaaaaaaa-0000-0000-0000-000000000002', 'Cardiovascular tissue repair', 4),
-- CJC/Ipamorelin
('aaaaaaaa-0000-0000-0000-000000000003', 'Improves deep sleep and sleep architecture', 0),
('aaaaaaaa-0000-0000-0000-000000000003', 'Enhances muscle recovery and lean mass', 1),
('aaaaaaaa-0000-0000-0000-000000000003', 'Promotes fat loss through GH optimization', 2),
('aaaaaaaa-0000-0000-0000-000000000003', 'Improves skin elasticity and collagen', 3),
('aaaaaaaa-0000-0000-0000-000000000003', 'Supports injury recovery via IGF-1', 4),
-- Epitalon
('aaaaaaaa-0000-0000-0000-000000000004', 'Activates telomerase and lengthens telomeres', 0),
('aaaaaaaa-0000-0000-0000-000000000004', 'Regulates melatonin and circadian rhythm', 1),
('aaaaaaaa-0000-0000-0000-000000000004', 'Antioxidant and anti-tumor effects', 2),
('aaaaaaaa-0000-0000-0000-000000000004', 'Improves sleep quality', 3),
-- Thymosin Alpha-1
('aaaaaaaa-0000-0000-0000-000000000005', 'Enhances T-cell maturation and immune response', 0),
('aaaaaaaa-0000-0000-0000-000000000005', 'Effective against chronic viral infections', 1),
('aaaaaaaa-0000-0000-0000-000000000005', 'Reduces autoimmune inflammation', 2),
('aaaaaaaa-0000-0000-0000-000000000005', 'Supports cancer adjunct therapy', 3),
-- KPV
('aaaaaaaa-0000-0000-0000-000000000006', 'Potent gut inflammation reduction', 0),
('aaaaaaaa-0000-0000-0000-000000000006', 'Reduces systemic inflammatory cytokines', 1),
('aaaaaaaa-0000-0000-0000-000000000006', 'Effective for IBD, Crohn''s, colitis', 2),
-- DSIP
('aaaaaaaa-0000-0000-0000-000000000007', 'Promotes deep delta-wave sleep', 0),
('aaaaaaaa-0000-0000-0000-000000000007', 'Reduces cortisol and stress hormones', 1),
('aaaaaaaa-0000-0000-0000-000000000007', 'Normalizes disrupted circadian rhythms', 2),
-- GHK-Cu
('aaaaaaaa-0000-0000-0000-000000000008', 'Stimulates collagen and elastin synthesis', 0),
('aaaaaaaa-0000-0000-0000-000000000008', 'Promotes wound healing and tissue remodeling', 1),
('aaaaaaaa-0000-0000-0000-000000000008', 'Activates over 4,000 beneficial genes', 2),
('aaaaaaaa-0000-0000-0000-000000000008', 'Strong antioxidant and anti-inflammatory', 3),
-- LL-37
('aaaaaaaa-0000-0000-0000-000000000009', 'Broad-spectrum antimicrobial activity', 0),
('aaaaaaaa-0000-0000-0000-000000000009', 'Breaks down bacterial biofilms', 1),
('aaaaaaaa-0000-0000-0000-000000000009', 'Effective for chronic Lyme and EBV', 2),
-- AOD-9604
('aaaaaaaa-0000-0000-0000-000000000010', 'Stimulates fat burning (lipolysis)', 0),
('aaaaaaaa-0000-0000-0000-000000000010', 'Inhibits new fat cell formation', 1),
('aaaaaaaa-0000-0000-0000-000000000010', 'No effect on blood sugar or IGF-1', 2),
-- Cerebrolysin
('aaaaaaaa-0000-0000-0000-000000000011', 'Promotes neuroplasticity and neurogenesis', 0),
('aaaaaaaa-0000-0000-0000-000000000011', 'Reduces excitotoxicity after stroke/TBI', 1),
('aaaaaaaa-0000-0000-0000-000000000011', 'Improves cognitive function and memory', 2),
('aaaaaaaa-0000-0000-0000-000000000011', 'Clinically approved in 50+ countries', 3),
-- Semax
('aaaaaaaa-0000-0000-0000-000000000012', 'Increases BDNF and NGF expression', 0),
('aaaaaaaa-0000-0000-0000-000000000012', 'Improves focus and cognitive performance', 1),
('aaaaaaaa-0000-0000-0000-000000000012', 'Neuroprotective against ischemic damage', 2),
-- Selank
('aaaaaaaa-0000-0000-0000-000000000013', 'Anxiolytic without sedation or dependence', 0),
('aaaaaaaa-0000-0000-0000-000000000013', 'Enhances memory and learning', 1),
('aaaaaaaa-0000-0000-0000-000000000013', 'Stabilizes mood and reduces anxiety', 2),
-- Dihexa
('aaaaaaaa-0000-0000-0000-000000000014', 'Dramatically promotes synaptogenesis', 0),
('aaaaaaaa-0000-0000-0000-000000000014', 'Enhances memory formation and retention', 1),
('aaaaaaaa-0000-0000-0000-000000000014', 'Potential for reversing cognitive decline', 2),
-- Semaglutide
('aaaaaaaa-0000-0000-0000-000000000015', 'Significant and sustained weight loss', 0),
('aaaaaaaa-0000-0000-0000-000000000015', 'Reduces cardiovascular risk', 1),
('aaaaaaaa-0000-0000-0000-000000000015', 'Improves insulin sensitivity and HbA1c', 2),
('aaaaaaaa-0000-0000-0000-000000000015', 'Reduces appetite and food cravings', 3);

-- ============================================================
-- Peptide Warnings
-- ============================================================
insert into peptide_warnings (peptide_id, warning_text, sort_order) values
('aaaaaaaa-0000-0000-0000-000000000001', 'Theoretical concern with cancer promotion due to angiogenic activity — avoid in active malignancy', 0),
('aaaaaaaa-0000-0000-0000-000000000001', 'May accelerate growth of pre-existing tumors — screen before use', 1),
('aaaaaaaa-0000-0000-0000-000000000002', 'Avoid in active cancer — promotes systemic tissue growth', 0),
('aaaaaaaa-0000-0000-0000-000000000002', 'May cause injection site reactions in sensitive individuals', 1),
('aaaaaaaa-0000-0000-0000-000000000003', 'May cause water retention, especially during loading phase', 0),
('aaaaaaaa-0000-0000-0000-000000000003', 'Possible cortisol suppression with very long cycles', 1),
('aaaaaaaa-0000-0000-0000-000000000003', 'Do not use in clients with active cancer', 2),
('aaaaaaaa-0000-0000-0000-000000000004', 'Not for use during pregnancy', 0),
('aaaaaaaa-0000-0000-0000-000000000004', 'Long-term effects of telomerase activation not fully characterized in humans', 1),
('aaaaaaaa-0000-0000-0000-000000000005', 'Herxheimer reaction possible in Lyme clients — start low', 0),
('aaaaaaaa-0000-0000-0000-000000000005', 'May temporarily worsen autoimmune flares before improving', 1),
('aaaaaaaa-0000-0000-0000-000000000006', 'Limited long-term human safety data', 0),
('aaaaaaaa-0000-0000-0000-000000000007', 'Not for use with benzodiazepines or strong CNS depressants', 0),
('aaaaaaaa-0000-0000-0000-000000000007', 'May cause vivid dreams during initial use', 1),
('aaaaaaaa-0000-0000-0000-000000000008', 'Copper toxicity possible with very high doses — stay within protocol', 0),
('aaaaaaaa-0000-0000-0000-000000000009', 'Pain at injection site common — dilute if needed', 0),
('aaaaaaaa-0000-0000-0000-000000000009', 'Herxheimer reaction likely in biofilm/Lyme cases — monitor closely', 1),
('aaaaaaaa-0000-0000-0000-000000000010', 'Not for use during pregnancy or in children', 0),
('aaaaaaaa-0000-0000-0000-000000000011', 'Porcine-derived — check for allergies', 0),
('aaaaaaaa-0000-0000-0000-000000000011', 'Rare allergic reactions reported — have emergency protocol ready', 1),
('aaaaaaaa-0000-0000-0000-000000000012', 'May cause nasal irritation — rotate nostrils', 0),
('aaaaaaaa-0000-0000-0000-000000000012', 'Stimulating effect — avoid in late evening', 1),
('aaaaaaaa-0000-0000-0000-000000000013', 'Avoid in clients with severe depression without clinical supervision', 0),
('aaaaaaaa-0000-0000-0000-000000000014', 'Very potent — do not exceed recommended doses', 0),
('aaaaaaaa-0000-0000-0000-000000000014', 'Limited long-term human safety data available', 1),
('aaaaaaaa-0000-0000-0000-000000000015', 'GI side effects common during titration (nausea, vomiting)', 0),
('aaaaaaaa-0000-0000-0000-000000000015', 'Risk of pancreatitis — contraindicated with history of pancreatitis', 1),
('aaaaaaaa-0000-0000-0000-000000000015', 'Thyroid C-cell tumor risk in rodents — use caution with thyroid history', 2);

-- ============================================================
-- Peptide Recon
-- ============================================================
insert into peptide_recon (peptide_id, vial_size_display, default_vial_mg, default_bac_ml, default_dose_mcg, concentration_display, unit_calc_display, dose_range_display, timing_display, cycle_length_display, storage_instructions, reconstitution_steps, vials_needed_display) values
('aaaaaaaa-0000-0000-0000-000000000001', '5 mg vial', 5, 2, 500, '2.5 mg/mL (2500 mcg/mL)', '20 units on U-100 syringe = 500 mcg', '250–500 mcg/day', 'Once daily, subcutaneous', '4–12 weeks', 'Lyophilized: refrigerate at 2–8°C. Reconstituted: refrigerate, use within 30 days.', array['Wipe vial top with alcohol', 'Draw 2 mL bacteriostatic water into syringe', 'Inject slowly down the side of the vial — do not shake', 'Gently swirl until dissolved (solution should be clear)', 'Store reconstituted vial in refrigerator'], '~1 vial per week at 500 mcg/day'),
('aaaaaaaa-0000-0000-0000-000000000002', '10 mg vial', 10, 2, 4000, '5 mg/mL', '80 units on U-100 syringe = 4 mg', '2–8 mg/week (split doses)', '2 injections per week', '4–8 weeks', 'Lyophilized: store at room temp or refrigerate. Reconstituted: refrigerate, use within 30 days.', array['Wipe vial top with alcohol', 'Draw 2 mL bacteriostatic water', 'Inject slowly down the side — do not shake', 'Swirl gently until dissolved', 'Refrigerate after reconstitution'], '~1 vial per 2 weeks at 4 mg/week'),
('aaaaaaaa-0000-0000-0000-000000000003', '5 mg blend vial', 5, 2, 200, '2.5 mg/mL', '8 units on U-100 syringe = 200 mcg', '100–200 mcg per peptide', 'Bedtime, 5x per week', '3 months on, 1 month off', 'Refrigerate reconstituted vial. Use within 30 days.', array['Reconstitute with 2 mL bacteriostatic water', 'Inject water slowly down vial wall', 'Gently swirl — do not shake or vortex', 'Refrigerate immediately'], '~2–3 vials per month'),
('aaaaaaaa-0000-0000-0000-000000000004', '10 mg vial', 10, 2, 5000, '5 mg/mL', '100 units on U-100 = 5 mg', '5–20 mg/day', 'Once daily during cycle', '10–20 consecutive days', 'Refrigerate lyophilized and reconstituted vials.', array['Add 2 mL bacteriostatic water', 'Swirl gently until dissolved', 'Refrigerate immediately after reconstitution'], '1 vial per 10-day cycle at 10 mg/day'),
('aaaaaaaa-0000-0000-0000-000000000005', '5 mg vial', 5, 1, 1500, '5 mg/mL (5000 mcg/mL)', '30 units on U-100 = 1.5 mg', '1.5 mg twice weekly', 'Twice weekly subcutaneous', '4–12 weeks', 'Refrigerate at 2–8°C. Reconstituted: use within 30 days.', array['Add 1 mL bacteriostatic water to 5 mg vial', 'Swirl gently until clear', 'Draw 30 units per injection (1.5 mg)'], '~1 vial per 2 weeks'),
('aaaaaaaa-0000-0000-0000-000000000006', '5 mg vial', 5, 2, 500, '2.5 mg/mL', '20 units on U-100 = 500 mcg', '500–1000 mcg/day', 'Once to twice daily', '4–8 weeks', 'Refrigerate. Use within 30 days of reconstitution.', array['Add 2 mL bacteriostatic water', 'Swirl gently', 'Refrigerate after reconstitution'], '~1 vial per 10 days at 500 mcg/day'),
('aaaaaaaa-0000-0000-0000-000000000007', '2 mg vial', 2, 1, 300, '2 mg/mL (2000 mcg/mL)', '15 units on U-100 = 300 mcg', '200–400 mcg before bed', '30 min before sleep', '2–4 weeks', 'Refrigerate. Use within 30 days.', array['Add 1 mL bacteriostatic water', 'Swirl gently until dissolved', 'Refrigerate immediately'], '~1 vial per 1 week at 300 mcg/day'),
('aaaaaaaa-0000-0000-0000-000000000008', '5 mg vial', 5, 2, 1000, '2.5 mg/mL', '40 units on U-100 = 1 mg', '1–2 mg/day', 'Once daily subcutaneous', '8–12 weeks', 'Refrigerate. Avoid light exposure.', array['Add 2 mL bacteriostatic water', 'Swirl gently — solution may have slight blue tint', 'Refrigerate immediately'], '~1 vial per 5 days at 1 mg/day'),
('aaaaaaaa-0000-0000-0000-000000000009', '5 mg vial', 5, 2, 200, '2.5 mg/mL', '8 units on U-100 = 200 mcg', '100–200 mcg/day', 'Once daily subcutaneous', '4–8 weeks', 'Refrigerate. Use within 30 days.', array['Add 2 mL bacteriostatic water', 'Swirl very gently', 'May cause stinging — dilute further if needed'], '~1 vial per 25 days at 200 mcg/day'),
('aaaaaaaa-0000-0000-0000-000000000010', '5 mg vial', 5, 2, 300, '2.5 mg/mL', '12 units on U-100 = 300 mcg', '300–500 mcg/day', 'Morning, fasted state', '12–16 weeks', 'Refrigerate. Use within 30 days.', array['Add 2 mL bacteriostatic water', 'Swirl gently until dissolved', 'Refrigerate immediately'], '~1 vial per 17 days at 300 mcg/day'),
('aaaaaaaa-0000-0000-0000-000000000011', '5 mL or 10 mL pre-mixed vial', 10, 10, 10000, 'Pre-mixed: 215.2 mg/mL', 'Draw per mL as directed', '5–30 mL/day', 'IM or IV daily during cycle', '10–20 consecutive days', 'Refrigerate at 2–8°C. Do not freeze. Use within 30 days of opening.', array['Already pre-mixed — do not add diluent', 'Draw desired volume with syringe', 'Administer IM or IV per protocol', 'Refrigerate between uses'], 'Varies by dose (1–3 vials per cycle)'),
('aaaaaaaa-0000-0000-0000-000000000015', '2.4 mg pen (0.25 mg dose)', 2, 0, 250, 'Pre-filled pen', 'Use pen dial as instructed', '0.25–1.0 mg/week', 'Once weekly subcutaneous', '4–6 months with titration', 'Refrigerate unused pens at 2–8°C. Room temp up to 28°C for 4 weeks after first use.', array['Remove pen cap and attach needle', 'Dial to prescribed dose', 'Inject subcutaneously in abdomen, thigh, or upper arm', 'Rotate injection sites weekly'], 'Titrate per schedule; 1 pen per 1–4 weeks depending on dose');

-- ============================================================
-- Vet Protocols
-- ============================================================
insert into vet_protocols (condition_name, animal_type, primary_peptide, adjunct_peptides, dosing_notes, weight_based_dosing, dose_per_kg_mcg, clinical_notes, cycle_length) values
('Hip Dysplasia / Joint Pain', 'dog', 'BPC-157', array['TB-500'], 'BPC-157 10 mcg/kg/day SQ; TB-500 2 mcg/kg twice weekly', 'Dose based on lean body weight', 10, 'Most effective when started before joint degeneration becomes severe. Monitor for improved gait and activity levels.', '6–8 weeks'),
('Soft Tissue Injury (Muscle/Tendon)', 'dog', 'BPC-157', array['TB-500', 'GHK-Cu'], 'BPC-157 10 mcg/kg/day; TB-500 2 mcg/kg/week; GHK-Cu 1 mcg/kg/day', 'Based on body weight, divided doses acceptable', 10, 'Combine with restricted exercise and physical rehabilitation for best results.', '6 weeks'),
('Degenerative Myelopathy', 'dog', 'Cerebrolysin', array['BPC-157'], 'Cerebrolysin 0.5 mL/10kg IM daily x10 days; BPC-157 10 mcg/kg/day', 'Cerebrolysin dosed by weight', 0, 'Early intervention critical. May slow progression; combine with physiotherapy.', '10-day cycles, 3x yearly'),
('Post-Surgical Recovery', 'dog', 'TB-500', array['BPC-157', 'GHK-Cu'], 'TB-500 2 mcg/kg twice weekly; BPC-157 10 mcg/kg/day', 'Weight-based dosing required', 10, 'Begin within 48–72 hours of surgery. Monitor for infection. Significantly speeds healing.', '4–6 weeks'),
('Chronic GI Issues / IBD', 'dog', 'BPC-157', array['KPV'], 'BPC-157 5–10 mcg/kg/day SQ or oral; KPV 5 mcg/kg/day', 'Lower dose acceptable for GI-only use', 5, 'Oral BPC-157 effective for gut conditions. Can mix with small amount of food.', '8 weeks, may continue');

-- ============================================================
-- Protocols (28 total)
-- ============================================================
insert into protocols (id, condition_name, slug, category, primary_peptide, adjunct_peptides, clinical_notes, cycle_intro) values
('bbbbbbbb-0000-0000-0000-000000000001', 'Stroke Recovery', 'stroke-recovery', 'Neurologic', 'Cerebrolysin', array['Semax', 'Dihexa'], 'Initiate as early as possible post-stroke. Cerebrolysin has the strongest clinical evidence base for neuroprotection and recovery acceleration.', 'This 3-month neurological recovery protocol combines the neurotrophic power of Cerebrolysin with the BDNF-upregulating effects of Semax and the synaptogenic power of Dihexa.'),
('bbbbbbbb-0000-0000-0000-000000000002', 'Traumatic Brain Injury (TBI)', 'tbi', 'Neurologic', 'Cerebrolysin', array['Semax', 'Selank', 'Dihexa'], 'Address both structural damage and psychological sequelae. Selank helps with TBI-associated anxiety and emotional dysregulation.', 'A comprehensive TBI recovery protocol targeting neuroprotection, neuroplasticity, cognitive restoration, and anxiety management.'),
('bbbbbbbb-0000-0000-0000-000000000003', 'Dementia / Cognitive Decline', 'dementia-cognitive-decline', 'Neurologic', 'Cerebrolysin', array['Dihexa', 'Epitalon'], 'Best outcomes when initiated early in cognitive decline. Repeat Cerebrolysin cycles every 3 months. Epitalon addresses the longevity and telomere aspect.', 'A long-term cognitive preservation protocol combining neurotrophic support, radical synaptogenesis promotion, and cellular longevity.'),
('bbbbbbbb-0000-0000-0000-000000000004', 'Parkinson''s Disease', 'parkinsons-disease', 'Neurologic', 'Cerebrolysin', array['Dihexa', 'Selank'], 'Focus on dopaminergic neuroprotection. Cerebrolysin has shown benefits in slowing Parkinson''s progression. Selank addresses anxiety/rigidity.', 'Combining neurotrophic support with synaptogenesis and anxiolytic modulation for Parkinson''s management.'),
('bbbbbbbb-0000-0000-0000-000000000005', 'Cerebral Palsy', 'cerebral-palsy', 'Neurologic', 'Cerebrolysin', array['Dihexa', 'BPC-157'], 'Best in pediatric/young adult populations. BPC-157 addresses systemic repair and inflammation. Requires specialist oversight.', 'Neurological and systemic repair protocol for cerebral palsy targeting neuroplasticity and tissue health.'),
('bbbbbbbb-0000-0000-0000-000000000006', 'Lyme Disease', 'lyme-disease', 'Immune/Infectious', 'Thymosin Alpha-1', array['LL-37', 'BPC-157'], 'Start with lower TA1 doses to avoid strong Herxheimer reactions. LL-37 is critical for biofilm disruption. BPC-157 addresses systemic inflammation.', 'A multi-modal Lyme disease protocol targeting immune modulation, biofilm disruption, and systemic repair.'),
('bbbbbbbb-0000-0000-0000-000000000007', 'Epstein-Barr Virus (EBV)', 'epstein-barr-virus', 'Immune/Infectious', 'Thymosin Alpha-1', array['LL-37', 'BPC-157'], 'Thymosin Alpha-1 has direct anti-EBV activity. LL-37 provides additional antiviral support. Monitor viral load markers.', 'Immune-focused EBV reactivation protocol targeting viral suppression and systemic restoration.'),
('bbbbbbbb-0000-0000-0000-000000000008', 'Multiple Sclerosis', 'multiple-sclerosis', 'Autoimmune', 'Thymosin Alpha-1', array['TB-500', 'BPC-157'], 'Thymosin Alpha-1 modulates the dysfunctional immune response. TB-500 and BPC-157 support myelin-adjacent tissue repair.', 'An autoimmune modulation protocol for MS combining immune regulation with neuroprotective tissue repair.'),
('bbbbbbbb-0000-0000-0000-000000000009', 'Rheumatoid Arthritis', 'rheumatoid-arthritis', 'Autoimmune', 'TB-500', array['BPC-157', 'KPV', 'Thymosin Alpha-1'], 'Anti-inflammatory quadruple approach. KPV directly inhibits joint inflammation. Monitor inflammatory markers (CRP, ESR) throughout.', 'A comprehensive RA protocol targeting synovial inflammation, immune dysregulation, and joint tissue repair.'),
('bbbbbbbb-0000-0000-0000-000000000010', 'Mold Toxicity / CIRS', 'mold-toxicity', 'Immune/Infectious', 'Thymosin Alpha-1', array['LL-37', 'BPC-157'], 'CIRS requires concurrent environmental remediation. Peptides support immune normalization and repair of mold-damaged tissue.', 'Immune restoration and systemic repair protocol for mold toxicity and Chronic Inflammatory Response Syndrome.'),
('bbbbbbbb-0000-0000-0000-000000000011', 'Muscle / Tendon Injury', 'muscle-tendon-injury', 'Musculoskeletal', 'BPC-157', array['TB-500', 'GHK-Cu'], 'Most common peptide protocol. BPC-157 is the workhorse; TB-500 provides systemic repair; GHK-Cu remodels collagen.', 'The gold-standard musculoskeletal injury protocol combining targeted and systemic tissue repair with collagen remodeling.'),
('bbbbbbbb-0000-0000-0000-000000000012', 'Joint Degeneration / Osteoarthritis', 'joint-degeneration', 'Musculoskeletal', 'BPC-157', array['TB-500', 'GHK-Cu'], 'Long-term protocol recommended. Repeat cycles for chronic OA. Intra-articular BPC-157 injection can be considered by qualified practitioners.', 'Targeting cartilage repair, joint inflammation, and collagen remodeling for degenerative joint disease.'),
('bbbbbbbb-0000-0000-0000-000000000013', 'Post-Surgical Recovery', 'post-surgical-recovery', 'Musculoskeletal', 'TB-500', array['BPC-157', 'GHK-Cu'], 'Begin within 48–72 hours post-op. TB-500 leads for systemic healing; BPC-157 targets the surgical site; GHK-Cu remodels scar tissue.', 'Accelerated surgical recovery protocol optimizing tissue healing, scar remodeling, and systemic repair.'),
('bbbbbbbb-0000-0000-0000-000000000014', 'Chronic Pain', 'chronic-pain', 'Musculoskeletal', 'BPC-157', array['TB-500'], 'BPC-157 modulates pain pathways including nitric oxide systems. Best for musculoskeletal chronic pain; evaluate underlying cause.', 'A targeted chronic pain protocol using BPC-157''s pain pathway modulation combined with TB-500 systemic repair.'),
('bbbbbbbb-0000-0000-0000-000000000015', 'Rotator Cuff Injury', 'rotator-cuff-injury', 'Musculoskeletal', 'BPC-157', array['TB-500', 'GHK-Cu', 'CJC-1295/Ipamorelin'], 'CJC/Ipamorelin added to enhance GH-mediated repair. Inject BPC-157 near the shoulder area. Physical therapy essential.', 'Comprehensive rotator cuff protocol with targeted peptide repair and GH optimization for accelerated healing.'),
('bbbbbbbb-0000-0000-0000-000000000016', 'Frozen Shoulder', 'frozen-shoulder', 'Musculoskeletal', 'BPC-157', array['TB-500', 'KPV'], 'KPV added for strong anti-inflammatory component. Combine with physical therapy and capsular stretching protocol.', 'Anti-inflammatory and repair protocol for adhesive capsulitis (frozen shoulder).'),
('bbbbbbbb-0000-0000-0000-000000000017', 'ACL Injury', 'acl-injury', 'Musculoskeletal', 'BPC-157', array['TB-500', 'CJC-1295/Ipamorelin'], 'Whether surgical or conservative management, this protocol accelerates healing. CJC/Ipamorelin enhances GH-mediated ligament repair.', 'ACL repair acceleration protocol combining targeted ligament healing with systemic GH optimization.'),
('bbbbbbbb-0000-0000-0000-000000000018', 'Meniscus Injury', 'meniscus-injury', 'Musculoskeletal', 'BPC-157', array['TB-500', 'GHK-Cu'], 'Meniscal tissue has poor blood supply; peptides help overcome this limitation. Start protocol immediately after injury or post-surgery.', 'Targeted meniscus repair protocol addressing poor vascularization with angiogenic and tissue-remodeling peptides.'),
('bbbbbbbb-0000-0000-0000-000000000019', 'Hip Labrum Injury', 'hip-labrum-injury', 'Musculoskeletal', 'BPC-157', array['TB-500', 'CJC-1295/Ipamorelin'], 'Labral tissue heals slowly; this protocol maximizes healing potential. BPC-157 injected near hip area.', 'Hip labrum healing protocol combining local tissue repair with systemic GH optimization.'),
('bbbbbbbb-0000-0000-0000-000000000020', 'Ankle Sprain / Ligament', 'ankle-sprain', 'Musculoskeletal', 'BPC-157', array['TB-500'], 'Simple but effective 2-peptide protocol. BPC-157 can be injected near the ankle ligaments for targeted effect.', 'Efficient ankle and ligament healing protocol for grade I–III sprains.'),
('bbbbbbbb-0000-0000-0000-000000000021', 'Stress Fracture / Bone Bruise', 'stress-fracture', 'Musculoskeletal', 'BPC-157', array['TB-500', 'CJC-1295/Ipamorelin'], 'CJC/Ipamorelin significantly aids bone repair via GH/IGF-1. Combine with adequate calcium, vitamin D, and load management.', 'Bone healing acceleration protocol combining BPC-157 angiogenic effects with GH-mediated bone repair.'),
('bbbbbbbb-0000-0000-0000-000000000022', 'Weight Loss / Metabolic Optimization', 'weight-loss-metabolic', 'Metabolic', 'Semaglutide/GLP-1', array['AOD-9604', 'CJC-1295/Ipamorelin'], 'Semaglutide leads with appetite regulation; AOD-9604 targets lipolysis directly; CJC/Ipamorelin improves body composition via GH.', 'A comprehensive metabolic optimization protocol combining GLP-1 appetite regulation, targeted lipolysis, and GH-mediated body composition improvement.'),
('bbbbbbbb-0000-0000-0000-000000000023', 'Anti-Aging / Longevity', 'anti-aging-longevity', 'Longevity', 'Epitalon', array['GHK-Cu', 'CJC-1295/Ipamorelin', 'TB-500'], 'Twice-yearly Epitalon cycles form the foundation. Ongoing GHK-Cu and CJC/Ipamorelin maintain tissue quality and GH output.', 'A comprehensive longevity protocol targeting telomere biology, tissue remodeling, GH optimization, and systemic repair.'),
('bbbbbbbb-0000-0000-0000-000000000024', 'Sleep Optimization', 'sleep-optimization', 'Sleep/Stress', 'DSIP', array['Epitalon', 'Selank'], 'DSIP promotes deep sleep directly; Epitalon resets circadian rhythm; Selank reduces the anxiety/rumination that disrupts sleep.', 'A three-pronged sleep optimization protocol addressing delta-wave induction, circadian reset, and anxiety-driven sleep disruption.'),
('bbbbbbbb-0000-0000-0000-000000000025', 'Inflammatory Bowel Disease (IBD)', 'inflammatory-bowel-disease', 'GI/Autoimmune', 'BPC-157', array['KPV', 'Thymosin Alpha-1'], 'Best IBD protocol with three complementary mechanisms: gut repair (BPC-157), direct cytokine inhibition (KPV), and immune modulation (TA1).', 'A comprehensive IBD protocol targeting gut repair, local cytokine suppression, and immune system normalization.'),
('bbbbbbbb-0000-0000-0000-000000000026', 'Leaky Gut / GI Inflammation', 'leaky-gut-gi-inflammation', 'GI', 'BPC-157', array['KPV'], 'Simple and highly effective 2-peptide GI protocol. BPC-157 can be used orally in sterile water for direct GI contact.', 'Targeted gut lining repair and inflammation reduction protocol for intestinal permeability and GI inflammation.'),
('bbbbbbbb-0000-0000-0000-000000000027', 'Joint Inflammation (Systemic)', 'joint-inflammation-systemic', 'Musculoskeletal/Autoimmune', 'BPC-157', array['TB-500', 'KPV'], 'For systemic inflammatory arthropathies. KPV provides the anti-cytokine component. Monitor inflammatory markers.', 'Systemic joint inflammation protocol combining structural repair with direct cytokine suppression.'),
('bbbbbbbb-0000-0000-0000-000000000028', 'Sleep & Cognitive Health', 'sleep-cognitive-health', 'Sleep/Cognitive', 'DSIP', array['Epitalon', 'Selank', 'Semax'], 'Advanced protocol combining sleep optimization with cognitive enhancement. Semax added for daytime BDNF support and cognitive function.', 'A comprehensive protocol addressing both sleep quality and daytime cognitive performance through complementary neuropeptide pathways.');

-- ============================================================
-- Protocol Months (3 months each for all 28 protocols)
-- Using a representative set for the primary protocols
-- ============================================================

-- Stroke Recovery (bbbbbbbb-0000-0000-0000-000000000001)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0001-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 1, 'Acute Neuroprotection & Foundation', 'Initiate Cerebrolysin cycle immediately. Semax begins day 1 for BDNF support.'),
('cccccccc-0001-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 2, 'Neuroplasticity Enhancement', 'Introduce Dihexa for synaptogenesis. Repeat Cerebrolysin cycle. Continue Semax.'),
('cccccccc-0001-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 3, 'Consolidation & Maintenance', 'Maintain Dihexa and Semax. Final Cerebrolysin cycle. Assess functional improvements.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0001-0001-0000-000000000001', 'Cerebrolysin', '10–20 mL IM daily', '10 consecutive days, then rest', 0),
('cccccccc-0001-0001-0000-000000000001', 'Semax', '600 mcg/nostril', 'Twice daily intranasal', 1),
('cccccccc-0001-0002-0000-000000000001', 'Cerebrolysin', '10–20 mL IM daily', '10 consecutive days repeat', 0),
('cccccccc-0001-0002-0000-000000000001', 'Semax', '600 mcg/nostril', 'Twice daily intranasal', 1),
('cccccccc-0001-0002-0000-000000000001', 'Dihexa', '10 mg oral', '3–5x per week', 2),
('cccccccc-0001-0003-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 days maintenance cycle', 0),
('cccccccc-0001-0003-0000-000000000001', 'Semax', '600 mcg/nostril', 'Twice daily intranasal', 1),
('cccccccc-0001-0003-0000-000000000001', 'Dihexa', '10 mg oral', '3x per week maintenance', 2);

-- TBI (bbbbbbbb-0000-0000-0000-000000000002)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0002-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 1, 'Acute Neuroprotection & Anxiety Support', 'Lead with Cerebrolysin and Selank for anxiety/emotional regulation. Semax for BDNF.'),
('cccccccc-0002-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 2, 'Cognitive Restoration & Synaptogenesis', 'Add Dihexa for synaptogenesis. Continue Cerebrolysin cycle 2. Maintain Semax + Selank.'),
('cccccccc-0002-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 3, 'Integration & Functional Improvement', 'Assess cognitive gains. Maintain Dihexa and Semax. Final Cerebrolysin cycle.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0002-0001-0000-000000000001', 'Cerebrolysin', '10–20 mL IM daily', '10 consecutive days', 0),
('cccccccc-0002-0001-0000-000000000001', 'Semax', '600 mcg/nostril', 'Twice daily intranasal', 1),
('cccccccc-0002-0001-0000-000000000001', 'Selank', '250 mcg/nostril', 'Twice daily intranasal', 2),
('cccccccc-0002-0002-0000-000000000001', 'Cerebrolysin', '10–15 mL IM daily', '10 days cycle 2', 0),
('cccccccc-0002-0002-0000-000000000001', 'Semax', '600 mcg/nostril', 'Twice daily', 1),
('cccccccc-0002-0002-0000-000000000001', 'Selank', '250 mcg/nostril', 'Twice daily', 2),
('cccccccc-0002-0002-0000-000000000001', 'Dihexa', '10 mg oral', '3–5x per week', 3),
('cccccccc-0002-0003-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 days final cycle', 0),
('cccccccc-0002-0003-0000-000000000001', 'Semax', '600 mcg/nostril', 'Twice daily', 1),
('cccccccc-0002-0003-0000-000000000001', 'Dihexa', '10 mg oral', '3x per week', 2);

-- Lyme Disease (bbbbbbbb-0000-0000-0000-000000000006)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0006-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000006', 1, 'Immune Activation & Biofilm Disruption', 'Start TA1 at low dose to avoid severe Herxheimer. LL-37 to break biofilm. BPC-157 for systemic inflammation.'),
('cccccccc-0006-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000006', 2, 'Intensification Phase', 'Increase TA1 to full dose. Continue LL-37 and BPC-157. Monitor for Herx reactions.'),
('cccccccc-0006-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000006', 3, 'Consolidation & Systemic Repair', 'TA1 maintenance dose. Continue BPC-157 for ongoing repair. Assess immune markers.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0006-0001-0000-000000000001', 'Thymosin Alpha-1', '0.5–1.0 mg', 'Twice weekly subcutaneous', 0),
('cccccccc-0006-0001-0000-000000000001', 'LL-37', '100 mcg', 'Once daily subcutaneous', 1),
('cccccccc-0006-0001-0000-000000000001', 'BPC-157', '500 mcg', 'Once daily subcutaneous', 2),
('cccccccc-0006-0002-0000-000000000001', 'Thymosin Alpha-1', '1.5 mg', 'Twice weekly subcutaneous', 0),
('cccccccc-0006-0002-0000-000000000001', 'LL-37', '200 mcg', 'Once daily subcutaneous', 1),
('cccccccc-0006-0002-0000-000000000001', 'BPC-157', '500 mcg', 'Once daily subcutaneous', 2),
('cccccccc-0006-0003-0000-000000000001', 'Thymosin Alpha-1', '1.0 mg', 'Twice weekly subcutaneous', 0),
('cccccccc-0006-0003-0000-000000000001', 'BPC-157', '250 mcg', 'Once daily subcutaneous', 1);

-- Muscle/Tendon Injury (bbbbbbbb-0000-0000-0000-000000000011)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0011-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000011', 1, 'Acute Healing & Loading Phase', 'Full dose BPC-157 and TB-500 loading. Inject BPC-157 near injury site.'),
('cccccccc-0011-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000011', 2, 'Collagen Remodeling Phase', 'Introduce GHK-Cu for collagen remodeling. Reduce TB-500 to maintenance. Continue BPC-157.'),
('cccccccc-0011-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000011', 3, 'Strengthening & Completion', 'Maintenance doses all peptides. Begin progressive loading rehabilitation.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0011-0001-0000-000000000001', 'BPC-157', '500 mcg', 'Once daily subcutaneous', 0),
('cccccccc-0011-0001-0000-000000000001', 'TB-500', '4–8 mg/week', 'Twice weekly subcutaneous', 1),
('cccccccc-0011-0002-0000-000000000001', 'BPC-157', '500 mcg', 'Once daily subcutaneous', 0),
('cccccccc-0011-0002-0000-000000000001', 'TB-500', '2 mg/week', 'Weekly subcutaneous', 1),
('cccccccc-0011-0002-0000-000000000001', 'GHK-Cu', '1 mg', 'Once daily subcutaneous', 2),
('cccccccc-0011-0003-0000-000000000001', 'BPC-157', '250 mcg', 'Once daily subcutaneous', 0),
('cccccccc-0011-0003-0000-000000000001', 'TB-500', '2 mg/week', 'Weekly subcutaneous', 1),
('cccccccc-0011-0003-0000-000000000001', 'GHK-Cu', '1 mg', 'Once daily subcutaneous', 2);

-- Weight Loss/Metabolic (bbbbbbbb-0000-0000-0000-000000000022)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0022-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000022', 1, 'Titration & Foundation', 'Semaglutide titration 0.25 mg. Add AOD-9604 from day 1. Avoid CJC/Ipamorelin week 1.'),
('cccccccc-0022-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000022', 2, 'Full Protocol Activation', 'Semaglutide to 0.5 mg. Full AOD-9604 dose. Add CJC/Ipamorelin at bedtime.'),
('cccccccc-0022-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000022', 3, 'Optimization & Maintenance Planning', 'Semaglutide to 1.0 mg if tolerated. Assess body composition changes. Plan long-term maintenance.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0022-0001-0000-000000000001', 'Semaglutide/GLP-1', '0.25 mg/week', 'Weekly subcutaneous', 0),
('cccccccc-0022-0001-0000-000000000001', 'AOD-9604', '300 mcg', 'Morning fasted, subcutaneous', 1),
('cccccccc-0022-0002-0000-000000000001', 'Semaglutide/GLP-1', '0.5 mg/week', 'Weekly subcutaneous', 0),
('cccccccc-0022-0002-0000-000000000001', 'AOD-9604', '300 mcg', 'Morning fasted, subcutaneous', 1),
('cccccccc-0022-0002-0000-000000000001', 'CJC-1295/Ipamorelin', '100/100 mcg', 'Bedtime, 5x per week', 2),
('cccccccc-0022-0003-0000-000000000001', 'Semaglutide/GLP-1', '1.0 mg/week', 'Weekly subcutaneous', 0),
('cccccccc-0022-0003-0000-000000000001', 'AOD-9604', '300 mcg', 'Morning fasted, subcutaneous', 1),
('cccccccc-0022-0003-0000-000000000001', 'CJC-1295/Ipamorelin', '100/100 mcg', 'Bedtime, 5x per week', 2);

-- Anti-Aging/Longevity (bbbbbbbb-0000-0000-0000-000000000023)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0023-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000023', 1, 'Epitalon Cycle & Foundation', 'Run 20-day Epitalon cycle in month 1. GHK-Cu ongoing for tissue remodeling.'),
('cccccccc-0023-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000023', 2, 'GH Optimization & Systemic Repair', 'CJC/Ipamorelin and TB-500 added after Epitalon cycle. Continue GHK-Cu.'),
('cccccccc-0023-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000023', 3, 'Consolidation & Long-Term Planning', 'Maintain CJC/Ipamorelin and GHK-Cu. TB-500 final month. Plan semi-annual Epitalon repeats.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0023-0001-0000-000000000001', 'Epitalon', '10 mg/day', 'Once daily x20 days', 0),
('cccccccc-0023-0001-0000-000000000001', 'GHK-Cu', '1 mg/day', 'Once daily subcutaneous', 1),
('cccccccc-0023-0002-0000-000000000001', 'GHK-Cu', '1 mg/day', 'Once daily subcutaneous', 0),
('cccccccc-0023-0002-0000-000000000001', 'CJC-1295/Ipamorelin', '100/100 mcg', 'Bedtime 5x/week', 1),
('cccccccc-0023-0002-0000-000000000001', 'TB-500', '2 mg/week', 'Weekly subcutaneous', 2),
('cccccccc-0023-0003-0000-000000000001', 'GHK-Cu', '1 mg/day', 'Once daily subcutaneous', 0),
('cccccccc-0023-0003-0000-000000000001', 'CJC-1295/Ipamorelin', '100/100 mcg', 'Bedtime 5x/week', 1),
('cccccccc-0023-0003-0000-000000000001', 'TB-500', '2 mg/week', 'Weekly subcutaneous', 2);

-- Sleep Optimization (bbbbbbbb-0000-0000-0000-000000000024)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0024-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000024', 1, 'Circadian Reset Phase', 'Epitalon cycle to reset pineal/melatonin. DSIP nightly. Selank for pre-sleep anxiety.'),
('cccccccc-0024-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000024', 2, 'Deep Sleep Optimization', 'Continue DSIP and Selank. Assess sleep quality metrics.'),
('cccccccc-0024-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000024', 3, 'Maintenance & Habit Integration', 'Reduce to lowest effective DSIP dose. Maintain Selank. Plan ongoing sleep hygiene.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0024-0001-0000-000000000001', 'Epitalon', '10 mg/day', 'Once daily x10–20 days', 0),
('cccccccc-0024-0001-0000-000000000001', 'DSIP', '300 mcg', '30 min before bed', 1),
('cccccccc-0024-0001-0000-000000000001', 'Selank', '250 mcg/nostril', 'Evening intranasal', 2),
('cccccccc-0024-0002-0000-000000000001', 'DSIP', '300 mcg', '30 min before bed', 0),
('cccccccc-0024-0002-0000-000000000001', 'Selank', '250 mcg/nostril', 'Evening intranasal', 1),
('cccccccc-0024-0003-0000-000000000001', 'DSIP', '200 mcg', '30 min before bed', 0),
('cccccccc-0024-0003-0000-000000000001', 'Selank', '250 mcg/nostril', 'Evening intranasal', 1);

-- IBD (bbbbbbbb-0000-0000-0000-000000000025)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0025-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000025', 1, 'Gut Repair & Inflammation Control', 'BPC-157 oral and SQ. KPV for direct cytokine suppression. TA1 starts immune modulation.'),
('cccccccc-0025-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000025', 2, 'Immune Normalization', 'Continue full protocol. Assess symptom burden and GI markers.'),
('cccccccc-0025-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000025', 3, 'Maintenance Dosing', 'Reduce to maintenance doses. BPC-157 oral may continue indefinitely for IBD.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0025-0001-0000-000000000001', 'BPC-157', '500 mcg', 'Twice daily (oral + SQ)', 0),
('cccccccc-0025-0001-0000-000000000001', 'KPV', '500 mcg', 'Once daily subcutaneous', 1),
('cccccccc-0025-0001-0000-000000000001', 'Thymosin Alpha-1', '1.5 mg', 'Twice weekly subcutaneous', 2),
('cccccccc-0025-0002-0000-000000000001', 'BPC-157', '500 mcg', 'Twice daily', 0),
('cccccccc-0025-0002-0000-000000000001', 'KPV', '500 mcg', 'Once daily subcutaneous', 1),
('cccccccc-0025-0002-0000-000000000001', 'Thymosin Alpha-1', '1.5 mg', 'Twice weekly', 2),
('cccccccc-0025-0003-0000-000000000001', 'BPC-157', '250 mcg', 'Once daily (oral preferred)', 0),
('cccccccc-0025-0003-0000-000000000001', 'KPV', '500 mcg', 'Every other day', 1),
('cccccccc-0025-0003-0000-000000000001', 'Thymosin Alpha-1', '0.5 mg', 'Twice weekly maintenance', 2);

-- Remaining protocols get generic 3-month breakdowns
-- Dementia (003), Parkinson's (004), Cerebral Palsy (005)
insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0003-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', 1, 'Neurotrophic Foundation', 'First Cerebrolysin cycle. Begin Dihexa for synaptogenesis.'),
('cccccccc-0003-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', 2, 'Longevity Integration', 'Add Epitalon cycle. Continue Dihexa. Second Cerebrolysin cycle.'),
('cccccccc-0003-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', 3, 'Maintenance Protocol', 'Dihexa maintenance. Third Cerebrolysin cycle. Assess cognitive metrics.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0003-0001-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 consecutive days', 0),
('cccccccc-0003-0001-0000-000000000001', 'Dihexa', '10 mg oral', '3–5x per week', 1),
('cccccccc-0003-0002-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 days cycle 2', 0),
('cccccccc-0003-0002-0000-000000000001', 'Dihexa', '10 mg oral', '3–5x per week', 1),
('cccccccc-0003-0002-0000-000000000001', 'Epitalon', '10 mg/day', 'x10 days', 2),
('cccccccc-0003-0003-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 days cycle 3', 0),
('cccccccc-0003-0003-0000-000000000001', 'Dihexa', '10 mg oral', '3x per week', 1);

insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0004-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000004', 1, 'Neuroprotection Phase', 'Cerebrolysin to protect dopaminergic neurons. Selank for tremor-related anxiety.'),
('cccccccc-0004-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000004', 2, 'Synaptogenesis & Mood', 'Add Dihexa. Repeat Cerebrolysin. Continue Selank.'),
('cccccccc-0004-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000004', 3, 'Maintenance', 'Maintenance doses. Third Cerebrolysin cycle if indicated.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0004-0001-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 consecutive days', 0),
('cccccccc-0004-0001-0000-000000000001', 'Selank', '250 mcg/nostril', 'Twice daily intranasal', 1),
('cccccccc-0004-0002-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 days', 0),
('cccccccc-0004-0002-0000-000000000001', 'Dihexa', '10 mg oral', '3x per week', 1),
('cccccccc-0004-0002-0000-000000000001', 'Selank', '250 mcg/nostril', 'Twice daily', 2),
('cccccccc-0004-0003-0000-000000000001', 'Dihexa', '10 mg oral', '3x per week', 0),
('cccccccc-0004-0003-0000-000000000001', 'Selank', '250 mcg/nostril', 'Once daily maintenance', 1);

insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
('cccccccc-0005-0001-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', 1, 'Neurological & Systemic Foundation', 'Cerebrolysin for neuroplasticity. BPC-157 for systemic and neural repair.'),
('cccccccc-0005-0002-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', 2, 'Synaptogenesis Phase', 'Add Dihexa. Repeat Cerebrolysin. Continue BPC-157.'),
('cccccccc-0005-0003-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', 3, 'Functional Integration', 'Maintenance protocol. Combine with physical and occupational therapy.');

insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
('cccccccc-0005-0001-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 consecutive days', 0),
('cccccccc-0005-0001-0000-000000000001', 'BPC-157', '500 mcg', 'Once daily subcutaneous', 1),
('cccccccc-0005-0002-0000-000000000001', 'Cerebrolysin', '10 mL IM daily', '10 days', 0),
('cccccccc-0005-0002-0000-000000000001', 'Dihexa', '10 mg oral', '3–5x per week', 1),
('cccccccc-0005-0002-0000-000000000001', 'BPC-157', '500 mcg', 'Once daily subcutaneous', 2),
('cccccccc-0005-0003-0000-000000000001', 'Dihexa', '10 mg oral', '3x per week', 0),
('cccccccc-0005-0003-0000-000000000001', 'BPC-157', '250 mcg', 'Once daily subcutaneous', 1);

-- EBV, MS, RA, Mold, Joint Degen, Post-Surg, Chronic Pain, Rotator, Frozen, ACL, Meniscus, Hip, Ankle, Stress Fx, Leaky Gut, Joint Inflam Systemic, Sleep+Cog
-- Generic 3-month structure for remaining protocols
do $$
declare
  p record;
  m1_id uuid;
  m2_id uuid;
  m3_id uuid;
begin
  for p in
    select id, condition_name, primary_peptide, adjunct_peptides
    from protocols
    where id not in (
      select distinct protocol_id from protocol_months
    )
  loop
    m1_id := gen_random_uuid();
    m2_id := gen_random_uuid();
    m3_id := gen_random_uuid();

    insert into protocol_months (id, protocol_id, month_number, title, clinical_note) values
    (m1_id, p.id, 1, 'Foundation & Loading Phase', 'Begin all peptides at full loading dose. Establish injection routine and monitor tolerance.'),
    (m2_id, p.id, 2, 'Optimization Phase', 'Assess initial response. Adjust doses as needed. Add or modify adjunct peptides per clinical response.'),
    (m3_id, p.id, 3, 'Maintenance & Assessment', 'Reduce to maintenance doses. Evaluate clinical outcomes. Plan next cycle or transition to maintenance.');

    -- Month 1 rows
    insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
    (m1_id, p.primary_peptide, 'Per standard protocol', 'As directed', 0);

    if array_length(p.adjunct_peptides, 1) >= 1 then
      insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
      (m1_id, p.adjunct_peptides[1], 'Per standard protocol', 'As directed', 1);
    end if;

    -- Month 2 rows
    insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
    (m2_id, p.primary_peptide, 'Per standard protocol', 'As directed', 0);

    if array_length(p.adjunct_peptides, 1) >= 1 then
      insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
      (m2_id, p.adjunct_peptides[1], 'Per standard protocol', 'As directed', 1);
    end if;

    if array_length(p.adjunct_peptides, 1) >= 2 then
      insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
      (m2_id, p.adjunct_peptides[2], 'Per standard protocol', 'As directed', 2);
    end if;

    -- Month 3 rows
    insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
    (m3_id, p.primary_peptide, 'Maintenance dose', 'As directed', 0);

    if array_length(p.adjunct_peptides, 1) >= 1 then
      insert into protocol_month_rows (month_id, peptide_name, dose, schedule, sort_order) values
      (m3_id, p.adjunct_peptides[1], 'Maintenance dose', 'As directed', 1);
    end if;
  end loop;
end $$;
