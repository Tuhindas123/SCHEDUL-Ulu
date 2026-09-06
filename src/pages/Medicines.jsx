import React, { useMemo, useState } from "react";
import { Search, Clock } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import MedicineDetailModal from "@/components/shared/MedicineDetailModal";
import { MEDICINES, getMedStatus } from "@/lib/medicines";

const FILTERS = [
  { key: "all", label: "All pharmacies" },
  { key: "open", label: "Open now" },
  { key: "24h", label: "24-hour" },
  { key: "delivery", label: "Home delivery" },
];

const FALLBACK_IMAGE = "/app_logo_original.png";

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return MEDICINES.filter((m) => {
      if (filter === "open" && !getMedStatus(m).isOpen) return false;
      if (filter === "24h" && !m.open24Hours) return false;
      if (filter === "delivery" && !m.homeDelivery) return false;
      if (term && !m.name.toLowerCase().includes(term)) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [search, filter]);

  const selected = MEDICINES.find((m) => m.id === selectedId) || null;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Medicines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pharmacies near campus, their hours, and who delivers — so you know where to go before you need it.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-2xl border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm font-medium text-foreground">No pharmacies match</p>
            <p className="text-xs mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {visible.map((m) => {
              const { isOpen } = getMedStatus(m);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className="flex items-center gap-3.5 text-left rounded-3xl bg-card border border-border p-3.5 hover:border-foreground/20 transition-colors"
                >
                  <div
                    className="w-14 h-14 rounded-2xl shrink-0 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${m.photoUrl || FALLBACK_IMAGE})` }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                        {m.open24Hours && (
                          <p className="text-xs text-teal-600 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Open 24 hours
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOpen
                            ? "bg-pastel-mint text-pastel-mint-foreground"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {m.emergencyMeds && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          Emergency meds
                        </span>
                      )}
                      {m.homeDelivery && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Home delivery · ~{m.deliveryFeeApprox}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && <MedicineDetailModal pharmacy={selected} onClose={() => setSelectedId(null)} />}
    </AppShell>
  );
}
