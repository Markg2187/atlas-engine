import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    // Fetch client with location
    const { data: client } = await supabase
      .from("clients")
      .select("*, location:locations(*)")
      .eq("id", clientId)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.email) {
      return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
    }

    // Fetch sender profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fetch active protocol if any
    const { data: clientProtocol } = await supabase
      .from("client_protocols")
      .select("*, protocol:protocols(condition_name)")
      .eq("client_id", clientId)
      .eq("status", "active")
      .single();

    const result = await sendWelcomeEmail(client.email, {
      clientName: `${client.first_name} ${client.last_name}`,
      practitionerName: profile?.full_name || "Your Practitioner",
      locationName: (client as any).location?.name || "Atlas Health",
      protocolName: (clientProtocol as any)?.protocol?.condition_name,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
