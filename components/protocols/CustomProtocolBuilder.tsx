"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Check, ChevronRight, ChevronLeft, Wrench, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Peptide, DeliveryForm, ScheduleType } from "@/lib/types";
import { toast } from "sonner";

// ─── Speed config ─────────────────────────────────────────────

type Speed = "gentle" | "standard" | "accelerated";

const SPEEDS = [
  {
    value: "gentle" as Speed,
    emoji: "🐢",
    label: "Gentle",
    color: "#6e88b0",
    bg: "rgba(110,136,176,0.12)",
    border: "rgba(110,136,176,0.3)",
    description: "Start low, stay there longer. Best for first-timers, sensitive patients, autoimmune history.",
  },
  {
    value: "standard" as Speed,
    emoji: "✅",
    label: "Standard",
    color: "#54c7a2",
    bg: "rgba(84,199,162,0.12)",
    border: "rgba(84,199,162,0.35)",
    description: "Textbook titration. Follows clinical protocol as written for each peptide class.",
  },
  {
    value: "accelerated" as Speed,
    emoji: "⚡",
    label: "Accelerated",
    color: "#e8b86d",
    bg: "rgba(232,184,109,0.12)",
    border: "rgba(232,184,109,0.35)",
    description: "Reaches therapeutic dose faster. For experienced patients with established tolerance.",
  },
];

const DELIVERY_LABELS: Record<DeliveryForm, string> = {
  subq: "SubQ injection",
  capsule: "Oral capsule",
  intranasal: "Intranasal",
  topical: "Topical",
  iv: "IV infusion",
  im: "IM injection",
  transdermal: "Transdermal",
};

const CATEGORIES = [
  "Neurologic","Immune/Infectious","Autoimmune","Musculoskeletal",
  "Metabolic","Longevity","Sleep/Stress","GI/Autoimmune","GI",
  "Sleep/Cognitive","Musculoskeletal/Autoimmune","Recovery/Performance",
  "Anti-Aging/Skin","Custom",
];

// ─── Phase label configs per schedule type ────────────────────

interface PhaseConfig { period: string; note: string; }

const PHASE_CONFIGS: Record<ScheduleType, Record<Speed, PhaseConfig[]>> = {
  "monthly-ramp": {
    gentle: [
      { period: "Month 1", note: "Half loading dose — hold here until fully tolerated" },
      { period: "Month 2", note: "Advance only if Month 1 was uneventful" },
      { period: "Month 3", note: "Consolidation — not yet at full therapeutic dose" },
    ],
    standard: [
      { period: "Month 1", note: "Loading phase — establish tissue peptide levels" },
      { period: "Month 2", note: "Therapeutic dose — core healing and regenerative window" },
      { period: "Month 3", note: "Maintenance — consider cycling off after this month" },
    ],
    accelerated: [
      { period: "Month 1", note: "Start at therapeutic dose — experienced patients only" },
      { period: "Month 2", note: "Full maintenance — monitor response weekly" },
      { period: "Month 3", note: "Continue at peak — reassess before additional cycles" },
    ],
  },
  "weekly-titration": {
    gentle: [
      { period: "Week 1–4", note: "Lowest starting dose — hold 6 weeks before escalating" },
      { period: "Week 5–8", note: "First step-up only after GI/systemic tolerance confirmed" },
      { period: "Week 9+", note: "Mid-range target — may stop here, no need to rush to max" },
    ],
    standard: [
      { period: "Week 1–4", note: "Standard starting dose — monitor tolerance weekly" },
      { period: "Week 5–8", note: "Advancing toward therapeutic range" },
      { period: "Week 9+", note: "Target maintenance dose — review labs and efficacy" },
    ],
    accelerated: [
      { period: "Week 1–4", note: "Start above baseline — prior exposure confirmed" },
      { period: "Week 5–8", note: "Advance every 2–3 weeks if fully tolerated" },
      { period: "Week 9+", note: "Full therapeutic dose — confirm with labs" },
    ],
  },
  "nightly-cycle": {
    gentle: [
      { period: "Weeks 1–2", note: "Every-other-night dosing — ease into hormone response" },
      { period: "Weeks 3–4", note: "Advance to nightly only if sleep quality improved" },
      { period: "Maintenance", note: "5 nights on / 2 off — conservative ongoing cycle" },
    ],
    standard: [
      { period: "Weeks 1–2", note: "Nightly dosing from start — track sleep quality daily" },
      { period: "Weeks 3–4", note: "Advancing to full dose as tolerance established" },
      { period: "Maintenance", note: "5 nights on / 2 off — standard ongoing cycle" },
    ],
    accelerated: [
      { period: "Weeks 1–2", note: "Full dose immediately — established baseline patients" },
      { period: "Weeks 3–4", note: "Hold at peak — confirm hormone and sleep markers" },
      { period: "Maintenance", note: "Daily or 6-on/1-off — reassess every 4 weeks" },
    ],
  },
  "burst-cycle": {
    gentle: [
      { period: "Cycle On — 14 days", note: "14-day burst at conservative dose — then full break" },
      { period: "Cycle Off — 28 days", note: "28-day rest — allow endogenous levels to recover" },
      { period: "Next Cycle", note: "Reassess before repeating — typically 1 cycle per quarter" },
    ],
    standard: [
      { period: "Cycle On — 10 days", note: "10-day burst at standard dose — textbook protocol" },
      { period: "Cycle Off — 20 days", note: "20-day rest — standard clinical recovery window" },
      { period: "Next Cycle", note: "Repeat 1–2x/quarter based on labs and clinical response" },
    ],
    accelerated: [
      { period: "Cycle On — 7 days", note: "7-day high-intensity burst — experienced patients only" },
      { period: "Cycle Off — 14 days", note: "14-day rest — shorter window between cycles" },
      { period: "Next Cycle", note: "Up to 3 cycles/quarter — monitor closely each cycle" },
    ],
  },
  "weekly-flat": {
    gentle: [
      { period: "Weekly Dose", note: "Lower end of therapeutic range — ideal starting point" },
      { period: "Ongoing", note: "No titration needed — review labs at 8 weeks" },
      { period: "Adjust PRN", note: "Increase only if labs show sub-response" },
    ],
    standard: [
      { period: "Weekly Dose", note: "Mid-range therapeutic dose — no titration required" },
      { period: "Ongoing", note: "Continue weekly — review efficacy every 8 weeks" },
      { period: "Adjust PRN", note: "Dose adjustments based on labs and clinical response" },
    ],
    accelerated: [
      { period: "Weekly Dose", note: "Upper therapeutic range — confirm with baseline labs first" },
      { period: "Ongoing", note: "Maintain at peak — monthly monitoring recommended" },
      { period: "Adjust PRN", note: "Step down if adverse markers appear" },
    ],
  },
  "daily-cycle": {
    gentle: [
      { period: "Week 1–2", note: "Every other day — ease into daily dosing" },
      { period: "Week 3–4", note: "Advance to daily only if no adverse response" },
      { period: "Maintenance", note: "Daily dosing — reassess every 4 weeks" },
    ],
    standard: [
      { period: "Week 1–2", note: "Daily from start — standard loading window" },
      { period: "Week 3–4", note: "Continue daily at standard dose" },
      { period: "Maintenance", note: "Ongoing daily — monitor labs monthly" },
    ],
    accelerated: [
      { period: "Week 1–2", note: "Full daily dose immediately — experienced patients" },
      { period: "Week 3–4", note: "Hold at peak — confirm response markers" },
      { period: "Maintenance", note: "Continue at peak — monthly reassessment" },
    ],
  },
};

// Speed → which sort_order index to use per phase [phase1, phase2, phase3]
const SPEED_IDX: Record<Speed, [number, number, number]> = {
  gentle:      [0, 0, 1],
  standard:    [0, 1, 2],
  accelerated: [1, 2, 2],
};

// For peptides with >3 dosing rows (week-by-week granularity)
const SPEED_IDX_WEEKLY: Record<Speed, [number, number, number]> = {
  gentle:      [0, 1, 4],
  standard:    [0, 2, 3],
  accelerated: [1, 3, 5],
};

// ─── Phase builder ────────────────────────────────────────────

interface PhaseData {
  period: string;
  dose: string;
  frequency: string;
  note: string;
  isRest?: boolean;
}

function buildPhases(peptide: Peptide, speed: Speed, deliveryForm: DeliveryForm): PhaseData[] {
  const scheduleType = peptide.schedule_type || "monthly-ramp";
  const dosing = (peptide.dosing || [])
    .filter(d => !d.delivery_form || d.delivery_form === deliveryForm || d.delivery_form === "subq")
    .sort((a, b) => a.sort_order - b.sort_order);

  const configs = PHASE_CONFIGS[scheduleType]?.[speed] || PHASE_CONFIGS["monthly-ramp"][speed];
  const hasWeekly = dosing.length > 3;
  const idxs = hasWeekly ? SPEED_IDX_WEEKLY[speed] : SPEED_IDX[speed];

  function dosingAt(phaseIdx: number) {
    const idx = Math.min(idxs[phaseIdx], Math.max(0, dosing.length - 1));
    const d = dosing[idx];
    return {
      dose: d?.dose ?? "—",
      frequency: d?.notes ?? d?.period ?? "As directed",
    };
  }

  if (scheduleType === "burst-cycle") {
    const on = dosingAt(0);
    return [
      { period: configs[0].period, dose: on.dose, frequency: on.frequency, note: configs[0].note },
      { period: configs[1].period, dose: "—", frequency: "Rest — no dose", note: configs[1].note, isRest: true },
      { period: configs[2].period, dose: "—", frequency: "PRN", note: configs[2].note },
    ];
  }

  if (scheduleType === "weekly-flat") {
    const flat = dosingAt(1);
    return configs.map(c => ({ period: c.period, dose: flat.dose, frequency: flat.frequency, note: c.note }));
  }

  return configs.map((c, i) => ({ period: c.period, ...dosingAt(i), note: c.note }));
}

// ─── Types ────────────────────────────────────────────────────

interface SelectedPeptide {
  peptide: Peptide;
  speed: Speed;
  deliveryForm: DeliveryForm;
}

// ─── Styles ───────────────────────────────────────────────────

const inputStyle = {
  backgroundColor: "#142035",
  border: "1px solid #1e3055",
  color: "#ccd9ee",
  borderRadius: "0.5rem",
  padding: "0.625rem 0.875rem",
  fontSize: "0.875rem",
  width: "100%",
};

// ─── Component ────────────────────────────────────────────────

export default function CustomProtocolBuilder() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Custom");
  const [library, setLibrary] = useState<Peptide[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedPeptide[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || library.length > 0) return;
    setLibraryLoading(true);
    createClient()
      .from("peptides")
      .select("*, dosing:peptide_dosing(*)")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setLibrary((data as Peptide[]) || []);
        setLibraryLoading(false);
      });
  }, [open, library.length]);

  function handleClose() {
    setOpen(false);
    setStep(1);
    setTitle("");
    setCategory("Custom");
    setSearch("");
    setSelected([]);
  }

  function togglePeptide(peptide: Peptide) {
    setSelected(prev => {
      if (prev.find(s => s.peptide.id === peptide.id))
        return prev.filter(s => s.peptide.id !== peptide.id);
      const defaultForm = peptide.default_delivery_form || "subq";
      return [...prev, { peptide, speed: "standard", deliveryForm: defaultForm }];
    });
  }

  function setSpeed(peptideId: string, speed: Speed) {
    setSelected(prev => prev.map(s => s.peptide.id === peptideId ? { ...s, speed } : s));
  }

  function setDeliveryForm(peptideId: string, form: DeliveryForm) {
    setSelected(prev => prev.map(s => s.peptide.id === peptideId ? { ...s, deliveryForm: form } : s));
  }

  async function handleSave() {
    if (!title.trim()) { toast.error("Enter a protocol name"); return; }
    if (selected.length === 0) { toast.error("Select at least one peptide"); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
      const { data: protocol, error: pErr } = await supabase
        .from("protocols")
        .insert({
          condition_name: title, slug, category,
          primary_peptide: selected[0].peptide.name,
          adjunct_peptides: selected.length > 1 ? selected.slice(1).map(s => s.peptide.name) : null,
          is_active: true, is_featured: false,
        })
        .select().single();
      if (pErr) throw pErr;

      const dominant = selected.find(sp => sp.peptide.schedule_type !== "weekly-flat") || selected[0];
      const dominantPhases = buildPhases(dominant.peptide, dominant.speed, dominant.deliveryForm);

      for (let phaseIdx = 0; phaseIdx < 3; phaseIdx++) {
        const phaseLabel = dominantPhases[phaseIdx];
        const { data: month, error: mErr } = await supabase
          .from("protocol_months")
          .insert({
            protocol_id: protocol.id,
            month_number: phaseIdx + 1,
            title: phaseLabel.period,
            clinical_note: phaseLabel.note,
            sort_order: phaseIdx,
          })
          .select().single();
        if (mErr) throw mErr;

        for (let i = 0; i < selected.length; i++) {
          const sp = selected[i];
          const phases = buildPhases(sp.peptide, sp.speed, sp.deliveryForm);
          const phase = phases[phaseIdx];
          if (phase.isRest) continue;
          await supabase.from("protocol_month_rows").insert({
            month_id: month.id,
            peptide_name: sp.peptide.name,
            dose: phase.dose,
            schedule: `${phase.frequency} · ${DELIVERY_LABELS[sp.deliveryForm] || sp.deliveryForm}`,
            sort_order: i,
          });
        }
      }

      toast.success(`"${title}" saved to Protocol Library`);
      handleClose();
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save protocol");
    } finally {
      setSaving(false);
    }
  }

  const branded = library.filter(p => p.is_brand_product && p.name.toLowerCase().includes(search.toLowerCase()));
  const partner = library.filter(p => !p.is_brand_product && p.name.toLowerCase().includes(search.toLowerCase()));
  const filtered = search
    ? library.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase()))
    : null;

  const SCHEDULE_LABELS: Record<string, string> = {
    "monthly-ramp": "Monthly ramp",
    "weekly-titration": "Weekly titration",
    "nightly-cycle": "Nightly cycle",
    "burst-cycle": "Burst cycle",
    "weekly-flat": "Weekly flat",
    "daily-cycle": "Daily cycle",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
        style={{ backgroundColor: "#142035", color: "#ccd9ee", border: "1px solid #1e3055", fontFamily: "'DM Mono', monospace" }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#1e3055"; e.currentTarget.style.borderColor = "#e8c96e"; e.currentTarget.style.color = "#e8c96e"; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#142035"; e.currentTarget.style.borderColor = "#1e3055"; e.currentTarget.style.color = "#ccd9ee"; }}
      >
        <Wrench size={14} /> Build Custom Protocol
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: "rgba(11,17,32,0.8)" }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
          <div className="ml-auto h-full w-full max-w-xl flex flex-col" style={{ backgroundColor: "#0f1a2e", borderLeft: "1px solid #1e3055" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: "#1e3055", borderTop: "2px solid #e8c96e" }}>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}>
                  <Wrench size={16} style={{ color: "#e8c96e" }} /> Build Custom Protocol
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                  Step {step} of 3 — {step === 1 ? "Details" : step === 2 ? "Select Peptides" : "Preview & Save"}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg" style={{ color: "#6e88b0" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ccd9ee")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6e88b0")}>
                <X size={18} />
              </button>
            </div>

            {/* Progress */}
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="flex gap-1.5">
                {[1, 2, 3].map(s => (
                  <div key={s} className="h-1 flex-1 rounded-full"
                    style={{ backgroundColor: s <= step ? "#e8c96e" : "#1e3055" }} />
                ))}
              </div>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5"
                    style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                    Protocol Name / Condition *
                  </label>
                  <input style={inputStyle} value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Post-Surgical Recovery, Chronic Fatigue..."
                    className="focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5"
                    style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                    Category
                  </label>
                  <select style={inputStyle} value={category}
                    onChange={e => setCategory(e.target.value)} className="focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Speed explainer */}
                <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}>
                  <p className="text-xs font-medium" style={{ color: "#ccd9ee" }}>How titration speeds work</p>
                  {SPEEDS.map(s => (
                    <div key={s.value} className="flex items-start gap-2">
                      <span className="text-sm leading-none mt-0.5">{s.emoji}</span>
                      <p className="text-xs leading-relaxed" style={{ color: "#6e88b0" }}>
                        <span style={{ color: s.color }}>{s.label}</span> — {s.description}
                      </p>
                    </div>
                  ))}
                </div>

                <button onClick={() => { if (title.trim()) setStep(2); else toast.error("Enter a protocol name"); }}
                  className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}>
                  Select Peptides <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e3055" }}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6e88b0" }} />
                    <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search peptides..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
                      style={{ backgroundColor: "#142035", border: "1px solid #1e3055", color: "#ccd9ee" }} />
                  </div>
                  {selected.length > 0 && (
                    <p className="text-xs mt-2" style={{ color: "#54c7a2", fontFamily: "'DM Mono', monospace" }}>
                      {selected.length} peptide{selected.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {libraryLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <p className="text-sm" style={{ color: "#6e88b0" }}>Loading peptide library...</p>
                    </div>
                  ) : (
                    [
                      { label: "CA Peptide Labs", items: filtered ? filtered.filter(p => p.is_brand_product) : branded, accent: "#e8c96e" },
                      { label: "Partner Sourced", items: filtered ? filtered.filter(p => !p.is_brand_product) : partner, accent: "#6e88b0" },
                    ].map(({ label, items, accent }) =>
                      items.length === 0 ? null : (
                        <div key={label}>
                          <div className="px-6 py-2.5 sticky top-0"
                            style={{ backgroundColor: "#0b1120", borderBottom: "1px solid #1e3055" }}>
                            <p className="text-xs uppercase tracking-widest"
                              style={{ fontFamily: "'DM Mono', monospace", color: accent }}>{label}</p>
                          </div>
                          {items.map(p => {
                            const isSelected = selected.some(s => s.peptide.id === p.id);
                            return (
                              <button key={p.id} onClick={() => togglePeptide(p)}
                                className="w-full text-left px-6 py-3.5 border-b transition-colors"
                                style={{ borderColor: "rgba(30,48,85,0.5)", backgroundColor: isSelected ? "rgba(84,199,162,0.06)" : "transparent" }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "#142035"; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: isSelected ? "#54c7a2" : "#ccd9ee" }}>
                                      {p.name}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                                      {SCHEDULE_LABELS[p.schedule_type || "monthly-ramp"]}
                                      {p.available_forms && p.available_forms.length > 1 &&
                                        ` · ${p.available_forms.length} forms`}
                                    </p>
                                  </div>
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: isSelected ? "#54c7a2" : "transparent", border: `1px solid ${isSelected ? "#54c7a2" : "#1e3055"}` }}>
                                    {isSelected && <Check size={11} style={{ color: "#0b1120" }} />}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )
                    )
                  )}
                </div>

                {/* Selected peptides panel */}
                {selected.length > 0 && (
                  <div className="border-t flex-shrink-0" style={{ borderColor: "#1e3055", maxHeight: "55vh", overflowY: "auto" }}>
                    <div className="px-6 py-3 sticky top-0 z-10" style={{ backgroundColor: "#0b1120", borderBottom: "1px solid #1e3055" }}>
                      <p className="text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                        Titration Speed · Delivery Form · Timeline
                      </p>
                    </div>
                    <div className="px-6 py-4 space-y-5">
                      {selected.map(sp => {
                        const phases = buildPhases(sp.peptide, sp.speed, sp.deliveryForm);
                        const activeSpeed = SPEEDS.find(s => s.value === sp.speed)!;
                        const availableForms = sp.peptide.available_forms || ["subq"];
                        const dilutionNote = sp.peptide.dosing?.find(d => d.dilution_note)?.dilution_note;

                        return (
                          <div key={sp.peptide.id} className="rounded-xl overflow-hidden"
                            style={{ border: "1px solid #1e3055" }}>

                            {/* Peptide header */}
                            <div className="flex items-center justify-between px-4 py-3"
                              style={{ backgroundColor: "#142035", borderBottom: "1px solid #1e3055" }}>
                              <p className="text-sm font-medium" style={{ color: "#ccd9ee" }}>{sp.peptide.name}</p>
                              <button onClick={() => setSelected(prev => prev.filter(s => s.peptide.id !== sp.peptide.id))}
                                style={{ color: "#6e88b0" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#e05a6a")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#6e88b0")}>
                                <X size={13} />
                              </button>
                            </div>

                            {/* Delivery form selector — only if multiple forms available */}
                            {availableForms.length > 1 && (
                              <div className="flex border-b" style={{ borderColor: "#1e3055" }}>
                                {availableForms.map(form => (
                                  <button key={form}
                                    onClick={() => setDeliveryForm(sp.peptide.id, form)}
                                    className="flex-1 py-1.5 text-xs transition-all"
                                    style={{
                                      backgroundColor: sp.deliveryForm === form ? "rgba(84,199,162,0.1)" : "transparent",
                                      color: sp.deliveryForm === form ? "#54c7a2" : "#4a6080",
                                      borderRight: form !== availableForms[availableForms.length - 1] ? "1px solid #1e3055" : "none",
                                      fontFamily: "'DM Mono', monospace",
                                    }}>
                                    {DELIVERY_LABELS[form] || form}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Speed selector */}
                            <div className="flex border-b" style={{ borderColor: "#1e3055" }}>
                              {SPEEDS.map(s => {
                                const active = sp.speed === s.value;
                                return (
                                  <button key={s.value} onClick={() => setSpeed(sp.peptide.id, s.value)}
                                    className="flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                                    style={{
                                      backgroundColor: active ? s.bg : "transparent",
                                      color: active ? s.color : "#4a6080",
                                      borderRight: s.value !== "accelerated" ? "1px solid #1e3055" : "none",
                                      fontFamily: "'DM Mono', monospace",
                                    }}>
                                    <span>{s.emoji}</span><span>{s.label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Dilution warning */}
                            {dilutionNote && (
                              <div className="px-3 py-2 flex items-start gap-2"
                                style={{ backgroundColor: "rgba(232,184,109,0.06)", borderBottom: "1px solid rgba(232,184,109,0.15)" }}>
                                <AlertTriangle size={11} style={{ color: "#e8b86d", flexShrink: 0, marginTop: 2 }} />
                                <p style={{ color: "#e8b86d", fontSize: "0.62rem", fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>
                                  {dilutionNote}
                                </p>
                              </div>
                            )}

                            {/* Phase timeline */}
                            <div className="grid grid-cols-3 divide-x" style={{ borderColor: "#1e3055" }}>
                              {phases.map((phase, i) => (
                                <div key={i} className="p-3 space-y-1"
                                  style={{
                                    backgroundColor: phase.isRest ? "rgba(11,17,32,0.5)" : "transparent",
                                    borderRight: i < 2 ? "1px solid #1e3055" : "none",
                                    opacity: phase.isRest ? 0.6 : 1,
                                  }}>
                                  <p style={{ fontFamily: "'DM Mono', monospace", color: activeSpeed.color, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                                    {phase.period}
                                  </p>
                                  {!phase.isRest ? (
                                    <>
                                      <p className="text-xs font-medium leading-snug" style={{ color: "#e8c96e" }}>
                                        {phase.dose}
                                      </p>
                                      <p style={{ color: "#6e88b0", fontSize: "0.6rem", fontFamily: "'DM Mono', monospace", lineHeight: 1.4 }}>
                                        {phase.frequency}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-xs" style={{ color: "#6e88b0" }}>Rest</p>
                                  )}
                                  <p style={{ color: "#4a6080", fontSize: "0.58rem", fontStyle: "italic", lineHeight: 1.4 }}>
                                    {phase.note}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e3055" }}>
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#142035", color: "#ccd9ee", border: "1px solid #1e3055" }}>
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button onClick={() => { if (selected.length > 0) setStep(3); else toast.error("Select at least one peptide"); }}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}>
                    Preview <ChevronRight size={15} />
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="rounded-xl p-4"
                  style={{ backgroundColor: "#142035", border: "1px solid #1e3055", borderTop: "2px solid #e8c96e" }}>
                  <p className="text-xs uppercase tracking-widest mb-1"
                    style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>Protocol Template</p>
                  <h3 className="text-base font-semibold"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#e8c96e" }}>{title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                    {category} · {selected.length} peptide{selected.length !== 1 ? "s" : ""} · 3-phase cycle
                  </p>
                </div>

                {selected.map(sp => {
                  const phases = buildPhases(sp.peptide, sp.speed, sp.deliveryForm);
                  const activeSpeed = SPEEDS.find(s => s.value === sp.speed)!;
                  return (
                    <div key={sp.peptide.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e3055" }}>
                      <div className="flex items-center justify-between px-4 py-3 border-b"
                        style={{ backgroundColor: "#142035", borderColor: "#1e3055" }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#ccd9ee" }}>{sp.peptide.name}</p>
                          <p className="text-xs" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                            {DELIVERY_LABELS[sp.deliveryForm] || sp.deliveryForm}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: activeSpeed.color, backgroundColor: activeSpeed.bg, border: `1px solid ${activeSpeed.border}` }}>
                          {activeSpeed.emoji} {activeSpeed.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3">
                        {phases.map((phase, i) => (
                          <div key={i} className="p-3 space-y-1"
                            style={{ borderRight: i < 2 ? "1px solid #1e3055" : "none", backgroundColor: phase.isRest ? "rgba(11,17,32,0.4)" : "transparent", opacity: phase.isRest ? 0.55 : 1 }}>
                            <p style={{ fontFamily: "'DM Mono', monospace", color: activeSpeed.color, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                              {phase.period}
                            </p>
                            {!phase.isRest ? (
                              <>
                                <p className="text-xs font-medium" style={{ color: "#e8c96e" }}>{phase.dose}</p>
                                <p style={{ color: "#6e88b0", fontSize: "0.6rem", fontFamily: "'DM Mono', monospace" }}>{phase.frequency}</p>
                              </>
                            ) : (
                              <p className="text-xs" style={{ color: "#6e88b0" }}>Rest period</p>
                            )}
                            <p style={{ color: "#4a6080", fontSize: "0.58rem", fontStyle: "italic", lineHeight: 1.4 }}>{phase.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-lg px-4 py-3"
                  style={{ backgroundColor: "rgba(232,201,110,0.05)", border: "1px solid rgba(232,201,110,0.15)" }}>
                  <p className="text-xs" style={{ color: "#6e88b0" }}>
                    This protocol will be saved to your library and can be assigned to any client from their profile page.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#142035", color: "#ccd9ee", border: "1px solid #1e3055" }}>
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                    style={{ backgroundColor: "#e8c96e", color: "#0b1120", opacity: saving ? 0.8 : 1 }}>
                    {saving ? "Saving..." : <><Check size={15} /> Save Protocol</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
