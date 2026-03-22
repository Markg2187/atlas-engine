"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Search, Plus, ChevronDown, Archive } from "lucide-react";
import NewClientModal from "@/components/clients/NewClientModal";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const supabase = createClient();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("clients")
      .select("*, location:locations(name)")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    } else if (!showArchived) {
      query = query.neq("status", "archived");
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data } = await query;
    setClients((data as Client[]) || []);
    setLoading(false);
  }, [search, statusFilter, showArchived]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const statusColors: Record<string, { bg: string; color: string; border: string }> = {
    active: {
      bg: "rgba(84,199,162,0.15)",
      color: "#54c7a2",
      border: "rgba(84,199,162,0.3)",
    },
    inactive: {
      bg: "rgba(110,136,176,0.15)",
      color: "#6e88b0",
      border: "rgba(110,136,176,0.3)",
    },
    onboarding: {
      bg: "rgba(232,201,110,0.15)",
      color: "#e8c96e",
      border: "rgba(232,201,110,0.3)",
    },
    archived: {
      bg: "rgba(224,90,106,0.12)",
      color: "#e05a6a",
      border: "rgba(224,90,106,0.3)",
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
          >
            Clients
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6e88b0" }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c9a84c")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e8c96e")}
        >
          <Plus size={16} />
          New Client
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3"
        style={{
          backgroundColor: "#0f1a2e",
          border: "1px solid #1e3055",
        }}
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#6e88b0" }}
          />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              backgroundColor: "#142035",
              border: "1px solid #1e3055",
              color: "#ccd9ee",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#e8c96e")}
            onBlur={(e) => (e.target.style.borderColor = "#1e3055")}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-lg text-sm focus:outline-none cursor-pointer"
            style={{
              backgroundColor: "#142035",
              border: "1px solid #1e3055",
              color: "#ccd9ee",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#6e88b0" }}
          />
        </div>
        <button
          onClick={() => { setShowArchived((v) => !v); setStatusFilter("all"); }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all"
          style={{
            backgroundColor: showArchived ? "rgba(224,90,106,0.12)" : "#142035",
            color: showArchived ? "#e05a6a" : "#6e88b0",
            border: `1px solid ${showArchived ? "rgba(224,90,106,0.35)" : "#1e3055"}`,
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.75rem",
          }}
        >
          <Archive size={13} />
          {showArchived ? "Hide Archived" : "Show Archived"}
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#0f1a2e",
          border: "1px solid #1e3055",
          borderTop: "2px solid #e8c96e",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#1e3055", borderTopColor: "#e8c96e" }}
            />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-2" style={{ color: "#6e88b0" }}>
              No clients found
            </p>
            <p className="text-sm mb-6" style={{ color: "#6e88b0" }}>
              {search ? "Try adjusting your search" : "Add your first client to get started"}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
              >
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #1e3055" }}>
                  {["Client", "Contact", "Status", "Weight", "Location", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs uppercase tracking-widest"
                      style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const sc = statusColors[client.status] || statusColors.inactive;
                  return (
                    <tr
                      key={client.id}
                      style={{ borderBottom: "1px solid rgba(30,48,85,0.5)" }}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(20,32,53,0.5)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-6 py-4">
                        <Link href={`/clients/${client.id}`}>
                          <p
                            className="font-medium transition-colors"
                            style={{ color: "#ccd9ee" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#e8c96e")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#ccd9ee")}
                          >
                            {client.first_name} {client.last_name}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
                          >
                            {client.sex ?? "—"} {client.date_of_birth ? `· DOB ${client.date_of_birth}` : ""}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: "#ccd9ee" }}>
                          {client.email ?? "—"}
                        </p>
                        <p className="text-xs" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                          {client.phone ?? ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            backgroundColor: sc.bg,
                            color: sc.color,
                            border: `1px solid ${sc.border}`,
                          }}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                        {client.weight_lbs ? `${client.weight_lbs} lbs` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#6e88b0" }}>
                        {(client as any).location?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            color: "#e8c96e",
                            border: "1px solid rgba(232,201,110,0.3)",
                            fontFamily: "'DM Mono', monospace",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(232,201,110,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                          }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <NewClientModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchClients();
          }}
        />
      )}
    </div>
  );
}
