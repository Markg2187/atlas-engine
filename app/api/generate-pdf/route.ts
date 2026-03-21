import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { ClientProtocolPDF } from "@/lib/pdf/ClientProtocolPDF";
import React from "react";

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
    const { clientId, clientProtocolId } = body;

    if (!clientId || !clientProtocolId) {
      return NextResponse.json(
        { error: "clientId and clientProtocolId are required" },
        { status: 400 }
      );
    }

    // Fetch client
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch client protocol with full protocol data
    const { data: clientProtocol } = await supabase
      .from("client_protocols")
      .select(`
        *,
        protocol:protocols(
          *,
          months:protocol_months(
            *,
            rows:protocol_month_rows(*)
          )
        )
      `)
      .eq("id", clientProtocolId)
      .single();

    if (!clientProtocol || !clientProtocol.protocol) {
      return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
    }

    const protocol = clientProtocol.protocol as any;

    // Sort months and rows
    if (protocol.months) {
      protocol.months.sort((a: any, b: any) => a.month_number - b.month_number);
      protocol.months.forEach((month: any) => {
        if (month.rows) {
          month.rows.sort((a: any, b: any) => a.sort_order - b.sort_order);
        }
      });
    }

    // Collect all unique peptide names from the protocol
    const peptideNameSet = new Set<string>();
    if (protocol.primary_peptide) peptideNameSet.add(protocol.primary_peptide);
    (protocol.adjunct_peptides || []).forEach((n: string) => peptideNameSet.add(n));
    (protocol.months || []).forEach((month: any) => {
      (month.rows || []).forEach((row: any) => {
        if (row.peptide_name) peptideNameSet.add(row.peptide_name);
      });
    });
    const peptideNames = Array.from(peptideNameSet);

    // Fetch peptide details with benefits and recon data
    const { data: peptidesData } = await supabase
      .from("peptides")
      .select("*, benefits:peptide_benefits(benefit_text, sort_order), recon:peptide_recon(*)")
      .in("name", peptideNames);

    const peptideGuide = (peptidesData || []).map((p: any) => ({
      name: p.name,
      summary: p.summary ?? null,
      route: p.route ?? null,
      benefits: (p.benefits || [])
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((b: any) => b.benefit_text),
      recon_steps: p.recon?.[0]?.steps ?? null,
      storage: p.recon?.[0]?.storage ?? null,
      timing: p.timing ?? null,
      vial_size: p.recon?.[0]?.vial_size ?? null,
      is_brand_product: p.is_brand_product ?? false,
      brand: p.brand ?? null,
    }));

    // Generate PDF
    const buffer = await renderToBuffer(
      React.createElement(ClientProtocolPDF as any, {
        client: client as any,
        protocol: protocol,
        clientProtocol: clientProtocol as any,
        peptideGuide,
        generatedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }) as any
    );

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${client.first_name}_${client.last_name}_Protocol.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
