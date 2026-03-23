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
    substack: "#c9973a",
    internal: "#54c7a2",
    research: "#5a6a7a",
    guide: "#e8b86d",
  };

  const accentColor = sourceColors[article.source_type] || "#c9973a";

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/knowledge-base"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: "#5a6a7a" }}
      >
        <ArrowLeft size={16} />
        Back to Knowledge Base
      </Link>

      {/* Article header */}
      <div
        className="rounded-2xl p-8 mb-6"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e8e0d0",
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
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
        >
          {article.title}
        </h1>

        {article.summary && (
          <p className="text-base leading-relaxed mb-4" style={{ color: "#5a6a7a" }}>
            {article.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t" style={{ borderColor: "#e8e0d0" }}>
          {article.author_name && (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#e8e0d0", color: "#c9973a" }}
              >
                {article.author_name[0]}
              </div>
              <span className="text-sm" style={{ color: "#0f1a2e" }}>{article.author_name}</span>
            </div>
          )}
          {article.published_at && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "#5a6a7a" }}>
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
                backgroundColor: "#f5f3ee",
                color: "#5a6a7a",
                border: "1px solid #e8e0d0",
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
          style={{ backgroundColor: "#ffffff", border: "1px solid #e8e0d0" }}
        >
          <div
            className="prose prose-invert max-w-none"
            style={{
              color: "#0f1a2e",
              lineHeight: "1.8",
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e8e0d0" }}
        >
          {article.source_url ? (
            <div>
              <p className="text-sm mb-4" style={{ color: "#5a6a7a" }}>
                This article is hosted externally. Click below to read the full content.
              </p>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: "#c9973a", color: "#0b1120" }}
              >
                Read Article <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#5a6a7a" }}>
              No content available for this article.
            </p>
          )}
        </div>
      )}

      {/* Related peptides */}
      {article.related_peptide_slugs && article.related_peptide_slugs.length > 0 && (
        <div
          className="mt-6 rounded-xl p-5"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e8e0d0" }}
        >
          <h3
            className="font-semibold mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
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
                  backgroundColor: "rgba(201,151,58,0.1)",
                  color: "#c9973a",
                  border: "1px solid rgba(201,151,58,0.2)",
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
