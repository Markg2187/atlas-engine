import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";

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

  // Locations
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .order("name");

  // All non-archived clients with location
  let clientsQuery = supabase
    .from("clients")
    .select("*, location:locations(id, name)")
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (!isSuperAdmin && profile?.location_id) {
    clientsQuery = clientsQuery.eq("location_id", profile.location_id);
  }

  const { data: allClients } = await clientsQuery;

  // All active client_protocols with client + protocol info
  const { data: activeProtocols } = await supabase
    .from("client_protocols")
    .select(
      "*, protocol:protocols(condition_name, primary_peptide, category), client:clients(id, first_name, last_name, location_id, date_of_birth, payment_status, location:locations(name))"
    )
    .eq("status", "active");

  return (
    <DashboardClient
      profile={profile}
      isSuperAdmin={isSuperAdmin}
      locations={locations || []}
      allClients={allClients || []}
      activeProtocols={activeProtocols || []}
    />
  );
}
