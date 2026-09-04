import React, { useEffect, useState } from "react";

export default function DateTimeCard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = now.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="shrink-0 text-left sm:text-right">
      <p className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wide">
        {weekday}
      </p>
      <p className="text-2xl font-heading font-extrabold text-foreground leading-tight mt-0.5">
        {dateLabel}
      </p>
      <p className="text-5xl font-heading font-extrabold tabular-nums text-foreground mt-1 leading-none tracking-tight">
        {time}
      </p>
    </div>
  );
}
