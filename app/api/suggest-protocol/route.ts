import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { goals, health_conditions } = await request.json();

    if (!goals && !health_conditions) {
      return NextResponse.json({ error: "No health data provided" }, { status: 400 });
    }

    // Fetch all active protocols
    const supabase = await createClient();
    const { data: protocols } = await supabase
      .from("protocols")
      .select("id, condition_name, category, primary_peptide, adjunct_peptides, cycle_intro")
      .eq("is_active", true)
      .order("category")
      .order("condition_name");

    if (!protocols || protocols.length === 0) {
      return NextResponse.json({ error: "No protocols available" }, { status: 500 });
    }

    const protocolList = protocols
      .map(
        (p, i) =>
          `${i + 1}. ID: ${p.id} | Condition: ${p.condition_name} | Category: ${p.category} | Primary: ${p.primary_peptide}${p.adjunct_peptides?.length ? ` | Adjunct: ${p.adjunct_peptides.join(", ")}` : ""}${p.cycle_intro ? ` | Overview: ${p.cycle_intro.slice(0, 120)}` : ""}`
      )
      .join("\n");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a clinical peptide protocol advisor for a wellness company. A new client has the following profile:

Goals: ${goals || "Not specified"}
Health Conditions: ${health_conditions || "Not specified"}

Available protocols:
${protocolList}

Based on the client's goals and health conditions, recommend the single best matching protocol. Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "protocol_id": "<the exact UUID from the list>",
  "condition_name": "<the condition name>",
  "reasoning": "<1-2 sentences explaining why this protocol is the best match for this client's specific goals and conditions>"
}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const suggestion = JSON.parse(jsonMatch[0]);

    // Validate the protocol_id actually exists in our data
    const matched = protocols.find((p) => p.id === suggestion.protocol_id);
    if (!matched) {
      throw new Error("AI suggested an unrecognized protocol");
    }

    return NextResponse.json({
      protocol_id: suggestion.protocol_id,
      condition_name: matched.condition_name,
      primary_peptide: matched.primary_peptide,
      category: matched.category,
      reasoning: suggestion.reasoning,
    });
  } catch (err: unknown) {
    console.error("[suggest-protocol]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to generate suggestion" },
      { status: 500 }
    );
  }
}
