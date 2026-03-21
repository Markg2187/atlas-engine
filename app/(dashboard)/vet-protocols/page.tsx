import { createClient } from "@/lib/supabase/server";
import { Stethoscope } from "lucide-react";

const animalEmoji: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  horse: "🐎",
  other: "🐾",
};

const animalColors: Record<string, string> = {
  dog: "#e8c96e",
  cat: "#54c7a2",
  horse: "#6e88b0",
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
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
        >
          Veterinary Protocols
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6e88b0" }}>
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
          const color = animalColors[animal] || "#e8c96e";
          const emoji = animalEmoji[animal] || "🐾";
          return (
            <div key={animal}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: "#1e3055" }}
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
                  style={{ backgroundColor: "#1e3055" }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(protos || []).map((protocol) => (
                  <div
                    key={protocol!.id}
                    className="rounded-xl p-5"
                    style={{
                      backgroundColor: "#0f1a2e",
                      border: "1px solid #1e3055",
                      borderTop: `2px solid ${color}`,
                    }}
                  >
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
                    >
                      {protocol!.condition_name}
                    </h3>

                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                        Primary Peptide
                      </p>
                      <p className="text-sm font-medium" style={{ color }}>
                        {protocol!.primary_peptide}
                      </p>
                    </div>

                    {protocol!.adjunct_peptides && protocol!.adjunct_peptides.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs uppercase tracking-widest mb-1.5" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                          Adjunct
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {protocol!.adjunct_peptides.map((p: string) => (
                            <span
                              key={p}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                backgroundColor: "rgba(110,136,176,0.15)",
                                color: "#6e88b0",
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
                        style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
                      >
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                          Dosing
                        </p>
                        <p className="text-sm" style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}>
                          {protocol!.dosing_notes}
                        </p>
                      </div>
                    )}

                    {protocol!.dose_per_kg_mcg && protocol!.dose_per_kg_mcg > 0 && (
                      <div className="flex gap-4 mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                            Dose per kg
                          </p>
                          <p className="text-sm font-medium" style={{ color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}>
                            {protocol!.dose_per_kg_mcg} mcg/kg
                          </p>
                        </div>
                        {protocol!.cycle_length && (
                          <div>
                            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                              Cycle
                            </p>
                            <p className="text-sm" style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}>
                              {protocol!.cycle_length}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {protocol!.clinical_notes && (
                      <p className="text-xs leading-relaxed" style={{ color: "#6e88b0" }}>
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
