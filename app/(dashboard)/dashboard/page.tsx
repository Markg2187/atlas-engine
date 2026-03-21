import { createClient } from "@/lib/supabase/server";
import { Users, Activity, AlertTriangle, Package } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const isSuperAdmin = profile?.role === "super_admin";

  // Fetch stats
  const locationFilter = isSuperAdmin
    ? {}
    : { location_id: profile?.location_id };

  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .match(locationFilter);

  const { count: activeProtocols } = await supabase
    .from("client_protocols")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Vials needing refill (0 remaining)
  const { count: vialsRefill } = await supabase
    .from("vial_inventory")
    .select("*", { count: "exact", head: true })
    .eq("vials_remaining", 0);

  // Recent clients
  const { data: recentClients } = await supabase
    .from("clients")
    .select("*, location:locations(name)")
    .eq("status", "active")
    .match(locationFilter)
    .order("created_at", { ascending: false })
    .limit(8);

  // Low vials
  const { data: lowVials } = await supabase
    .from("vial_inventory")
    .select("*, client:clients(first_name, last_name)")
    .lte("vials_remaining", 1)
    .order("vials_remaining", { ascending: true })
    .limit(5);

  // Location summaries for super admin
  const { data: locations } = isSuperAdmin
    ? await supabase.from("locations").select("*").eq("is_active", true)
    : { data: null };

  const stats = [
    {
      label: "Active Clients",
      value: totalClients ?? 0,
      icon: <Users size={20} />,
      color: "#e8c96e",
      href: "/clients",
    },
    {
      label: "Protocols Running",
      value: activeProtocols ?? 0,
      icon: <Activity size={20} />,
      color: "#54c7a2",
      href: "/clients",
    },
    {
      label: "Overdue Check-ins",
      value: 0,
      icon: <AlertTriangle size={20} />,
      color: "#e8b86d",
      href: "/clients",
    },
    {
      label: "Vials Need Refill",
      value: vialsRefill ?? 0,
      icon: <Package size={20} />,
      color: "#e05a6a",
      href: "/clients",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6e88b0" }}>
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"}.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div
              className="rounded-xl p-5 transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: "#0f1a2e",
                border: "1px solid #1e3055",
                borderTop: `2px solid ${stat.color}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: "'DM Mono', monospace", color: "#ccd9ee" }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
              >
                {stat.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Super Admin: Location Cards */}
      {isSuperAdmin && locations && locations.length > 0 && (
        <div className="mb-8">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
          >
            Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="rounded-xl p-5"
                style={{
                  backgroundColor: "#0f1a2e",
                  border: "1px solid #1e3055",
                  borderTop: "2px solid #e8c96e",
                }}
              >
                <h3
                  className="font-semibold mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
                >
                  {loc.name}
                </h3>
                <p className="text-sm" style={{ color: "#6e88b0" }}>
                  {loc.city}, {loc.state}
                </p>
                <p className="text-xs mt-2" style={{ color: "#6e88b0" }}>
                  {loc.owner_name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients Table */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{
            backgroundColor: "#0f1a2e",
            border: "1px solid #1e3055",
            borderTop: "2px solid #e8c96e",
          }}
        >
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#1e3055" }}
          >
            <h2
              className="font-semibold"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
            >
              Active Clients
            </h2>
            <Link
              href="/clients"
              className="text-xs transition-colors"
              style={{ color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #1e3055" }}>
                  {["Client", "Status", "Location", "Added"].map((h) => (
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
                {recentClients && recentClients.length > 0 ? (
                  recentClients.map((client) => (
                    <tr
                      key={client.id}
                      className="transition-colors hover:bg-[rgba(20,32,53,0.5)]"
                      style={{ borderBottom: "1px solid rgba(30,48,85,0.5)" }}
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium transition-colors hover:text-[#e8c96e]"
                          style={{ color: "#ccd9ee" }}
                        >
                          {client.first_name} {client.last_name}
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            backgroundColor:
                              client.status === "active"
                                ? "rgba(84,199,162,0.15)"
                                : "rgba(110,136,176,0.15)",
                            color:
                              client.status === "active" ? "#54c7a2" : "#6e88b0",
                            border: `1px solid ${client.status === "active" ? "rgba(84,199,162,0.3)" : "rgba(110,136,176,0.3)"}`,
                          }}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: "#6e88b0" }}>
                        {(client as any).location?.name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>
                        {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: "#6e88b0" }}>
                      No active clients yet.{" "}
                      <Link href="/clients" style={{ color: "#e8c96e" }}>
                        Add your first client →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts panel */}
        <div className="space-y-4">
          {/* Vials needing refill */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderTop: "2px solid #e05a6a",
            }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "#1e3055" }}
            >
              <h3
                className="font-semibold text-sm flex items-center gap-2"
                style={{ color: "#e05a6a" }}
              >
                <Package size={15} />
                Vials Need Refill
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {lowVials && lowVials.length > 0 ? (
                lowVials.map((vial) => (
                  <div
                    key={vial.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p style={{ color: "#ccd9ee" }}>
                        {(vial as any).client?.first_name} {(vial as any).client?.last_name}
                      </p>
                      <p style={{ color: "#6e88b0", fontSize: "0.75rem" }}>
                        {vial.peptide_name}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        backgroundColor: "rgba(224,90,106,0.15)",
                        color: "#e05a6a",
                        border: "1px solid rgba(224,90,106,0.3)",
                      }}
                    >
                      {vial.vials_remaining} left
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center py-4" style={{ color: "#6e88b0" }}>
                  All vials stocked
                </p>
              )}
            </div>
          </div>

          {/* Quick actions */}
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
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: "Add New Client", href: "/clients" },
                { label: "Browse Protocols", href: "/protocol-selector" },
                { label: "Peptide Calculator", href: "/calculator" },
                { label: "Knowledge Base", href: "/knowledge-base" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all border border-transparent hover:border-[#e8c96e] hover:text-[#e8c96e]"
                  style={{
                    backgroundColor: "#142035",
                    color: "#ccd9ee",
                  }}
                >
                  {action.label}
                  <span style={{ opacity: 0.5 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
