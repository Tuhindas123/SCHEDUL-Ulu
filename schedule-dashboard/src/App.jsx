import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, Bell, MessageSquare, Search, Plus, Filter, 
  ChevronDown, X, BookOpen, User, LayoutGrid, Settings, Sparkles
} from 'lucide-react';

const SUBJECT_THEMES = {
  Math: 'bg-purple-100/90 text-purple-900 border-l-4 border-purple-400 hover:bg-purple-200/80',
  Art: 'bg-rose-100/90 text-rose-900 border-l-4 border-rose-400 hover:bg-rose-200/80',
  Physics: 'bg-sky-100/90 text-sky-900 border-l-4 border-sky-400 hover:bg-sky-200/80',
  Sport: 'bg-emerald-100/90 text-emerald-900 border-l-4 border-emerald-400 hover:bg-emerald-200/80',
  Default: 'bg-amber-100/90 text-amber-900 border-l-4 border-amber-400 hover:bg-amber-200/80',
};

const DEFAULT_SCHEDULES = {
  "Semester 1": [
    { id: '1', subject: 'Math', day: 1, startTime: '07:30', endTime: '09:00', room: 'Room 201', isCustom: false },
    { id: '2', subject: 'Art', day: 1, startTime: '10:00', endTime: '12:00', room: 'Studio B', isCustom: false },
    { id: '3', subject: 'Physics', day: 2, startTime: '08:00', endTime: '09:30', room: 'Lab 102', isCustom: false },
    { id: '4', subject: 'Sport', day: 3, startTime: '11:00', endTime: '13:00', room: 'Main Gym', isCustom: false },
    { id: '5', subject: 'Math', day: 4, startTime: '06:30', endTime: '08:00', room: 'Room 201', isCustom: false },
    { id: '6', subject: 'Physics', day: 5, startTime: '09:00', endTime: '11:00', room: 'Lab 102', isCustom: false },
  ],
  "Semester 2": [
    { id: '7', subject: 'Physics', day: 1, startTime: '08:00', endTime: '10:00', room: 'Lab 201', isCustom: false },
    { id: '8', subject: 'Math', day: 2, startTime: '09:00', endTime: '11:00', room: 'Room 105', isCustom: false },
    { id: '9', subject: 'Art', day: 4, startTime: '12:00', endTime: '14:00', room: 'Studio A', isCustom: false },
    { id: '10', subject: 'Sport', day: 5, startTime: '07:00', endTime: '08:30', room: 'Field B', isCustom: false },
  ]
};

const DAYS = [
  { id: 1, name: '1-Mon' },
  { id: 2, name: '2-Tue' },
  { id: 3, name: '3-Wed' },
  { id: 4, name: '4-Thu' },
  { id: 5, name: '5-Fri' },
  { id: 6, name: '6-Sat' },
  { id: 7, name: '7-Sun' },
];

const HOURS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export default function App() {
  const [semester, setSemester] = useState('Semester 1');
  const [activeFilter, setActiveFilter] = useState('All');
  const [events, setEvents] = useState(DEFAULT_SCHEDULES['Semester 1']);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    subject: 'Math',
    day: 1,
    startTime: '08:00',
    endTime: '09:30',
    room: 'Room 101'
  });

  useEffect(() => {
    setEvents(DEFAULT_SCHEDULES[semester] || []);
  }, [semester]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const START_MINUTES = 360;
  const TOTAL_MINUTES = 540;

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
  const currentDayIndex = ((currentTime.getDay() + 6) % 7) + 1; 

  const indicatorTopPercent = Math.min(
    Math.max(((currentMinutes - START_MINUTES) / TOTAL_MINUTES) * 100, 0),
    100
  );

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'All') return events;
    return events.filter((e) => e.subject.toLowerCase() === activeFilter.toLowerCase());
  }, [events, activeFilter]);

  const ongoingClassInfo = useMemo(() => {
    const active = events.find((e) => {
      if (e.day !== currentDayIndex) return false;
      const start = timeToMinutes(e.startTime);
      const end = timeToMinutes(e.endTime);
      return currentMinutes >= start && currentMinutes <= end;
    });

    if (!active) return null;

    const remainingMins = Math.ceil(timeToMinutes(active.endTime) - currentMinutes);
    return { ...active, remainingMins };
  }, [events, currentMinutes, currentDayIndex]);

  const handleAddEvent = (e) => {
    e.preventDefault();
    const createdEvent = {
      ...newEvent,
      id: Date.now().toString(),
      day: Number(newEvent.day),
      isCustom: true
    };
    setEvents((prev) => [...prev, createdEvent]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden w-full">
      
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-purple-600 text-white p-2 rounded-xl shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Academia</span>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-semibold transition-colors">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Schedule</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Messages</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 px-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-purple-700">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">Maham</span>
            <span className="text-xs text-slate-400">Student</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400 font-medium">
              Maham &gt; <span className="text-slate-800 font-semibold">Schedule</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select 
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl px-4 py-2 pr-8 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600">
                  <Bell className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 pt-2">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">01-07 January 2025</h1>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
              {['All', 'Math', 'Art', 'Physics', 'Sport'].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveFilter(subject)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeFilter === subject
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-sm hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Event
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-x-auto">
          <div className="min-w-[900px] bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 relative">
            <div className="grid grid-cols-8 border-b border-slate-100 pb-4 mb-4 text-center">
              <div className="text-xs font-semibold text-slate-400">Time</div>
              {DAYS.map((day) => (
                <div key={day.id} className={`text-xs font-bold ${day.id === currentDayIndex ? 'text-purple-600' : 'text-slate-700'}`}>
                  {day.name}
                </div>
              ))}
            </div>

            <div className="relative grid grid-cols-8 h-[600px] divide-x divide-slate-100">
              <div className="flex flex-col justify-between pr-4 py-1 text-right text-xs font-medium text-slate-400">
                {HOURS.map((hour) => (
                  <div key={hour} className="-mt-2.5">{hour}</div>
                ))}
              </div>

              {DAYS.map((day) => (
                <div key={day.id} className="relative h-full">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {HOURS.map((_, idx) => (
                      <div key={idx} className="border-b border-slate-100/60 w-full h-0" />
                    ))}
                  </div>

                  {filteredEvents
                    .filter((e) => e.day === day.id)
                    .map((item) => {
                      const startMins = timeToMinutes(item.startTime);
                      const endMins = timeToMinutes(item.endTime);
                      
                      const top = Math.max(((startMins - START_MINUTES) / TOTAL_MINUTES) * 100, 0);
                      const height = ((endMins - startMins) / TOTAL_MINUTES) * 100;
                      
                      const themeClass = SUBJECT_THEMES[item.subject] || SUBJECT_THEMES.Default;

                      return (
                        <div
                          key={item.id}
                          style={{ top: `${top}%`, height: `${height}%` }}
                          className={`absolute left-1 right-1 p-2.5 rounded-xl shadow-xs border transition-all flex flex-col justify-between z-10 ${themeClass}`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-xs leading-tight">{item.subject}</span>
                              {item.isCustom && (
                                <span className="text-[9px] bg-slate-900/10 text-slate-800 font-bold px-1.5 py-0.5 rounded-md">
                                  Custom
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] opacity-75 mt-0.5">{item.room}</p>
                          </div>
                          <div className="text-[10px] font-semibold opacity-80 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.startTime} - {item.endTime}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}

              {indicatorTopPercent >= 0 && indicatorTopPercent <= 100 && (
                <div
                  style={{ top: `${indicatorTopPercent}%` }}
                  className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                >
                  <div className="w-full border-t-2 border-slate-900 border-dashed opacity-70" />
                  <div className="absolute left-2 -top-3.5 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 pointer-events-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    
                    {ongoingClassInfo && (
                      <span className="bg-purple-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-medium ml-1">
                        {ongoingClassInfo.subject}: {ongoingClassInfo.remainingMins}m left
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Add Custom Event
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newEvent.subject}
                  onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Day</label>
                  <select
                    value={newEvent.day}
                    onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Room / Location</label>
                  <input
                    type="text"
                    value={newEvent.room}
                    onChange={(e) => setNewEvent({ ...newEvent, room: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-xs"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
