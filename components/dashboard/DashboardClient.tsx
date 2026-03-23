"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { differenceInDays, format } from "date-fns";
import {
  Users,
  Activity,
  RefreshCw,
  DollarSign,
  Plus,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  profile: any;
  isSuperAdmin: boolean;
  locations: any[];
  allClients: any[];
  activeProtocols: any[];
}

const REUP_REVENUE = 420;

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getDaysLeft(startDate: string, totalMonths: number): number {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + totalMonths * 30 * 24 * 60 * 60 * 1000);
  return differenceInDays(end, new Date());
}

function getDayOfProtocol(startDate: string): number {
  return Math.max(1, differenceInDays(new Date(), new Date(startDate)) + 1);
}

function ClientCard({
  client,
  protocol,
}: {
  client: any;
  protocol?: any;
}) {
  const age = getAge(client.date_of_birth);
  const isPaid = client.payment_status === "paid";
  const dayOfProtocol = protocol ? getDayOfProtocol(protocol.start_date) : null;

  return (
    <Link href={`/clients/${client.id}`} style={{ display: "block", marginBottom: "8px" }}>
      <div
        style={{
          backgroundColor: "#f5f3ee",
          border: "1px solid #e8e0d0",
          borderRadius: "10px",
          padding: "10px 12px",
          cursor: "pointer",
          transition: "border-color 0.15s, background-color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#c9973a";
          (e.currentTarget as HTMLElement).style.backgroundColor = "#1a2e4a";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#e8e0d0";
          (e.currentTarget as HTMLElement).style.backgroundColor = "#f5f3ee";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <p
            style={{
              color: "#0f1a2e",
              fontWeight: 600,
              fontSize: "13px",
              lineHeight: 1.3,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {client.first_name} {client.last_name}
          </p>
          <span
            style={{
              fontSize: "9px",
              padding: "2px 6px",
              borderRadius: "999px",
              backgroundColor: isPaid
                ? "rgba(84,199,162,0.12)"
                : "rgba(224,90,106,0.10)",
              color: isPaid ? "#54c7a2" : "#e05a6a",
              border: `1px solid ${
                isPaid ? "rgba(84,199,162,0.25)" : "rgba(224,90,106,0.2)"
              }`,
              fontFamily: "'DM Mono', monospace",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {isPaid ? "Paid" : "Unpaid"}
          </span>
        </div>
        <p
          style={{
            color: "#5a6a7a",
            fontSize: "11px",
            fontFamily: "'DM Mono', monospace",
            margin: "0 0 3px 0",
          }}
        >
          {client.location?.name || "—"}
          {age !== null ? ` · ${age}y` : ""}
        </p>
        {protocol?.protocol && (
          <p
            style={{
              color: "#c9973a",
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {protocol.protocol.primary_peptide}
            {dayOfProtocol !== null ? ` · Day ${dayOfProtocol}` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}

type ReupFilter = "1-3" | "4-10" | "11-14" | "all";

export default function DashboardClient({
  profile,
  isSuperAdmin,
  locations,
  allClients,
  activeProtocols,
}: Props) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [reupFilter, setReupFilter] = useState<ReupFilter>("1-3");
  const [aiExpanded, setAiExpanded] = useState(false);

  // Filtered clients by location (super_admin can switch; others see all = their location only)
  const filteredClients = useMemo(() => {
    if (!selectedLocationId) return allClients;
    return allClients.filter((c) => c.location_id === selectedLocationId);
  }, [allClients, selectedLocationId]);

  // Filtered protocols by filtered client IDs
  const clientIdSet = useMemo(
    () => new Set(filteredClients.map((c) => c.id)),
    [filteredClients]
  );

  const filteredProtocols = useMemo(
    () => activeProtocols.filter((p) => clientIdSet.has(p.client_id)),
    [activeProtocols, clientIdSet]
  );

  // Stats
  const stats = useMemo(() => {
    const activeCount = filteredClients.filter((c) => c.status === "active").length;
    const protocolCount = filteredProtocols.length;
    const reupCount = filteredProtocols.filter((p) => {
      const d = getDaysLeft(p.start_date, p.total_months);
      return d >= 0 && d <= 14;
    }).length;
    const unpaidCount = filteredClients.filter(
      (c) =>
        c.status === "active" &&
        (!c.payment_status || c.payment_status === "unpaid")
    ).length;
    return { activeCount, protocolCount, reupCount, unpaidCount };
  }, [filteredClients, filteredProtocols]);

  // Protocol map: clientId → protocol row
  const protocolByClientId = useMemo(() => {
    const map = new Map<string, any>();
    filteredProtocols.forEach((p) => map.set(p.client_id, p));
    return map;
  }, [filteredProtocols]);

  // Pipeline columns
  const pipeline = useMemo(() => {
    const hasProtocol = new Set(filteredProtocols.map((p) => p.client_id));
    const onboarding = filteredClients.filter((c) => c.status === "onboarding");

    const reupDue = filteredProtocols
      .filter((p) => {
        const d = getDaysLeft(p.start_date, p.total_months);
        return d >= 0 && d <= 14;
      })
      .sort(
        (a, b) =>
          getDaysLeft(a.start_date, a.total_months) -
          getDaysLeft(b.start_date, b.total_months)
      );

    return {
      intake: onboarding,
      protocolReady: onboarding.filter((c) => !hasProtocol.has(c.id)),
      assigned: onboarding.filter((c) => hasProtocol.has(c.id)),
      active: filteredClients.filter(
        (c) => c.status === "active" && hasProtocol.has(c.id)
      ),
      reupDue,
    };
  }, [filteredClients, filteredProtocols]);

  // Reup tracker rows with filter
  const allReupRows = useMemo(
    () =>
      filteredProtocols
        .map((p) => ({ ...p, daysLeft: getDaysLeft(p.start_date, p.total_months) }))
        .filter((p) => p.daysLeft >= 0 && p.daysLeft <= 14)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [filteredProtocols]
  );

  const reupRows = useMemo(() => {
    return allReupRows.filter((p) => {
      if (reupFilter === "1-3") return p.daysLeft <= 3;
      if (reupFilter === "4-10") return p.daysLeft >= 4 && p.daysLeft <= 10;
      if (reupFilter === "11-14") return p.daysLeft >= 11;
      return true;
    });
  }, [allReupRows, reupFilter]);

  const totalReupRevenue = allReupRows.length * REUP_REVENUE;

  const today = format(new Date(), "EEEE, MMMM d");

  const PIPELINE_COLS = [
    { key: "intake" as const, label: "Intake", color: "#5a6a7a" },
    { key: "protocolReady" as const, label: "Protocol Ready", color: "#e8b86d" },
    { key: "assigned" as const, label: "Assigned", color: "#c9973a" },
    { key: "active" as const, label: "Active", color: "#54c7a2" },
    { key: "reupDue" as const, label: "Reup Due", color: "#e05a6a" },
  ];

  return (
    <div>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: "#0f1a2e",
              fontSize: "28px",
              fontWeight: 700,
              margin: "0 0 3px 0",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: "#5a6a7a",
              fontSize: "12px",
              fontFamily: "'DM Mono', monospace",
              margin: 0,
            }}
          >
            {today}
          </p>

          {/* Location filter pills — super_admin only */}
          {isSuperAdmin && locations.length > 0 && (
            <div
              style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}
            >
              {[{ id: null, name: "All Locations" }, ...locations].map((loc) => {
                const active = selectedLocationId === loc.id;
                return (
                  <button
                    key={loc.id ?? "all"}
                    onClick={() => setSelectedLocationId(loc.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontFamily: "'DM Mono', monospace",
                      cursor: "pointer",
                      border: `1px solid ${active ? "#c9973a" : "#e8e0d0"}`,
                      backgroundColor: active
                        ? "rgba(201,151,58,0.12)"
                        : "#f5f3ee",
                      color: active ? "#c9973a" : "#5a6a7a",
                      transition: "all 0.15s",
                    }}
                  >
                    {loc.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/clients?new=1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 18px",
            borderRadius: "8px",
            backgroundColor: "#c9973a",
            color: "#0b1120",
            fontWeight: 600,
            fontSize: "13px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = "#a87c2e")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = "#c9973a")
          }
        >
          <Plus size={15} />
          New Intake
        </Link>
      </div>

      {/* ── STATS ROW ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Active Clients",
            value: stats.activeCount,
            color: "#c9973a",
            icon: <Users size={17} />,
          },
          {
            label: "Active Protocols",
            value: stats.protocolCount,
            color: "#54c7a2",
            icon: <Activity size={17} />,
          },
          {
            label: "Reups Due",
            value: stats.reupCount,
            color: "#e8b86d",
            icon: <RefreshCw size={17} />,
          },
          {
            label: "Unpaid",
            value: stats.unpaidCount,
            color: "#e05a6a",
            icon: <DollarSign size={17} />,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e0d0",
              borderTop: `2px solid ${s.color}`,
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div style={{ color: s.color, marginBottom: "10px" }}>{s.icon}</div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                color: "#0f1a2e",
                fontSize: "30px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                color: "#5a6a7a",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: "6px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── CLIENT PIPELINE ────────────────────────────────────── */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#0f1a2e",
            fontSize: "17px",
            fontWeight: 600,
            margin: "0 0 12px 0",
          }}
        >
          Client Pipeline
        </h2>
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {PIPELINE_COLS.map((col) => {
            const items: any[] = pipeline[col.key];
            return (
              <div
                key={col.key}
                style={{
                  minWidth: "200px",
                  flex: "1 1 200px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e8e0d0",
                  borderTop: `2px solid ${col.color}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Column header */}
                <div
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid #e8e0d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: col.color,
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "11px",
                      color: "#5a6a7a",
                      backgroundColor: "#f5f3ee",
                      padding: "1px 7px",
                      borderRadius: "999px",
                    }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div
                  style={{
                    padding: "10px",
                    overflowY: "auto",
                    maxHeight: "380px",
                    flex: 1,
                  }}
                >
                  {items.length === 0 ? (
                    <p
                      style={{
                        color: "#3a5070",
                        fontSize: "11px",
                        textAlign: "center",
                        padding: "24px 0",
                        fontFamily: "'DM Mono', monospace",
                        margin: 0,
                      }}
                    >
                      Empty
                    </p>
                  ) : col.key === "reupDue" ? (
                    // Reup Due: items are protocol rows with nested .client
                    items.map((p: any) =>
                      p.client ? (
                        <ClientCard
                          key={p.id}
                          client={p.client}
                          protocol={p}
                        />
                      ) : null
                    )
                  ) : col.key === "assigned" || col.key === "active" ? (
                    items.map((c: any) => (
                      <ClientCard
                        key={c.id}
                        client={c}
                        protocol={protocolByClientId.get(c.id)}
                      />
                    ))
                  ) : (
                    items.map((c: any) => (
                      <ClientCard key={c.id} client={c} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* REUP TRACKER */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8e0d0",
            borderTop: "3px solid #54c7a2",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 16px",
              borderBottom: "1px solid #e8e0d0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={14} style={{ color: "#54c7a2" }} />
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#0f1a2e",
                  fontWeight: 600,
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                Reup Tracker
              </h3>
            </div>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                color: "#54c7a2",
                fontWeight: 600,
              }}
            >
              +${totalReupRevenue.toLocaleString()}
            </span>
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e8e0d0",
              backgroundColor: "#ffffff",
            }}
          >
            {(
              [
                { key: "1-3", label: "1–3 days", dot: "#e05a6a" },
                { key: "4-10", label: "4–10 days", dot: "#e8b86d" },
                { key: "11-14", label: "11–14 days", dot: "#5a6a7a" },
                { key: "all", label: "All", dot: "#8a7a5a" },
              ] as { key: ReupFilter; label: string; dot: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setReupFilter(tab.key)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  fontSize: "10px",
                  fontFamily: "'DM Mono', monospace",
                  cursor: "pointer",
                  border: "none",
                  borderBottom:
                    reupFilter === tab.key
                      ? `2px solid ${tab.dot}`
                      : "2px solid transparent",
                  backgroundColor: "transparent",
                  color: reupFilter === tab.key ? "#0f1a2e" : "#5a6a7a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  transition: "color 0.15s",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: tab.dot,
                    flexShrink: 0,
                  }}
                />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {reupRows.length === 0 ? (
              <p
                style={{
                  color: "#5a6a7a",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "28px 16px",
                  fontFamily: "'DM Mono', monospace",
                  margin: 0,
                }}
              >
                No reups due in this window
              </p>
            ) : (
              reupRows.map((row) => {
                const urgencyColor =
                  row.daysLeft <= 3
                    ? "#e05a6a"
                    : row.daysLeft <= 10
                    ? "#e8b86d"
                    : "#5a6a7a";
                const c = row.client;
                return (
                  <div
                    key={row.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderBottom: "1px solid rgba(232,224,208,0.5)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#0f1a2e",
                          fontSize: "13px",
                          fontWeight: 500,
                          margin: "0 0 2px 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c?.first_name} {c?.last_name}
                      </p>
                      <p
                        style={{
                          color: "#5a6a7a",
                          fontSize: "11px",
                          fontFamily: "'DM Mono', monospace",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c?.location?.name || "—"} ·{" "}
                        {row.protocol?.condition_name || "—"}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "11px",
                        color: urgencyColor,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {row.daysLeft}d
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "11px",
                        color: "#54c7a2",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      +${REUP_REVENUE}
                    </span>
                    <button
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontFamily: "'DM Mono', monospace",
                        cursor: "pointer",
                        border: "1px solid #e8e0d0",
                        backgroundColor: "#f5f3ee",
                        color: "#5a6a7a",
                        flexShrink: 0,
                        transition: "border-color 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#c9973a";
                        e.currentTarget.style.color = "#c9973a";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e8e0d0";
                        e.currentTarget.style.color = "#5a6a7a";
                      }}
                    >
                      Remind
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ATLAS AI */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8e0d0",
            borderTop: "3px solid #c9973a",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "13px 16px",
              borderBottom: "1px solid #e8e0d0",
            }}
          >
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Sparkles size={16} style={{ color: "#c9973a" }} />
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-3px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#54c7a2",
                  boxShadow: "0 0 6px #54c7a2",
                }}
              />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#0f1a2e",
                fontWeight: 600,
                fontSize: "15px",
                margin: 0,
              }}
            >
              Atlas AI
            </h3>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 20px" }}>
            <p
              style={{
                color: "#5a6a7a",
                fontSize: "14px",
                marginBottom: "20px",
                lineHeight: "1.6",
              }}
            >
              Any suggestions today?
            </p>
            <button
              onClick={() => setAiExpanded(!aiExpanded)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(201,151,58,0.3)",
                backgroundColor: aiExpanded
                  ? "rgba(201,151,58,0.12)"
                  : "rgba(201,151,58,0.06)",
                color: "#c9973a",
                fontSize: "13px",
                fontFamily: "'DM Mono', monospace",
                cursor: "pointer",
                transition: "background-color 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  "rgba(201,151,58,0.14)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor =
                  aiExpanded ? "rgba(201,151,58,0.12)" : "rgba(201,151,58,0.06)")
              }
            >
              <Sparkles size={14} />
              Check for suggestions
            </button>

            {aiExpanded && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "14px",
                  borderRadius: "8px",
                  backgroundColor: "#f5f3ee",
                  border: "1px solid #e8e0d0",
                }}
              >
                <p
                  style={{
                    color: "#5a6a7a",
                    fontSize: "12px",
                    fontFamily: "'DM Mono', monospace",
                    lineHeight: "1.7",
                    margin: 0,
                  }}
                >
                  AI suggestions coming soon — connect your client data to enable.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
