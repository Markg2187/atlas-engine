import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const sourceColors: Record<string, { color: string; bg: string; border: string }> = {
  substack: { color: "#c9973a", bg: "rgba(201,151,58,0.15)", border: "rgba(201,151,58,0.3)" },
  internal: { color: "#54c7a2", bg: "#eaf3de", border: "#c0dd97" },
  research: { color: "#5a6a7a", bg: "#f5f3ee", border: "#e8e0d0" },
  guide: { color: "#e8b86d", bg: "#faeeda", border: "#fac775" },
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
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
          >
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#5a6a7a" }}>
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
                backgroundColor: "rgba(232,224,208,0.5)",
                color: "#5a6a7a",
                border: "1px solid #e8e0d0",
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
                    backgroundColor: "#ffffff",
                    border: "1px solid #e8e0d0",
                    borderTop: "3px solid #c9973a",
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
                      <ExternalLink size={14} style={{ color: "#5a6a7a" }} />
                    )}
                  </div>

                  <h3
                    className="font-semibold text-base mb-2 leading-snug"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
                  >
                    {article.title}
                  </h3>

                  {article.summary && (
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "#5a6a7a" }}>
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
                            backgroundColor: "#f5f3ee",
                            color: "#5a6a7a",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#e8e0d0" }}>
                    {article.author_name && (
                      <p className="text-xs" style={{ color: "#5a6a7a" }}>
                        {article.author_name}
                      </p>
                    )}
                    {article.published_at && (
                      <p className="text-xs" style={{ color: "#5a6a7a", fontFamily: "'DM Mono', monospace" }}>
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
            backgroundColor: "#ffffff",
            border: "1px solid #e8e0d0",
            borderTop: "3px solid #c9973a",
          }}
        >
          <BookOpen size={40} className="mx-auto mb-4" style={{ color: "#e8e0d0" }} />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#0f1a2e" }}
          >
            No Articles Yet
          </h3>
          <p className="text-sm" style={{ color: "#5a6a7a" }}>
            Articles will appear here once published. Add content via the Settings page.
          </p>
        </div>
      )}
    </div>
  );
}
