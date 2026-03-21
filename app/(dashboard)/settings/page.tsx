import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, User, Building2, Shield, BookOpen } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, location:locations(*)")
    .eq("id", user.id)
    .single();

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true);

  const isSuperAdmin = profile?.role === "super_admin";

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6e88b0" }}>
          Manage your account, location, and platform settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "#0f1a2e",
            border: "1px solid #1e3055",
            borderTop: "2px solid #e8c96e",
          }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "#1e3055" }}>
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
            >
              <User size={16} style={{ color: "#e8c96e" }} />
              Profile
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: "#1e3055", color: "#e8c96e" }}
              >
                {profile?.full_name
                  ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                  : "?"}
              </div>
              <div>
                <p className="font-medium" style={{ color: "#ccd9ee" }}>
                  {profile?.full_name || "Unknown User"}
                </p>
                <p className="text-sm" style={{ color: "#6e88b0" }}>{user.email}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    backgroundColor: "rgba(232,201,110,0.1)",
                    color: "#e8c96e",
                    border: "1px solid rgba(232,201,110,0.2)",
                  }}
                >
                  {profile?.role?.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={profile?.full_name || ""}
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{
                    backgroundColor: "#142035",
                    border: "1px solid #1e3055",
                    color: "#ccd9ee",
                  }}
                  readOnly
                />
              </div>
              <div>
                <label
                  className="block text-xs uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user.email || ""}
                  className="w-full px-4 py-2.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: "#142035",
                    border: "1px solid #1e3055",
                    color: "#6e88b0",
                  }}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        {profile?.location && (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderTop: "2px solid #54c7a2",
            }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "#1e3055" }}>
              <h2
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <Building2 size={16} style={{ color: "#54c7a2" }} />
                Your Location
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["Location Name", (profile.location as any).name],
                  ["City", (profile.location as any).city],
                  ["State", (profile.location as any).state],
                  ["Owner", (profile.location as any).owner_name],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                      {label}
                    </p>
                    <p className="text-sm" style={{ color: "#ccd9ee" }}>{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Super Admin: All Locations */}
        {isSuperAdmin && locations && (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid #1e3055",
              borderTop: "2px solid #e8b86d",
            }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "#1e3055" }}>
              <h2
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <Shield size={16} style={{ color: "#e8b86d" }} />
                All Locations (Super Admin)
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
                  >
                    <div>
                      <p className="font-medium text-sm" style={{ color: "#ccd9ee" }}>{loc.name}</p>
                      <p className="text-xs" style={{ color: "#6e88b0" }}>
                        {loc.city}, {loc.state} · {loc.owner_name}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        backgroundColor: loc.is_active ? "rgba(84,199,162,0.15)" : "rgba(110,136,176,0.15)",
                        color: loc.is_active ? "#54c7a2" : "#6e88b0",
                        border: `1px solid ${loc.is_active ? "rgba(84,199,162,0.3)" : "rgba(110,136,176,0.3)"}`,
                      }}
                    >
                      {loc.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Platform Info */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "#0f1a2e",
            border: "1px solid #1e3055",
          }}
        >
          <h3
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
          >
            <BookOpen size={16} style={{ color: "#e8c96e" }} />
            Platform Information
          </h3>
          <div className="space-y-2">
            {[
              ["Platform", "Atlas Engine"],
              ["Version", "1.0.0"],
              ["Environment", process.env.NODE_ENV || "development"],
              ["App URL", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: "#1e3055" }}>
                <span style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>
                  {label}
                </span>
                <span style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
