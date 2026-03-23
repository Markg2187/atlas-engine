"use client";

import { useState } from "react";
import { Scale, BookOpen, DollarSign, TrendingDown, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { calcWeightBasedDose } from "@/lib/cycling";

type DoseUnit = "mcg" | "mg";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function calcMargin(retail: number, wholesale: number) {
  if (retail <= 0) return 0;
  return ((retail - wholesale) / retail) * 100;
}
function getMarginColor(margin: number, minimum: number) {
  if (margin < 0) return "#e05a6a";
  if (margin < minimum) return "#e8b86d";
  if (margin < minimum + 10) return "#c9973a";
  return "#54c7a2";
}
function calcRecon(vialMg: number, bacMl: number, dose: number, unit: DoseUnit) {
  const doseInMcg = unit === "mg" ? dose * 1000 : dose;
  const concMgMl = vialMg / bacMl;
  const concMcgMl = concMgMl * 1000;
  const volumeMl = doseInMcg / concMcgMl;
  const unitsU100 = volumeMl * 100;
  const dosesPerVial = Math.floor((vialMg * 1000) / doseInMcg);
  const syringe = unitsU100 <= 30 ? "0.3ml (30 unit)" : unitsU100 <= 50 ? "0.5ml (50 unit)" : "1ml (100 unit)";
  const syringeMax = unitsU100 <= 30 ? 30 : unitsU100 <= 50 ? 50 : 100;
  const splitWarning = volumeMl > 1.0 ? `Volume ${volumeMl.toFixed(2)}ml — split into 2 injection sites` : null;
  return { concMgMl, concMcgMl, doseInMcg, volumeMl, unitsU100, dosesPerVial, syringe, syringeMax, splitWarning };
}

// ─── Frequency options per peptide type ──────────────────────
interface FreqOption { label: string; value: number; display: string; }

const FREQ_DAILY: FreqOption[] = [
  { label: "1x/day", value: 1, display: "daily" },
  { label: "2x/day", value: 2, display: "twice daily" },
  { label: "3x/day", value: 3, display: "three times daily" },
];
const FREQ_WEEKLY: FreqOption[] = [
  { label: "1x/week", value: 1/7, display: "once weekly" },
  { label: "2x/week (microdose)", value: 2/7, display: "twice weekly" },
];
const FREQ_NIGHTLY: FreqOption[] = [
  { label: "5 nights/week", value: 5/7, display: "5 nights/week" },
  { label: "Nightly", value: 1, display: "nightly" },
  { label: "Every other night", value: 0.5, display: "every other night" },
];
const FREQ_TWICE_WEEKLY: FreqOption[] = [
  { label: "2x/week", value: 2/7, display: "twice weekly" },
  { label: "3x/week", value: 3/7, display: "3x weekly" },
];
const FREQ_BURST: FreqOption[] = [
  { label: "Daily (burst cycle)", value: 1, display: "daily during cycle" },
];

// ─── Peptide presets ──────────────────────────────────────────
interface Preset {
  name: string; vialMg: number; bacMl: number;
  dose: number; unit: DoseUnit; dilution: string | null;
  freqOptions: FreqOption[]; defaultFreqIdx: number;
}

const PRESETS: Preset[] = [
  { name: "BPC-157",      vialMg: 5,   bacMl: 2.5, dose: 250,  unit: "mcg", dilution: null,                                                              freqOptions: FREQ_DAILY,        defaultFreqIdx: 0 },
  { name: "TB-500",       vialMg: 5,   bacMl: 2,   dose: 4,    unit: "mg",  dilution: null,                                                              freqOptions: FREQ_TWICE_WEEKLY, defaultFreqIdx: 0 },
  { name: "GHK-Cu",       vialMg: 10,  bacMl: 2,   dose: 1,    unit: "mg",  dilution: "Dilute more (3-4ml BAC) if patient reports copper taste or flushing", freqOptions: FREQ_DAILY,     defaultFreqIdx: 0 },
  { name: "Semaglutide",  vialMg: 5,   bacMl: 2,   dose: 250,  unit: "mcg", dilution: null,                                                              freqOptions: FREQ_WEEKLY,       defaultFreqIdx: 0 },
  { name: "Retatrutide",  vialMg: 20,  bacMl: 2,   dose: 2,    unit: "mg",  dilution: "Split >1ml into 2 sites. Never exceed 12mg/week.",                freqOptions: FREQ_WEEKLY,       defaultFreqIdx: 0 },
  { name: "NAD+",         vialMg: 500, bacMl: 5,   dose: 250,  unit: "mg",  dilution: "Dilute heavily for histamine-sensitive patients. Slow push only.", freqOptions: FREQ_TWICE_WEEKLY, defaultFreqIdx: 0 },
  { name: "MOTS-C",       vialMg: 10,  bacMl: 4,   dose: 10,   unit: "mg",  dilution: null,                                                              freqOptions: FREQ_WEEKLY,       defaultFreqIdx: 0 },
  { name: "CJC/Ipa",      vialMg: 5,   bacMl: 2,   dose: 200,  unit: "mcg", dilution: null,                                                              freqOptions: FREQ_NIGHTLY,      defaultFreqIdx: 0 },
  { name: "Epitalon",     vialMg: 10,  bacMl: 2,   dose: 5,    unit: "mg",  dilution: null,                                                              freqOptions: FREQ_BURST,        defaultFreqIdx: 0 },
  { name: "Thymosin α-1", vialMg: 5,   bacMl: 2,   dose: 1500, unit: "mcg", dilution: null,                                                              freqOptions: FREQ_TWICE_WEEKLY, defaultFreqIdx: 0 },
  { name: "Cerebrolysin", vialMg: 10,  bacMl: 2,   dose: 20,   unit: "mg",  dilution: null,                                                              freqOptions: FREQ_DAILY,        defaultFreqIdx: 0 },
  { name: "Wolverine",    vialMg: 5,   bacMl: 2,   dose: 500,  unit: "mcg", dilution: null,                                                              freqOptions: FREQ_DAILY,        defaultFreqIdx: 0 },
  { name: "Tesamorelin",  vialMg: 1,   bacMl: 1,   dose: 1,    unit: "mg",  dilution: null,                                                              freqOptions: FREQ_DAILY,        defaultFreqIdx: 0 },
  { name: "Custom",       vialMg: 5,   bacMl: 2,   dose: 250,  unit: "mcg", dilution: null,                                                              freqOptions: FREQ_DAILY,        defaultFreqIdx: 0 },
];

const DISCOUNT_PRESETS = [
  { name: "Family plan",  pct: 20, color: "#54c7a2" },
  { name: "VIP client",   pct: 15, color: "#c9973a" },
  { name: "Staff",        pct: 30, color: "#5a6a7a" },
  { name: "Referral",     pct: 10, color: "#a87c2e" },
  { name: "Sale / Promo", pct: 25, color: "#e05a6a" },
];

// ─── Styles ───────────────────────────────────────────────────
const inp = {
  backgroundColor: "#f5f3ee", border: "1px solid #e8e0d0",
  color: "#1a2744", borderRadius: "0.5rem",
  padding: "0.625rem 0.75rem", fontSize: "1rem",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", width: "100%",
  WebkitAppearance: "none" as const,
} as React.CSSProperties;

const lbl = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: "0.875rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  color: "#5a4a3a", display: "block", marginBottom: "0.375rem",
};
const res = {
  backgroundColor: "#ffffff", border: "1.5px solid #d4c9b8",
  borderRadius: "0.5rem", padding: "0.75rem 1rem",
} as React.CSSProperties;

function MarginBar({ margin, minimum, label }: { margin: number; minimum: number; label?: string }) {
  const color = getMarginColor(margin, minimum);
  const pct = Math.max(0, Math.min(100, margin));
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#5a6a7a" }}>{label}</span>
          <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color, fontWeight: 600 }}>{margin.toFixed(1)}%</span>
        </div>
      )}
      <div style={{ height: "6px", backgroundColor: "#ffffff", borderRadius: "3px", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "3px", transition: "width 0.3s ease" }} />
        <div style={{ position: "absolute", left: `${Math.min(100, minimum)}%`, top: 0, height: "100%", width: "2px", backgroundColor: "#8a7a5a" }} />
      </div>
      {margin < minimum && margin >= 0 && <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#e8b86d", marginTop: "0.2rem" }}>Below {minimum}% minimum margin</p>}
      {margin < 0 && <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#e05a6a", marginTop: "0.2rem" }}>Selling at a loss</p>}
    </div>
  );
}

// ─── Smart number input — clears 0 on focus, mobile friendly ──
function NumInput({ value, onChange, step, placeholder, style }: {
  value: number; onChange: (v: number) => void;
  step?: number; placeholder?: string; style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(value === 0 ? "" : String(value));
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step || "any"}
      placeholder={placeholder || "0"}
      value={display}
      onFocus={() => { if (Number(display) === 0) setDisplay(""); }}
      onChange={e => {
        setDisplay(e.target.value);
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) onChange(n);
      }}
      onBlur={() => { if (display === "" || isNaN(Number(display))) { setDisplay("0"); onChange(0); } }}
      style={{ ...inp, ...style }}
    />
  );
}

export default function CalculatorPage() {
  const [activePreset, setActivePreset] = useState(0);
  const [vialMg, setVialMg] = useState(PRESETS[0].vialMg);
  const [bacMl, setBacMl] = useState(PRESETS[0].bacMl);
  const [dose, setDose] = useState(PRESETS[0].dose);
  const [doseUnit, setDoseUnit] = useState<DoseUnit>(PRESETS[0].unit);
  const [dilutionNote, setDilutionNote] = useState<string | null>(PRESETS[0].dilution);
  const [freqOptions, setFreqOptions] = useState(PRESETS[0].freqOptions);
  const [freqIdx, setFreqIdx] = useState(0);
  const [protocolDays, setProtocolDays] = useState(90);
  const [showSupply, setShowSupply] = useState(false);

  const [wholesale, setWholesale] = useState(0);
  const [retail, setRetail] = useState(0);
  const [minMargin, setMinMargin] = useState(20);
  const [discountPct, setDiscountPct] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [vialsForQuote, setVialsForQuote] = useState(1);

  const [weightLbs, setWeightLbs] = useState(165);
  const [dosePerKg, setDosePerKg] = useState(10);
  const [weightUnit, setWeightUnit] = useState<DoseUnit>("mcg");

  const r = calcRecon(vialMg, bacMl, dose, doseUnit);
  const dailyFreq = freqOptions[freqIdx]?.value || 1;
  const vials30 = Math.ceil((30 * dailyFreq) / r.dosesPerVial);
  const vials60 = Math.ceil((60 * dailyFreq) / r.dosesPerVial);
  const vialsFull = Math.ceil((protocolDays * dailyFreq) / r.dosesPerVial);

  const baseMargin = calcMargin(retail, wholesale);
  const discountedPrice = retail * (1 - discountPct / 100);
  const marginAfterDiscount = calcMargin(discountedPrice, wholesale);
  const profitPerVial = discountedPrice - wholesale;
  const isBelowMin = marginAfterDiscount < minMargin && retail > 0 && wholesale > 0;
  const isAtLoss = marginAfterDiscount < 0 && retail > 0 && wholesale > 0;
  const minPrice = wholesale > 0 ? wholesale / (1 - minMargin / 100) : 0;

  function selectPreset(i: number) {
    const p = PRESETS[i];
    setActivePreset(i);
    setVialMg(p.vialMg); setBacMl(p.bacMl);
    setDose(p.dose); setDoseUnit(p.unit);
    setDilutionNote(p.dilution);
    setFreqOptions(p.freqOptions);
    setFreqIdx(p.defaultFreqIdx);
    setWholesale(0); setRetail(0); setDiscountPct(0);
  }

  const weightKg = (weightLbs / 2.20462).toFixed(1);
  const weightDose = calcWeightBasedDose(weightLbs, dosePerKg);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}>Peptide Calculator</h1>
        <p className="mt-1 text-base" style={{ color: "#5a6a7a" }}>Reconstitution · Syringe units · Pricing & margin · Supply planning</p>
      </div>

      {/* Peptide selector */}
      <div className="mb-5">
        <p style={lbl}>Quick select peptide</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {PRESETS.map((p, i) => (
            <button key={p.name} onClick={() => selectPreset(i)}
              style={{ padding: "0.375rem 0.875rem", borderRadius: "1rem", fontSize: "13px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 600, cursor: "pointer", border: "1.5px solid", backgroundColor: activePreset === i ? "rgba(201,151,58,0.12)" : "#ffffff", color: activePreset === i ? "#c9973a" : "#1a2744", borderColor: activePreset === i ? "#c9973a" : "#d4c9b8" }}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* LEFT: Inputs */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#ffffff", border: "1px solid #e8e0d0", borderTop: "3px solid #c9973a" }}>
          <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #e8e0d0" }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744", fontWeight: 600, fontSize: "0.95rem" }}>
              {PRESETS[activePreset].name} — Reconstitution
            </p>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {dilutionNote && (
              <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(232,184,109,0.08)", border: "1px solid rgba(232,184,109,0.25)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
                <AlertTriangle size={13} style={{ color: "#e8b86d", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color: "#e8b86d", lineHeight: 1.5 }}>{dilutionNote}</p>
              </div>
            )}

            {/* Vial size */}
            <div>
              <label style={lbl}>Vial size (mg)</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                {[2, 5, 10, 20, 50, 100, 500].map(v => (
                  <button key={v} onClick={() => setVialMg(v)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: vialMg === v ? "rgba(201,151,58,0.15)" : "#f5f3ee", color: vialMg === v ? "#c9973a" : "#5a6a7a", borderColor: vialMg === v ? "#c9973a" : "#e8e0d0", minWidth: "48px" }}>
                    {v}mg
                  </button>
                ))}
              </div>
              <NumInput value={vialMg} onChange={setVialMg} step={0.5} placeholder="Enter mg" />
            </div>

            {/* BAC water */}
            <div>
              <label style={lbl}>Bacteriostatic water (ml)</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                {[1, 2, 2.5, 3, 4, 5, 10].map(v => (
                  <button key={v} onClick={() => setBacMl(v)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: bacMl === v ? "rgba(84,199,162,0.12)" : "#f5f3ee", color: bacMl === v ? "#54c7a2" : "#5a6a7a", borderColor: bacMl === v ? "#54c7a2" : "#e8e0d0", minWidth: "48px" }}>
                    {v}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Dose */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Dose per injection</label>
                <div style={{ display: "flex", border: "1px solid #e8e0d0", borderRadius: "0.5rem", overflow: "hidden" }}>
                  {(["mcg", "mg"] as DoseUnit[]).map(u => (
                    <button key={u} onClick={() => setDoseUnit(u)}
                      style={{ padding: "0.375rem 0.875rem", fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", backgroundColor: doseUnit === u ? "#e8e0d0" : "transparent", color: doseUnit === u ? "#c9973a" : "#5a6a7a", border: "none", cursor: "pointer" }}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <NumInput value={dose} onChange={setDose} step={doseUnit === "mcg" ? 50 : 0.25} placeholder={doseUnit === "mcg" ? "250" : "2"} />
              <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {(doseUnit === "mcg" ? [100,200,250,300,400,500,600,750,1000] : [0.25,0.5,1,1.5,2,2.5,4,5,10]).map(v => (
                  <button key={v} onClick={() => setDose(v)}
                    style={{ padding: "0.375rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.8rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", backgroundColor: dose === v ? "rgba(201,151,58,0.15)" : "#f5f3ee", color: dose === v ? "#c9973a" : "#5a6a7a", border: `1px solid ${dose === v ? "#c9973a" : "#e8e0d0"}` }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Supply toggle */}
            <button onClick={() => setShowSupply(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: "pointer", color: "#5a6a7a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", padding: 0 }}>
              {showSupply ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showSupply ? "Hide" : "Show"} supply calculator
            </button>

            {showSupply && (
              <>
                {/* Frequency — smart per peptide */}
                <div>
                  <label style={lbl}>Injection frequency</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {freqOptions.map((f, i) => (
                      <button key={f.label} onClick={() => setFreqIdx(i)}
                        style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: freqIdx === i ? "#f5f3ee" : "#f5f3ee", color: freqIdx === i ? "#5a6a7a" : "#8a7a5a", borderColor: freqIdx === i ? "#5a6a7a" : "#e8e0d0" }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Protocol length */}
                <div>
                  <label style={lbl}>Protocol length</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    {[{l:"3wk",d:21},{l:"1mo",d:30},{l:"2mo",d:60},{l:"3mo",d:90},{l:"6mo",d:180},{l:"1yr",d:365}].map(({l,d}) => (
                      <button key={d} onClick={() => setProtocolDays(d)}
                        style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: protocolDays === d ? "#f5f3ee" : "#f5f3ee", color: protocolDays === d ? "#5a6a7a" : "#8a7a5a", borderColor: protocolDays === d ? "#5a6a7a" : "#e8e0d0" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <NumInput value={protocolDays} onChange={setProtocolDays} step={1} placeholder="90" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={res}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "11px", fontWeight: 600, color: "#5a4a3a", textTransform: "uppercase", marginBottom: "0.25rem" }}>Concentration</p>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1rem", color: "#1a2744", fontWeight: 600 }}>{r.concMgMl.toFixed(2)} mg/ml ({r.concMcgMl.toFixed(0)} mcg/ml)</p>
          </div>

          <div style={{ ...res, border: "2px solid #c9973a" }}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "11px", fontWeight: 600, color: "#5a4a3a", textTransform: "uppercase", marginBottom: "0.25rem" }}>Draw on syringe (U-100)</p>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "2.5rem", fontWeight: 800, color: "#c9973a", lineHeight: 1 }}>
              {r.unitsU100.toFixed(1)} <span style={{ fontSize: "1rem", color: "#5a6a7a", fontWeight: 400 }}>units</span>
            </p>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: "#5a6a7a", marginTop: "0.25rem" }}>= {r.volumeMl.toFixed(3)} ml</p>
          </div>

          <div style={res}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "11px", fontWeight: 600, color: "#5a4a3a", textTransform: "uppercase", marginBottom: "0.25rem" }}>Recommended syringe</p>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.9rem", color: "#1a2744" }}>{r.syringe} syringe</p>
            <div style={{ marginTop: "0.5rem", height: "8px", backgroundColor: "#f5f3ee", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (r.unitsU100 / r.syringeMax) * 100)}%`, backgroundColor: "#54c7a2", borderRadius: "4px" }} />
            </div>
          </div>

          <div style={res}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "11px", fontWeight: 600, color: "#5a4a3a", textTransform: "uppercase", marginBottom: "0.25rem" }}>Doses per vial</p>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#54c7a2" }}>{r.dosesPerVial} doses</p>
          </div>

          {r.splitWarning && (
            <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(224,90,106,0.08)", border: "1px solid rgba(224,90,106,0.25)", borderRadius: "0.5rem", padding: "0.75rem" }}>
              <AlertTriangle size={14} style={{ color: "#e05a6a", flexShrink: 0 }} />
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: "#e05a6a" }}>{r.splitWarning}</p>
            </div>
          )}

          {showSupply && (
            <div>
              <p style={{ ...lbl, marginBottom: "0.5rem" }}>Vials needed</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                {[{l:"30 days",v:vials30},{l:"60 days",v:vials60},{l:`${protocolDays}d`,v:vialsFull}].map(({l,v}) => (
                  <div key={l} style={{ ...res, textAlign: "center" as const }}>
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#5a6a7a", marginBottom: "0.25rem" }}>{l}</p>
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1.75rem", fontWeight: 700, color: "#c9973a", lineHeight: 1 }}>{v}</p>
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#8a7a5a" }}>vial{v!==1?"s":""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRICING SECTION */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: "#ffffff", border: "1px solid #e8e0d0", borderTop: "3px solid #54c7a2" }}>
        <button onClick={() => setShowPricing(p => !p)} className="w-full"
          style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", borderBottom: showPricing ? "1px solid #e8e0d0" : "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={16} style={{ color: "#54c7a2" }} />
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744", fontWeight: 600, fontSize: "1rem" }}>
              Pricing & Margin — {PRESETS[activePreset].name}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {retail > 0 && wholesale > 0 && (
              <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1rem", color: getMarginColor(baseMargin, minMargin), fontWeight: 600 }}>
                {baseMargin.toFixed(1)}% margin
              </span>
            )}
            {showPricing ? <ChevronUp size={16} style={{ color: "#5a6a7a" }} /> : <ChevronDown size={16} style={{ color: "#5a6a7a" }} />}
          </div>
        </button>

        {showPricing && (
          <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={lbl}>Your cost (wholesale)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#e05a6a", fontSize: "1rem" }}>$</span>
                    <NumInput value={wholesale} onChange={setWholesale} step={0.01} placeholder="0.00" style={{ paddingLeft: "1.75rem" }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Client pays (retail)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#54c7a2", fontSize: "1rem" }}>$</span>
                    <NumInput value={retail} onChange={setRetail} step={0.01} placeholder="0.00" style={{ paddingLeft: "1.75rem" }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={lbl}>Minimum margin (%)</label>
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                  {[10,15,20,25,30,40].map(v => (
                    <button key={v} onClick={() => setMinMargin(v)}
                      style={{ flex: 1, padding: "0.5rem", borderRadius: "0.375rem", fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: minMargin === v ? "#f5f3ee" : "#f5f3ee", color: minMargin === v ? "#5a6a7a" : "#8a7a5a", borderColor: minMargin === v ? "#5a6a7a" : "#e8e0d0" }}>
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              {retail > 0 && wholesale > 0 && (
                <div style={res}>
                  <MarginBar margin={baseMargin} minimum={minMargin} label="Base margin" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                    <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#8a7a5a" }}>Break-even: {money(wholesale)}</span>
                    <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#8a7a5a" }}>Min {minMargin}%: {money(minPrice)}</span>
                  </div>
                </div>
              )}

              <div>
                <label style={lbl}>Apply discount</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.5rem" }}>
                  <button onClick={() => setDiscountPct(0)}
                    style={{ padding: "0.375rem 0.75rem", borderRadius: "1rem", fontSize: "0.8rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: discountPct === 0 ? "#f5f3ee" : "transparent", color: discountPct === 0 ? "#1a2744" : "#8a7a5a", borderColor: discountPct === 0 ? "#5a6a7a" : "#e8e0d0" }}>
                    None
                  </button>
                  {DISCOUNT_PRESETS.map(p => (
                    <button key={p.name} onClick={() => setDiscountPct(p.pct)}
                      style={{ padding: "0.375rem 0.75rem", borderRadius: "1rem", fontSize: "0.8rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: discountPct === p.pct ? `${p.color}20` : "transparent", color: discountPct === p.pct ? p.color : "#8a7a5a", borderColor: discountPct === p.pct ? p.color : "#e8e0d0" }}>
                      {p.name} {p.pct}%
                    </button>
                  ))}
                </div>
                <NumInput value={discountPct} onChange={v => setDiscountPct(Math.min(100, v))} step={1} placeholder="0" />
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color: "#5a6a7a", marginTop: "0.25rem" }}>% custom discount</p>
              </div>

              <div>
                <label style={lbl}>Vials for quote</label>
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                  {[{l:"30d",v:vials30},{l:"60d",v:vials60},{l:`${protocolDays}d`,v:vialsFull}].map(({l,v}) => (
                    <button key={l} onClick={() => setVialsForQuote(v)}
                      style={{ padding: "0.375rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.8rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: vialsForQuote === v ? "rgba(201,151,58,0.15)" : "#f5f3ee", color: vialsForQuote === v ? "#c9973a" : "#5a6a7a", borderColor: vialsForQuote === v ? "#c9973a" : "#e8e0d0" }}>
                      {v} vial{v!==1?"s":""} · {l}
                    </button>
                  ))}
                </div>
                <NumInput value={vialsForQuote} onChange={setVialsForQuote} step={1} placeholder="1" />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {retail > 0 && wholesale > 0 ? (
                <>
                  {discountPct > 0 && (
                    <div style={{ ...res, borderColor: isAtLoss ? "rgba(224,90,106,0.4)" : isBelowMin ? "rgba(232,184,109,0.4)" : "#c0dd97" }}>
                      <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#5a6a7a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Price after {discountPct}% off</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: isAtLoss ? "#e05a6a" : isBelowMin ? "#e8b86d" : "#54c7a2" }}>{money(discountedPrice)}</p>
                        <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color: "#8a7a5a", textDecoration: "line-through" }}>{money(retail)}</p>
                      </div>
                      <MarginBar margin={marginAfterDiscount} minimum={minMargin} label="Margin after discount" />
                    </div>
                  )}

                  <div style={res}>
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#5a6a7a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Your profit per vial</p>
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: getMarginColor(marginAfterDiscount, minMargin) }}>{money(profitPerVial)}</p>
                  </div>

                  {isAtLoss && (
                    <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(224,90,106,0.1)", border: "1px solid rgba(224,90,106,0.35)", borderRadius: "0.5rem", padding: "0.75rem" }}>
                      <AlertTriangle size={14} style={{ color: "#e05a6a", flexShrink: 0 }} />
                      <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: "#e05a6a", lineHeight: 1.5 }}>Selling at a loss. Break-even: {money(wholesale)}</p>
                    </div>
                  )}
                  {isBelowMin && !isAtLoss && (
                    <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(232,184,109,0.08)", border: "1px solid rgba(232,184,109,0.25)", borderRadius: "0.5rem", padding: "0.75rem" }}>
                      <TrendingDown size={14} style={{ color: "#e8b86d", flexShrink: 0 }} />
                      <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: "#e8b86d", lineHeight: 1.5 }}>Below {minMargin}% minimum. Safe floor: {money(minPrice)}</p>
                    </div>
                  )}

                  <div style={{ ...res, border: "1px solid rgba(201,151,58,0.25)" }}>
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#5a6a7a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                      Total quote — {vialsForQuote} vial{vialsForQuote!==1?"s":""}
                    </p>
                    {discountPct > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color: "#8a7a5a", textDecoration: "line-through" }}>Full retail</span>
                        <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color: "#8a7a5a", textDecoration: "line-through" }}>{money(retail * vialsForQuote)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                      <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.9rem", color: "#1a2744", fontWeight: 600 }}>Client pays</span>
                      <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1.25rem", color: "#c9973a", fontWeight: 700 }}>{money((discountPct > 0 ? discountedPrice : retail) * vialsForQuote)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.375rem", borderTop: "1px solid #e8e0d0" }}>
                      <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color: "#5a6a7a" }}>Your profit</span>
                      <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1rem", color: getMarginColor(marginAfterDiscount, minMargin), fontWeight: 600 }}>{money(profitPerVial * vialsForQuote)}</span>
                    </div>
                  </div>

                  <div style={res}>
                    <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#5a6a7a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>If you discount...</p>
                    {[10,15,20,25,30].map(pct => {
                      const m = calcMargin(retail*(1-pct/100), wholesale);
                      const c = getMarginColor(m, minMargin);
                      return (
                        <div key={pct} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: "#8a7a5a" }}>{pct}% → {money(retail*(1-pct/100))}</span>
                          <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: c, fontWeight: 600 }}>{m.toFixed(1)}% margin</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ ...res, textAlign: "center" as const, padding: "2.5rem 1rem" }}>
                  <DollarSign size={28} style={{ color: "#e8e0d0", margin: "0 auto 0.75rem" }} />
                  <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1rem", color: "#8a7a5a" }}>Enter wholesale cost and retail price to see margin analysis</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weight-based */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#ffffff", border: "1px solid #e8e0d0", borderTop: "2px solid #5a6a7a" }}>
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #e8e0d0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Scale size={16} style={{ color: "#5a6a7a" }} />
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744", fontWeight: 600, fontSize: "1rem" }}>Weight-based dose</p>
        </div>
        <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={lbl}>Client weight (lbs)</label>
              <NumInput value={weightLbs} onChange={setWeightLbs} step={1} placeholder="165" />
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: "#5a6a7a", marginTop: "0.375rem" }}>= {weightKg} kg</p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Dose per kg</label>
                <div style={{ display: "flex", border: "1px solid #e8e0d0", borderRadius: "0.5rem", overflow: "hidden" }}>
                  {(["mcg","mg"] as DoseUnit[]).map(u => (
                    <button key={u} onClick={() => setWeightUnit(u)}
                      style={{ padding: "0.375rem 0.875rem", fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", backgroundColor: weightUnit === u ? "#e8e0d0" : "transparent", color: weightUnit === u ? "#c9973a" : "#5a6a7a", border: "none", cursor: "pointer" }}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <NumInput value={dosePerKg} onChange={setDosePerKg} step={0.5} placeholder="10" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={res}>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#5a6a7a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Calculated dose</p>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "2rem", fontWeight: 700, color: "#c9973a", lineHeight: 1 }}>{weightDose} <span style={{ fontSize: "1rem", color: "#5a6a7a" }}>{weightUnit}</span></p>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color: "#8a7a5a", marginTop: "0.375rem" }}>{weightKg}kg × {dosePerKg} = {weightDose} {weightUnit}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
