import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const sourceColors: Record<string, { color: string; bg: string; border: string }> = {
  substack: { color: "#e8c96e", bg: "rgba(232,201,110,0.15)", border: "rgba(232,201,110,0.3)" },
  internal: { color: "#54c7a2", bg: "rgba(84,199,162,0.15)", border: "rgba(84,199,162,0.3)" },
  research: { color: "#6e88b0", bg: "rgba(110,136,176,0.15)", border: "rgba(110,136,176,0.3)" },
  guide: { color: "#e8b86d", bg: "rgba(232,184,109,0.15)", border: "rgba(232,184,109,0.3)" },
};

export default async function KnowledgeBasePage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const categories = [...new Set((articles || []).map((a) => a.category).filter(Boolean))];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
          >
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6e88b0" }}>
            {articles?.length ?? 0} articles and guides
          </p>
        </div>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <span
              key={cat}
              className="text-xs px-3 py-1.5 rounded-full cursor-pointer"
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
      )}

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => {
            const sc = sourceColors[article.source_type] || sourceColors.internal;
            return (
              <Link key={article.id} href={`/knowledge-base/${article.slug}`}>
                <div
                  className="rounded-xl p-5 h-full transition-all hover:scale-[1.01] cursor-pointer"
                  style={{
                    backgroundColor: "#0f1a2e",
                    border: "1px solid #1e3055",
                    borderTop: "2px solid #e8c96e",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        backgroundColor: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      {article.source_type}
                    </span>
                    {article.source_url && (
                      <ExternalLink size={14} style={{ color: "#6e88b0" }} />
                    )}
                  </div>

                  <h3
                    className="font-semibold text-base mb-2 leading-snug"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
                  >
                    {article.title}
                  </h3>

                  {article.summary && (
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "#6e88b0" }}>
                      {article.summary.slice(0, 120)}...
                    </p>
                  )}

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags.slice(0, 3).map((tag: string) => (
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

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#1e3055" }}>
                    {article.author_name && (
                      <p className="text-xs" style={{ color: "#6e88b0" }}>
                        {article.author_name}
                      </p>
                    )}
                    {article.published_at && (
                      <p className="text-xs" style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}>
                        {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-xl p-16 text-center"
          style={{
            backgroundColor: "#0f1a2e",
            border: "1px solid #1e3055",
            borderTop: "2px solid #e8c96e",
          }}
        >
          <BookOpen size={40} className="mx-auto mb-4" style={{ color: "#1e3055" }} />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ccd9ee" }}
          >
            No Articles Yet
          </h3>
          <p className="text-sm" style={{ color: "#6e88b0" }}>
            Articles will appear here once published. Add content via the Settings page.
          </p>
        </div>
      )}
    </div>
  );
}
