"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Search,
  Syringe,
  FlaskConical,
  MessageSquare,
  AlertTriangle,
  Shield,
  Star,
  BookLock,
  ChevronDown,
  Package,
  FileText,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import ClientActions from "@/components/clients/ClientActions";
import AssignProtocolSheet from "@/components/protocols/AssignProtocolSheet";

interface Props {
  client: any;
  activeProtocol: any | null;
  protocolHistory: any[];
  checkins: any[];
  labResults: any[];
  currentUserName: string;
  isMinor: boolean;
  age: number | null;
}

const GOAL_OPTIONS = [
  { label: "Body Composition", emoji: "💪" },
  { label: "Recovery", emoji: "🔄" },
  { label: "Longevity", emoji: "⏳" },
  { label: "Immune Support", emoji: "🛡️" },
  { label: "Gut Health", emoji: "🌱" },
  { label: "Cognitive/Neuro", emoji: "🧠" },
];

export default function ClientProfileClient({
  client,
  activeProtocol: initialActiveProtocol,
  protocolHistory,
  checkins: initialCheckins,
  labResults,
  currentUserName,
  isMinor,
  age,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  // Local state
  const [checkins, setCheckins] = useState<any[]>(initialCheckins);
  const [activeProtocol, setActiveProtocol] = useState<any | null>(initialActiveProtocol);
  const [paymentStatus, setPaymentStatus] = useState<string>(client.payment_status || "unpaid");
  const [healthConditions, setHealthConditions] = useState<string[]>(client.health_conditions || []);
  const [goals, setGoals] = useState<string[]>(client.goals || []);

  // Goals editing
  const [editingGoals, setEditingGoals] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(client.goals || []);
  const [savingGoals, setSavingGoals] = useState(false);

  // Health condition search
  const [showConditionSearch, setShowConditionSearch] = useState(false);
  const [conditionSearchTerm, setConditionSearchTerm] = useState("");
  const [conditionResults, setConditionResults] = useState<any[]>([]);
  const conditionSearchRef = useRef<HTMLInputElement>(null);

  // Consultation note form
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Check-in form
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [checkinDate, setCheckinDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkinWeight, setCheckinWeight] = useState("");
  const [checkinNotes, setCheckinNotes] = useState("");
  const [checkinCompliance, setCheckinCompliance] = useState(0);
  const [savingCheckin, setSavingCheckin] = useState(false);

  // Protocol actions
  const [updatingProtocol, setUpdatingProtocol] = useState(false);

  const statusColor =
    client.status === "active"
      ? { bg: "rgba(84,199,162,0.15)", color: "#54c7a2", border: "rgba(84,199,162,0.3)" }
      : client.status === "onboarding"
      ? { bg: "rgba(232,201,110,0.15)", color: "#e8c96e", border: "rgba(232,201,110,0.3)" }
      : client.status === "archived"
      ? { bg: "rgba(224,90,106,0.12)", color: "#e05a6a", border: "rgba(224,90,106,0.3)" }
      : { bg: "rgba(110,136,176,0.15)", color: "#6e88b0", border: "rgba(110,136,176,0.3)" };

  // Safety alert check
  const flaggedConditions = healthConditions.filter((c) => /thyroid|cardiac|cancer/i.test(c));

  // Search conditions
  useEffect(() => {
    if (!conditionSearchTerm || conditionSearchTerm.length < 2) {
      setConditionResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("protocols")
        .select("id, condition_name")
        .ilike("condition_name", `%${conditionSearchTerm}%`)
        .limit(8);
      setConditionResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [conditionSearchTerm]);

  async function handleSaveGoals() {
    setSavingGoals(true);
    try {
      await supabase.from("clients").update({ goals: selectedGoals }).eq("id", client.id);
      setGoals(selectedGoals);
      setEditingGoals(false);
      router.refresh();
    } finally {
      setSavingGoals(false);
    }
  }

  async function handleResolveCondition(index: number) {
    const updated = [...healthConditions];
    updated[index] = updated[index] + " (resolved)";
    setHealthConditions(updated);
    await supabase.from("clients").update({ health_conditions: updated }).eq("id", client.id);
  }

  async function handleAddCondition(conditionName: string) {
    const updated = [...healthConditions, conditionName];
    setHealthConditions(updated);
    await supabase.from("clients").update({ health_conditions: updated }).eq("id", client.id);
    setShowConditionSearch(false);
    setConditionSearchTerm("");
    setConditionResults([]);
  }

  async function handleMarkPaid() {
    await supabase.from("clients").update({ payment_status: "paid" }).eq("id", client.id);
    setPaymentStatus("paid");
  }

  async function handlePauseProtocol() {
    if (!activeProtocol) return;
    setUpdatingProtocol(true);
    await supabase.from("client_protocols").update({ status: "paused" }).eq("id", activeProtocol.id);
    setUpdatingProtocol(false);
    router.refresh();
  }

  async function handleCompleteProtocol() {
    if (!activeProtocol) return;
    setUpdatingProtocol(true);
    await supabase.from("client_protocols").update({ status: "completed" }).eq("id", activeProtocol.id);
    setUpdatingProtocol(false);
    router.refresh();
  }

  async function handleSaveNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("client_checkins")
        .insert({ client_id: client.id, checkin_date: today, subjective_response: noteText.trim() })
        .select()
        .single();
      if (data) {
        setCheckins([data, ...checkins]);
      }
      setNoteText("");
      setShowNoteForm(false);
      toast.success("Note saved");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleSaveCheckin() {
    setSavingCheckin(true);
    try {
      const { data } = await supabase
        .from("client_checkins")
        .insert({
          client_id: client.id,
          checkin_date: checkinDate,
          weight_lbs: checkinWeight ? parseFloat(checkinWeight) : null,
          subjective_response: checkinNotes || null,
          compliance_rating: checkinCompliance || null,
        })
        .select()
        .single();
      if (data) {
        setCheckins([data, ...checkins]);
      }
      setShowCheckinForm(false);
      setCheckinDate(new Date().toISOString().split("T")[0]);
      setCheckinWeight("");
      setCheckinNotes("");
      setCheckinCompliance(0);
      toast.success("Check-in logged");
    } finally {
      setSavingCheckin(false);
    }
  }

  const cardStyle = (topBorderColor?: string): React.CSSProperties => ({
    backgroundColor: "#0f1a2e",
    border: "1px solid #1e3055",
    borderTop: topBorderColor ? `2px solid ${topBorderColor}` : "1px solid #1e3055",
    borderRadius: "12px",
    overflow: "hidden",
  });

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #1e3055",
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', Georgia, serif",
    color: "#ccd9ee",
    fontSize: "15px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#6e88b0",
    fontFamily: "'DM Mono', monospace",
    marginBottom: "2px",
  };

  const smallBtnStyle = (color: string): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "6px",
    border: `1px solid ${color}30`,
    color,
    backgroundColor: `${color}12`,
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    backgroundColor: "#142035",
    border: "1px solid #1e3055",
    color: "#ccd9ee",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  // Separate consultation notes from weight check-ins
  const consultationNotes = checkins.filter((c) => c.subjective_response && !c.weight_lbs && !c.compliance_rating);
  const weightCheckins = checkins.filter((c) => c.weight_lbs || c.compliance_rating);

  const statusBadgeColor = (status: string) => {
    if (status === "completed") return { bg: "rgba(84,199,162,0.15)", color: "#54c7a2", border: "rgba(84,199,162,0.3)" };
    if (status === "paused") return { bg: "rgba(232,184,109,0.15)", color: "#e8b86d", border: "rgba(232,184,109,0.3)" };
    return { bg: "rgba(224,90,106,0.12)", color: "#e05a6a", border: "rgba(224,90,106,0.3)" };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: "#1e3055",
              color: "#e8c96e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {client.first_name?.[0]}{client.last_name?.[0]}
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#ccd9ee",
                fontSize: "28px",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {client.first_name} {client.last_name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  backgroundColor: statusColor.bg,
                  color: statusColor.color,
                  border: `1px solid ${statusColor.border}`,
                }}
              >
                {client.status}
              </span>
              {isMinor && age !== null && (
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(224,90,106,0.12)",
                    color: "#e05a6a",
                    border: "1px solid rgba(224,90,106,0.3)",
                  }}
                >
                  Minor — age {age}
                </span>
              )}
              {client.location?.name && (
                <span style={{ fontSize: "13px", color: "#6e88b0" }}>{client.location.name}</span>
              )}
            </div>
          </div>
        </div>
        <ClientActions
          clientId={client.id}
          clientStatus={client.status}
          clientName={`${client.first_name} ${client.last_name}`}
          client={client}
        />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Client Info Card */}
          <div style={cardStyle("#e8c96e")}>
            <div style={{ padding: "16px 20px 4px" }}>
              <h3 style={{ ...titleStyle, paddingBottom: "12px" }}>Client Information</h3>
            </div>
            <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                ["Email", client.email || "—"],
                ["Phone", client.phone || "—"],
                ["DOB", client.date_of_birth ? format(new Date(client.date_of_birth + "T00:00:00"), "MMM d, yyyy") : "—"],
                ["Sex", client.sex || "—"],
                ["Weight", client.weight_lbs ? `${client.weight_lbs} lbs` : "—"],
                ["Allergies", client.allergies || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span style={labelStyle}>{label}</span>
                  <span style={{ fontSize: "14px", color: "#ccd9ee" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Card */}
          <div style={cardStyle()}>
            <div style={sectionHeaderStyle}>
              <h3 style={titleStyle}>Goals</h3>
              {!editingGoals ? (
                <button
                  onClick={() => { setSelectedGoals([...goals]); setEditingGoals(true); }}
                  style={smallBtnStyle("#e8c96e")}
                >
                  <Edit2 size={11} /> Edit
                </button>
              ) : null}
            </div>
            <div style={{ padding: "16px 20px" }}>
              {!editingGoals ? (
                goals.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {goals.map((goal) => (
                      <span
                        key={goal}
                        style={{
                          fontSize: "12px",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(232,201,110,0.1)",
                          color: "#e8c96e",
                          border: "1px solid rgba(232,201,110,0.2)",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#6e88b0" }}>No goals recorded.</p>
                )
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                    {GOAL_OPTIONS.map((g) => {
                      const isSelected = selectedGoals.includes(g.label);
                      return (
                        <button
                          key={g.label}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedGoals(selectedGoals.filter((s) => s !== g.label));
                            } else {
                              setSelectedGoals([...selectedGoals, g.label]);
                            }
                          }}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: isSelected ? "1px solid rgba(232,201,110,0.5)" : "1px solid #1e3055",
                            backgroundColor: isSelected ? "rgba(232,201,110,0.12)" : "#142035",
                            color: isSelected ? "#e8c96e" : "#6e88b0",
                            fontSize: "12px",
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: "'DM Mono', monospace",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>{g.emoji}</span>
                          <span>{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setEditingGoals(false)}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "#142035", color: "#6e88b0", border: "1px solid #1e3055", cursor: "pointer", fontSize: "13px" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveGoals}
                      disabled={savingGoals}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "#e8c96e", color: "#0b1120", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, opacity: savingGoals ? 0.8 : 1 }}
                    >
                      {savingGoals ? "Saving..." : "Save Goals"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Health Conditions Card */}
          <div style={cardStyle()}>
            <div style={sectionHeaderStyle}>
              <h3 style={titleStyle}>Health Conditions</h3>
              <button
                onClick={() => { setShowConditionSearch(true); setTimeout(() => conditionSearchRef.current?.focus(), 50); }}
                style={smallBtnStyle("#54c7a2")}
              >
                <Plus size={11} /> Add
              </button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {showConditionSearch && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ position: "relative", marginBottom: "6px" }}>
                    <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e88b0" }} />
                    <input
                      ref={conditionSearchRef}
                      type="text"
                      value={conditionSearchTerm}
                      onChange={(e) => setConditionSearchTerm(e.target.value)}
                      placeholder="Search conditions..."
                      style={{ ...inputStyle, paddingLeft: "32px" }}
                    />
                  </div>
                  {conditionResults.length > 0 && (
                    <div style={{ border: "1px solid #1e3055", borderRadius: "8px", overflow: "hidden" }}>
                      {conditionResults.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleAddCondition(r.condition_name)}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 12px",
                            fontSize: "13px",
                            color: "#ccd9ee",
                            backgroundColor: "transparent",
                            border: "none",
                            borderBottom: "1px solid #1e3055",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#142035")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          {r.condition_name}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setShowConditionSearch(false); setConditionSearchTerm(""); setConditionResults([]); }}
                    style={{ ...smallBtnStyle("#6e88b0"), marginTop: "6px" }}
                  >
                    <X size={11} /> Cancel
                  </button>
                </div>
              )}
              {healthConditions.length === 0 && !showConditionSearch ? (
                <p style={{ fontSize: "13px", color: "#6e88b0" }}>No conditions recorded.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {healthConditions.map((c, i) => {
                    const isResolved = c.endsWith(" (resolved)");
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          backgroundColor: "#142035",
                          border: "1px solid #1e3055",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: isResolved ? "#6e88b0" : "#ccd9ee",
                            textDecoration: isResolved ? "line-through" : "none",
                          }}
                        >
                          {c}
                        </span>
                        {!isResolved && (
                          <button
                            onClick={() => handleResolveCondition(i)}
                            style={{ ...smallBtnStyle("#54c7a2"), fontSize: "10px", padding: "2px 8px" }}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          {client.notes && (
            <div style={cardStyle()}>
              <div style={{ padding: "16px 20px 4px" }}>
                <h3 style={{ ...titleStyle, paddingBottom: "12px" }}>Notes</h3>
              </div>
              <div style={{ padding: "0 20px 20px" }}>
                <p style={{ fontSize: "13px", color: "#6e88b0", lineHeight: "1.6" }}>{client.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Safety Alert */}
          {flaggedConditions.length > 0 && (
            <div
              style={{
                border: "1px solid #e8b86d",
                borderRadius: "10px",
                backgroundColor: "rgba(232,184,109,0.08)",
                padding: "14px 16px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#e8b86d", flexShrink: 0, marginTop: "1px" }} />
              <div>
                <p style={{ fontSize: "12px", color: "#e8b86d", fontWeight: 600, marginBottom: "4px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Safety note — persists on every visit
                </p>
                <p style={{ fontSize: "13px", color: "#ccd9ee", margin: 0 }}>
                  {flaggedConditions.join(", ")}. Review contraindicated peptides before prescribing.
                </p>
              </div>
            </div>
          )}

          {/* Payment Row */}
          <div
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderRadius: "10px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "11px", color: "#6e88b0", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Payment Status
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {paymentStatus === "paid" ? (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(84,199,162,0.15)",
                    color: "#54c7a2",
                    border: "1px solid rgba(84,199,162,0.3)",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  Paid
                </span>
              ) : (
                <>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(224,90,106,0.12)",
                      color: "#e05a6a",
                      border: "1px solid rgba(224,90,106,0.3)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Unpaid
                  </span>
                  <button
                    onClick={handleMarkPaid}
                    style={{
                      fontSize: "12px",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(84,199,162,0.15)",
                      color: "#54c7a2",
                      border: "1px solid rgba(84,199,162,0.3)",
                      cursor: "pointer",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Mark as Paid
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Active Protocol Card */}
          <div style={cardStyle("#54c7a2")}>
            <div style={sectionHeaderStyle}>
              <h3 style={titleStyle}>
                <Syringe size={15} style={{ color: "#54c7a2" }} />
                Active Protocol
              </h3>
            </div>
            <div style={{ padding: "20px" }}>
              {activeProtocol && activeProtocol.protocol ? (
                <div>
                  <h4
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: "#e8c96e",
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    {activeProtocol.protocol.condition_name}
                  </h4>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(84,199,162,0.15)",
                        color: "#54c7a2",
                        border: "1px solid rgba(84,199,162,0.3)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      Month {activeProtocol.current_month} of {activeProtocol.total_months}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(110,136,176,0.12)",
                        color: "#6e88b0",
                        border: "1px solid rgba(110,136,176,0.25)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      Started {format(new Date(activeProtocol.start_date), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <span style={labelStyle}>Primary Peptide</span>
                    <p style={{ fontSize: "14px", color: "#ccd9ee", margin: 0 }}>{activeProtocol.protocol.primary_peptide}</p>
                  </div>

                  {activeProtocol.protocol.adjunct_peptides && activeProtocol.protocol.adjunct_peptides.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ ...labelStyle, marginTop: "10px" }}>Adjunct Peptides</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {activeProtocol.protocol.adjunct_peptides.map((p: string) => (
                          <span
                            key={p}
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              backgroundColor: "rgba(110,136,176,0.12)",
                              color: "#6e88b0",
                              border: "1px solid rgba(110,136,176,0.2)",
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeProtocol.show_clinical_notes && activeProtocol.protocol.clinical_notes && (
                    <div
                      style={{
                        marginTop: "16px",
                        borderRadius: "8px",
                        padding: "14px",
                        backgroundColor: "rgba(232,201,110,0.04)",
                        border: "1px solid rgba(232,201,110,0.25)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <BookLock size={12} style={{ color: "#e8c96e" }} />
                        <span style={{ fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}>
                          Clinical Notes
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#ccd9ee", lineHeight: "1.6", margin: 0 }}>
                        {activeProtocol.protocol.clinical_notes}
                      </p>
                    </div>
                  )}

                  {/* Protocol action buttons */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
                    <AssignProtocolSheet
                      clientId={client.id}
                      clientWeightLbs={client.weight_lbs}
                      label="Change Protocol"
                      onBeforeAssign={async () => {
                        await supabase
                          .from("client_protocols")
                          .update({ status: "completed" })
                          .eq("id", activeProtocol.id);
                      }}
                    />
                    <AssignProtocolSheet
                      clientId={client.id}
                      clientWeightLbs={client.weight_lbs}
                      label="+ Add Protocol"
                    />
                    <button
                      onClick={handlePauseProtocol}
                      disabled={updatingProtocol}
                      style={{
                        ...smallBtnStyle("#e8b86d"),
                        padding: "6px 14px",
                        fontSize: "12px",
                      }}
                    >
                      Pause
                    </button>
                    <button
                      onClick={handleCompleteProtocol}
                      disabled={updatingProtocol}
                      style={{
                        ...smallBtnStyle("#54c7a2"),
                        padding: "6px 14px",
                        fontSize: "12px",
                      }}
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <Syringe size={32} style={{ color: "#1e3055", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "13px", color: "#6e88b0", marginBottom: "16px" }}>No active protocol assigned</p>
                  <AssignProtocolSheet clientId={client.id} clientWeightLbs={client.weight_lbs} />
                </div>
              )}
            </div>
          </div>

          {/* Protocol History Card */}
          <div style={cardStyle("#6e88b0")}>
            <div style={sectionHeaderStyle}>
              <h3 style={titleStyle}>
                <Clock size={15} style={{ color: "#6e88b0" }} />
                Protocol History
              </h3>
            </div>
            <div style={{ padding: "20px" }}>
              {protocolHistory.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#6e88b0", lineHeight: "1.6" }}>
                  No protocol history yet — history is written automatically when a protocol is marked complete or changed.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {protocolHistory.map((item: any) => {
                    const sc = statusBadgeColor(item.status);
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "8px",
                          backgroundColor: "#142035",
                          border: "1px solid #1e3055",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "14px", color: "#ccd9ee", margin: "0 0 2px", fontWeight: 500 }}>
                            {item.protocol?.condition_name || "—"}
                          </p>
                          <p style={{ fontSize: "12px", color: "#e8c96e", margin: "0 0 4px", fontFamily: "'DM Mono', monospace" }}>
                            {item.protocol?.primary_peptide || "—"}
                          </p>
                          <p style={{ fontSize: "11px", color: "#6e88b0", margin: 0, fontFamily: "'DM Mono', monospace" }}>
                            {item.start_date ? format(new Date(item.start_date), "MMM d, yyyy") : "—"}
                            {" → "}
                            {item.end_date ? format(new Date(item.end_date), "MMM d, yyyy") : "ongoing"}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "3px 8px",
                            borderRadius: "999px",
                            backgroundColor: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                            fontFamily: "'DM Mono', monospace",
                            flexShrink: 0,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Consultation Notes Card */}
          <div style={cardStyle("#e8c96e")}>
            <div style={sectionHeaderStyle}>
              <h3 style={titleStyle}>
                <FileText size={15} style={{ color: "#e8c96e" }} />
                Consultation Notes
              </h3>
              <button
                onClick={() => setShowNoteForm(true)}
                style={smallBtnStyle("#e8c96e")}
              >
                <Plus size={11} /> Add Note
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              {showNoteForm && (
                <div style={{ marginBottom: "16px", padding: "14px", backgroundColor: "#142035", borderRadius: "8px", border: "1px solid #1e3055" }}>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter consultation note..."
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      marginBottom: "10px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => { setShowNoteForm(false); setNoteText(""); }}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "#0f1a2e", color: "#6e88b0", border: "1px solid #1e3055", cursor: "pointer", fontSize: "13px" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote || !noteText.trim()}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "#e8c96e", color: "#0b1120", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, opacity: savingNote ? 0.8 : 1 }}
                    >
                      {savingNote ? "Saving..." : "Save Note"}
                    </button>
                  </div>
                </div>
              )}
              {checkins.filter((c) => c.subjective_response).length === 0 && !showNoteForm ? (
                <p style={{ fontSize: "13px", color: "#6e88b0" }}>No consultation notes yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {checkins.filter((c) => c.subjective_response).map((note: any) => (
                    <div
                      key={note.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#142035",
                        border: "1px solid #1e3055",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}>
                          {format(new Date(note.checkin_date), "MMM d, yyyy")}
                        </span>
                        <span style={{ fontSize: "11px", color: "#6e88b0" }}>by {currentUserName}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#ccd9ee", lineHeight: "1.5", margin: 0 }}>
                        {note.subjective_response}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Check-in History Card */}
          <div style={cardStyle("#6e88b0")}>
            <div style={sectionHeaderStyle}>
              <h3 style={titleStyle}>
                <MessageSquare size={15} style={{ color: "#6e88b0" }} />
                Check-in History
              </h3>
              <button
                onClick={() => setShowCheckinForm(true)}
                style={smallBtnStyle("#6e88b0")}
              >
                <Plus size={11} /> Log Check-in
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              {showCheckinForm && (
                <div style={{ marginBottom: "16px", padding: "14px", backgroundColor: "#142035", borderRadius: "8px", border: "1px solid #1e3055" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={labelStyle}>Date</label>
                    <input
                      type="date"
                      value={checkinDate}
                      onChange={(e) => setCheckinDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={labelStyle}>Weight (lbs)</label>
                    <input
                      type="number"
                      value={checkinWeight}
                      onChange={(e) => setCheckinWeight(e.target.value)}
                      placeholder="e.g. 180"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea
                      value={checkinNotes}
                      onChange={(e) => setCheckinNotes(e.target.value)}
                      placeholder="Client's subjective response..."
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={labelStyle}>Compliance Rating</label>
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setCheckinCompliance(n)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: n <= checkinCompliance ? "#e8c96e" : "#1e3055",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Star size={14} style={{ color: n <= checkinCompliance ? "#0b1120" : "#6e88b0" }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setShowCheckinForm(false)}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "#0f1a2e", color: "#6e88b0", border: "1px solid #1e3055", cursor: "pointer", fontSize: "13px" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCheckin}
                      disabled={savingCheckin}
                      style={{ flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "#6e88b0", color: "#0b1120", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, opacity: savingCheckin ? 0.8 : 1 }}
                    >
                      {savingCheckin ? "Saving..." : "Log Check-in"}
                    </button>
                  </div>
                </div>
              )}
              {checkins.length === 0 && !showCheckinForm ? (
                <p style={{ fontSize: "13px", color: "#6e88b0" }}>No check-ins recorded yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {checkins.map((ci: any) => (
                    <div
                      key={ci.id}
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        backgroundColor: "#142035",
                        border: "1px solid #1e3055",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}>
                          {format(new Date(ci.checkin_date), "MMM d, yyyy")}
                        </span>
                        {ci.compliance_rating && (
                          <div style={{ display: "flex", gap: "3px" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  backgroundColor: i < ci.compliance_rating ? "#e8c96e" : "#1e3055",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {ci.weight_lbs && (
                        <p style={{ fontSize: "12px", color: "#6e88b0", margin: "0 0 4px", fontFamily: "'DM Mono', monospace" }}>
                          Weight: {ci.weight_lbs} lbs
                        </p>
                      )}
                      {ci.subjective_response && (
                        <p style={{ fontSize: "13px", color: "#ccd9ee", lineHeight: "1.5", margin: 0 }}>
                          {ci.subjective_response}
                        </p>
                      )}
                      {ci.side_effects && (
                        <p style={{ fontSize: "12px", color: "#e8b86d", marginTop: "6px", margin: 0 }}>
                          Side effects: {ci.side_effects}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lab Results */}
          {labResults && labResults.length > 0 && (
            <div style={cardStyle("#e8c96e")}>
              <div style={sectionHeaderStyle}>
                <h3 style={titleStyle}>
                  <FlaskConical size={15} style={{ color: "#e8c96e" }} />
                  Lab Results
                </h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e3055" }}>
                      {["Test", "Result", "Range", "Date", "Flag"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            textAlign: "left",
                            fontSize: "10px",
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.1em",
                            color: "#6e88b0",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map((lab: any) => (
                      <tr key={lab.id} style={{ borderBottom: "1px solid rgba(30,48,85,0.5)" }}>
                        <td style={{ padding: "10px 16px", fontSize: "13px", color: "#ccd9ee" }}>{lab.test_name}</td>
                        <td style={{ padding: "10px 16px", fontSize: "13px", color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}>
                          {lab.result_value} {lab.unit}
                        </td>
                        <td style={{ padding: "10px 16px", fontSize: "13px", color: "#6e88b0" }}>{lab.reference_range || "—"}</td>
                        <td style={{ padding: "10px 16px", fontSize: "11px", color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                          {lab.test_date ? format(new Date(lab.test_date + "T00:00:00"), "MMM d, yyyy") : "—"}
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          {lab.is_flagged && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                backgroundColor: "rgba(232,184,109,0.15)",
                                color: "#e8b86d",
                                border: "1px solid rgba(232,184,109,0.3)",
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              Flagged
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
