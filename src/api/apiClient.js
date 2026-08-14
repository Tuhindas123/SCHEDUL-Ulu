import { sheetsApi } from "@/lib/sheetsClient";

export const api = {
  // CLASS SESSIONS
  getClassSessions: () => sheetsApi.listRows("ClassSession"),
  createClassSession: (data) => sheetsApi.createRow("ClassSession", data),
  updateClassSession: (id, data) => sheetsApi.updateRow("ClassSession", id, data),
  deleteClassSession: (id) => sheetsApi.deleteRow("ClassSession", id),

  // ATTENDANCE
  getAttendanceRecords: () => sheetsApi.listRows("AttendanceRecord"),
  createAttendanceRecord: (data) => sheetsApi.createRow("AttendanceRecord", data),
  updateAttendanceRecord: (id, data) => sheetsApi.updateRow("AttendanceRecord", id, data),
  deleteAttendanceRecord: (id) => sheetsApi.deleteRow("AttendanceRecord", id),

  // WEEKLY PLAN
  getWeeklyPlans: () => sheetsApi.listRows("WeeklyPlan"),
  createWeeklyPlan: (data) => sheetsApi.createRow("WeeklyPlan", data),
  updateWeeklyPlan: (id, data) => sheetsApi.updateRow("WeeklyPlan", id, data),
  deleteWeeklyPlan: (id) => sheetsApi.deleteRow("WeeklyPlan", id),

  // SETTINGS — no longer needed (sheet auto-managed), keep harmless stub
  getSyncSettings: async () => [],
  updateSyncSetting: async () => ({}),
};