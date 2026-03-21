"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const step1Schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
});

const step2Schema = z.object({
  weight_lbs: z.coerce.number().positive().optional(),
  goals: z.string().optional(),
  health_conditions: z.string().optional(),
  current_medications: z.string().optional(),
  allergies: z.string().optional(),
});

const step3Schema = z.object({
  notes: z.string().optional(),
  status: z.enum(["active", "inactive", "onboarding"]).default("onboarding"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

interface NewClientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = ["Basic Info", "Health Profile", "Notes & Status", "Review", "Complete"];

export default function NewClientModal({ onClose, onSuccess }: NewClientModalProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({});
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<{
    protocol_id: string;
    condition_name: string;
    primary_peptide: string;
    category: string;
    reasoning: string;
  } | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const supabase = createClient();

  useState(() => {
    supabase.from("locations").select("id,name").eq("is_active", true).then(({ data }) => {
      if (data) setLocations(data);
      if (data && data.length > 0) setLocationId(data[0].id);
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const step1Form = useForm<Step1Data>({ resolver: zodResolver(step1Schema) as any, defaultValues: formData as any });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const step2Form = useForm<Step2Data>({ resolver: zodResolver(step2Schema) as any, defaultValues: formData as any });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const step3Form = useForm<Step3Data>({ resolver: zodResolver(step3Schema) as any, defaultValues: { status: "onboarding" as const, ...formData } as any });

  async function handleStep1(data: Step1Data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(1);
  }

  async function handleStep2(data: Step2Data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  }

  async function handleSuggestProtocol() {
    const values = step2Form.getValues();
    if (!values.goals && !values.health_conditions) {
      toast.error("Enter goals or health conditions first");
      return;
    }
    setSuggestLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch("/api/suggest-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: values.goals || "",
          health_conditions: values.health_conditions || "",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      const data = await res.json();
      setAiSuggestion(data);
    } catch (err: unknown) {
      toast.error((err as Error).message || "AI suggestion failed");
    } finally {
      setSuggestLoading(false);
    }
  }

  async function handleStep3(data: Step3Data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        location_id: locationId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        sex: formData.sex || null,
        weight_lbs: formData.weight_lbs || null,
        goals: formData.goals
          ? formData.goals.split(",").map((g) => g.trim()).filter(Boolean)
          : null,
        health_conditions: formData.health_conditions
          ? formData.health_conditions.split(",").map((c) => c.trim()).filter(Boolean)
          : null,
        current_medications: formData.current_medications
          ? formData.current_medications.split(",").map((m) => m.trim()).filter(Boolean)
          : null,
        allergies: formData.allergies || null,
        notes: formData.notes || null,
        status: formData.status || "onboarding",
      };

      const { error } = await supabase.from("clients").insert(payload);
      if (error) throw error;

      setStep(4);
      toast.success("Client created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: "#142035",
    border: "1px solid #1e3055",
    color: "#ccd9ee",
    borderRadius: "0.5rem",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  const labelStyle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.65rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#6e88b0",
    display: "block",
    marginBottom: "0.375rem",
  };

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
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "#1e3055" }}
        >
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
            >
              New Client Intake
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "#6e88b0" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ccd9ee")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6e88b0")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all"
                style={{
                  backgroundColor: i <= step ? "#e8c96e" : "#1e3055",
                }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input style={inputStyle} {...step1Form.register("first_name")} placeholder="Jane" />
                  {step1Form.formState.errors.first_name && (
                    <p className="text-xs mt-1" style={{ color: "#e05a6a" }}>
                      {step1Form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input style={inputStyle} {...step1Form.register("last_name")} placeholder="Smith" />
                  {step1Form.formState.errors.last_name && (
                    <p className="text-xs mt-1" style={{ color: "#e05a6a" }}>
                      {step1Form.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" {...step1Form.register("email")} placeholder="jane@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} {...step1Form.register("phone")} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input style={inputStyle} type="date" {...step1Form.register("date_of_birth")} />
                </div>
                <div>
                  <label style={labelStyle}>Biological Sex</label>
                  <select style={inputStyle} {...step1Form.register("sex")}>
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
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Step 1: Health Profile */}
          {step === 1 && (
            <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
              <div>
                <label style={labelStyle}>Weight (lbs)</label>
                <input style={inputStyle} type="number" step="0.1" {...step2Form.register("weight_lbs")} placeholder="165" />
              </div>
              <div>
                <label style={labelStyle}>Goals (comma-separated)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  {...step2Form.register("goals")}
                  placeholder="Weight loss, muscle recovery, sleep optimization"
                />
              </div>
              <div>
                <label style={labelStyle}>Health Conditions (comma-separated)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  {...step2Form.register("health_conditions")}
                  placeholder="Chronic back pain, IBD, Lyme disease"
                />
              </div>
              {/* AI Protocol Suggestion */}
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "rgba(232,201,110,0.04)",
                  border: "1px solid rgba(232,201,110,0.15)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}
                    >
                      ✦ AI Protocol Suggestion
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6e88b0" }}>
                      Analyzes goals & conditions to recommend the best protocol
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSuggestProtocol}
                    disabled={suggestLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                    style={{
                      backgroundColor: suggestLoading
                        ? "rgba(232,201,110,0.1)"
                        : "rgba(232,201,110,0.15)",
                      color: "#e8c96e",
                      border: "1px solid rgba(232,201,110,0.3)",
                      fontFamily: "'DM Mono', monospace",
                      opacity: suggestLoading ? 0.8 : 1,
                    }}
                  >
                    <Sparkles size={12} />
                    {suggestLoading ? "Analyzing..." : "Suggest"}
                  </button>
                </div>

                {aiSuggestion ? (
                  <div
                    className="rounded-lg p-3 space-y-2"
                    style={{
                      backgroundColor: "rgba(11,17,32,0.6)",
                      border: "1px solid rgba(232,201,110,0.2)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: "#e8c96e",
                            fontFamily: "'Playfair Display', Georgia, serif",
                          }}
                        >
                          {aiSuggestion.condition_name}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}
                        >
                          {aiSuggestion.primary_peptide}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: "rgba(84,199,162,0.15)",
                          color: "#54c7a2",
                          border: "1px solid rgba(84,199,162,0.3)",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {aiSuggestion.category}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#6e88b0" }}>
                      {aiSuggestion.reasoning}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(110,136,176,0.6)", fontFamily: "'DM Mono', monospace" }}
                    >
                      Assign after creating the client from their profile page
                    </p>
                  </div>
                ) : !suggestLoading ? (
                  <p className="text-xs" style={{ color: "rgba(110,136,176,0.5)" }}>
                    Fill in goals and health conditions above, then click Suggest
                  </p>
                ) : null}
              </div>

              <div>
                <label style={labelStyle}>Current Medications (comma-separated)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  {...step2Form.register("current_medications")}
                  placeholder="Metformin, Vitamin D, Omega-3"
                />
              </div>
              <div>
                <label style={labelStyle}>Known Allergies</label>
                <input style={inputStyle} {...step2Form.register("allergies")} placeholder="Penicillin, sulfa drugs" />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#142035", color: "#ccd9ee", border: "1px solid #1e3055" }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Notes & Status */}
          {step === 2 && (
            <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
              <div>
                <label style={labelStyle}>Internal Notes</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                  {...step3Form.register("notes")}
                  placeholder="Clinical observations, referral source, special considerations..."
                />
              </div>
              <div>
                <label style={labelStyle}>Initial Status</label>
                <select style={inputStyle} {...step3Form.register("status")}>
                  <option value="onboarding">Onboarding</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#142035", color: "#ccd9ee", border: "1px solid #1e3055" }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
                >
                  Review <ChevronRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
              >
                <h3 className="font-semibold text-sm" style={{ color: "#e8c96e", fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Client Summary
                </h3>
                {[
                  ["Name", `${formData.first_name} ${formData.last_name}`],
                  ["Email", formData.email || "—"],
                  ["Phone", formData.phone || "—"],
                  ["DOB", formData.date_of_birth || "—"],
                  ["Sex", formData.sex || "—"],
                  ["Weight", formData.weight_lbs ? `${formData.weight_lbs} lbs` : "—"],
                  ["Goals", formData.goals || "—"],
                  ["Conditions", formData.health_conditions || "—"],
                  ["Status", formData.status || "onboarding"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>
                      {label}
                    </span>
                    <span style={{ color: "#ccd9ee" }}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#142035", color: "#ccd9ee", border: "1px solid #1e3055" }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e8c96e", color: "#0b1120", opacity: loading ? 0.8 : 1 }}
                >
                  {loading ? "Creating..." : (<><Check size={16} /> Create Client</>)}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(84,199,162,0.15)", border: "1px solid rgba(84,199,162,0.3)" }}
              >
                <Check size={28} style={{ color: "#54c7a2" }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                Client Created
              </h3>
              <p className="text-sm mb-6" style={{ color: "#6e88b0" }}>
                {formData.first_name} {formData.last_name} has been added to the system.
              </p>
              <button
                onClick={onSuccess}
                className="px-8 py-3 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
