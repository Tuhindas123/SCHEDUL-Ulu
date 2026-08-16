import { supabaseData } from "@/lib/supabaseData";

export const api = {
  // CLASS SESSIONS
  getClassSessions: () => supabaseData.listRows("ClassSession", { column: "start_time" }),
  createClassSession: (data) => supabaseData.createRow("ClassSession", data),
  updateClassSession: (id, data) => supabaseData.updateRow("ClassSession", id, data),
  deleteClassSession: (id) => supabaseData.deleteRow("ClassSession", id),

  // ATTENDANCE
  getAttendanceRecords: () =>
    supabaseData.listRows("AttendanceRecord", { column: "date", ascending: false }),
  createAttendanceRecord: (data) => supabaseData.createRow("AttendanceRecord", data),
  updateAttendanceRecord: (id, data) => supabaseData.updateRow("AttendanceRecord", id, data),
  deleteAttendanceRecord: (id) => supabaseData.deleteRow("AttendanceRecord", id),

  // WEEKLY PLAN
  getWeeklyPlans: () => supabaseData.listRows("WeeklyPlan", { column: "week_start_date" }),
  createWeeklyPlan: (data) => supabaseData.createRow("WeeklyPlan", data),
  updateWeeklyPlan: (id, data) => supabaseData.updateRow("WeeklyPlan", id, data),
  deleteWeeklyPlan: (id) => supabaseData.deleteRow("WeeklyPlan", id),

  // SETTINGS
  getSyncSettings: () => supabaseData.listRows("SyncSetting"),
  updateSyncSetting: (id, data) => supabaseData.updateRow("SyncSetting", id, data),

  // Live sync: call with an entity name + callback; returns an unsubscribe fn.
  // Use this in a page's useEffect to auto-refresh when another device
  // (phone or browser) changes the same data.
  subscribe: (entity, onChange) => supabaseData.subscribeToTable(entity, onChange),
};
