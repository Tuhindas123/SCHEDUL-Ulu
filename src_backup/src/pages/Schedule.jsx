import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Data extracted directly from TimeTable_Autumn2026_v0.7 (1).xls
const INITIAL_SCHEDULE = [
  { id: 1, title: "BCN (AH)", subject: "BCN", semester: "MBA 1st Sem", day: 1, startTime: "09:10", endTime: "10:10", color: "bg-purple-100 text-purple-900 border-purple-200" },
  { id: 2, title: "Floating Slot", subject: "Floating Slot", semester: "MBA 1st Sem", day: 1, startTime: "10:20", endTime: "11:20", color: "bg-sky-100 text-sky-900 border-sky-200" },
  { id: 3, title: "QT (AH)", subject: "QT", semester: "MBA 1st Sem", day: 1, startTime: "11:30", endTime: "12:30", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 4, title: "QT (AH)", subject: "QT", semester: "MBA 1st Sem", day: 1, startTime: "12:30", endTime: "13:30", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 5, title: "ME (AB)", subject: "ME", semester: "MBA 1st Sem", day: 1, startTime: "14:30", endTime: "15:30", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: 6, title: "ME (AB)", subject: "ME", semester: "MBA 1st Sem", day: 1, startTime: "15:30", endTime: "16:30", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: 7, title: "Mentor Mentee Meeting", subject: "Mentor Mentee Meeting", semester: "MBA 1st Sem", day: 1, startTime: "16:30", endTime: "17:30", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  { id: 8, title: "SPL - M - SM (MKS)", subject: "SPL - M - SM", semester: "MBA 3rd Sem", day: 1, startTime: "09:10", endTime: "10:10", color: "bg-rose-100 text-rose-900 border-rose-200" },
  { id: 9, title: "SPL - M - SM (MKS)", subject: "SPL - M - SM", semester: "MBA 3rd Sem", day: 1, startTime: "10:20", endTime: "11:20", color: "bg-rose-100 text-rose-900 border-rose-200" },
  { id: 10, title: "SPL - F - SAPM (AR) / SPL - O - QM (TRS)", subject: "SPL - F - SAPM / SPL - O - QM", semester: "MBA 3rd Sem", day: 1, startTime: "11:30", endTime: "12:30", color: "bg-teal-100 text-teal-900 border-teal-200" },
  { id: 11, title: "SPL - F - SAPM (AR) / SPL - O - QM (TRS)", subject: "SPL - F - SAPM / SPL - O - QM", semester: "MBA 3rd Sem", day: 1, startTime: "12:30", endTime: "13:30", color: "bg-teal-100 text-teal-900 border-teal-200" },
  { id: 12, title: "OR (PrB) / SCM (MD)", subject: "OR / SCM", semester: "MBA 3rd Sem", day: 1, startTime: "14:30", endTime: "15:30", color: "bg-orange-100 text-orange-900 border-orange-200" },
  { id: 13, title: "OR (PrB) / SCM (MD)", subject: "OR / SCM", semester: "MBA 3rd Sem", day: 1, startTime: "15:30", endTime: "16:30", color: "bg-orange-100 text-orange-900 border-orange-200" },
  { id: 14, title: "SPL - F - AFM (AH) / SPL - O - MMIC (PrB)", subject: "SPL - F - AFM / SPL - O - MMIC", semester: "MBA 3rd Sem", day: 1, startTime: "16:30", endTime: "17:30", color: "bg-blue-100 text-blue-900 border-blue-200" },
  { id: 15, title: "Floating Slot", subject: "Floating Slot", semester: "MTTM 1st Sem", day: 1, startTime: "09:10", endTime: "10:10", color: "bg-sky-100 text-sky-900 border-sky-200" },
  { id: 16, title: "DGHH (AB)", subject: "DGHH", semester: "MTTM 1st Sem", day: 1, startTime: "10:20", endTime: "11:20", color: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200" },
  { id: 17, title: "DGHH (AB)", subject: "DGHH", semester: "MTTM 1st Sem", day: 1, startTime: "11:30", endTime: "12:30", color: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200" },
  { id: 18, title: "FT (MKS)", subject: "FT", semester: "MTTM 1st Sem", day: 1, startTime: "12:30", endTime: "13:30", color: "bg-purple-100 text-purple-900 border-purple-200" },
  { id: 19, title: "Class Activity", subject: "Class Activity", semester: "MTTM 1st Sem", day: 1, startTime: "14:30", endTime: "15:30", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 20, title: "Class Activity", subject: "Class Activity", semester: "MTTM 1st Sem", day: 1, startTime: "15:30", endTime: "16:30", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 21, title: "Mentor Mentee Meeting", subject: "Mentor Mentee Meeting", semester: "MTTM 1st Sem", day: 1, startTime: "16:30", endTime: "17:30", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  { id: 22, title: "HM (ND)", subject: "HM", semester: "MTTM 3rd Sem", day: 1, startTime: "10:20", endTime: "11:20", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: 23, title: "HM (ND)", subject: "HM", semester: "MTTM 3rd Sem", day: 1, startTime: "11:30", endTime: "12:30", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: 24, title: "FITCRS (HB)", subject: "FITCRS", semester: "MTTM 3rd Sem", day: 1, startTime: "12:30", endTime: "13:30", color: "bg-rose-100 text-rose-900 border-rose-200" },
  { id: 25, title: "TNEI (ND)", subject: "TNEI", semester: "MTTM 3rd Sem", day: 1, startTime: "14:30", endTime: "15:30", color: "bg-teal-100 text-teal-900 border-teal-200" },
  { id: 26, title: "TNEI (ND)", subject: "TNEI", semester: "MTTM 3rd Sem", day: 1, startTime: "15:30", endTime: "16:30", color: "bg-teal-100 text-teal-900 border-teal-200" },
  { id: 27, title: "Mentor Mentee Meeting", subject: "Mentor Mentee Meeting", semester: "MTTM 3rd Sem", day: 1, startTime: "16:30", endTime: "17:30", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  { id: 28, title: "MF (TC)", subject: "MF", semester: "B.Tech MBA 3rd Sem", day: 1, startTime: "14:30", endTime: "15:30", color: "bg-blue-100 text-blue-900 border-blue-200" },
  { id: 29, title: "MF (RD)", subject: "MF", semester: "MBA 1st Sem", day: 2, startTime: "09:10", endTime: "10:10", color: "bg-blue-100 text-blue-900 border-blue-200" },
  { id: 30, title: "MF (RD)", subject: "MF", semester: "MBA 1st Sem", day: 2, startTime: "10:20", endTime: "11:20", color: "bg-blue-100 text-blue-900 border-blue-200" },
  { id: 31, title: "ME (AB)", subject: "ME", semester: "MBA 1st Sem", day: 2, startTime: "11:30", endTime: "12:30", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: 32, title: "ME (AB)", subject: "ME", semester: "MBA 1st Sem", day: 2, startTime: "12:30", endTime: "13:30", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: 33, title: "BCN (AH)", subject: "BCN", semester: "MBA 1st Sem", day: 2, startTime: "14:30", endTime: "15:30", color: "bg-purple-100 text-purple-900 border-purple-200" },
  { id: 34, title: "OPEN EL / SIP", subject: "OPEN EL / SIP", semester: "MBA 3rd Sem", day: 2, startTime: "09:10", endTime: "10:10", color: "bg-orange-100 text-orange-900 border-orange-200" },
  { id: 35, title: "SPL - M - DM (MD)", subject: "SPL - M - DM", semester: "MBA 3rd Sem", day: 2, startTime: "10:20", endTime: "11:20", color: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200" },
  { id: 36, title: "SPL - M - DM (MD)", subject: "SPL - M - DM", semester: "MBA 3rd Sem", day: 2, startTime: "11:30", endTime: "12:30", color: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200" },
  { id: 37, title: "BECSR (KM)", subject: "BECSR", semester: "MBA 3rd Sem", day: 2, startTime: "12:30", endTime: "13:30", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  { id: 38, title: "OPEN EL", subject: "OPEN EL", semester: "MBA 3rd Sem", day: 2, startTime: "14:30", endTime: "15:30", color: "bg-orange-100 text-orange-900 border-orange-200" },
  { id: 39, title: "St.M (SSS)", subject: "St.M", semester: "MBA 3rd Sem", day: 2, startTime: "15:30", endTime: "16:30", color: "bg-sky-100 text-sky-900 border-sky-200" },
  { id: 40, title: "St.M (SSS)", subject: "St.M", semester: "MBA 3rd Sem", day: 2, startTime: "16:30", endTime: "17:30", color: "bg-sky-100 text-sky-900 border-sky-200" },
  { id: 41, title: "CSR (TC)", subject: "CSR", semester: "SEC/VAC", day: 2, startTime: "09:10", endTime: "10:10", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: 42, title: "BC (AH)", subject: "BC", semester: "SEC/VAC", day: 2, startTime: "15:30", endTime: "16:30", color: "bg-purple-100 text-purple-900 border-purple-200" },
  { id: 43, title: "BC (AH)", subject: "BC", semester: "SEC/VAC", day: 2, startTime: "16:30", endTime: "17:30", color: "bg-purple-100 text-purple-900 border-purple-200" },
  { id: 44, title: "FA (SSS)", subject: "FA", semester: "MBA 1st Sem", day: 3, startTime: "09:10", endTime: "10:10", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 45, title: "OB (PB)", subject: "OB", semester: "MBA 1st Sem", day: 3, startTime: "10:20", endTime: "11:20", color: "bg-rose-100 text-rose-900 border-rose-200" },
  { id: 46, title: "MF (RD)", subject: "MF", semester: "MBA 1st Sem", day: 3, startTime: "11:30", endTime: "12:30", color: "bg-blue-100 text-blue-900 border-blue-200" },
  { id: 47, title: "QT (AH)", subject: "QT", semester: "MBA 1st Sem", day: 3, startTime: "12:30", endTime: "13:30", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 48, title: "ITM (HB)", subject: "ITM", semester: "MBA 1st Sem", day: 3, startTime: "15:30", endTime: "16:30", color: "bg-teal-100 text-teal-900 border-teal-200" },
  { id: 49, title: "ITM (HB)", subject: "ITM", semester: "MBA 1st Sem", day: 3, startTime: "16:30", endTime: "17:30", color: "bg-teal-100 text-teal-900 border-teal-200" },
  { id: 50, title: "FA (SSS)", subject: "FA", semester: "MBA 1st Sem", day: 4, startTime: "09:10", endTime: "10:10", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 51, title: "FA (SSS)", subject: "FA", semester: "MBA 1st Sem", day: 4, startTime: "10:20", endTime: "11:20", color: "bg-indigo-100 text-indigo-900 border-indigo-200" },
  { id: 52, title: "OB (PB)", subject: "OB", semester: "MBA 1st Sem", day: 4, startTime: "11:30", endTime: "12:30", color: "bg-rose-100 text-rose-900 border-rose-200" },
  { id: 53, title: "OB (PB)", subject: "OB", semester: "MBA 1st Sem", day: 4, startTime: "12:30", endTime: "13:30", color: "bg-rose-100 text-rose-900 border-rose-200" },
  { id: 54, title: "BCN (AH)", subject: "BCN", semester: "MBA 1st Sem", day: 5, startTime: "09:10", endTime: "10:10", color: "bg-purple-100 text-purple-900 border-purple-200" },
  { id: 55, title: "ITM (HB)", subject: "ITM", semester: "MBA 1st Sem", day: 5, startTime: "10:20", endTime: "11:20", color: "bg-teal-100 text-teal-900 border-teal-200" },
  { id: 56, title: "ITM (HB)", subject: "ITM", semester: "MBA 1st Sem", day: 5, startTime: "11:30", endTime: "12:30", color: "bg-teal-100 text-teal-900 border-teal-200" }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function Schedule() {
  const [scheduleEvents, setScheduleEvents] = useState(INITIAL_SCHEDULE);
  const [selectedSemester, setSelectedSemester] = useState('MBA 1st Sem');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time live
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Filter options
  const semesters = Array.from(new Set(scheduleEvents.map(e => e.semester))).sort();
  const subjects = Array.from(
    new Set(
      scheduleEvents
        .filter(e => selectedSemester === 'ALL' || e.semester === selectedSemester)
        .map(e => e.subject)
    )
  ).sort();

  // Filtered Events
  const filteredEvents = scheduleEvents.filter(e => {
    const semMatch = selectedSemester === 'ALL' || e.semester === selectedSemester;
    const subjMatch = selectedSubject === 'ALL' || e.subject === selectedSubject;
    return semMatch && subjMatch;
  });

  // Calculate pixel offsets for time grid (9 AM to 6 PM = 540 mins)
  const getEventStyle = (startTime, endTime) => {
    const parseMins = (tStr) => {
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + m;
    };
    const startMins = parseMins(startTime);
    const endMins = parseMins(endTime);
    const gridStart = 9 * 60; // 09:00 AM
    const totalMins = 9 * 60; // 9 hours

    const topPercent = ((startMins - gridStart) / totalMins) * 100;
    const heightPercent = ((endMins - startMins) / totalMins) * 100;

    return {
      top: `${Math.max(0, topPercent)}%`,
      height: `${Math.max(4, heightPercent)}%`
    };
  };

  // Dynamic Excel Timetable Parser
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const timeSlotCols = ['9.10-10.10', '10.20-11.20', '11.30-12.30', '12.30-1.30', '2.30-3.30', '3.30-4.30', '4.30-5.30'];
        const timeMapping = {
          0: ['09:10', '10:10'],
          1: ['10:20', '11:20'],
          2: ['11:30', '12:30'],
          3: ['12:30', '13:30'],
          4: ['14:30', '15:30'],
          5: ['15:30', '16:30'],
          6: ['16:30', '17:30']
        };

        const dayMapping = { 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5 };
        const newEvents = [];
        let currentDay = '';
        let eventId = 1000;

        rows.forEach((row, rIdx) => {
          if (rIdx === 0) return; // Header
          if (row[0]) currentDay = String(row[0]).trim().toUpperCase();
          const dayNum = dayMapping[currentDay];
          if (!dayNum) return;

          const className = row[1] ? String(row[1]).trim() : 'General';

          for (let colIdx = 2; colIdx <= 8; colIdx++) {
            const cellVal = row[colIdx];
            if (!cellVal) continue;
            const title = String(cellVal).replace(/\n/g, ' ').trim();
            if (!title || title.toLowerCase() === 'nan') continue;

            const [sTime, eTime] = timeMapping[colIdx - 2];
            const subj = title.split('(')[0].trim();

            newEvents.push({
              id: eventId++,
              title,
              subject: subj,
              semester: className,
              day: dayNum,
              startTime: sTime,
              endTime: eTime,
              color: "bg-indigo-100 text-indigo-900 border-indigo-200"
            });
          }
        });

        if (newEvents.length > 0) {
          setScheduleEvents(newEvents);
          alert(`Successfully parsed ${newEvents.length} schedule entries!`);
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        alert("Failed to parse Excel file. Please ensure it follows the timetable matrix format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Class Schedule & Timetable
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time semester timetable, floating slots, and custom elective view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Semester Selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setSelectedSubject('ALL');
              }}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Excel Timetable Upload */}
          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition cursor-pointer shadow-sm">
            <Upload className="w-4 h-4" />
            Upload Timetable (.xls)
            <input 
              type="file" 
              accept=".xls,.xlsx" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Timetable Weekly Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/50 text-center text-sm font-semibold text-slate-600 py-3">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" /> TIME
          </div>
          {DAYS.map((d, i) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Timetable Body */}
        <div className="grid grid-cols-6 relative h-[650px] overflow-y-auto">
          {/* Time Axis Column */}
          <div className="border-r border-slate-100 bg-slate-50/30 flex flex-col justify-between py-2 text-xs font-mono text-slate-400 text-center">
            {HOURS.map(h => (
              <div key={h} className="h-12 flex items-center justify-center border-b border-slate-100/50">
                {h}
              </div>
            ))}
          </div>

          {/* Days Slots Grid */}
          {[1, 2, 3, 4, 5].map(dayNum => {
            const dayEvents = filteredEvents.filter(e => e.day === dayNum);
            return (
              <div key={dayNum} className="relative border-r border-slate-100 last:border-r-0 h-full">
                {/* Background Hour Lines */}
                {HOURS.map(h => (
                  <div key={h} className="h-[72px] border-b border-slate-100/60" />
                ))}

                {/* Render Class Cards */}
                {dayEvents.map(evt => {
                  const style = getEventStyle(evt.startTime, evt.endTime);
                  return (
                    <div
                      key={evt.id}
                      style={style}
                      className={`absolute left-1 right-1 p-2 rounded-xl border text-xs shadow-xs transition-all hover:scale-[1.02] hover:z-10 flex flex-col justify-between overflow-hidden ${evt.color}`}
                    >
                      <div>
                        <div className="font-bold line-clamp-2 leading-tight">
                          {evt.title}
                        </div>
                        <div className="text-[10px] opacity-75 mt-0.5 font-medium">
                          {evt.semester}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono opacity-80 mt-1">
                        {evt.startTime} - {evt.endTime}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}