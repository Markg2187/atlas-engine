import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import type { Peptide } from "@/lib/types";

const routeColors: Record<string, string> = {
  subcutaneous: "#54c7a2",
  intramuscular: "#e8b86d",
  intranasal: "#6e88b0",
  oral: "#e8c96e",
  "pre-mixed": "#c9a84c",
  topical: "#6e88b0",
};

export default async function PeptidesPage() {
  const supabase = await createClient();

  const { data: peptides } = await supabase
    .from("peptides")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const categories = [...new Set((peptides || []).map((p) => p.category).filter(Boolean))];

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
        >
          Peptide Library
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6e88b0" }}>
          {peptides?.length ?? 0} peptides in the Atlas Engine database
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <span
            key={cat}
            className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all"
            style={{
              fontFamily: "'DM Mono', monospace",
              backgroundColor: "rgba(30,48,85,0.5)",
              color: "#6e88b0",
              border: "1px solid #1e3055",
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(peptides || []).map((peptide) => {
          const routeColor = routeColors[peptide.route || ""] || "#6e88b0";
          return (
            <Link key={peptide.id} href={`/peptides/${peptide.slug}`}>
              <div
                className="rounded-xl p-5 h-full transition-all hover:scale-[1.01] cursor-pointer"
                style={{
                  backgroundColor: "#0f1a2e",
                  border: "1px solid #1e3055",
                  borderTop: "2px solid #e8c96e",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#e8c96e" }}
                    >
                      {peptide.name}
                    </h3>
                    {peptide.full_name && (
                      <p className="text-xs mt-0.5" style={{ color: "#6e88b0" }}>
                        {peptide.full_name}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(232,201,110,0.1)", border: "1px solid rgba(232,201,110,0.2)" }}
                  >
                    <FlaskConical size={16} style={{ color: "#e8c96e" }} />
                  </div>
                </div>

                {/* Category + Route */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {peptide.category && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        backgroundColor: "rgba(232,201,110,0.1)",
                        color: "#e8c96e",
                        border: "1px solid rgba(232,201,110,0.2)",
                      }}
                    >
                      {peptide.category}
                    </span>
                  )}
                  {peptide.route && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        backgroundColor: `${routeColor}20`,
                        color: routeColor,
                        border: `1px solid ${routeColor}40`,
                      }}
                    >
                      {peptide.route}
                    </span>
                  )}
                </div>

                {/* Summary */}
                {peptide.summary && (
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "#6e88b0" }}>
                    {peptide.summary.slice(0, 140)}...
                  </p>
                )}

                {/* Half-life + Cycle */}
                <div className="flex gap-4 pt-3 border-t" style={{ borderColor: "#1e3055" }}>
                  {peptide.half_life && (
                    <div>
                      <p
                        className="text-xs uppercase tracking-widest mb-0.5"
                        style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                      >
                        Half-life
                      </p>
                      <p className="text-xs font-medium" style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}>
                        {peptide.half_life}
                      </p>
                    </div>
                  )}
                  {peptide.cycle_length && (
                    <div>
                      <p
                        className="text-xs uppercase tracking-widest mb-0.5"
                        style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}
                      >
                        Cycle
                      </p>
                      <p className="text-xs font-medium" style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}>
                        {peptide.cycle_length}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {peptide.tags && peptide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {peptide.tags.slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "#142035",
                          color: "#6e88b0",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
