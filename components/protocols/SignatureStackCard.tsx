"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Syringe, ChevronDown, ChevronRight, BookLock, Star } from "lucide-react";
import type { Protocol } from "@/lib/types";

interface SignatureStackCardProps {
  protocol: Protocol;
  brandedPeptideNames: string[];
}

function isBranded(name: string, brandedNames: string[]): boolean {
  return brandedNames.some(
    (b) => b.toLowerCase() === name.toLowerCase()
  );
}

export default function SignatureStackCard({
  protocol,
  brandedPeptideNames,
}: SignatureStackCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const allPeptides = [
    protocol.primary_peptide,
    ...(protocol.adjunct_peptides || []),
  ];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all hover:scale-[1.005]"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid rgba(201,151,58,0.3)",
        borderTop: "3px solid #c9973a",
      }}
    >
      {/* Gold shimmer top bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201,151,58,0.6), transparent)",
        }}
      />

      <div className="p-5">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{
              fontFamily: "'DM Mono', monospace",
              backgroundColor: "rgba(201,151,58,0.12)",
              color: "#c9973a",
              border: "1px solid rgba(201,151,58,0.3)",
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
            }}
          >
            <Star size={9} />
            SIGNATURE STACK
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              fontFamily: "'DM Mono', monospace",
              backgroundColor: "rgba(84,199,162,0.1)",
              color: "#54c7a2",
              border: "1px solid rgba(84,199,162,0.2)",
              fontSize: "0.6rem",
            }}
          >
            CA Peptide Labs
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold mb-1.5 leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c9973a" }}
        >
          {protocol.condition_name}
        </h3>

        {/* Tagline */}
        {protocol.tagline && (
          <p className="text-sm mb-4 leading-relaxed" style={{ color: "#5a6a7a" }}>
            {protocol.tagline}
          </p>
        )}

        {/* Core peptides */}
        <div className="mb-4">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}
          >
            Core Peptides
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allPeptides.map((name) => {
              const branded = isBranded(name, brandedPeptideNames);
              return (
                <div key={name} className="flex items-center gap-1">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: branded
                        ? "rgba(201,151,58,0.1)"
                        : "rgba(110,136,176,0.1)",
                      color: branded ? "#c9973a" : "#5a6a7a",
                      border: `1px solid ${branded ? "rgba(201,151,58,0.25)" : "rgba(110,136,176,0.2)"}`,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {name}
                  </span>
                  {branded && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.55rem",
                        backgroundColor: "rgba(84,199,162,0.1)",
                        color: "#54c7a2",
                        border: "1px solid rgba(84,199,162,0.2)",
                      }}
                    >
                      T1
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cycle intro — always visible, truncated until expanded */}
        {protocol.cycle_intro && (
          <div className="mb-4">
            <p className="text-xs leading-relaxed" style={{ color: "#5a6a7a" }}>
              {expanded
                ? protocol.cycle_intro
                : `${protocol.cycle_intro.slice(0, 120)}...`}
            </p>
            {protocol.cycle_intro.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs mt-1 transition-colors"
                style={{ color: "#c9973a", fontFamily: "'DM Mono', monospace" }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Expanded: clinical notes */}
        {expanded && (
          <>
            {protocol.clinical_notes && (
              <div
                className="mb-4 rounded-lg p-3"
                style={{
                  backgroundColor: "rgba(201,151,58,0.04)",
                  border: "1px solid rgba(201,151,58,0.25)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookLock size={11} style={{ color: "#c9973a" }} />
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ fontFamily: "'DM Mono', monospace", color: "#c9973a" }}
                  >
                    Clinical Notes
                  </span>
                  <span
                    className="ml-auto text-xs px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.6rem",
                      backgroundColor: "rgba(201,151,58,0.12)",
                      color: "#c9973a",
                      border: "1px solid rgba(201,151,58,0.2)",
                    }}
                  >
                    Rx only
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#1a2744" }}
                >
                  {protocol.clinical_notes}
                </p>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() =>
              router.push(`/clients?assignProtocol=${protocol.id}`)
            }
            className="flex-1 py-2.5 text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={{
              backgroundColor: "rgba(201,151,58,0.15)",
              color: "#c9973a",
              border: "1px solid rgba(201,151,58,0.3)",
              fontFamily: "'DM Mono', monospace",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(201,151,58,0.25)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(201,151,58,0.15)")
            }
          >
            <Syringe size={12} />
            Build My Protocol
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-2.5 text-xs rounded-lg transition-all"
            style={{
              backgroundColor: "#f5f3ee",
              color: "#5a6a7a",
              border: "1px solid #e8e0d0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8e0d0";
              e.currentTarget.style.color = "#1a2744";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f3ee";
              e.currentTarget.style.color = "#5a6a7a";
            }}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}
