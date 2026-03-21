import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, FileText, Syringe, FlaskConical, MessageSquare, Package, BookLock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import AssignProtocolSheet from "@/components/protocols/AssignProtocolSheet";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*, location:locations(*), assigned_staff:user_profiles!assigned_to(*)")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: activeProtocol } = await supabase
    .from("client_protocols")
    .select("*, protocol:protocols(*, months:protocol_months(*, rows:protocol_month_rows(*)))")
    .eq("client_id", id)
    .eq("status", "active")
    .single();

  const { data: checkins } = await supabase
    .from("client_checkins")
    .select("*")
    .eq("client_id", id)
    .order("checkin_date", { ascending: false })
    .limit(10);

  const { data: vials } = await supabase
    .from("vial_inventory")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const { data: labResults } = await supabase
    .from("lab_results")
    .select("*")
    .eq("client_id", id)
    .order("test_date", { ascending: false })
    .limit(10);

  const statusColor =
    client.status === "active"
      ? { bg: "rgba(84,199,162,0.15)", color: "#54c7a2", border: "rgba(84,199,162,0.3)" }
      : client.status === "onboarding"
      ? { bg: "rgba(232,201,110,0.15)", color: "#e8c96e", border: "rgba(232,201,110,0.3)" }
      : { bg: "rgba(110,136,176,0.15)", color: "#6e88b0", border: "rgba(110,136,176,0.3)" };

  return (
    <div>
      {/* Back */}
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-[#e8c96e]"
        style={{ color: "#6e88b0" }}
      >
        <ArrowLeft size={16} />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: "#1e3055", color: "#e8c96e" }}
          >
            {client.first_name[0]}{client.last_name[0]}
          </div>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
            >
              {client.first_name} {client.last_name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  backgroundColor: statusColor.bg,
                  color: statusColor.color,
                  border: `1px solid ${statusColor.border}`,
                }}
              >
                {client.status}
              </span>
              <span className="text-sm" style={{ color: "#6e88b0" }}>
                {(client as any).location?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Client details */}
        <div className="space-y-5">
          {/* Info card */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderTop: "2px solid #e8c96e",
            }}
          >
            <h3
              className="font-semibold text-sm mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
            >
              Client Information
            </h3>
            <div className="space-y-3">
              {[
                ["Email", client.email || "—"],
                ["Phone", client.phone || "—"],
                ["DOB", client.date_of_birth ? format(new Date(client.date_of_birth + 'T00:00:00'), "MMM d, yyyy") : "—"],
                ["Sex", client.sex || "—"],
                ["Weight", client.weight_lbs ? `${client.weight_lbs} lbs (${client.weight_kg} kg)` : "—"],
                ["Allergies", client.allergies || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span
                    className="block text-xs uppercase tracking-widest mb-0.5"
                    style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                  >
                    {label}
                  </span>
                  <span className="text-sm" style={{ color: "#ccd9ee" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          {client.goals && client.goals.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#0f1a2e",
                border: "1px solid #1e3055",
              }}
            >
              <h3
                className="font-semibold text-sm mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {client.goals.map((goal: string) => (
                  <span
                    key={goal}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
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
            </div>
          )}

          {/* Health conditions */}
          {client.health_conditions && client.health_conditions.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055" }}
            >
              <h3
                className="font-semibold text-sm mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                Health Conditions
              </h3>
              <div className="space-y-1">
                {client.health_conditions.map((c: string) => (
                  <p key={c} className="text-sm" style={{ color: "#6e88b0" }}>• {c}</p>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055" }}
            >
              <h3
                className="font-semibold text-sm mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                Notes
              </h3>
              <p className="text-sm" style={{ color: "#6e88b0", lineHeight: "1.6" }}>{client.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Protocol + Checkins + Vials */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Protocol */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderTop: "2px solid #54c7a2",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#1e3055" }}
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <Syringe size={16} style={{ color: "#54c7a2" }} />
                Active Protocol
              </h3>
              {!activeProtocol && (
                <AssignProtocolSheet
                  clientId={id}
                  clientWeightLbs={client.weight_lbs}
                />
              )}
            </div>
            <div className="p-5">
              {activeProtocol && activeProtocol.protocol ? (
                <div>
                  <h4
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#e8c96e" }}
                  >
                    {activeProtocol.protocol.condition_name}
                  </h4>
                  <div className="flex gap-3 mb-4">
                    <span className="badge-success">Month {activeProtocol.current_month} of {activeProtocol.total_months}</span>
                    <span className="badge-dim">Started {format(new Date(activeProtocol.start_date), "MMM d, yyyy")}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                      Primary Peptide
                    </p>
                    <p className="text-sm" style={{ color: "#ccd9ee" }}>{activeProtocol.protocol.primary_peptide}</p>
                    {activeProtocol.protocol.adjunct_peptides && (
                      <>
                        <p className="text-xs uppercase tracking-widest mt-3" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                          Adjunct Peptides
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activeProtocol.protocol.adjunct_peptides.map((p: string) => (
                            <span key={p} className="badge-dim">{p}</span>
                          ))}
                        </div>
                      </>
                    )}

                    {activeProtocol.show_clinical_notes && activeProtocol.protocol.clinical_notes && (
                      <div
                        className="mt-4 rounded-lg p-4"
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
                            PDF hidden
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "#ccd9ee" }}>
                          {activeProtocol.protocol.clinical_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Syringe size={32} className="mx-auto mb-3" style={{ color: "#1e3055" }} />
                  <p className="text-sm" style={{ color: "#6e88b0" }}>No active protocol assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Vial Inventory */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderTop: "2px solid #e8b86d",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#1e3055" }}
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <Package size={16} style={{ color: "#e8b86d" }} />
                Vial Inventory
              </h3>
            </div>
            <div className="p-5">
              {vials && vials.length > 0 ? (
                <div className="space-y-3">
                  {vials.map((vial) => (
                    <div
                      key={vial.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#ccd9ee" }}>{vial.peptide_name}</p>
                        <p className="text-xs" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                          Dispensed: {vial.vials_dispensed} | Remaining: {vial.vials_remaining}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          backgroundColor: vial.vials_remaining === 0 ? "rgba(224,90,106,0.15)" : vial.vials_remaining <= 1 ? "rgba(232,184,109,0.15)" : "rgba(84,199,162,0.15)",
                          color: vial.vials_remaining === 0 ? "#e05a6a" : vial.vials_remaining <= 1 ? "#e8b86d" : "#54c7a2",
                          border: `1px solid ${vial.vials_remaining === 0 ? "rgba(224,90,106,0.3)" : vial.vials_remaining <= 1 ? "rgba(232,184,109,0.3)" : "rgba(84,199,162,0.3)"}`,
                        }}
                      >
                        {vial.vials_remaining} vials left
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-6" style={{ color: "#6e88b0" }}>
                  No vial records yet
                </p>
              )}
            </div>
          </div>

          {/* Check-ins */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderTop: "2px solid #6e88b0",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#1e3055" }}
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <MessageSquare size={16} style={{ color: "#6e88b0" }} />
                Check-in History
              </h3>
            </div>
            <div className="p-5">
              {checkins && checkins.length > 0 ? (
                <div className="space-y-3">
                  {checkins.map((ci) => (
                    <div
                      key={ci.id}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs" style={{ fontFamily: "'DM Mono', monospace", color: "#e8c96e" }}>
                          {format(new Date(ci.checkin_date), "MMM d, yyyy")}
                        </span>
                        {ci.compliance_rating && (
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: i < ci.compliance_rating! ? "#e8c96e" : "#1e3055" }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {ci.subjective_response && (
                        <p className="text-sm" style={{ color: "#ccd9ee", lineHeight: "1.5" }}>
                          {ci.subjective_response}
                        </p>
                      )}
                      {ci.side_effects && (
                        <p className="text-xs mt-2" style={{ color: "#e8b86d" }}>
                          Side effects: {ci.side_effects}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-6" style={{ color: "#6e88b0" }}>
                  No check-ins recorded yet
                </p>
              )}
            </div>
          </div>

          {/* Lab Results */}
          {labResults && labResults.length > 0 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "#0f1a2e",
                border: "1px solid #1e3055",
                borderTop: "2px solid #e8c96e",
              }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: "#1e3055" }}
              >
                <h3
                  className="font-semibold flex items-center gap-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
                >
                  <FlaskConical size={16} style={{ color: "#e8c96e" }} />
                  Lab Results
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e3055" }}>
                      {["Test", "Result", "Range", "Date", "Flag"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map((lab) => (
                      <tr key={lab.id} style={{ borderBottom: "1px solid rgba(30,48,85,0.5)" }}>
                        <td className="px-5 py-3 text-sm" style={{ color: "#ccd9ee" }}>{lab.test_name}</td>
                        <td className="px-5 py-3 text-sm" style={{ fontFamily: "'DM Mono', monospace", color: "#ccd9ee" }}>
                          {lab.result_value} {lab.unit}
                        </td>
                        <td className="px-5 py-3 text-sm" style={{ color: "#6e88b0" }}>{lab.reference_range || "—"}</td>
                        <td className="px-5 py-3 text-xs" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                          {lab.test_date ? format(new Date(lab.test_date + 'T00:00:00'), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="px-5 py-3">
                          {lab.is_flagged && (
                            <span className="badge-warning">⚠ Flagged</span>
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
