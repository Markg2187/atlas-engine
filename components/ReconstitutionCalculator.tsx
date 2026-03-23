"use client";

import { useState, useCallback } from "react";
import { Calculator, Syringe, Package, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

type DoseUnit = "mcg" | "mg";
type SyringeSize = "0.3ml" | "0.5ml" | "1ml";

interface ReconResult {
  // Concentration
  concentrationMgMl: number;
  concentrationMcgMl: number;
  // Per dose
  doseInMcg: number;
  doseInMg: number;
  volumePerDoseMl: number;
  unitsU100: number;
  recommendedSyringe: SyringeSize;
  syringeReason: string;
  // Per vial
  dosesPerVial: number;
  // Supply calculations
  vialsPerPhase: (days: number, frequency: number) => number;
  vials30Days: number;
  vials60Days: number;
  vialsFullProtocol: number;
  // Warnings
  dilutionWarning: string | null;
  splitDoseWarning: string | null;
  // Display
  concentrationDisplay: string;
  doseDisplay: string;
  unitsDisplay: string;
}

interface CalculatorProps {
  // Optional: pre-fill from peptide detail page
  peptideName?: string;
  defaultVialMg?: number;
  defaultBacMl?: number;
  defaultDoseMcg?: number;
  defaultDoseUnit?: DoseUnit;
  defaultDailyDoses?: number;
  defaultProtocolDays?: number;
  dilutionNote?: string;
  // Layout
  compact?: boolean;
}

// ─── Core Math ────────────────────────────────────────────────

function calcRecon(
  vialMg: number,
  bacMl: number,
  dose: number,
  doseUnit: DoseUnit,
  dailyDoses: number,
  protocolDays: number,
  dilutionNote: string | null
): ReconResult {
  const doseInMcg = doseUnit === "mg" ? dose * 1000 : dose;
  const doseInMg = doseUnit === "mcg" ? dose / 1000 : dose;

  const concentrationMgMl = vialMg / bacMl;
  const concentrationMcgMl = concentrationMgMl * 1000;

  const volumePerDoseMl = doseInMcg / concentrationMcgMl;
  const unitsU100 = volumePerDoseMl * 100;

  // Syringe recommendation
  let recommendedSyringe: SyringeSize;
  let syringeReason: string;
  if (unitsU100 <= 30) {
    recommendedSyringe = "0.3ml";
    syringeReason = "0.3ml (30 unit) syringe — precise dosing for small volumes";
  } else if (unitsU100 <= 50) {
    recommendedSyringe = "0.5ml";
    syringeReason = "0.5ml (50 unit) syringe — standard peptide syringe";
  } else {
    recommendedSyringe = "1ml";
    syringeReason = "1ml (100 unit) syringe — larger volume dose";
  }

  // Doses per vial
  const dosesPerVial = Math.floor((vialMg * 1000) / doseInMcg);

  // Vial calculations
  const totalDosesNeeded = (days: number) => Math.ceil(days * dailyDoses);
  const vialsNeeded = (days: number) => Math.ceil(totalDosesNeeded(days) / dosesPerVial);

  const vials30Days = vialsNeeded(30);
  const vials60Days = vialsNeeded(60);
  const vialsFullProtocol = vialsNeeded(protocolDays);

  // Warnings
  let splitDoseWarning: string | null = null;
  if (volumePerDoseMl > 1.0) {
    splitDoseWarning = `Volume ${volumePerDoseMl.toFixed(2)}ml exceeds 1ml — split into 2 injection sites for proper absorption`;
  }

  return {
    concentrationMgMl,
    concentrationMcgMl,
    doseInMcg,
    doseInMg,
    volumePerDoseMl,
    unitsU100,
    recommendedSyringe,
    syringeReason,
    dosesPerVial,
    vialsPerPhase: vialsNeeded,
    vials30Days,
    vials60Days,
    vialsFullProtocol,
    dilutionWarning: dilutionNote || null,
    splitDoseWarning,
    concentrationDisplay: `${concentrationMgMl.toFixed(2)} mg/ml (${concentrationMcgMl.toFixed(0)} mcg/ml)`,
    doseDisplay: doseUnit === "mcg" ? `${doseInMcg} mcg (${doseInMg.toFixed(3)} mg)` : `${doseInMg} mg (${doseInMcg.toFixed(0)} mcg)`,
    unitsDisplay: `${unitsU100.toFixed(1)} units on a U-100 syringe`,
  };
}

// ─── Styles ───────────────────────────────────────────────────

const s = {
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e8e0d0",
    borderRadius: "0.75rem",
    overflow: "hidden",
  } as React.CSSProperties,
  input: {
    backgroundColor: "#f5f3ee",
    border: "1px solid #e8e0d0",
    color: "#1a2744",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    fontSize: "1rem",
    width: "100%",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  } as React.CSSProperties,
  label: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#5a6a7a",
    display: "block",
    marginBottom: "0.3rem",
  },
  result: {
    backgroundColor: "#f5f3ee",
    border: "1px solid #e8e0d0",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
  } as React.CSSProperties,
  resultLabel: {
    fontSize: "0.75rem",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#5a6a7a",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: "0.25rem",
  } as React.CSSProperties,
  resultValue: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "0.85rem",
    color: "#c9973a",
    fontWeight: 600,
  } as React.CSSProperties,
  sectionHeader: {
    padding: "0.75rem 1.25rem",
    borderBottom: "1px solid #e8e0d0",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
};

// ─── Unit Toggle ──────────────────────────────────────────────

function UnitToggle({ value, onChange }: { value: DoseUnit; onChange: (v: DoseUnit) => void }) {
  return (
    <div style={{ display: "flex", border: "1px solid #e8e0d0", borderRadius: "0.5rem", overflow: "hidden" }}>
      {(["mcg", "mg"] as DoseUnit[]).map(u => (
        <button key={u} onClick={() => onChange(u)}
          style={{
            flex: 1, padding: "0.5rem", fontSize: "0.875rem",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            backgroundColor: value === u ? "#e8e0d0" : "transparent",
            color: value === u ? "#c9973a" : "#5a6a7a",
            border: "none", cursor: "pointer",
            fontWeight: value === u ? 600 : 400,
          }}>
          {u}
        </button>
      ))}
    </div>
  );
}

// ─── Syringe Visual ───────────────────────────────────────────

function SyringeIndicator({ units, syringe, reason }: { units: number; syringe: SyringeSize; reason: string }) {
  const maxUnits = syringe === "0.3ml" ? 30 : syringe === "0.5ml" ? 50 : 100;
  const pct = Math.min(100, (units / maxUnits) * 100);
  const color = pct > 90 ? "#e05a6a" : pct > 70 ? "#e8b86d" : "#54c7a2";

  return (
    <div style={s.result}>
      <p style={s.resultLabel}>Recommended syringe</p>
      <p style={{ ...s.resultValue, color: "#1a2744", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{reason}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ flex: 1, height: "8px", backgroundColor: "#ffffff", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: "4px", transition: "width 0.3s ease" }} />
        </div>
        <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem", color, minWidth: "60px", textAlign: "right" }}>
          {units.toFixed(1)}/{maxUnits}u
        </span>
      </div>
    </div>
  );
}

// ─── Vial Supply Card ─────────────────────────────────────────

function VialSupplyCard({ label, vials, days, accent }: { label: string; vials: number; days?: number; accent: string }) {
  return (
    <div style={{ ...s.result, textAlign: "center" }}>
      <p style={{ ...s.resultLabel, marginBottom: "0.4rem" }}>{label}</p>
      <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "1.75rem", fontWeight: 700, color: accent, lineHeight: 1 }}>
        {vials}
      </p>
      <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#5a6a7a", marginTop: "0.2rem" }}>
        vial{vials !== 1 ? "s" : ""}
        {days ? ` · ${days}d` : ""}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function ReconstitutionCalculator({
  peptideName,
  defaultVialMg = 5,
  defaultBacMl = 2,
  defaultDoseMcg = 250,
  defaultDoseUnit = "mcg",
  defaultDailyDoses = 1,
  defaultProtocolDays = 90,
  dilutionNote,
  compact = false,
}: CalculatorProps) {
  const [vialMg, setVialMg] = useState(defaultVialMg);
  const [bacMl, setBacMl] = useState(defaultBacMl);
  const [dose, setDose] = useState(defaultDoseMcg);
  const [doseUnit, setDoseUnit] = useState<DoseUnit>(defaultDoseUnit);
  const [dailyDoses, setDailyDoses] = useState(defaultDailyDoses);
  const [protocolDays, setProtocolDays] = useState(defaultProtocolDays);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const result = calcRecon(vialMg, bacMl, dose, doseUnit, dailyDoses, protocolDays, dilutionNote || null);

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={{ ...s.sectionHeader, borderTop: "3px solid #c9973a" }}>
        <Calculator size={15} style={{ color: "#c9973a" }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744", fontWeight: 600, fontSize: "0.95rem" }}>
            {peptideName ? `${peptideName} — Reconstitution` : "Reconstitution Calculator"}
          </p>
          <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#5a6a7a" }}>
            Enter vial size and BAC water to calculate everything
          </p>
        </div>
      </div>

      <div style={{ padding: "1rem 1.25rem", display: "grid", gap: "1rem", gridTemplateColumns: compact ? "1fr" : "1fr 1fr" }}>

        {/* ── LEFT: Inputs ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

          {/* Dilution warning */}
          {result.dilutionWarning && (
            <div style={{ backgroundColor: "rgba(232,184,109,0.08)", border: "1px solid rgba(232,184,109,0.25)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", display: "flex", gap: "0.5rem" }}>
              <AlertTriangle size={13} style={{ color: "#e8b86d", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#e8b86d", lineHeight: 1.5 }}>
                {result.dilutionWarning}
              </p>
            </div>
          )}

          {/* Vial size */}
          <div>
            <label style={s.label}>Vial size (mg)</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[2, 5, 10, 20, 50, 100, 500].map(v => (
                <button key={v} onClick={() => setVialMg(v)}
                  style={{
                    padding: "0.375rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid",
                    backgroundColor: vialMg === v ? "rgba(201,151,58,0.15)" : "#f5f3ee",
                    color: vialMg === v ? "#c9973a" : "#5a6a7a",
                    borderColor: vialMg === v ? "#c9973a" : "#e8e0d0",
                  }}>
                  {v}mg
                </button>
              ))}
              <input type="number" step="0.5" value={vialMg}
                onChange={e => setVialMg(Number(e.target.value))}
                placeholder="custom"
                style={{ ...s.input, width: "80px" }} />
            </div>
          </div>

          {/* BAC water */}
          <div>
            <label style={s.label}>Bacteriostatic water (ml)</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {[1, 2, 2.5, 3, 4, 5, 10].map(v => (
                <button key={v} onClick={() => setBacMl(v)}
                  style={{
                    padding: "0.375rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid",
                    backgroundColor: bacMl === v ? "rgba(84,199,162,0.12)" : "#f5f3ee",
                    color: bacMl === v ? "#54c7a2" : "#5a6a7a",
                    borderColor: bacMl === v ? "#54c7a2" : "#e8e0d0",
                  }}>
                  {v}ml
                </button>
              ))}
            </div>
          </div>

          {/* Dose */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
              <label style={{ ...s.label, marginBottom: 0 }}>Dose per injection</label>
              <UnitToggle value={doseUnit} onChange={setDoseUnit} />
            </div>
            <input type="number" step={doseUnit === "mcg" ? 50 : 0.5}
              value={dose} onChange={e => setDose(Number(e.target.value))}
              style={s.input} />
            {/* Quick dose presets */}
            <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.375rem", flexWrap: "wrap" }}>
              {doseUnit === "mcg"
                ? [100, 200, 250, 300, 400, 500, 600, 750, 1000].map(v => (
                  <button key={v} onClick={() => setDose(v)}
                    style={{ padding: "0.2rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", backgroundColor: dose === v ? "rgba(201,151,58,0.15)" : "#f5f3ee", color: dose === v ? "#c9973a" : "#5a6a7a", border: `1px solid ${dose === v ? "#c9973a" : "#e8e0d0"}` }}>
                    {v}
                  </button>
                ))
                : [0.5, 1, 1.5, 2, 2.5, 4, 5, 10].map(v => (
                  <button key={v} onClick={() => setDose(v)}
                    style={{ padding: "0.2rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", backgroundColor: dose === v ? "rgba(201,151,58,0.15)" : "#f5f3ee", color: dose === v ? "#c9973a" : "#5a6a7a", border: `1px solid ${dose === v ? "#c9973a" : "#e8e0d0"}` }}>
                    {v}
                  </button>
                ))
              }
            </div>
          </div>

          {/* Advanced toggle */}
          <button onClick={() => setShowAdvanced(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: "pointer", color: "#5a6a7a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", padding: 0 }}>
            {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showAdvanced ? "Hide" : "Show"} supply calculator
          </button>

          {showAdvanced && (
            <>
              <div>
                <label style={s.label}>Injections per day</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[1, 2, 3].map(v => (
                    <button key={v} onClick={() => setDailyDoses(v)}
                      style={{ flex: 1, padding: "0.5rem", borderRadius: "0.375rem", fontSize: "0.875rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: dailyDoses === v ? "#f5f3ee" : "#f5f3ee", color: dailyDoses === v ? "#5a6a7a" : "#8a7a5a", borderColor: dailyDoses === v ? "#5a6a7a" : "#e8e0d0" }}>
                      {v}x/day
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={s.label}>Protocol length (days)</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {[21, 30, 60, 90, 180, 365].map(v => (
                    <button key={v} onClick={() => setProtocolDays(v)}
                      style={{ padding: "0.375rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.8rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", cursor: "pointer", border: "1px solid", backgroundColor: protocolDays === v ? "#f5f3ee" : "#f5f3ee", color: protocolDays === v ? "#5a6a7a" : "#8a7a5a", borderColor: protocolDays === v ? "#5a6a7a" : "#e8e0d0" }}>
                      {v === 30 ? "1mo" : v === 60 ? "2mo" : v === 90 ? "3mo" : v === 180 ? "6mo" : v === 365 ? "1yr" : `${v}d`}
                    </button>
                  ))}
                  <input type="number" step="1" value={protocolDays}
                    onChange={e => setProtocolDays(Number(e.target.value))}
                    style={{ ...s.input, width: "70px" }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Results ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>

          {/* Concentration */}
          <div style={s.result}>
            <p style={s.resultLabel}>Concentration</p>
            <p style={s.resultValue}>{result.concentrationDisplay}</p>
          </div>

          {/* Dose breakdown */}
          <div style={s.result}>
            <p style={s.resultLabel}>Your dose</p>
            <p style={s.resultValue}>{result.doseDisplay}</p>
          </div>

          {/* Units — the KEY number */}
          <div style={{ ...s.result, borderColor: "#c9973a", borderWidth: "1px" }}>
            <p style={s.resultLabel}>Draw on syringe</p>
            <p style={{ ...s.resultValue, fontSize: "1.5rem", color: "#c9973a" }}>
              {result.unitsU100.toFixed(1)} <span style={{ fontSize: "0.875rem", color: "#5a6a7a" }}>units (U-100)</span>
            </p>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.8rem", color: "#5a6a7a", marginTop: "0.25rem" }}>
              = {result.volumePerDoseMl.toFixed(3)} ml
            </p>
          </div>

          {/* Syringe indicator */}
          <SyringeIndicator units={result.unitsU100} syringe={result.recommendedSyringe} reason={result.syringeReason} />

          {/* Doses per vial */}
          <div style={s.result}>
            <p style={s.resultLabel}>Doses per vial</p>
            <p style={{ ...s.resultValue, color: "#54c7a2", fontSize: "1.25rem" }}>{result.dosesPerVial} doses</p>
          </div>

          {/* Split dose warning */}
          {result.splitDoseWarning && (
            <div style={{ backgroundColor: "rgba(224,90,106,0.08)", border: "1px solid rgba(224,90,106,0.25)", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", display: "flex", gap: "0.5rem" }}>
              <AlertTriangle size={13} style={{ color: "#e05a6a", flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#e05a6a", lineHeight: 1.5 }}>
                {result.splitDoseWarning}
              </p>
            </div>
          )}

          {/* Vial supply — shows when advanced is open */}
          {showAdvanced && (
            <div>
              <p style={{ ...s.resultLabel, marginBottom: "0.5rem" }}>Vials needed</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <VialSupplyCard label="30 days" vials={result.vials30Days} days={30} accent="#5a6a7a" />
                <VialSupplyCard label="60 days" vials={result.vials60Days} days={60} accent="#54c7a2" />
                <VialSupplyCard label={`${protocolDays}d full`} vials={result.vialsFullProtocol} accent="#c9973a" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formula reference footer */}
      <div style={{ borderTop: "1px solid #e8e0d0", padding: "0.75rem 1.25rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {[
            { label: "Concentration", formula: `${vialMg}mg ÷ ${bacMl}ml = ${result.concentrationMgMl.toFixed(2)}mg/ml` },
            { label: "Units", formula: `(${result.doseInMcg}mcg ÷ ${result.concentrationMcgMl.toFixed(0)}mcg/ml) × 100 = ${result.unitsU100.toFixed(1)}u` },
            { label: "Doses/vial", formula: `floor(${vialMg * 1000}mcg ÷ ${result.doseInMcg}mcg) = ${result.dosesPerVial}` },
          ].map(({ label, formula }) => (
            <div key={label} style={{ flex: "1 1 200px" }}>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.7rem", color: "#c9973a", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.75rem", color: "#8a7a5a", marginTop: "0.125rem" }}>{formula}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
