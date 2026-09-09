import React, { useEffect, useMemo, useState } from "react";
import { Users, BookOpen, UserPlus, Trash2, ShieldAlert } from "lucide-react";

import { api } from "@/api/apiClient";
import { classifyEmail } from "@/lib/emailClassifier";
import AppShell from "@/components/layout/AppShell";
import { usePreviewRole } from "@/contexts/PreviewRoleContext";

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400";

const ROLE_CHIP = {
  admin: "bg-rose-100 text-rose-700",
  teacher: "bg-teal-100 text-teal-700",
  student: "bg-slate-100 text-slate-600",
};

export default function Admin() {
  const { effectiveRole: role, loading } = usePreviewRole();
  const [tab, setTab] = useState("sections");

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (role === "student") {
    return (
      <AppShell>
        <div className="rounded-3xl bg-card border border-border/60 p-10 text-center max-w-md mx-auto mt-10">
          <ShieldAlert className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">This page is for teachers and admins</p>
          <p className="text-sm text-muted-foreground mt-1">You don't need anything here as a student.</p>
        </div>
      </AppShell>
    );
  }

  const tabs = [
    { key: "sections", label: "Sections", icon: BookOpen },
    { key: "enrollments", label: "Enrollments", icon: UserPlus },
    ...(role === "admin" ? [{ key: "people", label: "People", icon: Users }] : []),
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "admin" ? "Manage roles, sections, and enrollments." : "Manage your sections and their rosters."}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.key ? "bg-pink-500 text-white" : "bg-card border border-border/60 text-muted-foreground hover:bg-[hsl(var(--muted))]"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "sections" && <SectionsTab role={role} />}
        {tab === "enrollments" && <EnrollmentsTab role={role} />}
        {tab === "people" && role === "admin" && <PeopleTab />}
      </div>
    </AppShell>
  );
}

// ============ PEOPLE (admin only) ============
const SUBTABS = [
  { key: "teacher", label: "Faculty" },
  { key: "student", label: "Students" },
  { key: "admin", label: "Office / Admin" },
];

function Avatar({ name, url }) {
  if (url) return <img src={url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />;
  const initials = (name || "?").trim().slice(0, 1).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 grid place-items-center font-semibold shrink-0">
      {initials}
    </div>
  );
}

function PeopleTab() {
  const [subtab, setSubtab] = useState("teacher");
  const [people, setPeople] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // add-by-email form state
  const [email, setEmail] = useState("");
  const [guessedRole, setGuessedRole] = useState(null);
  const [guessReason, setGuessReason] = useState("");
  const [chosenRole, setChosenRole] = useState("student");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [profiles, directory] = await Promise.all([api.listAllProfiles(), api.listRoleDirectory()]);
      setPeople(profiles);
      // "pending" = pre-registered by email but nobody with that email has logged in yet
      const activeEmails = new Set(profiles.map((p) => p.email).filter(Boolean));
      setPending(directory.filter((d) => !activeEmails.has(d.email)));
    } catch (err) {
      console.error("Failed to load people:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId, role) => {
    try {
      setSavingId(userId);
      await api.setUserRole(userId, role);
      await load();
    } catch (err) {
      console.error("Failed to change role:", err);
      alert("Couldn't change that person's role.");
    } finally {
      setSavingId(null);
    }
  };

  const onEmailChange = (value) => {
    setEmail(value);
    const guess = classifyEmail(value);
    setGuessedRole(guess.role);
    setGuessReason(guess.reason);
    if (guess.role) setChosenRole(guess.role);
  };

  const addByEmail = async () => {
    if (!email.trim()) return;
    try {
      setAdding(true);
      await api.addRoleDirectoryEntry(email, chosenRole);
      setEmail(""); setGuessedRole(null); setGuessReason(""); setChosenRole("student");
      await load();
    } catch (err) {
      console.error("Failed to add person:", err);
      alert("Couldn't add that email. Check it's a valid address and try again.");
    } finally {
      setAdding(false);
    }
  };

  const removePending = async (email) => {
    try { await api.removeRoleDirectoryEntry(email); await load(); }
    catch (err) { console.error("Failed to remove:", err); }
  };

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading people…</p>;

  const shown = people.filter((p) => p.role === subtab);
  const shownPending = pending.filter((p) => p.role === subtab);

  return (
    <div className="space-y-5">
      {/* Add by email */}
      <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Add a person by email</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className={inputCls}
            placeholder="e.g. bam25058@tezu.ac.in"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
          <select
            className="rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm"
            value={chosenRole}
            onChange={(e) => setChosenRole(e.target.value)}
          >
            <option value="student">student</option>
            <option value="teacher">teacher</option>
            <option value="admin">admin</option>
          </select>
          <button
            className="rounded-2xl bg-pink-600 text-white px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            disabled={adding || !email.trim()}
            onClick={addByEmail}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
        {email && (
          <p className="text-xs text-muted-foreground">
            {guessedRole ? `Guessed role: ${guessedRole}. ` : ""}{guessReason} They'll get this role automatically the first time they sign in.
          </p>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubtab(t.key)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
              subtab === t.key ? "bg-pink-600 text-white" : "bg-card border border-border/60 text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending (registered by email, not yet logged in) */}
      {shownPending.length > 0 && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 divide-y divide-amber-200">
          <p className="px-5 py-2.5 text-xs font-semibold text-amber-700">Waiting for first login</p>
          {shownPending.map((p) => (
            <div key={p.email} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{p.full_name || p.email}</p>
                <p className="text-xs text-muted-foreground truncate">{p.email}</p>
              </div>
              <button className="text-xs text-amber-700 hover:underline" onClick={() => removePending(p.email)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Registered people in this sub-tab */}
      <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Nobody here yet.</p>
        ) : (
          shown.map((person) => (
            <div key={person.user_id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={person.full_name} url={person.avatar_url} />
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{person.full_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                </div>
              </div>
              <select
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm"
                value={person.role}
                disabled={savingId === person.user_id}
                onChange={(e) => changeRole(person.user_id, e.target.value)}
              >
                <option value="student">student</option>
                <option value="teacher">teacher</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============ SECTIONS ============
function SectionsTab({ role }) {
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", department: "", teacherId: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = role === "admin" ? await api.listAllSections() : await api.getMySections();
      setSections(data || []);
      if (role === "admin") {
        const people = await api.listAllProfiles();
        setTeachers(people.filter((p) => p.role === "teacher" || p.role === "admin"));
      }
    } catch (err) {
      console.error("Failed to load sections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name) return;
    try {
      setSaving(true);
      // Admin picks who teaches it; a teacher creating their own
      // section is always the teacher themselves.
      const teacherId = role === "admin" ? form.teacherId : undefined;
      await api.createSection(form.name, form.department, teacherId || undefined);
      setForm({ name: "", department: "", teacherId: "" });
      await load();
    } catch (err) {
      console.error("Failed to create section:", err);
      alert("Couldn't create that section.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (sectionId) => {
    if (!confirm("Delete this section? This also removes its enrollments and attendance history.")) return;
    try {
      await api.deleteSection(sectionId);
      await load();
    } catch (err) {
      console.error("Failed to delete section:", err);
      alert("Couldn't delete that section.");
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="rounded-3xl bg-card border border-border/60 p-5 space-y-3">
        <p className="text-sm font-semibold text-foreground">New section</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className={inputCls}
            placeholder="Section name (e.g. CSE 3rd Year A)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Department (optional)"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
          {role === "admin" ? (
            <select
              className={inputCls}
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            >
              <option value="">Assign a teacher…</option>
              {teachers.map((t) => (
                <option key={t.user_id} value={t.user_id}>{t.full_name || t.user_id}</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center text-xs text-muted-foreground px-1">You'll be the teacher for this section.</div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !form.name || (role === "admin" && !form.teacherId)}
            className="px-4 py-2.5 rounded-2xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating…" : "Create section"}
          </button>
        </div>
      </form>

      <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading sections…</p>
        ) : sections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">No sections yet — create one above.</p>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{section.name}</p>
                <p className="text-xs text-muted-foreground">
                  {section.department || "No department"}
                  {role === "admin" ? ` · Taught by ${section.teacher_name}` : ""}
                </p>
              </div>
              <button onClick={() => remove(section.id)} className="text-rose-400 hover:text-rose-600 transition-colors shrink-0" title="Delete section">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============ ENROLLMENTS ============
function EnrollmentsTab({ role }) {
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [roster, setRoster] = useState([]);
  const [students, setStudents] = useState([]);
  const [addingId, setAddingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = role === "admin" ? await api.listAllSections() : await api.getMySections();
        setSections(data || []);
        if (role === "admin") {
          const people = await api.listAllProfiles();
          setStudents(people.filter((p) => p.role === "student"));
        }
      } catch (err) {
        console.error("Failed to load sections:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  const loadRoster = async (id) => {
    if (!id) { setRoster([]); return; }
    try {
      setRoster(await api.getEnrollmentsForSection(id));
    } catch (err) {
      console.error("Failed to load roster:", err);
    }
  };

  useEffect(() => { loadRoster(sectionId); }, [sectionId]);

  const enrolledIds = useMemo(() => new Set(roster.map((r) => r.user_id)), [roster]);
  const availableStudents = students.filter((s) => !enrolledIds.has(s.user_id));

  const addStudent = async () => {
    if (!sectionId || !addingId) return;
    try {
      setBusy(true);
      await api.enrollStudent(sectionId, addingId);
      setAddingId("");
      await loadRoster(sectionId);
    } catch (err) {
      console.error("Failed to enroll student:", err);
      alert("Couldn't enroll that student.");
    } finally {
      setBusy(false);
    }
  };

  const removeStudent = async (enrollmentId) => {
    try {
      setBusy(true);
      await api.unenroll(enrollmentId);
      await loadRoster(sectionId);
    } catch (err) {
      console.error("Failed to remove student:", err);
      alert("Couldn't remove that student.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-card border border-border/60 p-5">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Section</label>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sections yet — create one in the Sections tab first.</p>
        ) : (
          <select className={inputCls} value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            <option value="">Choose a section…</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {sectionId && (
        <>
          {role === "admin" && (
            <div className="rounded-3xl bg-card border border-border/60 p-5">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Add a student</label>
              <div className="flex gap-2">
                <select className={inputCls} value={addingId} onChange={(e) => setAddingId(e.target.value)}>
                  <option value="">Choose a student…</option>
                  {availableStudents.map((s) => <option key={s.user_id} value={s.user_id}>{s.full_name || s.user_id}</option>)}
                </select>
                <button
                  onClick={addStudent}
                  disabled={!addingId || busy}
                  className="px-4 py-2.5 rounded-2xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-card border border-border/60 shadow-sm divide-y divide-border/40">
            {roster.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">No students enrolled yet.</p>
            ) : (
              roster.map((student) => (
                <div key={student.enrollment_id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <p className="font-medium text-foreground truncate">{student.full_name}</p>
                  <button
                    onClick={() => removeStudent(student.enrollment_id)}
                    disabled={busy}
                    className="text-rose-400 hover:text-rose-600 transition-colors shrink-0"
                    title="Remove from section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}