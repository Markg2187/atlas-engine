import { createClient } from "@/lib/supabase/server";
import PeptideGrid from "@/components/peptides/PeptideGrid";
import type { Peptide } from "@/lib/types";

export default async function PeptidesPage() {
  const supabase = await createClient();

  const { data: peptides } = await supabase
    .from("peptides")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const allPeptides = (peptides || []) as Peptide[];
  const categories = [...new Set(allPeptides.map((p) => p.category).filter(Boolean))] as string[];

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
        >
          Peptide Library
        </h1>
        <p className="mt-1 text-base" style={{ color: "#5a6a7a" }}>
          {allPeptides.length} peptides in the Atlas Engine database
        </p>
      </div>

      <PeptideGrid peptides={allPeptides} categories={categories} />
    </div>
  );
}
