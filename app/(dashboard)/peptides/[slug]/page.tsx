import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, AlertTriangle, BookOpen, FlaskConical, Syringe } from "lucide-react";

export default async function PeptideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: peptide } = await supabase
    .from("peptides")
    .select(`
      *,
      dosing:peptide_dosing(*),
      benefits:peptide_benefits(*),
      warnings:peptide_warnings(*),
      studies:peptide_studies(*),
      recon:peptide_recon(*)
    `)
    .eq("slug", slug)
    .single();

  if (!peptide) notFound();

  const recon = Array.isArray(peptide.recon) ? peptide.recon[0] : peptide.recon;
  const benefits = (peptide.benefits || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const warnings = (peptide.warnings || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const dosing = (peptide.dosing || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const studies = (peptide.studies || []).sort((a: any, b: any) => a.sort_order - b.sort_order);

  return (
    <div className="max-w-5xl">
      <Link
        href="/peptides"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: "#6e88b0" }}
      >
        <ArrowLeft size={16} />
        Back to Peptide Library
      </Link>

      {/* Hero */}
      <div
        className="rounded-2xl p-8 mb-8"
        style={{
          backgroundColor: "#0f1a2e",
          border: "1px solid #1e3055",
          borderTop: "2px solid #e8c96e",
        }}
      >
        <div className="flex items-start gap-5">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(232,201,110,0.1)", border: "1px solid rgba(232,201,110,0.3)" }}
          >
            <FlaskConical size={24} style={{ color: "#e8c96e" }} />
          </div>
          <div className="flex-1">
            <h1
              className="text-4xl font-bold mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#e8c96e" }}
            >
              {peptide.name}
            </h1>
            {peptide.full_name && (
              <p className="text-sm mb-3" style={{ color: "#6e88b0" }}>
                {peptide.full_name}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {peptide.category && (
                <span className="badge-gold">{peptide.category}</span>
              )}
              {peptide.route && (
                <span className="badge-dim">{peptide.route}</span>
              )}
              {peptide.tags?.map((tag: string) => (
                <span key={tag} className="badge-dim">#{tag}</span>
              ))}
            </div>
            {peptide.summary && (
              <p className="text-base leading-relaxed" style={{ color: "#ccd9ee" }}>
                {peptide.summary}
              </p>
            )}
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: "#1e3055" }}>
          {[
            { label: "Half-Life", value: peptide.half_life },
            { label: "Cycle Length", value: peptide.cycle_length },
            { label: "Route", value: peptide.route },
            { label: "Injectable", value: peptide.is_injectable ? "Yes" : "No" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="stat-label mb-1">{label}</p>
              <p className="text-sm font-medium" style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}>
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Benefits */}
          {benefits.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#0f1a2e",
                border: "1px solid #1e3055",
                borderTop: "2px solid #54c7a2",
              }}
            >
              <h2
                className="font-semibold mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <Check size={16} style={{ color: "#54c7a2" }} />
                Benefits
              </h2>
              <ul className="space-y-2">
                {benefits.map((b: any) => (
                  <li key={b.id} className="flex items-start gap-2 text-sm" style={{ color: "#ccd9ee" }}>
                    <span style={{ color: "#54c7a2", marginTop: "2px", flexShrink: 0 }}>✓</span>
                    {b.benefit_text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#0f1a2e",
                border: "1px solid #1e3055",
                borderTop: "2px solid #e8b86d",
              }}
            >
              <h2
                className="font-semibold mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#e8b86d" }}
              >
                <AlertTriangle size={16} />
                Clinical Warnings
              </h2>
              <ul className="space-y-2">
                {warnings.map((w: any) => (
                  <li key={w.id} className="flex items-start gap-2 text-sm" style={{ color: "#ccd9ee" }}>
                    <span style={{ color: "#e8b86d", marginTop: "2px", flexShrink: 0 }}>⚠</span>
                    {w.warning_text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Mechanism */}
          {peptide.mechanism_of_action && (
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055" }}
            >
              <h2
                className="font-semibold mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                Mechanism of Action
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#6e88b0" }}>
                {peptide.mechanism_of_action}
              </p>
            </div>
          )}

          {/* Dosing */}
          {dosing.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#0f1a2e",
                border: "1px solid #1e3055",
                borderTop: "2px solid #e8c96e",
              }}
            >
              <h2
                className="font-semibold mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <Syringe size={16} style={{ color: "#e8c96e" }} />
                Dosing Schedule
              </h2>
              <div className="space-y-3">
                {dosing.map((d: any) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
                  >
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                      {d.period}
                    </p>
                    <p className="text-sm font-medium" style={{ color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}>
                      {d.dose}
                    </p>
                    {d.notes && (
                      <p className="text-xs mt-1" style={{ color: "#6e88b0" }}>{d.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reconstitution */}
          {recon && !recon.is_premixed && (
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: "#0f1a2e",
                border: "1px solid #1e3055",
                borderTop: "2px solid #6e88b0",
              }}
            >
              <h2
                className="font-semibold mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                Reconstitution Guide
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  ["Vial Size", recon.vial_size_display],
                  ["Concentration", recon.concentration_display],
                  ["Unit Draw (U100)", recon.unit_calc_display],
                  ["Dose Range", recon.dose_range_display],
                  ["Timing", recon.timing_display],
                  ["Cycle", recon.cycle_length_display],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                      {label}
                    </p>
                    <p className="text-sm" style={{ color: "#ccd9ee", fontFamily: "'DM Mono', monospace" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {recon.reconstitution_steps && recon.reconstitution_steps.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                    Steps
                  </p>
                  <ol className="space-y-2">
                    {recon.reconstitution_steps.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#ccd9ee" }}>
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: "#1e3055", color: "#e8c96e", fontFamily: "'DM Mono', monospace" }}
                        >
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {recon.storage_instructions && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace", color: "#6e88b0" }}>
                    Storage
                  </p>
                  <p className="text-sm" style={{ color: "#ccd9ee" }}>{recon.storage_instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Research Studies */}
          {studies.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055" }}
            >
              <h2
                className="font-semibold mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
              >
                <BookOpen size={16} style={{ color: "#e8c96e" }} />
                Research Studies
              </h2>
              <div className="space-y-3">
                {studies.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: "#142035", border: "1px solid #1e3055" }}
                  >
                    <p className="text-sm font-medium mb-1" style={{ color: "#ccd9ee" }}>{s.title}</p>
                    {s.authors && (
                      <p className="text-xs" style={{ color: "#6e88b0" }}>{s.authors} {s.year ? `(${s.year})` : ""}</p>
                    )}
                    {s.description && (
                      <p className="text-xs mt-2 leading-relaxed" style={{ color: "#6e88b0" }}>{s.description}</p>
                    )}
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs mt-2 inline-block transition-colors"
                        style={{ color: "#e8c96e" }}
                      >
                        View Study →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
