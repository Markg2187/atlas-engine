"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClientActionsProps {
  clientId: string;
  clientStatus: string;
  clientName: string;
  client?: any;
}

export default function ClientActions({ clientId, clientStatus, clientName, client }: ClientActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    sex: "",
    weight_lbs: "",
    allergies: "",
  });

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

  function openEditModal() {
    setEditForm({
      first_name: client?.first_name || "",
      last_name: client?.last_name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      date_of_birth: client?.date_of_birth || "",
      sex: client?.sex || "",
      weight_lbs: client?.weight_lbs != null ? String(client.weight_lbs) : "",
      allergies: client?.allergies || "",
    });
    setShowEditModal(true);
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        date_of_birth: editForm.date_of_birth || null,
        sex: editForm.sex || null,
        weight_lbs: editForm.weight_lbs ? parseFloat(editForm.weight_lbs) : null,
        allergies: editForm.allergies || null,
      };
      await supabase.from("clients").update(updates).eq("id", clientId);
      setShowEditModal(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    backgroundColor: "#f5f3ee",
    border: "1px solid #e8e0d0",
    color: "#1a2744",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "#5a6a7a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    marginBottom: "4px",
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Edit Profile button */}
        <button
          onClick={openEditModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
          style={{
            backgroundColor: "rgba(201,151,58,0.1)",
            color: "#c9973a",
            border: "1px solid rgba(201,151,58,0.3)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,151,58,0.18)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,151,58,0.1)")}
        >
          <Edit2 size={13} />
          Edit Profile
        </button>

        <button
          onClick={handleArchive}
          disabled={archiving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
          style={{
            backgroundColor: isArchived ? "rgba(84,199,162,0.1)" : "rgba(110,136,176,0.1)",
            color: isArchived ? "#54c7a2" : "#5a6a7a",
            border: `1px solid ${isArchived ? "#c0dd97" : "#e8e0d0"}`,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              backgroundColor: "rgba(224,90,106,0.08)",
              color: "#e05a6a",
              border: "1px solid rgba(224,90,106,0.25)",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fcebeb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(224,90,106,0.08)")}
          >
            <Trash2 size={13} />
            Delete
          </button>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e8e0d0",
              borderTop: "3px solid #c9973a",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              margin: "16px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Edit2 size={17} style={{ color: "#c9973a" }} />
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744", fontSize: "18px", fontWeight: 700, margin: 0 }}>
                Edit Profile
              </h3>
            </div>

            {/* first_name + last_name side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Email</label>
              <input
                type="text"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Date of Birth</label>
              <input
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Sex</label>
              <select
                value={editForm.sex}
                onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                style={{ ...inputStyle }}
              >
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Weight (lbs)</label>
              <input
                type="number"
                value={editForm.weight_lbs}
                onChange={(e) => setEditForm({ ...editForm, weight_lbs: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Allergies</label>
              <input
                type="text"
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#f5f3ee",
                  color: "#5a6a7a",
                  border: "1px solid #e8e0d0",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8e0d0")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f5f3ee")}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#c9973a",
                  color: "#0b1120",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  opacity: saving ? 0.8 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowDeleteDialog(false); setDeleteConfirm(""); } }}
        >
          <div
            className="rounded-xl p-6 w-full max-w-sm mx-4"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid rgba(224,90,106,0.35)",
              borderTop: "3px solid #e05a6a",
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

            <p className="text-base mb-3 leading-relaxed" style={{ color: "#1a2744" }}>
              You are permanently deleting <strong>{clientName}</strong> and all associated records.
            </p>

            <div
              className="text-sm px-3 py-2 rounded-lg mb-5"
              style={{
                color: "#e05a6a",
                backgroundColor: "rgba(224,90,106,0.08)",
                border: "1px solid rgba(224,90,106,0.2)",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              This cannot be undone.
            </div>

            <label
              className="block text-sm mb-1.5"
              style={{ color: "#5a6a7a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
            >
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-base mb-4 focus:outline-none"
              style={{
                backgroundColor: "#f5f3ee",
                border: `1px solid ${deleteConfirm === "DELETE" ? "#e05a6a" : "#e8e0d0"}`,
                color: "#1a2744",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                letterSpacing: "0.05em",
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(""); }}
                className="flex-1 py-2.5 rounded-lg text-base transition-all"
                style={{
                  backgroundColor: "#f5f3ee",
                  color: "#5a6a7a",
                  border: "1px solid #e8e0d0",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8e0d0")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f5f3ee")}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="flex-1 py-2.5 rounded-lg text-base font-semibold transition-all"
                style={{
                  backgroundColor: deleteConfirm === "DELETE" ? "#e05a6a" : "#fcebeb",
                  color: deleteConfirm === "DELETE" ? "#fff" : "rgba(224,90,106,0.4)",
                  border: "1px solid #f7c1c1",
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
