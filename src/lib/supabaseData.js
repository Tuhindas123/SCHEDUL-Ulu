import { supabase } from "@/lib/supabaseClient";

const TABLES = {
  ClassSession: "class_sessions",
  AttendanceRecord: "attendance_records",
  WeeklyPlan: "weekly_plans",
  SyncSetting: "sync_settings",
  Subject: "subjects",
  Profile: "profiles",
  Section: "sections",
  Enrollment: "enrollments",
  Notification: "notifications",
};

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Not signed in.");
  return data.user.id;
}

async function listRows(entity, orderBy) {
  const table = TABLES[entity];
  let query = supabase.from(table).select("*");
  if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function createRow(entity, values) {
  const table = TABLES[entity];
  const user_id = await currentUserId();
  const { data, error } = await supabase
    .from(table)
    .insert({ ...values, user_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateRow(entity, id, values) {
  const table = TABLES[entity];
  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteRow(entity, id) {
  const table = TABLES[entity];
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

// Subscribes to live inserts/updates/deletes on a table so multiple
// devices (web + app) stay in sync without a manual refresh.
// Returns an unsubscribe function.
function subscribeToTable(entity, onChange) {
  const table = TABLES[entity];
  const channel = supabase
    .channel(`${table}-changes`)
    .on("postgres_changes", { event: "*", schema: "public", table }, onChange)
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ============ ERP: roles, sections, rosters ============

// The signed-in person's profile row (role: student / teacher / admin).
async function getMyProfile() {
  const user_id = await currentUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user_id)
    .single();
  if (error) throw error;
  return data;
}

// Teachers/admins get the sections they teach.
// Students get the sections they're enrolled in (via the enrollments
// -> sections foreign key, so Supabase can embed it in one query).
async function getMySections() {
  const user_id = await currentUserId();
  const profile = await getMyProfile();

  if (profile.role === "teacher" || profile.role === "admin") {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("teacher_id", user_id)
      .order("name");
    if (error) throw error;
    return data || [];
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select("section_id, sections(*)")
    .eq("user_id", user_id);
  if (error) throw error;
  return (data || []).map((row) => row.sections).filter(Boolean);
}

// The list of students enrolled in a section, for the teacher's
// roll-call screen. Two queries (enrollments, then profiles) since
// enrollments and profiles don't have a direct foreign key between
// them (both point at auth.users separately) — Supabase can't
// auto-embed across that gap.
async function getRoster(sectionId) {
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("user_id")
    .eq("section_id", sectionId);
  if (enrollError) throw enrollError;

  const userIds = (enrollments || []).map((e) => e.user_id);
  if (userIds.length === 0) return [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);
  if (profileError) throw profileError;

  return profiles || [];
}

// Teacher submits one status per student for a section/date in one go.
// entries: [{ user_id, status }]
async function markAttendanceBulk(sectionId, date, sessionTitle, entries) {
  const marked_by = await currentUserId();
  const rows = entries.map((entry) => ({
    user_id: entry.user_id,
    section_id: sectionId,
    date,
    status: entry.status,
    session_title: sessionTitle || "Class session",
    marked_by,
  }));
  const { data, error } = await supabase
    .from("attendance_records")
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

async function getMyNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ ERP: admin tools ============

// Every profile — "read all profiles" is open to any signed-in user,
// so this works for both the admin's People list and the teacher
// dropdown when creating a section.
async function listAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  if (error) throw error;
  return data || [];
}

// Admin-only in practice: RLS only allows this update to go through
// if the caller is an admin (see schema_v2_admin_patch.sql). A
// non-admin calling this will get an RLS error, not silently succeed.
async function setUserRole(userId, role) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// All sections (admin view) vs. just-mine is handled by getMySections();
// this one is for the admin's "every section" list, with each
// section's teacher name attached. Two-step lookup — same reason as
// getRoster() above: sections.teacher_id and profiles.user_id both
// point at auth.users separately, with no direct FK between the two
// tables for PostgREST to embed across.
async function listAllSections() {
  const { data: sections, error } = await supabase
    .from("sections")
    .select("*")
    .order("name");
  if (error) throw error;
  if (!sections?.length) return [];

  const teacherIds = [...new Set(sections.map((s) => s.teacher_id))];
  const { data: teachers, error: teacherError } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", teacherIds);
  if (teacherError) throw teacherError;

  const nameById = Object.fromEntries((teachers || []).map((t) => [t.user_id, t.full_name]));
  return sections.map((s) => ({ ...s, teacher_name: nameById[s.teacher_id] || "Unassigned" }));
}

async function createSection(name, department, teacherId) {
  const resolvedTeacherId = teacherId || (await currentUserId());
  const { data, error } = await supabase
    .from("sections")
    .insert({ name, department, teacher_id: resolvedTeacherId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteSection(sectionId) {
  const { error } = await supabase.from("sections").delete().eq("id", sectionId);
  if (error) throw error;
  return { ok: true };
}

// Roster WITH each row's enrollment id, so the admin/teacher UI can
// remove a specific enrollment (getRoster() above intentionally only
// returns profile info, for the read-only teacher roll-call screen).
// Two-step, same reason as getRoster(): no direct FK from enrollments
// to profiles for PostgREST to embed across.
async function getEnrollmentsForSection(sectionId) {
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("id, user_id")
    .eq("section_id", sectionId);
  if (error) throw error;
  if (!enrollments?.length) return [];

  const userIds = enrollments.map((e) => e.user_id);
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds);
  if (profileError) throw profileError;

  const nameById = Object.fromEntries((profiles || []).map((p) => [p.user_id, p.full_name]));
  return enrollments.map((e) => ({
    enrollment_id: e.id,
    user_id: e.user_id,
    full_name: nameById[e.user_id] || "Unnamed student",
  }));
}

async function enrollStudent(sectionId, userId) {
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ section_id: sectionId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function unenroll(enrollmentId) {
  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);
  if (error) throw error;
  return { ok: true };
}

export const supabaseData = {
  listRows,
  createRow,
  updateRow,
  deleteRow,
  subscribeToTable,
  getMyProfile,
  getMySections,
  getRoster,
  markAttendanceBulk,
  getMyNotifications,
  listAllProfiles,
  setUserRole,
  listAllSections,
  createSection,
  deleteSection,
  getEnrollmentsForSection,
  enrollStudent,
  unenroll,
};