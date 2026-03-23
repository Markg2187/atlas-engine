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
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-base" style={{ color: "#5a6a7a" }}>
          Manage your account, location, and platform settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8e0d0",
            borderTop: "3px solid #c9973a",
          }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "#e8e0d0" }}>
            <h2
              className="font-semibold flex items-center gap-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
            >
              <User size={16} style={{ color: "#c9973a" }} />
              Profile
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: "#e8e0d0", color: "#c9973a" }}
              >
                {profile?.full_name
                  ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                  : "?"}
              </div>
              <div>
                <p className="font-medium" style={{ color: "#1a2744" }}>
                  {profile?.full_name || "Unknown User"}
                </p>
                <p className="text-base" style={{ color: "#5a6a7a" }}>{user.email}</p>
                <span
                  className="text-sm px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    backgroundColor: "rgba(201,151,58,0.1)",
                    color: "#c9973a",
                    border: "1px solid rgba(201,151,58,0.2)",
                  }}
                >
                  {profile?.role?.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#5a6a7a" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={profile?.full_name || ""}
                  className="w-full px-4 py-2.5 rounded-lg text-base focus:outline-none"
                  style={{
                    backgroundColor: "#f5f3ee",
                    border: "1px solid #e8e0d0",
                    color: "#1a2744",
                  }}
                  readOnly
                />
              </div>
              <div>
                <label
                  className="block text-sm uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#5a6a7a" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user.email || ""}
                  className="w-full px-4 py-2.5 rounded-lg text-base"
                  style={{
                    backgroundColor: "#f5f3ee",
                    border: "1px solid #e8e0d0",
                    color: "#5a6a7a",
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
              backgroundColor: "#ffffff",
              border: "1px solid #e8e0d0",
              borderTop: "3px solid #54c7a2",
            }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "#e8e0d0" }}>
              <h2
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
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
                    <p className="text-sm uppercase tracking-widest mb-0.5" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#5a6a7a" }}>
                      {label}
                    </p>
                    <p className="text-base" style={{ color: "#1a2744" }}>{value || "—"}</p>
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
              backgroundColor: "#ffffff",
              border: "1px solid #e8e0d0",
              borderTop: "3px solid #e8b86d",
            }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "#e8e0d0" }}>
              <h2
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
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
                    style={{ backgroundColor: "#f5f3ee", border: "1px solid #e8e0d0" }}
                  >
                    <div>
                      <p className="font-medium text-base" style={{ color: "#1a2744" }}>{loc.name}</p>
                      <p className="text-sm" style={{ color: "#5a6a7a" }}>
                        {loc.city}, {loc.state} · {loc.owner_name}
                      </p>
                    </div>
                    <span
                      className="text-sm px-2 py-1 rounded-full"
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        backgroundColor: loc.is_active ? "#eaf3de" : "#f5f3ee",
                        color: loc.is_active ? "#54c7a2" : "#5a6a7a",
                        border: `1px solid ${loc.is_active ? "#c0dd97" : "#e8e0d0"}`,
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
            backgroundColor: "#ffffff",
            border: "1px solid #e8e0d0",
          }}
        >
          <h3
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
          >
            <BookOpen size={16} style={{ color: "#c9973a" }} />
            Platform Information
          </h3>
          <div className="space-y-2">
            {[
              ["Platform", "Atlas Engine"],
              ["Version", "1.0.0"],
              ["Environment", process.env.NODE_ENV || "development"],
              ["App URL", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-base py-2 border-b" style={{ borderColor: "#e8e0d0" }}>
                <span style={{ color: "#5a6a7a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem" }}>
                  {label}
                </span>
                <span style={{ color: "#1a2744", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "0.875rem" }}>
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
