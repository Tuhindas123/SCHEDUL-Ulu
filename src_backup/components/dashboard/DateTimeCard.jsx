import React, { useEffect, useState } from "react";

export default function DateTimeCard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekday = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "short" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const [timeValue, meridiem] = time.split(" ");

  return (
    <div className="shrink-0 rounded-3xl bg-sidebar text-white px-5 py-4 flex items-center gap-4 w-fit">
      <div className="text-center leading-none">
        <p className="text-[10px] font-bold tracking-widest text-pastelPink mb-1.5">
          {weekday}
        </p>
        <p className="text-3xl font-heading font-extrabold tabular-nums">{day}</p>
        <p className="text-[10px] text-white/45 mt-1 uppercase tracking-wide">{month}</p>
      </div>

      <div className="w-px h-10 bg-white/10" />

      <div className="leading-none">
        <p className="text-xl font-heading font-bold tabular-nums">
          {timeValue}
          {meridiem && (
            <span className="text-xs font-semibold text-white/50 ml-1">{meridiem}</span>
          )}
        </p>
        <p className="text-[10px] text-white/45 mt-1.5">Local time</p>
      </div>
    </div>
  );
}
