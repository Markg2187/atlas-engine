import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientProfileClient from "@/components/clients/ClientProfileClient";

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
    .maybeSingle();

  const { data: protocolHistory } = await supabase
    .from("client_protocols")
    .select("*, protocol:protocols(condition_name, primary_peptide, category)")
    .eq("client_id", id)
    .in("status", ["completed", "paused", "cancelled"])
    .order("created_at", { ascending: false });

  const { data: checkins } = await supabase
    .from("client_checkins")
    .select("*")
    .eq("client_id", id)
    .order("checkin_date", { ascending: false })
    .limit(20);

  const { data: labResults } = await supabase
    .from("lab_results")
    .select("*")
    .eq("client_id", id)
    .order("test_date", { ascending: false })
    .limit(10);

  // Current user name
  let currentUserName = "Staff";
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    currentUserName = userProfile?.full_name || "Staff";
  }

  // Minor check
  let isMinor = false;
  let clientAge: number | null = null;
  if (client.date_of_birth) {
    const dob = new Date(client.date_of_birth + "T00:00:00");
    const today = new Date();
    clientAge = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) clientAge--;
    isMinor = clientAge < 18;
  }

  return (
    <div>
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-[#c9973a]"
        style={{ color: "#5a6a7a" }}
      >
        <ArrowLeft size={16} />
        Back to Clients
      </Link>

      <ClientProfileClient
        client={client}
        activeProtocol={activeProtocol || null}
        protocolHistory={protocolHistory || []}
        checkins={checkins || []}
        labResults={labResults || []}
        currentUserName={currentUserName}
        isMinor={isMinor}
        age={clientAge}
      />
    </div>
  );
}
