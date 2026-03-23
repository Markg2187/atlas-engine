"use client";

import { useState } from "react";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import type { Peptide } from "@/lib/types";

const routeColors: Record<string, string> = {
  subcutaneous: "#54c7a2",
  intramuscular: "#e8b86d",
  intranasal: "#5a6a7a",
  oral: "#c9973a",
  "pre-mixed": "#a87c2e",
  topical: "#5a6a7a",
};

export default function PeptideGrid({ peptides, categories }: { peptides: Peptide[]; categories: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const visible = selected ? peptides.filter((p) => p.category === selected) : peptides;

  function handlePill(cat: string) {
    setSelected((prev) => (prev === cat ? null : cat));
  }

  return (
    <>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelected(null)}
          className="text-sm px-3 py-1.5 rounded-full cursor-pointer transition-all"
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            backgroundColor: selected === null ? "rgba(201,151,58,0.12)" : "rgba(232,224,208,0.5)",
            color: selected === null ? "#c9973a" : "#5a6a7a",
            border: `1px solid ${selected === null ? "#c9973a" : "#e8e0d0"}`,
          }}
        >
          All
        </button>
        {categories.map((cat) => {
          const active = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => handlePill(cat)}
              className="text-sm px-3 py-1.5 rounded-full cursor-pointer transition-all"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                backgroundColor: active ? "rgba(201,151,58,0.12)" : "rgba(232,224,208,0.5)",
                color: active ? "#c9973a" : "#5a6a7a",
                border: `1px solid ${active ? "#c9973a" : "#e8e0d0"}`,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((peptide) => {
          const routeColor = routeColors[peptide.route || ""] || "#5a6a7a";
          return (
            <Link key={peptide.id} href={`/peptides/${peptide.slug}`}>
              <div
                className="rounded-xl p-5 h-full transition-all hover:scale-[1.01] cursor-pointer"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e8e0d0",
                  borderTop: "3px solid #c9973a",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c9973a" }}
                    >
                      {peptide.name}
                    </h3>
                    {peptide.full_name && (
                      <p className="text-sm mt-0.5" style={{ color: "#5a6a7a" }}>
                        {peptide.full_name}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.2)" }}
                  >
                    <FlaskConical size={16} style={{ color: "#c9973a" }} />
                  </div>
                </div>

                {/* Category + Route */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {peptide.category && (
                    <span
                      className="text-sm px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        backgroundColor: "rgba(201,151,58,0.1)",
                        color: "#c9973a",
                        border: "1px solid rgba(201,151,58,0.2)",
                      }}
                    >
                      {peptide.category}
                    </span>
                  )}
                  {peptide.route && (
                    <span
                      className="text-sm px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
                  <p className="text-base leading-relaxed mb-3" style={{ color: "#5a6a7a" }}>
                    {peptide.summary.slice(0, 140)}...
                  </p>
                )}

                {/* Half-life + Cycle */}
                <div className="flex gap-4 pt-3 border-t" style={{ borderColor: "#e8e0d0" }}>
                  {peptide.half_life && (
                    <div>
                      <p
                        className="text-sm uppercase tracking-widest mb-0.5"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#5a6a7a" }}
                      >
                        Half-life
                      </p>
                      <p className="text-sm font-medium" style={{ color: "#1a2744", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                        {peptide.half_life}
                      </p>
                    </div>
                  )}
                  {peptide.cycle_length && (
                    <div>
                      <p
                        className="text-sm uppercase tracking-widest mb-0.5"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#5a6a7a" }}
                      >
                        Cycle
                      </p>
                      <p className="text-sm font-medium" style={{ color: "#1a2744", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
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
                        className="text-sm px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "#f5f3ee",
                          color: "#5a6a7a",
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
    </>
  );
}
