// Shared helpers + data for the Restaurants ("Campus Eats") page.
//
// ================================================================
// ✦ RESTAURANT DIRECTORY — EDIT ONLY THE LIST BELOW ✦
// To add a place: copy one whole { ... } block, paste it before the
// closing "];", and change the values.
// To remove a place: delete its whole { ... } block.
// Nothing else in this file, or in Restaurants.jsx, needs to change.
//
// Field guide:
//   id                - short unique code, no spaces (e.g. "r6")
//   name              - restaurant / shop name
//   cuisine           - short tag under the name, e.g. "Momos · Chinese"
//   ownerName         - owner's name shown on the detail card
//   phone             - phone number with country code, e.g. "+919876543210"
//   address           - full address shown on the detail card
//   lat, lng          - map coordinates (right-click the spot on Google
//                       Maps and copy the two numbers it shows you)
//   opensAt, closesAt - opening/closing time, 24-hour "HH:MM"
//                       (overnight hours like 18:00-02:00 work automatically)
//   closedOn          - weekly off days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu
//                       5=Fri 6=Sat. Leave as [] if open every day.
//   rating            - star rating out of 5, e.g. 4.3
//                       (this is typed in by hand from Google, not pulled
//                       live — update it every so often)
//   reviewCount       - number of Google reviews, e.g. 214
//   hostelDelivery    - true or false
//   deliveryFeeApprox - approximate delivery charge as text, e.g. "₹20–30"
//                       (leave as "" if hostelDelivery is false)
//   photoUrl          - link to a photo of the restaurant, or "" to use
//                       a plain placeholder tile
//   menuImageUrl      - link to a photo of the menu, or "" to use a
//                       placeholder
//   accent            - hex color for the placeholder tile when there's
//                       no photoUrl, e.g. "#C98A22"
// ================================================================
export const RESTAURANTS = [
  {
    id: "r1",
    name: "Cooking star Restaurant",
    ownerName: "Diganta Bora",
    phone: "+919864012345",
    address: "MRWP+F7W, University, Napaam, Tezpur, Parmai Gauli Gaon, Assam 784028",
    lat: 26.7010, lng: 92.7930,
    opensAt: "10:30", closesAt: "22:00", closedOn: [],
    rating: 4.5, reviewCount: 212,
    hostelDelivery: true, deliveryFeeApprox: "₹20–30",
    photoUrl: "", menuImageUrl: "",
    accent: "#C98A22",
  },
  {
    id: "r2",
    name: "Momo Point",
    cuisine: "Momos · Chinese",
    ownerName: "Tenzin Dorjee",
    phone: "+919435098765",
    address: "Near Main Gate, Tezpur University Road",
    lat: 26.7042, lng: 92.7961,
    opensAt: "12:00", closesAt: "21:30", closedOn: [1],
    rating: 4.2, reviewCount: 98,
    hostelDelivery: true, deliveryFeeApprox: "₹15–25",
    photoUrl: "", menuImageUrl: "",
    accent: "#B4574A",
  },
  {
    id: "r3",
    name: "The Tea Junction",
    cuisine: "Tea stall · Snacks",
    ownerName: "Ranjit Das",
    phone: "+919864099887",
    address: "Bus Stop Corner, Napaam Chariali",
    lat: 26.6998, lng: 92.7902,
    opensAt: "06:00", closesAt: "23:00", closedOn: [],
    rating: 4.0, reviewCount: 340,
    hostelDelivery: false, deliveryFeeApprox: "",
    photoUrl: "", menuImageUrl: "",
    accent: "#5E8B5A",
  },
  {
    id: "r4",
    name: "ASpice Route Dhaba",
    cuisine: "North Indian · Punjabi",
    ownerName: "Harpreet Singh",
    phone: "+919678123450",
    address: "NH-15, Opposite Petrol Pump, Tezpur",
    lat: 26.7085, lng: 92.8010,
    opensAt: "11:00", closesAt: "23:30", closedOn: [],
    rating: 4.6, reviewCount: 501,
    hostelDelivery: true, deliveryFeeApprox: "₹30–50",
    photoUrl: "", menuImageUrl: "",
    accent: "#A6472F",
  },
  {
    id: "r5",
    name: "Night Owl Fast Food",
    cuisine: "Rolls · Fast food",
    ownerName: "Mridul Saikia",
    phone: "+919101234567",
    address: "Hostel Road Market, Block C",
    lat: 26.7025, lng: 92.7889,
    opensAt: "18:00", closesAt: "02:00", closedOn: [],
    rating: 4.1, reviewCount: 76,
    hostelDelivery: true, deliveryFeeApprox: "₹10–20",
    photoUrl: "", menuImageUrl: "",
    accent: "#3E6B8A",
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

// Returns { isOpen, closedToday } for a restaurant, computed from the
// current time. Handles overnight hours (e.g. 18:00 to 02:00).
export function getStatus(restaurant) {
  const now = new Date();
  const day = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = timeToMin(restaurant.opensAt);
  const closeMin = timeToMin(restaurant.closesAt);
  const closedToday = (restaurant.closedOn || []).includes(day);

  let isOpen;
  if (closeMin > openMin) {
    isOpen = nowMin >= openMin && nowMin < closeMin;
  } else {
    isOpen = nowMin >= openMin || nowMin < closeMin;
  }
  if (closedToday) isOpen = false;

  return { isOpen, closedToday };
}

export function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}
