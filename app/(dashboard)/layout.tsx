import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import type { UserProfile } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, location:locations(*)")
    .eq("id", user.id)
    .single();

  // Count overdue checkins (clients without checkin in 14+ days)
  const { count: overdueCount } = await supabase
    .from("client_protocols")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0b1120" }}>
      <Sidebar user={profile as UserProfile} overdueCount={overdueCount ?? 0} />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
