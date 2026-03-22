"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Shield,
  ShieldCheck,
  FlaskConical,
  User,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Location {
  id: string;
  name: string;
}

interface Protocol {
  id: string;
  condition_name: string;
  category: string;
  primary_peptide: string;
  adjunct_peptides: string[] | null;
  is_featured: boolean;
  tagline: string | null;
}

interface ScreeningRecord {
  id: string;
  phone: string;
  safety_flags: string[];
  completed_at: string;
}

interface SelectedProtocol {
  protocol: Protocol;
  enabledPeptides: Set<string>;
  disabledReasons: Map<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_TILES = [
  { id: "body_composition", label: "Body Composition", emoji: "⚖️" },
  { id: "recovery",         label: "Recovery",         emoji: "🔄" },
  { id: "longevity",        label: "Longevity",        emoji: "🌿" },
  { id: "immune_support",   label: "Immune Support",   emoji: "🛡️" },
  { id: "gut_health",       label: "Gut Health",       emoji: "🌱" },
  { id: "cognitive_neuro",  label: "Cognitive / Neuro", emoji: "🧠" },
];

const HEALTH_FLAGS = [
  "Chronic pain",
  "Diabetes / insulin",
  "Cardiac history",
  "Cancer history",
  "Thyroid",
  "None",
];

const GOAL_CATEGORY_MAP: Record<string, string[]> = {
  body_composition: ["Metabolic", "Recovery/Performance"],
  recovery:         ["Musculoskeletal", "Recovery/Performance", "Musculoskeletal/Autoimmune"],
  longevity:        ["Longevity", "Anti-Aging/Skin"],
  immune_support:   ["Immune/Infectious", "Autoimmune", "GI/Autoimmune"],
  gut_health:       ["GI", "GI/Autoimmune"],
  cognitive_neuro:  ["Neurologic", "Sleep/Cognitive", "Sleep/Stress"],
};

const FLAG_PEPTIDE_RISKS: Record<string, { patterns: string[]; reason: string }> = {
  "Diabetes / insulin": {
    patterns: ["semaglutide", "retatrutide"],
    reason: "Active GLP-1 use — confirm no duplication with prescribing provider",
  },
  "Cardiac history": {
    patterns: ["aod-9604", "tesamorelin", "mots-c"],
    reason: "Cardiac history — lipid/metabolic modulators require cardiac clearance",
  },
  "Cancer history": {
    patterns: ["cjc", "tesamorelin", "ipamorelin", "ghrp", "mod grf"],
    reason: "Cancer history — GH secretagogues require oncology clearance",
  },
  "Thyroid": {
    patterns: ["tesamorelin"],
    reason: "Thyroid condition — Tesamorelin may alter thyroid axis; confirm with endocrinology",
  },
};

const STEPS = [
  "Basic Info",
  "Goals & Conditions",
  "Health Details",
  "Protocol",
  "Review",
  "Complete",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function stripPhone(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewClientModal({ onClose, onSuccess }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);

  // Locations
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState("");

  // Step 1 — Basic Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");

  // Screening
  const [screeningPhone, setScreeningPhone] = useState("");
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningRecord, setScreeningRecord] = useState<ScreeningRecord | null>(null);
  const [screeningNotFound, setScreeningNotFound] = useState(false);

  // Step 2 — Goals & Conditions
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [conditionSearch, setConditionSearch] = useState("");
  const [browseProtocols, setBrowseProtocols] = useState<Protocol[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [addedConditions, setAddedConditions] = useState<string[]>([]);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  // Step 3 — Health Details
  const [weightLbs, setWeightLbs] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Step 4 — Protocol
  const [allProtocols, setAllProtocols] = useState<Protocol[]>([]);
  const [protocolsLoading, setProtocolsLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<SelectedProtocol | null>(null);

  // Step 5 — Review
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid">("unpaid");

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [createdClientId, setCreatedClientId] = useState<string | null>(null);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase
      .from("locations")
      .select("id,name")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) {
          setLocations(data);
          if (data[0]) setLocationId(data[0].id);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== 3 || allProtocols.length > 0) return;
    setProtocolsLoading(true);
    supabase
      .from("protocols")
      .select("id,condition_name,category,primary_peptide,adjunct_peptides,is_featured,tagline")
      .eq("is_active", true)
      .then(({ data }) => {
        setAllProtocols((data as Protocol[]) || []);
        setProtocolsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Load all protocols for the browse panel when step 2 opens
  useEffect(() => {
    if (step !== 1 || browseProtocols.length > 0) return;
    setBrowseLoading(true);
    supabase
      .from("protocols")
      .select("id,condition_name,category,primary_peptide,adjunct_peptides,is_featured,tagline")
      .eq("is_active", true)
      .order("condition_name")
      .then(({ data }) => {
        setBrowseProtocols((data as Protocol[]) || []);
        setBrowseLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function lookupScreening() {
    const digits = stripPhone(screeningPhone);
    if (digits.length < 10) {
      toast.error("Enter a full 10-digit phone number");
      return;
    }
    setScreeningLoading(true);
    setScreeningRecord(null);
    setScreeningNotFound(false);
    try {
      const res = await fetch(`/api/screening-lookup?phone=${digits}`);
      if (res.status === 404) {
        setScreeningNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();
      setScreeningRecord(data);
    } catch {
      setScreeningNotFound(true);
    } finally {
      setScreeningLoading(false);
    }
  }

  function toggleGoal(id: string) {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function toggleFlag(flag: string) {
    if (flag === "None") {
      setSelectedFlags(["None"]);
      return;
    }
    setSelectedFlags((prev) => {
      const without = prev.filter((f) => f !== "None");
      return without.includes(flag)
        ? without.filter((f) => f !== flag)
        : [...without, flag];
    });
  }

  function addCondition(name: string) {
    if (!addedConditions.includes(name))
      setAddedConditions((prev) => [...prev, name]);
  }

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function getPeptideRisk(peptideName: string): string | null {
    const lower = peptideName.toLowerCase();
    for (const flag of selectedFlags) {
      const risk = FLAG_PEPTIDE_RISKS[flag];
      if (risk && risk.patterns.some((p) => lower.includes(p))) return risk.reason;
    }
    return null;
  }

  function selectProtocol(protocol: Protocol) {
    const allPeptides = [
      protocol.primary_peptide,
      ...(protocol.adjunct_peptides || []),
    ];
    const disabledReasons = new Map<string, string>();
    const enabledPeptides = new Set<string>();
    for (const p of allPeptides) {
      const risk = getPeptideRisk(p);
      if (risk) disabledReasons.set(p, risk);
      else enabledPeptides.add(p);
    }
    setSelectedProtocol({ protocol, enabledPeptides, disabledReasons });
  }

  function togglePeptide(name: string) {
    setSelectedProtocol((prev) => {
      if (!prev) return prev;
      const next = { ...prev, enabledPeptides: new Set(prev.enabledPeptides) };
      if (next.enabledPeptides.has(name)) next.enabledPeptides.delete(name);
      else next.enabledPeptides.add(name);
      return next;
    });
  }

  function validateStep1(): boolean {
    if (!firstName.trim()) { toast.error("First name is required"); return false; }
    if (!lastName.trim()) { toast.error("Last name is required"); return false; }
    const digits = stripPhone(phone);
    if (digits.length > 0 && digits.length < 10) {
      toast.error("Phone must be 10 digits: (XXX) XXX-XXXX");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const goalsArray = selectedGoals.map(
        (g) => GOAL_TILES.find((t) => t.id === g)?.label || g
      );
      const { data: client, error } = await supabase
        .from("clients")
        .insert({
          location_id: locationId || null,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || null,
          phone: stripPhone(phone) || null,
          date_of_birth: dob || null,
          sex: sex || null,
          weight_lbs: weightLbs ? parseFloat(weightLbs) : null,
          goals: goalsArray.length > 0 ? goalsArray : null,
          health_conditions:
            addedConditions.length > 0 ? addedConditions : null,
          current_medications: medications
            ? medications
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean)
            : null,
          allergies: allergies.trim() || null,
          notes: adminNotes.trim() || null,
          status: "onboarding",
        })
        .select("id")
        .single();
      if (error) throw error;
      setCreatedClientId(client.id);
      setStep(5);
      toast.success("Client created");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create client");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(0);
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
    setDob(""); setSex("");
    setScreeningPhone(""); setScreeningRecord(null); setScreeningNotFound(false);
    setSelectedGoals([]); setAddedConditions([]); setConditionSearch("");
    setBrowseProtocols([]); setExpandedCategories(new Set()); setSelectedFlags([]);
    setWeightLbs(""); setMedications(""); setAllergies(""); setAdminNotes("");
    setAllProtocols([]); setSelectedProtocol(null);
    setPaymentStatus("unpaid"); setCreatedClientId(null);
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const signatureStacks = allProtocols.filter(
    (p) =>
      p.is_featured ||
      p.category.toLowerCase().includes("stack") ||
      p.category.toLowerCase().includes("signature")
  );
  const matchedStacks = (() => {
    if (selectedGoals.length === 0) return signatureStacks;
    const cats = selectedGoals.flatMap((g) => GOAL_CATEGORY_MAP[g] || []);
    return signatureStacks
      .map((p) => ({ p, score: cats.filter((c) => p.category === c).length }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);
  })();

  const conditionMatchedProtocols = allProtocols.filter(
    (p) =>
      !p.is_featured &&
      addedConditions.some((c) =>
        p.condition_name.toLowerCase().includes(c.toLowerCase())
      )
  );

  const locationName = locations.find((l) => l.id === locationId)?.name || "—";

  // ── Styles ────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#142035",
    border: "1px solid #1e3055",
    color: "#ccd9ee",
    borderRadius: "0.5rem",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.65rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6e88b0",
    display: "block",
    marginBottom: "0.375rem",
  };

  // ── Peptide toggle card ───────────────────────────────────────────────────

  function PeptideToggleRow({ name }: { name: string }) {
    const enabled = selectedProtocol?.enabledPeptides.has(name) ?? false;
    const reason = selectedProtocol?.disabledReasons.get(name);
    return (
      <div
        className="flex items-start gap-3 rounded-lg px-3 py-2.5"
        style={{
          backgroundColor: "#0f1a2e",
          border: `1px solid ${reason ? "rgba(232,184,109,0.25)" : "#1e3055"}`,
        }}
      >
        <button
          onClick={() => togglePeptide(name)}
          className="relative flex-shrink-0 mt-0.5 transition-colors"
          style={{
            width: "2rem",
            height: "1.125rem",
            borderRadius: "9999px",
            backgroundColor: enabled ? "#54c7a2" : "#1e3055",
          }}
        >
          <div
            className="absolute top-0.5 rounded-full bg-white transition-all"
            style={{
              width: "0.875rem",
              height: "0.875rem",
              left: enabled ? "calc(100% - 1rem)" : "0.125rem",
            }}
          />
        </button>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium"
            style={{ color: enabled ? "#ccd9ee" : "#6e88b0" }}
          >
            {name}
          </p>
          {reason && (
            <p
              className="text-xs mt-0.5 leading-relaxed"
              style={{
                color: "#e8b86d",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.6rem",
              }}
            >
              ⚠ Disabled — {reason}. Enable only if provider has cleared.
            </p>
          )}
        </div>
      </div>
    );
  }

  function ProtocolCard({
    protocol,
    accentColor,
    accentBg,
    badge,
  }: {
    protocol: Protocol;
    accentColor: string;
    accentBg: string;
    badge?: string;
  }) {
    const isSelected = selectedProtocol?.protocol.id === protocol.id;
    const allPeptides = [
      protocol.primary_peptide,
      ...(protocol.adjunct_peptides || []),
    ];
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: `1px solid ${isSelected ? accentColor + "66" : "#1e3055"}`,
          backgroundColor: isSelected ? accentBg : "#142035",
        }}
      >
        <button
          className="w-full text-left p-4"
          onClick={() =>
            isSelected ? setSelectedProtocol(null) : selectProtocol(protocol)
          }
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {badge && (
                <span
                  className="inline-block text-xs px-1.5 py-0.5 rounded mb-1.5"
                  style={{
                    fontSize: "0.55rem",
                    backgroundColor: "rgba(84,199,162,0.15)",
                    color: "#54c7a2",
                    border: "1px solid rgba(84,199,162,0.3)",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {badge}
                </span>
              )}
              <p
                className="text-sm font-semibold"
                style={{
                  color: isSelected ? accentColor : "#ccd9ee",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {protocol.condition_name}
              </p>
              {protocol.tagline && (
                <p className="text-xs mt-0.5" style={{ color: "#6e88b0" }}>
                  {protocol.tagline}
                </p>
              )}
              {!protocol.tagline && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
                >
                  {protocol.primary_peptide} · {protocol.category}
                </p>
              )}
            </div>
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                backgroundColor: isSelected ? accentColor : "transparent",
                border: `1px solid ${isSelected ? accentColor : "#1e3055"}`,
              }}
            >
              {isSelected && <Check size={10} style={{ color: "#0b1120" }} />}
            </div>
          </div>
        </button>
        {isSelected && (
          <div
            className="border-t px-4 pb-4 pt-3 space-y-2"
            style={{ borderColor: accentColor + "33" }}
          >
            <p style={{ ...labelStyle, marginBottom: "0.5rem" }}>
              Peptides — toggle to include
            </p>
            {allPeptides.map((name) => (
              <PeptideToggleRow key={name} name={name} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(11,17,32,0.85)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#0f1a2e",
          border: "1px solid #1e3055",
          borderTop: "2px solid #e8c96e",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: "#1e3055" }}
        >
          <div>
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#ccd9ee",
              }}
            >
              New Client Intake
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
            >
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          {step < 5 && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg"
              style={{ color: "#6e88b0" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ccd9ee")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6e88b0")}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all"
                style={{ backgroundColor: i <= step ? "#e8c96e" : "#1e3055" }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 1: Basic Info ──────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    style={inputStyle}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="focus:outline-none"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    style={inputStyle}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="focus:outline-none"
                />
              </div>

              <div>
                <label style={labelStyle}>Phone — Client ID</label>
                <input
                  style={inputStyle}
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 000-0000"
                  className="focus:outline-none"
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
                >
                  Phone is the unique client identifier
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="focus:outline-none"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Biological Sex</label>
                  <select
                    style={inputStyle}
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Location</label>
                <select
                  style={inputStyle}
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="focus:outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Screening lookup */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
              >
                <div className="flex items-center gap-2">
                  <Shield size={13} style={{ color: "#6e88b0" }} />
                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#6e88b0",
                    }}
                  >
                    Link Screening Record
                  </p>
                  <span
                    className="ml-auto text-xs px-1.5 py-0.5 rounded"
                    style={{
                      fontSize: "0.55rem",
                      color: "#6e88b0",
                      backgroundColor: "rgba(110,136,176,0.1)",
                      border: "1px solid rgba(110,136,176,0.2)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Optional
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    style={{ ...inputStyle, flex: 1, width: "auto" }}
                    value={screeningPhone}
                    onChange={(e) =>
                      setScreeningPhone(formatPhone(e.target.value))
                    }
                    placeholder="(555) 000-0000"
                    className="focus:outline-none"
                  />
                  <button
                    onClick={lookupScreening}
                    disabled={screeningLoading}
                    className="px-4 py-2 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors"
                    style={{
                      backgroundColor: "#1e3055",
                      color: "#ccd9ee",
                      border: "1px solid #2a4066",
                      fontFamily: "'DM Mono', monospace",
                      opacity: screeningLoading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2a4066")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#1e3055")
                    }
                  >
                    {screeningLoading ? "Looking..." : "Look up"}
                  </button>
                </div>

                {screeningRecord && (
                  <div
                    className="rounded-lg p-3 space-y-2"
                    style={{
                      backgroundColor: "rgba(84,199,162,0.06)",
                      border: "1px solid rgba(84,199,162,0.2)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={13} style={{ color: "#54c7a2" }} />
                      <p
                        className="text-xs font-medium"
                        style={{
                          color: "#54c7a2",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        Screening record found
                      </p>
                    </div>
                    {screeningRecord.safety_flags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {screeningRecord.safety_flags.map((flag) => (
                          <span
                            key={flag}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "rgba(232,184,109,0.12)",
                              color: "#e8b86d",
                              border: "1px solid rgba(232,184,109,0.3)",
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "0.6rem",
                            }}
                          >
                            ⚠ {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {screeningNotFound && (
                  <div
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: "rgba(232,184,109,0.06)",
                      border: "1px solid rgba(232,184,109,0.2)",
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{
                        color: "#e8b86d",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      ⚠ No screening record found — intake can continue without
                      one
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (validateStep1()) setStep(1);
                }}
                className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Goals & Conditions ──────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Goal tiles */}
              <div>
                <label style={labelStyle}>Treatment Goals</label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_TILES.map((tile) => {
                    const active = selectedGoals.includes(tile.id);
                    return (
                      <button
                        key={tile.id}
                        onClick={() => toggleGoal(tile.id)}
                        className="rounded-xl p-3 text-left transition-all"
                        style={{
                          backgroundColor: active
                            ? "rgba(232,201,110,0.1)"
                            : "#142035",
                          border: `1px solid ${
                            active
                              ? "rgba(232,201,110,0.4)"
                              : "#1e3055"
                          }`,
                        }}
                      >
                        <div className="text-lg mb-1">{tile.emoji}</div>
                        <p
                          className="text-xs font-medium leading-tight"
                          style={{
                            color: active ? "#e8c96e" : "#ccd9ee",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {tile.label}
                        </p>
                        {active && (
                          <Check
                            size={10}
                            className="mt-1"
                            style={{ color: "#e8c96e" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditions browse */}
              <div>
                <label style={labelStyle}>Health Conditions</label>

                {/* Selected chips */}
                {addedConditions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {addedConditions.map((c) => (
                      <span
                        key={c}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: "rgba(84,199,162,0.1)",
                          color: "#54c7a2",
                          border: "1px solid rgba(84,199,162,0.25)",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {c}
                        <button
                          onClick={() =>
                            setAddedConditions((prev) =>
                              prev.filter((x) => x !== c)
                            )
                          }
                        >
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search filter */}
                <div className="relative mb-2">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#6e88b0" }}
                  />
                  <input
                    style={{ ...inputStyle, paddingLeft: "2.25rem" }}
                    value={conditionSearch}
                    onChange={(e) => setConditionSearch(e.target.value)}
                    placeholder="Filter conditions..."
                    className="focus:outline-none"
                  />
                </div>

                {/* Category accordion */}
                {browseLoading ? (
                  <p className="text-xs py-3 text-center" style={{ color: "#6e88b0" }}>
                    Loading...
                  </p>
                ) : (
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: "1px solid #1e3055", maxHeight: "260px", overflowY: "auto" }}
                  >
                    {(() => {
                      const term = conditionSearch.toLowerCase();
                      const filtered = browseProtocols.filter(
                        (p) =>
                          !term ||
                          p.condition_name.toLowerCase().includes(term) ||
                          p.category.toLowerCase().includes(term) ||
                          p.primary_peptide.toLowerCase().includes(term)
                      );
                      const grouped = filtered.reduce(
                        (acc: Record<string, Protocol[]>, p) => {
                          if (!acc[p.category]) acc[p.category] = [];
                          acc[p.category].push(p);
                          return acc;
                        },
                        {}
                      );
                      const cats = Object.keys(grouped).sort();
                      if (cats.length === 0)
                        return (
                          <p className="text-xs px-4 py-3" style={{ color: "#6e88b0" }}>
                            No conditions match
                          </p>
                        );
                      return cats.map((cat) => {
                        const open = expandedCategories.has(cat) || !!conditionSearch;
                        return (
                          <div key={cat} style={{ borderBottom: "1px solid #1e3055" }}>
                            <button
                              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                              style={{ backgroundColor: "#0f1a2e" }}
                              onClick={() => toggleCategory(cat)}
                            >
                              <span
                                className="text-xs font-medium"
                                style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
                              >
                                {cat}
                              </span>
                              <span className="text-xs" style={{ color: "#4a6080" }}>
                                {grouped[cat].length} · {open ? "▲" : "▼"}
                              </span>
                            </button>
                            {open &&
                              grouped[cat].map((p) => {
                                const already = addedConditions.includes(p.condition_name);
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => addCondition(p.condition_name)}
                                    disabled={already}
                                    className="w-full text-left px-5 py-2 flex items-center justify-between border-t"
                                    style={{
                                      borderColor: "rgba(30,48,85,0.4)",
                                      backgroundColor: already
                                        ? "rgba(84,199,162,0.04)"
                                        : "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!already)
                                        e.currentTarget.style.backgroundColor = "#142035";
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!already)
                                        e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="text-xs font-medium"
                                        style={{ color: already ? "#54c7a2" : "#ccd9ee" }}
                                      >
                                        {p.condition_name}
                                      </p>
                                      <p
                                        className="text-xs mt-0.5"
                                        style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem" }}
                                      >
                                        {p.primary_peptide}
                                      </p>
                                    </div>
                                    {already ? (
                                      <Check size={12} style={{ color: "#54c7a2", flexShrink: 0 }} />
                                    ) : (
                                      <Plus size={12} style={{ color: "#6e88b0", flexShrink: 0 }} />
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Health flags */}
              <div>
                <label style={labelStyle}>Health Flags</label>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_FLAGS.map((flag) => {
                    const active = selectedFlags.includes(flag);
                    return (
                      <button
                        key={flag}
                        onClick={() => toggleFlag(flag)}
                        className="text-xs px-3 py-1.5 rounded-full transition-all"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          backgroundColor: active
                            ? "rgba(232,184,109,0.15)"
                            : "#142035",
                          color: active ? "#e8b86d" : "#6e88b0",
                          border: `1px solid ${
                            active
                              ? "rgba(232,184,109,0.4)"
                              : "#1e3055"
                          }`,
                        }}
                      >
                        {flag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live preview */}
              {(selectedGoals.length > 0 ||
                addedConditions.length > 0 ||
                selectedFlags.length > 0) && (
                <div
                  className="rounded-lg p-3 space-y-2"
                  style={{
                    backgroundColor: "rgba(232,201,110,0.04)",
                    border: "1px solid rgba(232,201,110,0.15)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.6rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#e8c96e",
                    }}
                  >
                    Profile Preview
                  </p>
                  {selectedGoals.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedGoals.map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "rgba(232,201,110,0.1)",
                            color: "#e8c96e",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.6rem",
                          }}
                        >
                          {GOAL_TILES.find((t) => t.id === g)?.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {addedConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {addedConditions.map((c) => (
                        <span
                          key={c}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "rgba(84,199,162,0.1)",
                            color: "#54c7a2",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.6rem",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedFlags.filter((f) => f !== "None").length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedFlags
                        .filter((f) => f !== "None")
                        .map((f) => (
                          <span
                            key={f}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "rgba(232,184,109,0.1)",
                              color: "#e8b86d",
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "0.6rem",
                            }}
                          >
                            ⚠ {f}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#142035",
                    color: "#ccd9ee",
                    border: "1px solid #1e3055",
                  }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Health Details ───────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Weight (lbs)</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="0.1"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="165"
                  className="focus:outline-none"
                />
              </div>

              <div>
                <label style={labelStyle}>Current Medications (comma-separated)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="Metformin, Vitamin D, Omega-3"
                  className="focus:outline-none"
                />
              </div>

              <div>
                <label style={labelStyle}>Known Allergies</label>
                <input
                  style={inputStyle}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Penicillin, sulfa drugs"
                  className="focus:outline-none"
                />
              </div>

              <div>
                <label style={labelStyle}>Admin Notes</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Clinical observations, referral source, special considerations..."
                  className="focus:outline-none"
                />
              </div>

              {/* Lab work placeholder */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  border: "1px dashed rgba(110,136,176,0.3)",
                  backgroundColor: "rgba(110,136,176,0.03)",
                }}
              >
                <FlaskConical
                  size={18}
                  style={{ color: "#6e88b0", flexShrink: 0 }}
                />
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#6e88b0" }}
                  >
                    Lab Work — Coming Soon
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: "rgba(110,136,176,0.5)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Lab result upload and parsing will be available here
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#142035",
                    color: "#ccd9ee",
                    border: "1px solid #1e3055",
                  }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Protocol Selection ───────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              {protocolsLoading ? (
                <p
                  className="text-sm py-8 text-center"
                  style={{ color: "#6e88b0" }}
                >
                  Loading protocols...
                </p>
              ) : (
                <>
                  {/* Signature stacks */}
                  <div>
                    <p style={labelStyle}>✦ CA Peptide Labs Signature Stacks</p>
                    {matchedStacks.length === 0 ? (
                      <p className="text-xs" style={{ color: "#6e88b0" }}>
                        No signature stacks available
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {matchedStacks.map((p, idx) => (
                          <ProtocolCard
                            key={p.id}
                            protocol={p}
                            accentColor="#e8c96e"
                            accentBg="rgba(232,201,110,0.05)"
                            badge={
                              idx === 0 && selectedGoals.length > 0
                                ? "Best Match"
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Condition-matched protocols */}
                  {conditionMatchedProtocols.length > 0 && (
                    <div>
                      <p style={labelStyle}>Condition Protocols</p>
                      <div className="space-y-2">
                        {conditionMatchedProtocols.map((p) => (
                          <ProtocolCard
                            key={p.id}
                            protocol={p}
                            accentColor="#54c7a2"
                            accentBg="rgba(84,199,162,0.05)"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom option */}
                  <div>
                    <p style={labelStyle}>Custom</p>
                    <div
                      className="rounded-xl p-4"
                      style={{
                        border: "1px dashed #1e3055",
                        backgroundColor: "rgba(110,136,176,0.03)",
                      }}
                    >
                      <p className="text-xs" style={{ color: "#6e88b0" }}>
                        Build a custom protocol after creating the client —
                        use the Protocol Selector or Custom Builder from the
                        client&apos;s profile.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: "#142035",
                        color: "#ccd9ee",
                        border: "1px solid #1e3055",
                      }}
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                      style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
                    >
                      Review <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 5: Review ──────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  backgroundColor: "#142035",
                  border: "1px solid #1e3055",
                  borderTop: "2px solid #e8c96e",
                }}
              >
                <h3
                  className="font-semibold text-sm"
                  style={{
                    color: "#e8c96e",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  Client Summary
                </h3>
                {(
                  [
                    ["Name", `${firstName} ${lastName}`],
                    ["Email", email || "—"],
                    ["Phone", phone || "—"],
                    ["DOB", dob || "—"],
                    ["Sex", sex || "—"],
                    ["Location", locationName],
                    ["Weight", weightLbs ? `${weightLbs} lbs` : "—"],
                    [
                      "Goals",
                      selectedGoals.length > 0
                        ? selectedGoals
                            .map(
                              (g) => GOAL_TILES.find((t) => t.id === g)?.label
                            )
                            .join(", ")
                        : "—",
                    ],
                    [
                      "Conditions",
                      addedConditions.length > 0
                        ? addedConditions.join(", ")
                        : "—",
                    ],
                    [
                      "Health Flags",
                      selectedFlags.length > 0
                        ? selectedFlags.join(", ")
                        : "—",
                    ],
                    ["Medications", medications || "—"],
                    ["Allergies", allergies || "—"],
                    [
                      "Protocol",
                      selectedProtocol?.protocol.condition_name ||
                        "None selected",
                    ],
                    [
                      "Screening",
                      screeningRecord ? "Linked ✓" : "Not linked",
                    ],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span
                      style={{
                        color: "#6e88b0",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.7rem",
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        color: "#ccd9ee",
                        textAlign: "right",
                        fontSize: "0.8rem",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment status — only editable field */}
              <div>
                <label style={labelStyle}>Payment Status</label>
                <div className="flex gap-2">
                  {(["unpaid", "paid"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        backgroundColor:
                          paymentStatus === status
                            ? status === "paid"
                              ? "rgba(84,199,162,0.15)"
                              : "rgba(232,90,106,0.1)"
                            : "#142035",
                        color:
                          paymentStatus === status
                            ? status === "paid"
                              ? "#54c7a2"
                              : "#e05a6a"
                            : "#6e88b0",
                        border: `1px solid ${
                          paymentStatus === status
                            ? status === "paid"
                              ? "rgba(84,199,162,0.3)"
                              : "rgba(224,90,106,0.3)"
                            : "#1e3055"
                        }`,
                      }}
                    >
                      {status === "paid" ? "✓ Paid" : "Unpaid"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#142035",
                    color: "#ccd9ee",
                    border: "1px solid #1e3055",
                  }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#e8c96e",
                    color: "#0b1120",
                    opacity: submitting ? 0.8 : 1,
                  }}
                >
                  {submitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Check size={16} /> Create Client
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 6: Confirmation ─────────────────────────────── */}
          {step === 5 && (
            <div className="py-4 space-y-5">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: "rgba(84,199,162,0.15)",
                    border: "1px solid rgba(84,199,162,0.3)",
                  }}
                >
                  <Check size={28} style={{ color: "#54c7a2" }} />
                </div>
                <h3
                  className="text-xl font-semibold mb-1"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    color: "#ccd9ee",
                  }}
                >
                  {firstName} {lastName}
                </h3>
                <p className="text-sm" style={{ color: "#6e88b0" }}>
                  Client successfully created
                </p>
              </div>

              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  backgroundColor: "#142035",
                  border: "1px solid #1e3055",
                }}
              >
                {(
                  [
                    ["Phone", phone || "—"],
                    ["Location", locationName],
                    [
                      "Protocol",
                      selectedProtocol?.protocol.condition_name ||
                        "None assigned",
                    ],
                    [
                      "Screening",
                      screeningRecord ? "Linked ✓" : "Not linked",
                    ],
                    [
                      "Payment",
                      paymentStatus === "paid" ? "Paid ✓" : "Unpaid",
                    ],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between text-sm"
                  >
                    <span
                      style={{
                        color: "#6e88b0",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.7rem",
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ color: "#ccd9ee", fontSize: "0.8rem" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    if (createdClientId)
                      router.push(`/clients/${createdClientId}`);
                    onSuccess();
                  }}
                  className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
                >
                  <User size={15} /> View Client Profile
                </button>
                <button
                  onClick={resetForm}
                  className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#142035",
                    color: "#ccd9ee",
                    border: "1px solid #1e3055",
                  }}
                >
                  Start Another Intake
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
