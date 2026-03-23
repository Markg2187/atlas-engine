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

  // Auto-open modal if ?new=1 in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "1") {
        setShowModal(true);
        // Clean up URL without navigation
        const url = new URL(window.location.href);
        url.searchParams.delete("new");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  const statusColors: Record<string, { bg: string; color: string; border: string }> = {
    active: {
      bg: "#eaf3de",
      color: "#3b6d11",
      border: "#c0dd97",
    },
    inactive: {
      bg: "#f5f3ee",
      color: "#5a6a7a",
      border: "#e8e0d0",
    },
    onboarding: {
      bg: "#e6f1fb",
      color: "#185fa5",
      border: "#b5d4f4",
    },
    archived: {
      bg: "#fcebeb",
      color: "#a32d2d",
      border: "#f7c1c1",
    },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
          >
            Clients
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#5a6a7a" }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: "#c9973a", color: "#0b1120" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a87c2e")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c9973a")}
        >
          <Plus size={16} />
          New Client
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e8e0d0",
        }}
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#5a6a7a" }}
          />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              backgroundColor: "#f5f3ee",
              border: "1px solid #e8e0d0",
              color: "#0f1a2e",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#c9973a")}
            onBlur={(e) => (e.target.style.borderColor = "#e8e0d0")}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 rounded-lg text-sm focus:outline-none cursor-pointer"
            style={{
              backgroundColor: "#f5f3ee",
              border: "1px solid #e8e0d0",
              color: "#0f1a2e",
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
            style={{ color: "#5a6a7a" }}
          />
        </div>
        <button
          onClick={() => { setShowArchived((v) => !v); setStatusFilter("all"); }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all"
          style={{
            backgroundColor: showArchived ? "#fcebeb" : "#f5f3ee",
            color: showArchived ? "#e05a6a" : "#5a6a7a",
            border: `1px solid ${showArchived ? "rgba(224,90,106,0.35)" : "#e8e0d0"}`,
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
          backgroundColor: "#ffffff",
          border: "1px solid #e8e0d0",
          borderTop: "3px solid #c9973a",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#e8e0d0", borderTopColor: "#c9973a" }}
            />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-2" style={{ color: "#5a6a7a" }}>
              No clients found
            </p>
            <p className="text-sm mb-6" style={{ color: "#5a6a7a" }}>
              {search ? "Try adjusting your search" : "Add your first client to get started"}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "#c9973a", color: "#0b1120" }}
              >
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #e8e0d0" }}>
                  {["Client", "Contact", "Status", "Weight", "Location", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs uppercase tracking-widest"
                      style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}
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
                      style={{ borderBottom: "1px solid rgba(232,224,208,0.5)" }}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(245,243,238,0.5)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-6 py-4">
                        <Link href={`/clients/${client.id}`}>
                          <p
                            className="font-medium transition-colors"
                            style={{ color: "#0f1a2e" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9973a")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#0f1a2e")}
                          >
                            {client.first_name} {client.last_name}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#5a6a7a", fontFamily: "'DM Mono', monospace" }}
                          >
                            {client.sex ?? "—"} {client.date_of_birth ? `· DOB ${client.date_of_birth}` : ""}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: "#0f1a2e" }}>
                          {client.email ?? "—"}
                        </p>
                        <p className="text-xs" style={{ color: "#5a6a7a", fontFamily: "'DM Mono', monospace" }}>
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
                      <td className="px-6 py-4 text-sm" style={{ color: "#5a6a7a", fontFamily: "'DM Mono', monospace" }}>
                        {client.weight_lbs ? `${client.weight_lbs} lbs` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: "#5a6a7a" }}>
                        {(client as any).location?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            color: "#c9973a",
                            border: "1px solid rgba(201,151,58,0.3)",
                            fontFamily: "'DM Mono', monospace",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(201,151,58,0.1)";
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
