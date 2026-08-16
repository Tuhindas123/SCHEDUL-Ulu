import { supabase } from "@/lib/supabaseClient";

const TABLES = {
  ClassSession: "class_sessions",
  AttendanceRecord: "attendance_records",
  WeeklyPlan: "weekly_plans",
  SyncSetting: "sync_settings",
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

export const supabaseData = { listRows, createRow, updateRow, deleteRow, subscribeToTable };
