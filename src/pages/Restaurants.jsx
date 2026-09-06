import React, { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import RestaurantDetailModal from "@/components/shared/RestaurantDetailModal";
import { RESTAURANTS, getStatus, initialsOf } from "@/lib/restaurants";

const FILTERS = [
  { key: "all", label: "All places" },
  { key: "open", label: "Open now" },
  { key: "delivery", label: "Hostel delivery" },
];

export default function Restaurants() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

    const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return RESTAURANTS.filter((r) => {
      if (filter === "open" && !getStatus(r).isOpen) return false;
      if (filter === "delivery" && !r.hostelDelivery) return false;
      if (term && !`${r.name} ${r.cuisine}`.toLowerCase().includes(term)) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [search, filter]);

  const selected = RESTAURANTS.find((r) => r.id === selectedId) || null;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Restaurants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Numbers, hours and hostel delivery for places near campus — so you know who's open before you call.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or cuisine"
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
            <p className="text-sm font-medium text-foreground">No places match</p>
            <p className="text-xs mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {visible.map((r) => {
              const { isOpen } = getStatus(r);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className="flex items-center gap-3.5 text-left rounded-3xl bg-card border border-border p-3.5 hover:border-foreground/20 transition-colors"
                >
                  <div
                    className="w-14 h-14 rounded-2xl shrink-0 grid place-items-center font-heading font-bold text-white text-base"
                    style={{
                      background: r.photoUrl ? undefined : r.accent,
                      backgroundImage: r.photoUrl ? `url(${r.photoUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!r.photoUrl && initialsOf(r.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.cuisine}</p>
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
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Star className="w-3 h-3 fill-current text-pastel-yellow-foreground" />
                        {r.rating.toFixed(1)}
                        <span className="text-muted-foreground font-normal">({r.reviewCount})</span>
                      </span>
                      {r.hostelDelivery && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Hostel delivery · ~{r.deliveryFeeApprox}
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

      {selected && <RestaurantDetailModal restaurant={selected} onClose={() => setSelectedId(null)} />}
    </AppShell>
  );
}
