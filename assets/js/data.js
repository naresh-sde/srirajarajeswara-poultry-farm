/* =========================================================
   Sri Rajarajeswara Poultry Farm — site configuration
   Owner can override every value from the in-page Admin panel.
   Changes are stored in this browser (localStorage) and never
   upload anywhere. Use "Reset to defaults" to restore.
   ========================================================= */

window.SRR_CONFIG = {
  /* ---------- Business identity ---------- */
  farmName: "Sri Rajarajeswara Poultry Farm",
  founder: "Goutham Naresh",
  tagline: "Farm Fresh Eggs, Bulk Ready",

  /* ---------- Contact ---------- */
  phone: "7095671881",
  phoneDisplay: "+91 70956 71881",
  whatsapp: "917095671881",
  email: "info@srirajarajeswarapoultry.in",
  addressLine: "Layer Farm & Packing Unit, Telangana",
  city: "Telangana, India",
  gstNote: "GST invoice available for bulk buyers",

  /* ---------- Operations ---------- */
  birds: 25000,
  eggsPerDay: 20000,
  eggsPerMonth: 600000,
  established: "2019",
  hours: [
    ["Farm & office hours", "Mon – Sat, 7:00 AM – 8:00 PM"],
    ["Order cut-off for next-day delivery", "Daily, 6:00 PM"],
    ["Sunday", "Wholesale dispatch only"]
  ],

  /* ---------- Products (₹) ---------- */
  currency: "₹",
  products: {
    tray:     { label: "Retail Egg Tray",   qty: 30,   rate: 7.00,  unit: "per egg" },
    carton:   { label: "Wholesale Carton",  qty: 180,  rate: 6.25,  unit: "per egg" },
    marigold: { label: "Marigold Gold Tray",qty: 30,   rate: 7.50,  unit: "per egg" },
    bulk:     { label: "Bulk / Pallet",     qty: 5400, rate: 4.55,  unit: "per egg" }
  },
  retailPack: { qty: 30, mrp: 7.9 },

  /* ---------- Bulk slabs (₹ per egg) ---------- */
  slabs: [
    { min: 1,   max: 9,    rate: 7.00, tag: "Trial",     label: "Trial supply" },
    { min: 10,  max: 49,   rate: 6.25, tag: "Std",       label: "Standard wholesale" },
    { min: 50,  max: 199,  rate: 5.60, tag: "Hot",       label: "Business supply" },
    { min: 200, max: 9999, rate: 4.55, tag: "Best",      label: "Volume / distributor" }
  ],

  /* ---------- Delivery ---------- */
  deliveryFee: 150,
  freeDeliveryAbove: 3000,
  serviceArea: "Telangana + 60 km",

  /* ---------- Media (optional) ---------- */
  youtube: "",      /* Paste a YouTube ID (e.g. dQw4w9WgXcQ) to show a video player */
  videoFallbackNote: "Add your farm video ID in the Admin panel and it appears here instantly.",

  /* ---------- Admin ---------- */
  adminPin: "7095"
};

/* Deep clone so overrides never touch the original object */
window.SRR_DEFAULTS = JSON.parse(JSON.stringify(window.SRR_CONFIG));

window.SRR_STORE_KEY = "srrp_admin_v1";

window.SRR_readOverrides = function () {
  try {
    const raw = localStorage.getItem(window.SRR_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

window.SRR_saveOverrides = function (obj) {
  try {
    localStorage.setItem(window.SRR_STORE_KEY, JSON.stringify(obj));
  } catch (e) {
    /* storage blocked — settings simply won't persist */
  }
};

window.SRR_clearOverrides = function () {
  try {
    localStorage.removeItem(window.SRR_STORE_KEY);
  } catch (e) {}
};
