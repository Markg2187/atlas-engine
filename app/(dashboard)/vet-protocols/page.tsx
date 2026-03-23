import { createClient } from "@/lib/supabase/server";
import { Stethoscope } from "lucide-react";

const animalEmoji: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  horse: "🐎",
  other: "🐾",
};

const animalColors: Record<string, string> = {
  dog: "#c9973a",
  cat: "#54c7a2",
  horse: "#5a6a7a",
  other: "#e8b86d",
};

export default async function VetProtocolsPage() {
  const supabase = await createClient();

  const { data: protocols } = await supabase
    .from("vet_protocols")
    .select("*")
    .eq("is_active", true)
    .order("animal_type")
    .order("condition_name");

  const byAnimal = (protocols || []).reduce((acc: Record<string, typeof protocols>, p) => {
    const type = p!.animal_type;
    if (!acc[type]) acc[type] = [];
    acc[type]!.push(p!);
    return acc;
  }, {} as Record<string, typeof protocols>);

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
        >
          Veterinary Protocols
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#5a6a7a" }}>
          {protocols?.length ?? 0} peptide protocols for companion animals
        </p>
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl p-4 mb-6 flex items-start gap-3"
        style={{
          backgroundColor: "rgba(232,184,109,0.08)",
          border: "1px solid rgba(232,184,109,0.25)",
        }}
      >
        <Stethoscope size={18} style={{ color: "#e8b86d", flexShrink: 0, marginTop: "2px" }} />
        <p className="text-sm" style={{ color: "#e8b86d" }}>
          These protocols are for veterinary use only and should be administered under veterinary supervision.
          Doses are weight-based and should be calculated per individual animal.
        </p>
      </div>

      {/* By animal type */}
      <div className="space-y-8">
        {Object.entries(byAnimal).map(([animal, protos]) => {
          const color = animalColors[animal] || "#c9973a";
          const emoji = animalEmoji[animal] || "🐾";
          return (
            <div key={animal}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: "#e8e0d0" }}
                />
                <h2
                  className="text-xs uppercase tracking-widest px-3 flex items-center gap-2"
                  style={{ fontFamily: "'DM Mono', monospace", color, flexShrink: 0 }}
                >
                  <span>{emoji}</span>
                  {animal.toUpperCase()}
                </h2>
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: "#e8e0d0" }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(protos || []).map((protocol) => (
                  <div
                    key={protocol!.id}
                    className="rounded-xl p-5"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e8e0d0",
                      borderTop: `2px solid ${color}`,
                    }}
                  >
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
                    >
                      {protocol!.condition_name}
                    </h3>

                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}>
                        Primary Peptide
                      </p>
                      <p className="text-sm font-medium" style={{ color }}>
                        {protocol!.primary_peptide}
                      </p>
                    </div>

                    {protocol!.adjunct_peptides && protocol!.adjunct_peptides.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}>
                          Adjunct
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {protocol!.adjunct_peptides.map((p: string) => (
                            <span
                              key={p}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                backgroundColor: "#f5f3ee",
                                color: "#5a6a7a",
                                border: "1px solid rgba(110,136,176,0.2)",
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {protocol!.dosing_notes && (
                      <div
                        className="p-3 rounded-lg mb-3"
                        style={{ backgroundColor: "#f5f3ee", border: "1px solid #e8e0d0" }}
                      >
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}>
                          Dosing
                        </p>
                        <p className="text-sm" style={{ color: "#0f1a2e", fontFamily: "'DM Mono', monospace" }}>
                          {protocol!.dosing_notes}
                        </p>
                      </div>
                    )}

                    {protocol!.dose_per_kg_mcg && protocol!.dose_per_kg_mcg > 0 && (
                      <div className="flex gap-4 mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}>
                            Dose per kg
                          </p>
                          <p className="text-sm font-medium" style={{ color: "#c9973a", fontFamily: "'DM Mono', monospace" }}>
                            {protocol!.dose_per_kg_mcg} mcg/kg
                          </p>
                        </div>
                        {protocol!.cycle_length && (
                          <div>
                            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}>
                              Cycle
                            </p>
                            <p className="text-sm" style={{ color: "#0f1a2e", fontFamily: "'DM Mono', monospace" }}>
                              {protocol!.cycle_length}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {protocol!.clinical_notes && (
                      <p className="text-xs leading-relaxed" style={{ color: "#5a6a7a" }}>
                        {protocol!.clinical_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
