import { createClient } from "@/lib/supabase/server";
import ProtocolCard from "@/components/protocols/ProtocolCard";
import SignatureStackCard from "@/components/protocols/SignatureStackCard";
import CustomProtocolBuilder from "@/components/protocols/CustomProtocolBuilder";
import type { Protocol } from "@/lib/types";

const categoryColors: Record<string, string> = {
  Neurologic: "#5a6a7a",
  "Immune/Infectious": "#54c7a2",
  Autoimmune: "#e8b86d",
  Musculoskeletal: "#c9973a",
  Metabolic: "#a87c2e",
  Longevity: "#e05a6a",
  "Sleep/Stress": "#5a6a7a",
  "GI/Autoimmune": "#54c7a2",
  GI: "#54c7a2",
  "Sleep/Cognitive": "#5a6a7a",
  "Musculoskeletal/Autoimmune": "#c9973a",
};

export default async function ProtocolSelectorPage() {
  const supabase = await createClient();

  const [{ data: allProtocols }, { data: brandedPeptides }] = await Promise.all([
    supabase
      .from("protocols")
      .select("*")
      .eq("is_active", true)
      .order("condition_name"),
    supabase
      .from("peptides")
      .select("name")
      .eq("is_brand_product", true),
  ]);

  const brandedNames = (brandedPeptides || []).map((p) => p.name);
  const featuredStacks = (allProtocols || []).filter((p) => p.is_featured) as Protocol[];
  const conditionProtocols = (allProtocols || []).filter((p) => !p.is_featured) as Protocol[];

  const byCategory = conditionProtocols.reduce(
    (acc: Record<string, Protocol[]>, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {}
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
          >
            Protocol Selector
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#5a6a7a" }}>
            {featuredStacks.length} signature stacks · {conditionProtocols.length} clinical protocols across{" "}
            {Object.keys(byCategory).length} categories
          </p>
        </div>
        <CustomProtocolBuilder />
      </div>

      {/* ── Signature Stacks ──────────────────────────────────── */}
      {featuredStacks.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ backgroundColor: "rgba(201,151,58,0.2)" }} />
            <h2
              className="text-xs uppercase tracking-widest px-3 flex items-center gap-2"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: "#c9973a",
                flexShrink: 0,
              }}
            >
              ✦ Signature Stacks — CA Peptide Labs
            </h2>
            <div className="h-px flex-1" style={{ backgroundColor: "rgba(201,151,58,0.2)" }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStacks.map((stack) => (
              <SignatureStackCard
                key={stack.id}
                protocol={stack}
                brandedPeptideNames={brandedNames}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Condition-Based Protocols ─────────────────────────── */}
      {Object.keys(byCategory).length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: "#e8e0d0" }} />
            <h2
              className="text-xs uppercase tracking-widest px-3"
              style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a", flexShrink: 0 }}
            >
              Condition-Based Protocols
            </h2>
            <div className="h-px flex-1" style={{ backgroundColor: "#e8e0d0" }} />
          </div>

          <div className="space-y-8">
            {Object.entries(byCategory).map(([category, protos]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ backgroundColor: "#e8e0d0" }} />
                  <h3
                    className="text-xs uppercase tracking-widest px-3"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: categoryColors[category] || "#5a6a7a",
                      flexShrink: 0,
                    }}
                  >
                    {category}
                  </h3>
                  <div className="h-px flex-1" style={{ backgroundColor: "#e8e0d0" }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {protos.map((protocol) => (
                    <ProtocolCard
                      key={protocol.id}
                      protocol={protocol}
                      accentColor={categoryColors[category] || "#c9973a"}
                      brandedPeptideNames={brandedNames}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
