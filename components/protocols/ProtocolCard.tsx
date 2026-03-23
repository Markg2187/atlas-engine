"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Syringe, ChevronRight, ChevronDown, BookLock } from "lucide-react";
import type { Protocol } from "@/lib/types";

interface ProtocolCardProps {
  protocol: Protocol;
  accentColor: string;
  brandedPeptideNames?: string[];
}

export default function ProtocolCard({ protocol, accentColor, brandedPeptideNames = [] }: ProtocolCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl p-5 transition-all hover:scale-[1.01] cursor-pointer"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e8e0d0",
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3
          className="leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744", fontSize: "16px", fontWeight: 700 }}
        >
          {protocol.condition_name}
        </h3>
      </div>

      <div className="mb-3">
        <p
          className="mb-1"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#5a4a3a" }}
        >
          Primary peptide
        </p>
        <p className="text-sm font-medium" style={{ color: "#c9973a" }}>
          {protocol.primary_peptide}
        </p>
      </div>

      {protocol.adjunct_peptides && protocol.adjunct_peptides.length > 0 && (
        <div className="mb-4">
          <p
            className="mb-1.5"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#5a4a3a" }}
          >
            Adjunct peptides
          </p>
          <div className="flex flex-wrap gap-1.5">
            {protocol.adjunct_peptides.map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "#f5f3ee",
                  color: "#5a6a7a",
                  border: "1px solid rgba(110,136,176,0.2)",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {protocol.cycle_intro && (
        <div className="mb-4">
          <p className="leading-relaxed" style={{ color: "#3a4a5a", fontSize: "13px" }}>
            {expanded ? protocol.cycle_intro : `${protocol.cycle_intro.slice(0, 120)}...`}
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

      {expanded && brandedPeptideNames.length > 0 && (
        (() => {
          const allPeptides = [
            protocol.primary_peptide,
            ...(protocol.adjunct_peptides || []),
          ];
          const hasBranded = allPeptides.some((n) =>
            brandedPeptideNames.some((b) => b.toLowerCase() === n.toLowerCase())
          );
          if (!hasBranded) return null;
          return (
            <div className="mb-4">
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: "'DM Mono', monospace", color: "#5a6a7a" }}
              >
                CA Peptide Labs Products
              </p>
              <div className="space-y-1.5">
                {allPeptides.map((name) => {
                  const branded = brandedPeptideNames.some(
                    (b) => b.toLowerCase() === name.toLowerCase()
                  );
                  if (!branded) return null;
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: "rgba(84,199,162,0.06)",
                        border: "1px solid #eaf3de",
                      }}
                    >
                      <span className="text-xs" style={{ color: "#1a2744" }}>
                        {name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "0.6rem",
                          backgroundColor: "rgba(84,199,162,0.12)",
                          color: "#54c7a2",
                          border: "1px solid rgba(84,199,162,0.25)",
                        }}
                      >
                        CA Peptide Labs
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}

      {expanded && protocol.clinical_notes && (
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
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#5a4a3a" }}
            >
              Clinician notes
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
          <p className="leading-relaxed" style={{ color: "#3a4a5a", fontSize: "13px" }}>
            {protocol.clinical_notes}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/clients?assignProtocol=${protocol.id}`)}
          className="flex-1 py-2 text-xs rounded-lg font-medium transition-all flex items-center justify-center gap-1"
          style={{
            backgroundColor: "rgba(201,151,58,0.1)",
            color: "#c9973a",
            border: "1px solid rgba(201,151,58,0.2)",
            fontFamily: "'DM Mono', monospace",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(201,151,58,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(201,151,58,0.1)";
          }}
        >
          <Syringe size={13} />
          Assign to Client
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-2 text-xs rounded-lg transition-all"
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
  );
}
