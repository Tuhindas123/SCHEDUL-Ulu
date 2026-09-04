import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { api } from "@/api/apiClient";

export default function SubjectManager({ subjects, onSubjectsChange, onClose }) {
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const inputCls =
    "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400";

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const subject = await api.createSubject(name);
      onSubjectsChange((prev) => [...prev, subject].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (error) {
      console.error("Failed to add subject:", error);
      alert("Failed to add subject.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject? Existing schedule and attendance entries keep their history but lose the subject link.")) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteSubject(id);
      onSubjectsChange((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete subject:", error);
      alert("Failed to delete subject.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Manage subjects</h2>
            <p className="text-sm text-muted-foreground mt-1">Add or remove subjects for the semester.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="New subject name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="px-4 rounded-2xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "…" : "Add"}
            </button>
          </div>

          <div className="rounded-2xl border border-border/60 divide-y divide-border/40 max-h-72 overflow-y-auto">
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No subjects yet.</p>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-foreground">{subject.name}</span>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    disabled={deletingId === subject.id}
                    className="text-rose-400 hover:text-rose-600 disabled:opacity-50 transition-colors"
                    title="Delete subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
