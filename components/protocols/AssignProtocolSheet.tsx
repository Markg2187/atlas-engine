"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Syringe, X, Search, ChevronRight, Check, BookLock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Protocol } from "@/lib/types";
import { toast } from "sonner";

interface AssignProtocolSheetProps {
  clientId: string;
  clientWeightLbs: number | null;
  label?: string;
  onBeforeAssign?: () => Promise<void>;
}

const categoryColors: Record<string, string> = {
  Neurologic: "#6e88b0",
  "Immune/Infectious": "#54c7a2",
  Autoimmune: "#e8b86d",
  Musculoskeletal: "#e8c96e",
  Metabolic: "#c9a84c",
  Longevity: "#e05a6a",
  "Sleep/Stress": "#6e88b0",
  "GI/Autoimmune": "#54c7a2",
  GI: "#54c7a2",
  "Sleep/Cognitive": "#6e88b0",
  "Musculoskeletal/Autoimmune": "#e8c96e",
};

export default function AssignProtocolSheet({ clientId, clientWeightLbs, label, onBeforeAssign }: AssignProtocolSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!open || protocols.length > 0) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("protocols")
      .select("*, months:protocol_months(id, month_number)")
      .eq("is_active", true)
      .order("category")
      .order("condition_name")
      .then(({ data }) => {
        setProtocols((data as Protocol[]) || []);
        setLoading(false);
      });
  }, [open, protocols.length]);

  const filtered = protocols.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.condition_name.toLowerCase().includes(q) ||
      p.primary_peptide.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const byCategory = filtered.reduce((acc: Record<string, Protocol[]>, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  function handleClose() {
    setOpen(false);
    setSelected(null);
    setSearch("");
  }

  async function handleAssign() {
    if (!selected) return;
    setAssigning(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (onBeforeAssign) {
        await onBeforeAssign();
      }

      const { error } = await supabase.from("client_protocols").insert({
        client_id: clientId,
        protocol_id: selected.id,
        start_date: startDate,
        total_months: selected.months?.length || 3,
        current_month: 1,
        status: "active",
        assigned_by: user?.id || null,
        weight_at_assignment_lbs: clientWeightLbs,
      });

      if (error) throw error;

      toast.success(`${selected.condition_name} protocol assigned`);
      handleClose();
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to assign protocol");
    } finally {
      setAssigning(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg transition-all"
        style={{
          color: "#e8c96e",
          border: "1px solid rgba(232,201,110,0.3)",
          fontFamily: "'DM Mono', monospace",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(232,201,110,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {label ?? "Assign Protocol →"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          style={{ backgroundColor: "rgba(11,17,32,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          {/* Sheet — slides in from right */}
          <div
            className="ml-auto h-full w-full max-w-md flex flex-col"
            style={{ backgroundColor: "#0f1a2e", borderLeft: "1px solid #1e3055" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0"
              style={{ borderColor: "#1e3055", borderTop: "2px solid #54c7a2" }}
            >
              <div>
                <h2
                  className="text-lg font-semibold flex items-center gap-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
                >
                  <Syringe size={16} style={{ color: "#54c7a2" }} />
                  {selected ? "Confirm Assignment" : "Assign Protocol"}
                </h2>
                {!selected && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
                  >
                    {loading ? "Loading..." : `${protocols.length} protocols available`}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "#6e88b0" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ccd9ee")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6e88b0")}
              >
                <X size={18} />
              </button>
            </div>

            {!selected ? (
              <>
                {/* Search */}
                <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e3055" }}>
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#6e88b0" }}
                    />
                    <input
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by condition, peptide, or category..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
                      style={{
                        backgroundColor: "#142035",
                        border: "1px solid #1e3055",
                        color: "#ccd9ee",
                      }}
                    />
                  </div>
                </div>

                {/* Protocol list */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <p className="text-sm" style={{ color: "#6e88b0" }}>
                        Loading protocols...
                      </p>
                    </div>
                  ) : Object.entries(byCategory).length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <p className="text-sm" style={{ color: "#6e88b0" }}>
                        No protocols found
                      </p>
                    </div>
                  ) : (
                    Object.entries(byCategory).map(([category, protos]) => (
                      <div key={category}>
                        {/* Category header */}
                        <div
                          className="px-6 py-2.5 sticky top-0"
                          style={{
                            backgroundColor: "#0b1120",
                            borderBottom: "1px solid #1e3055",
                          }}
                        >
                          <p
                            className="text-xs uppercase tracking-widest"
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              color: categoryColors[category] || "#6e88b0",
                            }}
                          >
                            {category}
                          </p>
                        </div>

                        {protos.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelected(p)}
                            className="w-full text-left px-6 py-4 border-b transition-colors"
                            style={{
                              borderColor: "rgba(30,48,85,0.5)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#142035")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "transparent")
                            }
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium"
                                  style={{ color: "#ccd9ee" }}
                                >
                                  {p.condition_name}
                                </p>
                                <p
                                  className="text-xs mt-0.5"
                                  style={{
                                    color: "#e8c96e",
                                    fontFamily: "'DM Mono', monospace",
                                  }}
                                >
                                  {p.primary_peptide}
                                </p>
                                {p.adjunct_peptides && p.adjunct_peptides.length > 0 && (
                                  <p className="text-xs mt-0.5" style={{ color: "#6e88b0" }}>
                                    +{p.adjunct_peptides.slice(0, 2).join(", ")}
                                    {p.adjunct_peptides.length > 2 &&
                                      ` +${p.adjunct_peptides.length - 2} more`}
                                  </p>
                                )}
                              </div>
                              <ChevronRight
                                size={14}
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: "#6e88b0" }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Confirmation panel */
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                {/* Selected protocol card */}
                <div
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: "#142035",
                    border: "1px solid #1e3055",
                    borderTop: "2px solid #54c7a2",
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                  >
                    Selected Protocol
                  </p>
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: "#ccd9ee",
                    }}
                  >
                    {selected.condition_name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}
                  >
                    {selected.primary_peptide}
                  </p>
                  {selected.adjunct_peptides && selected.adjunct_peptides.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selected.adjunct_peptides.map((p) => (
                        <span
                          key={p}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "rgba(110,136,176,0.15)",
                            color: "#6e88b0",
                            border: "1px solid rgba(110,136,176,0.2)",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {selected.cycle_intro && (
                    <p
                      className="text-xs mt-3 leading-relaxed"
                      style={{ color: "#6e88b0" }}
                    >
                      {selected.cycle_intro.slice(0, 200)}
                      {selected.cycle_intro.length > 200 ? "..." : ""}
                    </p>
                  )}
                  <p
                    className="text-xs mt-2"
                    style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
                  >
                    {selected.months?.length || 3}-month protocol · {selected.category}
                  </p>
                </div>

                {selected.clinical_notes && (
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: "rgba(232,201,110,0.04)",
                      border: "1px solid rgba(232,201,110,0.25)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookLock size={12} style={{ color: "#e8c96e" }} />
                      <span
                        className="text-xs uppercase tracking-widest"
                        style={{ fontFamily: "'DM Mono', monospace", color: "#e8c96e" }}
                      >
                        Clinical Notes
                      </span>
                      <span
                        className="ml-auto text-xs px-1.5 py-0.5 rounded"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "0.6rem",
                          backgroundColor: "rgba(232,201,110,0.12)",
                          color: "#e8c96e",
                          border: "1px solid rgba(232,201,110,0.2)",
                        }}
                      >
                        Rx only
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#ccd9ee" }}>
                      {selected.clinical_notes}
                    </p>
                  </div>
                )}

                {/* Start date */}
                <div>
                  <label
                    className="block text-xs uppercase tracking-widest mb-1.5"
                    style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{
                      backgroundColor: "#142035",
                      border: "1px solid #1e3055",
                      color: "#ccd9ee",
                    }}
                  />
                </div>

                {/* Weight note */}
                {clientWeightLbs && (
                  <div
                    className="rounded-lg px-4 py-3"
                    style={{
                      backgroundColor: "rgba(84,199,162,0.08)",
                      border: "1px solid rgba(84,199,162,0.2)",
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "#54c7a2", fontFamily: "'DM Mono', monospace" }}
                    >
                      Weight at assignment: {clientWeightLbs} lbs — recorded for
                      weight-adjusted dose calculations
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm"
                    style={{
                      backgroundColor: "#142035",
                      color: "#ccd9ee",
                      border: "1px solid #1e3055",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={assigning}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                    style={{
                      backgroundColor: "#54c7a2",
                      color: "#0b1120",
                      opacity: assigning ? 0.8 : 1,
                    }}
                  >
                    {assigning ? (
                      "Assigning..."
                    ) : (
                      <>
                        <Check size={15} /> Confirm & Assign
                      </>
                    )}
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
