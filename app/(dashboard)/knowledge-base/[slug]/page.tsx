import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) notFound();

  const sourceColors: Record<string, string> = {
    substack: "#e8c96e",
    internal: "#54c7a2",
    research: "#6e88b0",
    guide: "#e8b86d",
  };

  const accentColor = sourceColors[article.source_type] || "#e8c96e";

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/knowledge-base"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: "#6e88b0" }}
      >
        <ArrowLeft size={16} />
        Back to Knowledge Base
      </Link>

      {/* Article header */}
      <div
        className="rounded-2xl p-8 mb-6"
        style={{
          backgroundColor: "#0f1a2e",
          border: "1px solid #1e3055",
          borderTop: `2px solid ${accentColor}`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{
              fontFamily: "'DM Mono', monospace",
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}
          >
            {article.source_type}
          </span>
          {article.category && (
            <span className="badge-dim">{article.category}</span>
          )}
        </div>

        <h1
          className="text-3xl font-bold mb-3 leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
        >
          {article.title}
        </h1>

        {article.summary && (
          <p className="text-base leading-relaxed mb-4" style={{ color: "#6e88b0" }}>
            {article.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t" style={{ borderColor: "#1e3055" }}>
          {article.author_name && (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#1e3055", color: "#e8c96e" }}
              >
                {article.author_name[0]}
              </div>
              <span className="text-sm" style={{ color: "#ccd9ee" }}>{article.author_name}</span>
            </div>
          )}
          {article.published_at && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "#6e88b0" }}>
              <Calendar size={13} />
              {format(new Date(article.published_at), "MMMM d, yyyy")}
            </div>
          )}
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm transition-colors ml-auto"
              style={{ color: accentColor }}
            >
              View Original <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{
                fontFamily: "'DM Mono', monospace",
                backgroundColor: "#142035",
                color: "#6e88b0",
                border: "1px solid #1e3055",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Article content */}
      {article.content ? (
        <div
          className="rounded-xl p-8"
          style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055" }}
        >
          <div
            className="prose prose-invert max-w-none"
            style={{
              color: "#ccd9ee",
              lineHeight: "1.8",
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055" }}
        >
          {article.source_url ? (
            <div>
              <p className="text-sm mb-4" style={{ color: "#6e88b0" }}>
                This article is hosted externally. Click below to read the full content.
              </p>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: "#e8c96e", color: "#0b1120" }}
              >
                Read Article <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#6e88b0" }}>
              No content available for this article.
            </p>
          )}
        </div>
      )}

      {/* Related peptides */}
      {article.related_peptide_slugs && article.related_peptide_slugs.length > 0 && (
        <div
          className="mt-6 rounded-xl p-5"
          style={{ backgroundColor: "#0f1a2e", border: "1px solid #1e3055" }}
        >
          <h3
            className="font-semibold mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
          >
            Related Peptides
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.related_peptide_slugs.map((slug: string) => (
              <Link
                key={slug}
                href={`/peptides/${slug}`}
                className="text-sm px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: "rgba(232,201,110,0.1)",
                  color: "#e8c96e",
                  border: "1px solid rgba(232,201,110,0.2)",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {slug.replace(/-/g, " ").toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
