// Shared helpers + data for the Restaurants ("Campus Eats") page.
//
// ================================================================
// ✦ RESTAURANT DIRECTORY — EDIT ONLY THE LIST BELOW ✦
// To add a place: copy one whole { ... } block, paste it before the
// closing "];", and change the values.
// To remove a place: delete its whole { ... } block.
// Nothing else in this file, or in Restaurants.jsx, needs to change.
//
// ================================================================
// ✦ HOW TO ADD A PHOTO (photoUrl) ✦
// photoUrl needs a direct link to an image file — one that ends in
// .jpg/.png/.webp and opens as JUST the picture in a browser tab,
// not a webpage.
//
// Easiest ways to get one:
//   1. From your phone: upload the photo to https://imgur.com/upload
//      (no account needed) → right-click the uploaded image →
//      "Copy image address" → paste that as photoUrl below.
//   2. From this project: drop the image file into the /public folder
//      (e.g. public/restaurant-photos/cooking-star.jpg), then use
//      photoUrl: "/restaurant-photos/cooking-star.jpg"
//
// Example:
//   photoUrl: "https://i.imgur.com/AbCdEfG.jpg",
//
// Leave photoUrl: "" (empty) if you don't have a photo yet — the app
// will automatically show the Schedul-Ulu logo as a placeholder
// instead, so nothing looks broken while you're still collecting photos.
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
//   hostelDelivery    - true or false
//   deliveryFeeApprox - approximate delivery charge as text, e.g. "₹20–30"
//                       (leave as "" if hostelDelivery is false)
//   photoUrl          - link to a photo of the restaurant, see guide
//                       above. Leave as "" to show the logo placeholder.
//   menuImageUrl      - link to a photo of the menu, or "" to use a
//                       placeholder
// ================================================================
export const RESTAURANTS = [
  {
    id: "r1",
    name: "Cooking star Restaurant",
    phone: "",
    address: "MRWP+F7W, University, Napaam, Tezpur, Parmai Gauli Gaon, Assam 784028",
    lat: 26.69624948342062, lng: 92.8356704253021,
    opensAt: "10:30", closesAt: "22:00", closedOn: [],
    hostelDelivery: true, deliveryFeeApprox: "₹20–30",
    photoUrl: "", menuImageUrl: "",
  },
  {
    id: "r2",
    name: "SRISHTI RESTAURANT",
    phone: "+919365419001",
    address: "MRWP+CCQ, Napaam, Parmai Gauli Gaon, Assam 784028",
    lat: 26.6960895, lng: 92.8359627,
    opensAt: "8:00", closesAt: "22:00", closedOn: [1],
    hostelDelivery: true, deliveryFeeApprox: "₹15–25",
    photoUrl: "/food/srishti-restaurant.png", menuImageUrl: "",
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
    hostelDelivery: false, deliveryFeeApprox: "",
    photoUrl: "", menuImageUrl: "",
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
    hostelDelivery: true, deliveryFeeApprox: "₹30–50",
    photoUrl: "", menuImageUrl: "",
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
    hostelDelivery: true, deliveryFeeApprox: "₹10–20",
    photoUrl: "", menuImageUrl: "",
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