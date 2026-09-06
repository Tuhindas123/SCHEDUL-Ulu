import React from "react";
import { X, Star, MapPin, Phone, Bike, Navigation } from "lucide-react";
import { getStatus, formatTime12 } from "@/lib/restaurants";

export default function RestaurantDetailModal({ restaurant, onClose }) {
  if (!restaurant) return null;
  const { isOpen } = getStatus(restaurant);
  const mapEmbedSrc = `https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-xl">
        {/* Hero */}
        <div
          className="relative h-36 flex items-end p-5"
          style={{
            background: restaurant.photoUrl
              ? `url(${restaurant.photoUrl}) center/cover`
              : restaurant.accent,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-t-3xl" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/45 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative z-10">
            <h2 className="text-xl font-heading font-bold text-white leading-tight">{restaurant.name}</h2>
            <p className="text-white/75 text-xs mt-0.5">{restaurant.cuisine}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + rating */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                isOpen
                  ? "bg-pastel-mint text-pastel-mint-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isOpen ? `Open now · closes ${formatTime12(restaurant.closesAt)}` : `Closed · opens ${formatTime12(restaurant.opensAt)}`}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Star className="w-3.5 h-3.5 fill-current text-pastel-yellow-foreground" />
              {restaurant.rating.toFixed(1)}
              <span className="text-muted-foreground font-normal">({restaurant.reviewCount} Google reviews)</span>
            </span>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Location</p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-foreground flex items-start gap-2 max-w-[22ch]">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                {restaurant.address}
              </p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-2xl bg-primary text-primary-foreground whitespace-nowrap"
              >
                <Navigation className="w-3.5 h-3.5" />
                Directions
              </a>
            </div>
            <iframe
              title={`Map for ${restaurant.name}`}
              src={mapEmbedSrc}
              className="w-full h-36 rounded-2xl border border-border mt-3"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Contact</p>
            <div className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Owner</p>
                  <p className="text-sm font-semibold text-foreground">{restaurant.ownerName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Phone</p>
                  <p className="text-sm font-semibold text-foreground">{restaurant.phone}</p>
                </div>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-2xl border border-border text-foreground"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
              </div>
            </div>
          </div>

          {/* Hostel delivery */}
          <div
            className={`rounded-2xl p-4 flex items-start gap-3 ${
              restaurant.hostelDelivery ? "bg-pastel-mint/40" : "bg-muted"
            }`}
          >
            <Bike className={`w-5 h-5 mt-0.5 ${restaurant.hostelDelivery ? "text-pastel-mint-foreground" : "text-muted-foreground"}`} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {restaurant.hostelDelivery ? "Delivers to hostels" : "No hostel delivery"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {restaurant.hostelDelivery
                  ? `Approx delivery charge: ${restaurant.deliveryFeeApprox} — call to confirm and place your order`
                  : "Pickup or dine-in only — call ahead if you plan to walk over"}
              </p>
            </div>
          </div>

          {/* Menu photo */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Menu</p>
            <div className="rounded-2xl border border-border overflow-hidden">
              {restaurant.menuImageUrl ? (
                <img src={restaurant.menuImageUrl} alt={`${restaurant.name} menu`} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-32 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  No menu photo added yet
                </div>
              )}
              <p className="text-[11px] text-muted-foreground px-3 py-2 bg-muted/60">
                Add a real photo by setting menuImageUrl in src/lib/restaurants.js
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
