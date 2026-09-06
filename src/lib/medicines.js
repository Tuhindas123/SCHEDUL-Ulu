// Shared helpers + data for the Medicines ("Campus Meds") page.
//
// ================================================================
// ✦ PHARMACY DIRECTORY — EDIT ONLY THE LIST BELOW ✦
// To add a place: copy one whole { ... } block, paste it before the
// closing "];", and change the values.
// To remove a place: delete its whole { ... } block.
//
// ================================================================
// ✦ HOW TO ADD A PHOTO (photoUrl) ✦
// Same as the restaurants file — needs a direct image link (ends in
// .jpg/.png/.webp).
//   1. Upload to https://imgur.com/upload → right-click the image →
//      "Copy image address" → paste as photoUrl.
//   2. Or drop the file into public/meds-photos/ and use
//      photoUrl: "/meds-photos/filename.jpg"
// Leave photoUrl: "" to show the Schedul-Ulu logo as a placeholder.
//
// Field guide:
//   id              - short unique code, no spaces (e.g. "m3")
//   name            - pharmacy / medical store name
//   phone           - phone number with country code, e.g. "+919876543210"
//   address         - full address shown on the detail card
//   lat, lng        - map coordinates (right-click the spot on Google
//                     Maps and copy the two numbers it shows you)
//   open24Hours     - true if it never closes. If true, opensAt/closesAt/
//                     closedOn are ignored — leave them as "00:00"/[].
//   opensAt, closesAt - opening/closing time, 24-hour "HH:MM"
//                     (ignored if open24Hours is true)
//   closedOn        - weekly off days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu
//                     5=Fri 6=Sat. Leave as [] if open every day.
//   homeDelivery    - true or false
//   deliveryFeeApprox - approximate delivery charge as text, e.g. "₹20–30"
//                     (leave as "" if homeDelivery is false)
//   emergencyMeds   - true if they reliably stock urgent/emergency
//                     medication, not just general OTC stuff
//   photoUrl        - see guide above. Leave as "" for the logo placeholder.
// ================================================================
export const MEDICINES = [
  {
    id: "m1",
    name: "Campus Care Pharmacy",
    phone: "+919864012345",
    address: "Near Main Gate, Napaam, Tezpur University, Assam 784028",
    lat: 26.6968, lng: 92.8351,
    open24Hours: true,
    opensAt: "00:00", closesAt: "00:00", closedOn: [],
    homeDelivery: true, deliveryFeeApprox: "₹15–25",
    emergencyMeds: true,
    photoUrl: "",
  },
  {
    id: "m2",
    name: "Napaam Medical Store",
    phone: "+919365498712",
    address: "Napaam Chariali, Opposite Bus Stop, Assam 784028",
    lat: 26.6995, lng: 92.7901,
    open24Hours: false,
    opensAt: "08:00", closesAt: "21:30", closedOn: [],
    homeDelivery: false, deliveryFeeApprox: "",
    emergencyMeds: false,
    photoUrl: "",
  },
];
// ============== END OF EDITABLE DATA — CODE BELOW ==============

function timeToMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime12(t) {
  const [hStr, m] = t.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m === "00" ? "" : ":" + m}${suffix}`;
}

// Returns { isOpen, closedToday } for a pharmacy, computed from the
// current time. 24-hour places are always open. Handles overnight
// hours (e.g. 18:00 to 02:00) for the rest.
export function getMedStatus(pharmacy) {
  if (pharmacy.open24Hours) {
    return { isOpen: true, closedToday: false };
  }

  const now = new Date();
  const day = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = timeToMin(pharmacy.opensAt);
  const closeMin = timeToMin(pharmacy.closesAt);
  const closedToday = (pharmacy.closedOn || []).includes(day);

  let isOpen;
  if (closeMin > openMin) {
    isOpen = nowMin >= openMin && nowMin < closeMin;
  } else {
    isOpen = nowMin >= openMin || nowMin < closeMin;
  }
  if (closedToday) isOpen = false;

  return { isOpen, closedToday };
}
