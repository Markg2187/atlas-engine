"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClientActionsProps {
  clientId: string;
  clientStatus: string;
  clientName: string;
}

export default function ClientActions({ clientId, clientStatus, clientName }: ClientActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(data?.role ?? null);
    }
    getRole();
  }, []);

  async function handleArchive() {
    setArchiving(true);
    const newStatus = clientStatus === "archived" ? "active" : "archived";
    await supabase.from("clients").update({ status: newStatus }).eq("id", clientId);
    setArchiving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    await supabase.from("clients").delete().eq("id", clientId);
    router.push("/clients");
  }

  const isArchived = clientStatus === "archived";

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleArchive}
          disabled={archiving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
          style={{
            backgroundColor: isArchived ? "rgba(84,199,162,0.1)" : "rgba(110,136,176,0.1)",
            color: isArchived ? "#54c7a2" : "#6e88b0",
            border: `1px solid ${isArchived ? "rgba(84,199,162,0.3)" : "rgba(110,136,176,0.3)"}`,
            fontFamily: "'DM Mono', monospace",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          {archiving ? "..." : isArchived ? "Unarchive" : "Archive"}
        </button>

        {role === "super_admin" && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
            style={{
              backgroundColor: "rgba(224,90,106,0.08)",
              color: "#e05a6a",
              border: "1px solid rgba(224,90,106,0.25)",
              fontFamily: "'DM Mono', monospace",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,90,106,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,90,106,0.08)")}
          >
            <Trash2 size={13} />
            Delete
          </button>
        )}
      </div>

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteDialog(false); setDeleteConfirm(""); } }}
        >
          <div
            className="rounded-xl p-6 w-full max-w-sm mx-4"
            style={{
              backgroundColor: "#0f1a2e",
              border: "1px solid rgba(224,90,106,0.35)",
              borderTop: "2px solid #e05a6a",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trash2 size={17} style={{ color: "#e05a6a" }} />
              <h3
                className="font-bold text-base"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#e05a6a" }}
              >
                Delete Client
              </h3>
            </div>

            <p className="text-sm mb-3 leading-relaxed" style={{ color: "#ccd9ee" }}>
              You are permanently deleting <strong>{clientName}</strong> and all associated records.
            </p>

            <div
              className="text-xs px-3 py-2 rounded-lg mb-5"
              style={{
                color: "#e05a6a",
                backgroundColor: "rgba(224,90,106,0.08)",
                border: "1px solid rgba(224,90,106,0.2)",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              This cannot be undone.
            </div>

            <label
              className="block text-xs mb-1.5"
              style={{ color: "#6e88b0", fontFamily: "'DM Mono', monospace" }}
            >
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-sm mb-4 focus:outline-none"
              style={{
                backgroundColor: "#142035",
                border: `1px solid ${deleteConfirm === "DELETE" ? "#e05a6a" : "#1e3055"}`,
                color: "#ccd9ee",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.05em",
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(""); }}
                className="flex-1 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: "#142035",
                  color: "#6e88b0",
                  border: "1px solid #1e3055",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e3055")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#142035")}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: deleteConfirm === "DELETE" ? "#e05a6a" : "rgba(224,90,106,0.15)",
                  color: deleteConfirm === "DELETE" ? "#fff" : "rgba(224,90,106,0.4)",
                  border: "1px solid rgba(224,90,106,0.3)",
                  cursor: deleteConfirm === "DELETE" ? "pointer" : "not-allowed",
                }}
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
