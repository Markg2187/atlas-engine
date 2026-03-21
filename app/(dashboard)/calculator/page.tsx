"use client";

import { useState } from "react";
import { Scale, BookOpen, DollarSign, TrendingDown, AlertTriangle, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { calcWeightBasedDose, calcDosesPerVial } from "@/lib/cycling";

// ─── Helpers ──────────────────────────────────────────────────

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(n);
}

function calcMargin(retail: number, wholesale: number) {
  if (retail <= 0) return 0;
  return ((retail - wholesale) / retail) * 100;
}

function getMarginColor(margin: number, minimum: number) {
  if (margin < 0) return "#e05a6a";
  if (margin < minimum) return "#e8b86d";
  if (margin < minimum + 10) return "#e8c96e";
  return "#54c7a2";
}

type DoseUnit = "mcg" | "mg";
type SyringeSize = "0.3ml" | "0.5ml" | "1ml";

// ─── Recon Math ───────────────────────────────────────────────

function calcRecon(vialMg: number, bacMl: number, dose: number, unit: DoseUnit) {
  const doseInMcg = unit === "mg" ? dose * 1000 : dose;
  const concMgMl = vialMg / bacMl;
  const concMcgMl = concMgMl * 1000;
  const volumeMl = doseInMcg / concMcgMl;
  const unitsU100 = volumeMl * 100;
  const dosesPerVial = Math.floor((vialMg * 1000) / doseInMcg);
  let syringe: SyringeSize = unitsU100 <= 30 ? "0.3ml" : unitsU100 <= 50 ? "0.5ml" : "1ml";
  let syringeLabel = syringe === "0.3ml" ? "0.3ml (30 unit) syringe" : syringe === "0.5ml" ? "0.5ml (50 unit) syringe" : "1ml (100 unit) syringe";
  const splitWarning = volumeMl > 1.0 ? `Volume ${volumeMl.toFixed(2)}ml — split into 2 injection sites` : null;
  return { concMgMl, concMcgMl, doseInMcg, volumeMl, unitsU100, dosesPerVial, syringe, syringeLabel, splitWarning };
}

// ─── Styles ───────────────────────────────────────────────────

const inp = {
  backgroundColor: "#142035", border: "1px solid #1e3055",
  color: "#ccd9ee", borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem", fontSize: "0.875rem",
  fontFamily: "'DM Mono', monospace", width: "100%",
} as React.CSSProperties;

const lbl = {
  fontFamily: "'DM Mono', monospace", fontSize: "0.65rem",
  letterSpacing: "0.08em", textTransform: "uppercase" as const,
  color: "#6e88b0", display: "block", marginBottom: "0.3rem",
};

const res = {
  backgroundColor: "#142035", border: "1px solid #1e3055",
  borderRadius: "0.5rem", padding: "0.75rem 1rem",
} as React.CSSProperties;

const PRESETS = [
  { name: "BPC-157",       vialMg: 5,   bacMl: 2.5, dose: 250,  unit: "mcg" as DoseUnit, dilution: null },
  { name: "TB-500",        vialMg: 5,   bacMl: 2,   dose: 4,    unit: "mg"  as DoseUnit, dilution: null },
  { name: "GHK-Cu",        vialMg: 10,  bacMl: 2,   dose: 1,    unit: "mg"  as DoseUnit, dilution: "Dilute more if copper taste or flushing" },
  { name: "Semaglutide",   vialMg: 5,   bacMl: 2,   dose: 250,  unit: "mcg" as DoseUnit, dilution: null },
  { name: "Retatrutide",   vialMg: 20,  bacMl: 2,   dose: 2,    unit: "mg"  as DoseUnit, dilution: "Split >1ml into 2 sites. Max 12mg/week." },
  { name: "NAD+",          vialMg: 500, bacMl: 5,   dose: 250,  unit: "mg"  as DoseUnit, dilution: "Dilute heavily for histamine-sensitive patients. Slow push only." },
  { name: "MOTS-C",        vialMg: 10,  bacMl: 4,   dose: 10,   unit: "mg"  as DoseUnit, dilution: null },
  { name: "CJC/Ipa",       vialMg: 5,   bacMl: 2,   dose: 200,  unit: "mcg" as DoseUnit, dilution: null },
  { name: "Epitalon",      vialMg: 10,  bacMl: 2,   dose: 5,    unit: "mg"  as DoseUnit, dilution: null },
  { name: "Thymosin α-1",  vialMg: 5,   bacMl: 2,   dose: 1500, unit: "mcg" as DoseUnit, dilution: null },
  { name: "Cerebrolysin",  vialMg: 10,  bacMl: 2,   dose: 20,   unit: "mg"  as DoseUnit, dilution: null },
  { name: "Wolverine",     vialMg: 5,   bacMl: 2,   dose: 500,  unit: "mcg" as DoseUnit, dilution: null },
  { name: "Tesamorelin",   vialMg: 1,   bacMl: 1,   dose: 1,    unit: "mg"  as DoseUnit, dilution: null },
  { name: "Custom",        vialMg: 5,   bacMl: 2,   dose: 250,  unit: "mcg" as DoseUnit, dilution: null },
];

const DISCOUNT_PRESETS = [
  { name: "Family plan",  pct: 20, color: "#54c7a2" },
  { name: "VIP client",   pct: 15, color: "#e8c96e" },
  { name: "Staff",        pct: 30, color: "#6e88b0" },
  { name: "Referral",     pct: 10, color: "#c9a84c" },
  { name: "Sale / Promo", pct: 25, color: "#e05a6a" },
];

// ─── Margin Bar ───────────────────────────────────────────────

function MarginBar({ margin, minimum, label }: { margin: number; minimum: number; label?: string }) {
  const color = getMarginColor(margin, minimum);
  const pct = Math.max(0, Math.min(100, margin));
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#6e88b0" }}>{label}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color, fontWeight: 600 }}>{margin.toFixed(1)}%</span>
        </div>
      )}
      <div style={{ height: "6px", backgroundColor: "#0b1120", borderRadius: "3px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "3px", transition: "width 0.3s ease" }} />
        <div style={{ position: "absolute", left: `${Math.min(100, minimum)}%`, top: 0, height: "100%", width: "2px", backgroundColor: "#4a6080" }} />
      </div>
      {margin < minimum && margin >= 0 && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#e8b86d", marginTop: "0.2rem" }}>Below {minimum}% minimum margin</p>}
      {margin < 0 && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#e05a6a", marginTop: "0.2rem" }}>Selling at a loss</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function CalculatorPage() {
  // Recon state
  const [activePreset, setActivePreset] = useState(0);
  const [vialMg, setVialMg] = useState(PRESETS[0].vialMg);
  const [bacMl, setBacMl] = useState(PRESETS[0].bacMl);
  const [dose, setDose] = useState(PRESETS[0].dose);
  const [doseUnit, setDoseUnit] = useState<DoseUnit>(PRESETS[0].unit);
  const [dilutionNote, setDilutionNote] = useState<string | null>(PRESETS[0].dilution);
  const [dailyDoses, setDailyDoses] = useState(1);
  const [protocolDays, setProtocolDays] = useState(90);
  const [showSupply, setShowSupply] = useState(false);

  // Pricing state
  const [wholesale, setWholesale] = useState(0);
  const [retail, setRetail] = useState(0);
  const [minMargin, setMinMargin] = useState(20);
  const [discountPct, setDiscountPct] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const [vialsForQuote, setVialsForQuote] = useState(1);

  // Weight-based
  const [weightLbs, setWeightLbs] = useState(165);
  const [dosePerKg, setDosePerKg] = useState(10);
  const [weightUnit, setWeightUnit] = useState<DoseUnit>("mcg");

  // Recon calcs
  const r = calcRecon(vialMg, bacMl, dose, doseUnit);
  const vials30 = Math.ceil((30 * dailyDoses) / r.dosesPerVial);
  const vials60 = Math.ceil((60 * dailyDoses) / r.dosesPerVial);
  const vialsFull = Math.ceil((protocolDays * dailyDoses) / r.dosesPerVial);

  // Pricing calcs
  const baseMargin = calcMargin(retail, wholesale);
  const discountedPrice = retail * (1 - discountPct / 100);
  const marginAfterDiscount = calcMargin(discountedPrice, wholesale);
  const profitPerVial = discountedPrice - wholesale;
  const isBelowMin = marginAfterDiscount < minMargin && retail > 0 && wholesale > 0;
  const isAtLoss = marginAfterDiscount < 0 && retail > 0 && wholesale > 0;
  const breakEven = wholesale;
  const minPrice = wholesale > 0 ? wholesale / (1 - minMargin / 100) : 0;

  function selectPreset(i: number) {
    const p = PRESETS[i];
    setActivePreset(i);
    setVialMg(p.vialMg);
    setBacMl(p.bacMl);
    setDose(p.dose);
    setDoseUnit(p.unit);
    setDilutionNote(p.dilution);
    setWholesale(0);
    setRetail(0);
    setDiscountPct(0);
  }

  const weightKg = (weightLbs / 2.20462).toFixed(1);
  const weightDose = calcWeightBasedDose(weightLbs, dosePerKg);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}>
          Peptide Calculator
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6e88b0" }}>
          Reconstitution · Syringe units · Pricing & margin · Supply planning
        </p>
      </div>

      {/* Peptide quick select */}
      <div className="mb-5">
        <p style={lbl}>Quick select peptide</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {PRESETS.map((p, i) => (
            <button key={p.name} onClick={() => selectPreset(i)}
              style={{ padding: "0.375rem 0.875rem", borderRadius: "1rem", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: activePreset === i ? "rgba(232,201,110,0.15)" : "#142035", color: activePreset === i ? "#e8c96e" : "#6e88b0", borderColor: activePreset === i ? "#e8c96e" : "#1e3055", transition: "all 0.15s" }}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── LEFT: Reconstitution inputs ── */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055", borderTop: "2px solid #e8c96e" }}>
          <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #1e3055" }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee", fontWeight: 600, fontSize: "0.95rem" }}>
              {PRESETS[activePreset].name} — Reconstitution
            </p>
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            {dilutionNote && (
              <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(232,184,109,0.08)", border: "1px solid rgba(232,184,109,0.25)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
                <AlertTriangle size={12} style={{ color: "#e8b86d", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#e8b86d", lineHeight: 1.5 }}>{dilutionNote}</p>
              </div>
            )}

            {/* Vial size */}
            <div>
              <label style={lbl}>Vial size (mg)</label>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                {[2, 5, 10, 20, 50, 100, 500].map(v => (
                  <button key={v} onClick={() => setVialMg(v)}
                    style={{ padding: "0.3rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: vialMg === v ? "rgba(232,201,110,0.15)" : "#142035", color: vialMg === v ? "#e8c96e" : "#6e88b0", borderColor: vialMg === v ? "#e8c96e" : "#1e3055" }}>
                    {v}mg
                  </button>
                ))}
              </div>
              <input type="number" step="0.5" value={vialMg} onChange={e => setVialMg(Number(e.target.value))} style={inp} />
            </div>

            {/* BAC water */}
            <div>
              <label style={lbl}>Bacteriostatic water (ml)</label>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                {[1, 2, 2.5, 3, 4, 5, 10].map(v => (
                  <button key={v} onClick={() => setBacMl(v)}
                    style={{ padding: "0.3rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: bacMl === v ? "rgba(84,199,162,0.12)" : "#142035", color: bacMl === v ? "#54c7a2" : "#6e88b0", borderColor: bacMl === v ? "#54c7a2" : "#1e3055" }}>
                    {v}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Dose */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Dose per injection</label>
                <div style={{ display: "flex", border: "1px solid #1e3055", borderRadius: "0.5rem", overflow: "hidden" }}>
                  {(["mcg", "mg"] as DoseUnit[]).map(u => (
                    <button key={u} onClick={() => setDoseUnit(u)}
                      style={{ padding: "0.25rem 0.625rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", backgroundColor: doseUnit === u ? "#1e3055" : "transparent", color: doseUnit === u ? "#e8c96e" : "#6e88b0", border: "none", cursor: "pointer" }}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <input type="number" step={doseUnit === "mcg" ? 50 : 0.25} value={dose} onChange={e => setDose(Number(e.target.value))} style={inp} />
              <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.375rem", flexWrap: "wrap" }}>
                {(doseUnit === "mcg" ? [100,200,250,300,400,500,600,750,1000] : [0.25,0.5,1,1.5,2,2.5,4,5,10]).map(v => (
                  <button key={v} onClick={() => setDose(v)}
                    style={{ padding: "0.2rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.65rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", backgroundColor: dose === v ? "rgba(232,201,110,0.15)" : "#142035", color: dose === v ? "#e8c96e" : "#6e88b0", border: `1px solid ${dose === v ? "#e8c96e" : "#1e3055"}` }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Supply toggle */}
            <button onClick={() => setShowSupply(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: "pointer", color: "#6e88b0", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", padding: 0 }}>
              {showSupply ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showSupply ? "Hide" : "Show"} supply calculator
            </button>

            {showSupply && (
              <>
                <div>
                  <label style={lbl}>Injections per day</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[1, 2, 3].map(v => (
                      <button key={v} onClick={() => setDailyDoses(v)}
                        style={{ flex: 1, padding: "0.5rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: dailyDoses === v ? "rgba(110,136,176,0.15)" : "#142035", color: dailyDoses === v ? "#6e88b0" : "#4a6080", borderColor: dailyDoses === v ? "#6e88b0" : "#1e3055" }}>
                        {v}x/day
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Protocol length</label>
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                    {[{l:"1mo",d:30},{l:"2mo",d:60},{l:"3mo",d:90},{l:"6mo",d:180},{l:"1yr",d:365}].map(({l,d}) => (
                      <button key={d} onClick={() => setProtocolDays(d)}
                        style={{ padding: "0.3rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: protocolDays === d ? "rgba(110,136,176,0.15)" : "#142035", color: protocolDays === d ? "#6e88b0" : "#4a6080", borderColor: protocolDays === d ? "#6e88b0" : "#1e3055" }}>
                        {l}
                      </button>
                    ))}
                    <input type="number" step="1" value={protocolDays} onChange={e => setProtocolDays(Number(e.target.value))} style={{ ...inp, width: "70px" }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Recon results ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div style={res}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Concentration</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: "#ccd9ee", fontWeight: 600 }}>{r.concMgMl.toFixed(2)} mg/ml ({r.concMcgMl.toFixed(0)} mcg/ml)</p>
          </div>

          <div style={{ ...res, border: "1px solid #e8c96e" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Draw on syringe (U-100)</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.75rem", fontWeight: 700, color: "#e8c96e", lineHeight: 1 }}>
              {r.unitsU100.toFixed(1)} <span style={{ fontSize: "0.75rem", color: "#6e88b0" }}>units</span>
            </p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#6e88b0", marginTop: "0.25rem" }}>= {r.volumeMl.toFixed(3)} ml</p>
          </div>

          <div style={res}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Recommended syringe</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#ccd9ee" }}>{r.syringeLabel}</p>
            <div style={{ marginTop: "0.5rem", height: "6px", backgroundColor: "#0b1120", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, r.unitsU100 / (r.syringe === "0.3ml" ? 30 : r.syringe === "0.5ml" ? 50 : 100) * 100)}%`, backgroundColor: "#54c7a2", borderRadius: "3px" }} />
            </div>
          </div>

          <div style={res}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Doses per vial</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.25rem", fontWeight: 700, color: "#54c7a2" }}>{r.dosesPerVial} doses</p>
          </div>

          {r.splitWarning && (
            <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(224,90,106,0.08)", border: "1px solid rgba(224,90,106,0.25)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
              <AlertTriangle size={12} style={{ color: "#e05a6a", flexShrink: 0 }} />
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#e05a6a" }}>{r.splitWarning}</p>
            </div>
          )}

          {showSupply && (
            <div>
              <p style={{ ...lbl, marginBottom: "0.5rem" }}>Vials needed</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                {[{l:"30 days",v:vials30},{l:"60 days",v:vials60},{l:`${protocolDays}d full`,v:vialsFull}].map(({l,v}) => (
                  <div key={l} style={{ ...res, textAlign: "center" as const }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", marginBottom: "0.25rem" }}>{l}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.5rem", fontWeight: 700, color: "#e8c96e", lineHeight: 1 }}>{v}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#4a6080" }}>vial{v!==1?"s":""}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PRICING SECTION ── */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055", borderTop: "2px solid #54c7a2" }}>
        <button onClick={() => setShowPricing(p => !p)} className="w-full"
          style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", borderBottom: showPricing ? "1px solid #1e3055" : "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={15} style={{ color: "#54c7a2" }} />
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee", fontWeight: 600, fontSize: "0.95rem" }}>
              Pricing & Margin — {PRESETS[activePreset].name}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {retail > 0 && wholesale > 0 && (
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: getMarginColor(baseMargin, minMargin), fontWeight: 600 }}>
                {baseMargin.toFixed(1)}% margin
              </span>
            )}
            {showPricing ? <ChevronUp size={14} style={{ color: "#6e88b0" }} /> : <ChevronDown size={14} style={{ color: "#6e88b0" }} />}
          </div>
        </button>

        {showPricing && (
          <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

            {/* Left: inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={lbl}>Your cost (wholesale)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'DM Mono', monospace", color: "#e05a6a", fontSize: "0.875rem" }}>$</span>
                    <input type="number" step="0.01" value={wholesale || ""} placeholder="0.00"
                      onChange={e => setWholesale(Number(e.target.value))}
                      style={{ ...inp, paddingLeft: "1.5rem" }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Client pays (retail)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'DM Mono', monospace", color: "#54c7a2", fontSize: "0.875rem" }}>$</span>
                    <input type="number" step="0.01" value={retail || ""} placeholder="0.00"
                      onChange={e => setRetail(Number(e.target.value))}
                      style={{ ...inp, paddingLeft: "1.5rem" }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={lbl}>Minimum acceptable margin (%)</label>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  {[10, 15, 20, 25, 30, 40].map(v => (
                    <button key={v} onClick={() => setMinMargin(v)}
                      style={{ flex: 1, padding: "0.3rem", borderRadius: "0.375rem", fontSize: "0.65rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: minMargin === v ? "rgba(110,136,176,0.15)" : "#142035", color: minMargin === v ? "#6e88b0" : "#4a6080", borderColor: minMargin === v ? "#6e88b0" : "#1e3055" }}>
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              {retail > 0 && wholesale > 0 && (
                <div style={res}>
                  <MarginBar margin={baseMargin} minimum={minMargin} label="Base margin" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#4a6080" }}>Break-even: {money(breakEven)}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#4a6080" }}>Min {minMargin}%: {money(minPrice)}</span>
                  </div>
                </div>
              )}

              {/* Discount presets */}
              <div>
                <label style={lbl}>Apply discount</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  <button onClick={() => setDiscountPct(0)}
                    style={{ padding: "0.25rem 0.625rem", borderRadius: "1rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: discountPct === 0 ? "#142035" : "transparent", color: discountPct === 0 ? "#ccd9ee" : "#4a6080", borderColor: discountPct === 0 ? "#6e88b0" : "#1e3055" }}>
                    None
                  </button>
                  {DISCOUNT_PRESETS.map(p => (
                    <button key={p.name} onClick={() => setDiscountPct(p.pct)}
                      style={{ padding: "0.25rem 0.625rem", borderRadius: "1rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: discountPct === p.pct ? `${p.color}20` : "transparent", color: discountPct === p.pct ? p.color : "#4a6080", borderColor: discountPct === p.pct ? p.color : "#1e3055" }}>
                      {p.name} {p.pct}%
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.375rem" }}>
                  <input type="number" min="0" max="100" step="1" value={discountPct}
                    onChange={e => setDiscountPct(Number(e.target.value))}
                    style={{ ...inp, width: "80px" }} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.875rem", color: "#6e88b0" }}>% off</span>
                </div>
              </div>

              {/* Vials for quote */}
              <div>
                <label style={lbl}>Vials for quote</label>
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                  {[{l:"30d",v:vials30},{l:"60d",v:vials60},{l:`${protocolDays}d`,v:vialsFull}].map(({l,v}) => (
                    <button key={l} onClick={() => setVialsForQuote(v)}
                      style={{ padding: "0.3rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", cursor: "pointer", border: "1px solid", backgroundColor: vialsForQuote === v ? "rgba(232,201,110,0.15)" : "#142035", color: vialsForQuote === v ? "#e8c96e" : "#6e88b0", borderColor: vialsForQuote === v ? "#e8c96e" : "#1e3055" }}>
                      {v} vial{v!==1?"s":""} · {l}
                    </button>
                  ))}
                  <input type="number" min="1" step="1" value={vialsForQuote}
                    onChange={e => setVialsForQuote(Number(e.target.value))}
                    style={{ ...inp, width: "70px" }} />
                </div>
              </div>
            </div>

            {/* Right: live results */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {retail > 0 && wholesale > 0 ? (
                <>
                  {discountPct > 0 && (
                    <div style={{ ...res, borderColor: isAtLoss ? "rgba(224,90,106,0.4)" : isBelowMin ? "rgba(232,184,109,0.4)" : "rgba(84,199,162,0.3)" }}>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Price after {discountPct}% off</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.25rem", fontWeight: 700, color: isAtLoss ? "#e05a6a" : isBelowMin ? "#e8b86d" : "#54c7a2" }}>{money(discountedPrice)}</p>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#4a6080", textDecoration: "line-through" }}>{money(retail)}</p>
                      </div>
                      <MarginBar margin={marginAfterDiscount} minimum={minMargin} label="Margin after discount" />
                    </div>
                  )}

                  <div style={res}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Your profit per vial</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.25rem", fontWeight: 700, color: getMarginColor(marginAfterDiscount, minMargin) }}>{money(profitPerVial)}</p>
                  </div>

                  {isAtLoss && (
                    <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(224,90,106,0.1)", border: "1px solid rgba(224,90,106,0.35)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
                      <AlertTriangle size={13} style={{ color: "#e05a6a", flexShrink: 0 }} />
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#e05a6a", lineHeight: 1.5 }}>Selling at a loss. Break-even price: {money(breakEven)}</p>
                    </div>
                  )}

                  {isBelowMin && !isAtLoss && (
                    <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "rgba(232,184,109,0.08)", border: "1px solid rgba(232,184,109,0.25)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem" }}>
                      <TrendingDown size={13} style={{ color: "#e8b86d", flexShrink: 0 }} />
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#e8b86d", lineHeight: 1.5 }}>Below {minMargin}% minimum. Safe floor: {money(minPrice)}</p>
                    </div>
                  )}

                  {/* Total quote */}
                  <div style={{ ...res, border: "1px solid rgba(232,201,110,0.25)" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                      Total quote — {vialsForQuote} vial{vialsForQuote!==1?"s":""}
                    </p>
                    {discountPct > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#4a6080", textDecoration: "line-through" }}>Full retail</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#4a6080", textDecoration: "line-through" }}>{money(retail * vialsForQuote)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#ccd9ee", fontWeight: 600 }}>Client pays</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.1rem", color: "#e8c96e", fontWeight: 700 }}>{money((discountPct > 0 ? discountedPrice : retail) * vialsForQuote)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.375rem", borderTop: "1px solid #1e3055" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#6e88b0" }}>Your profit</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", color: getMarginColor(marginAfterDiscount, minMargin), fontWeight: 600 }}>{money(profitPerVial * vialsForQuote)}</span>
                    </div>
                  </div>

                  {/* Margin at common discounts */}
                  <div style={res}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>If you discount...</p>
                    {[10,15,20,25,30].map(pct => {
                      const m = calcMargin(retail*(1-pct/100), wholesale);
                      const c = getMarginColor(m, minMargin);
                      return (
                        <div key={pct} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#4a6080" }}>{pct}% off → {money(retail*(1-pct/100))}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: c, fontWeight: 600 }}>{m.toFixed(1)}% margin</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ ...res, textAlign: "center" as const, padding: "2rem" }}>
                  <DollarSign size={24} style={{ color: "#1e3055", margin: "0 auto 0.5rem" }} />
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#4a6080" }}>
                    Enter your wholesale cost and retail price to see margin analysis
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weight-based */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055", borderTop: "2px solid #6e88b0" }}>
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #1e3055", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Scale size={15} style={{ color: "#6e88b0" }} />
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee", fontWeight: 600, fontSize: "0.95rem" }}>Weight-based dose</p>
        </div>
        <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={lbl}>Client weight (lbs)</label>
              <input type="number" step="1" value={weightLbs} onChange={e => setWeightLbs(Number(e.target.value))} style={inp} />
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#6e88b0", marginTop: "0.25rem" }}>= {weightKg} kg</p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Dose per kg</label>
                <div style={{ display: "flex", border: "1px solid #1e3055", borderRadius: "0.5rem", overflow: "hidden" }}>
                  {(["mcg","mg"] as DoseUnit[]).map(u => (
                    <button key={u} onClick={() => setWeightUnit(u)}
                      style={{ padding: "0.25rem 0.625rem", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", backgroundColor: weightUnit === u ? "#1e3055" : "transparent", color: weightUnit === u ? "#e8c96e" : "#6e88b0", border: "none", cursor: "pointer" }}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <input type="number" step="0.5" value={dosePerKg} onChange={e => setDosePerKg(Number(e.target.value))} style={inp} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <div style={res}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#6e88b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Calculated dose</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1.75rem", fontWeight: 700, color: "#e8c96e", lineHeight: 1 }}>{weightDose} <span style={{ fontSize: "0.875rem", color: "#6e88b0" }}>{weightUnit}</span></p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#4a6080", marginTop: "0.375rem" }}>{weightKg}kg × {dosePerKg} = {weightDose} {weightUnit}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
