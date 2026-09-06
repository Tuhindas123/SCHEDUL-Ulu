import React from "react";
import { X, MapPin, Phone, Bike, Navigation, Clock, ShieldAlert } from "lucide-react";
import { getMedStatus, formatTime12 } from "@/lib/medicines";

const FALLBACK_IMAGE = "/app_logo_original.png";

export default function MedicineDetailModal({ pharmacy, onClose }) {
  if (!pharmacy) return null;
  const { isOpen } = getMedStatus(pharmacy);
  const mapEmbedSrc = `https://www.google.com/maps?q=${pharmacy.lat},${pharmacy.lng}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-xl">
        {/* Hero */}
        <div
          className="relative h-36 flex items-end p-5 bg-cover bg-center"
          style={{ backgroundImage: `url(${pharmacy.photoUrl || FALLBACK_IMAGE})` }}
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
            <h2 className="text-xl font-heading font-bold text-white leading-tight">{pharmacy.name}</h2>
            {pharmacy.open24Hours && (
              <p className="text-white/85 text-xs mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Open 24 hours
              </p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                isOpen
                  ? "bg-pastel-mint text-pastel-mint-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {pharmacy.open24Hours
                ? "Always open"
                : isOpen
                ? `Open now · closes ${formatTime12(pharmacy.closesAt)}`
                : `Closed · opens ${formatTime12(pharmacy.opensAt)}`}
            </span>
            {pharmacy.emergencyMeds && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
                <ShieldAlert className="w-3.5 h-3.5" />
                Stocks emergency meds
              </span>
            )}
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Location</p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-foreground flex items-start gap-2 max-w-[22ch]">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                {pharmacy.address}
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
              title={`Map for ${pharmacy.name}`}
              src={mapEmbedSrc}
              className="w-full h-36 rounded-2xl border border-border mt-3"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Contact</p>
            <div className="rounded-2xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">Phone</p>
                <p className="text-sm font-semibold text-foreground">{pharmacy.phone}</p>
              </div>
              <a
                href={`tel:${pharmacy.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-2xl border border-border text-foreground"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            </div>
          </div>

          {/* Home delivery */}
          <div
            className={`rounded-2xl p-4 flex items-start gap-3 ${
              pharmacy.homeDelivery ? "bg-pastel-mint/40" : "bg-muted"
            }`}
          >
            <Bike className={`w-5 h-5 mt-0.5 ${pharmacy.homeDelivery ? "text-pastel-mint-foreground" : "text-muted-foreground"}`} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {pharmacy.homeDelivery ? "Delivers to hostels/home" : "No home delivery"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pharmacy.homeDelivery
                  ? `Approx delivery charge: ${pharmacy.deliveryFeeApprox} — call to confirm and place your order`
                  : "Walk-in only — call ahead to check stock before heading over"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
