import React from "react";
import { MapPin, Clock, BookOpen, FlaskConical, Users, Video, GraduationCap, Wrench, Calendar } from "lucide-react";
import { COLOR_TAGS, TYPE_ICONS, formatTime, TYPE_LABELS } from "@/lib/studentUtils";

const ICONS = { BookOpen, FlaskConical, Users, Video, GraduationCap, Wrench, Calendar };

export default function TodaySchedule({ sessions, todayLabel }) {
  return (
    <div className="rounded-3xl bg-card p-6 border border-border/60 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Today{todayLabel ? ` · ${todayLabel}` : ""}</h3>
        <span className="text-xs text-muted-foreground">{sessions.length} class{sessions.length !== 1 ? "es" : ""}</span>
      </div>
      {sessions.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-sm text-muted-foreground">Nothing scheduled today. Enjoy the breather!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const tag = COLOR_TAGS[s.color_tag] || COLOR_TAGS.violet;
            const Icon = ICONS[TYPE_ICONS[s.type] || "Calendar"] || Calendar;
            return (
              <div key={s.id} className="flex items-stretch gap-3">
                <div className={`w-1.5 rounded-full ${tag.dot}`} />
                <div className="flex-1 rounded-2xl bg-[hsl(var(--muted))] px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{s.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(s.start_time)}–{formatTime(s.end_time)}</span>
                        {s.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>}
                        <span className={`px-1.5 py-0.5 rounded-md ${tag.bg} ${tag.text} font-medium`}>{TYPE_LABELS[s.type] || s.type}</span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${tag.bg} ${tag.text}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}