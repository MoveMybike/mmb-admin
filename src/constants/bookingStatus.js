// Booking status codes. `code` is the value the API stores and expects
// (booking.status, approveStatus, getBookingByStatus); `order` is the
// position in the shipment flow and is only used on the frontend.
export const BOOKING_STATUSES = [
  { order: 10,  code: "OP", label: "Open",                  color: "#6c757d" },
  { order: 15,  code: "MC", label: "MMB Confirmation",      color: "#6f42c1" },
  { order: 18,  code: "CC", label: "Customer Confirmation", color: "#8e44ad" },
  { order: 20,  code: "BC", label: "Booking Confirmed",     color: "#198754" },
  { order: 40,  code: "RP", label: "Ready for Pickup",      color: "#528b56" },
  { order: 60,  code: "SH", label: "At Source Hub",         color: "#fd7e14" },
  { order: 70,  code: "IT", label: "In Transit",            color: "#e8a33d" },
  { order: 80,  code: "DH", label: "At Destination Hub",    color: "#c9a800" },
  { order: 90,  code: "OD", label: "Out for Delivery",      color: "#0d6efd" },
  { order: 100, code: "DL", label: "Delivered",             color: "#0a3622" },
  { order: 110, code: "CL", label: "Completed",             color: "#0a3622" },
];

// Side statuses outside the main flow.
export const BOOKING_EXTRA_STATUSES = [
  { order: 900, code: "PP", label: "Postponed",   color: "orange" },
  { order: 910, code: "NR", label: "No Response", color: "#a0888e" },
  { order: 920, code: "OH", label: "On Hold",     color: "#b8860b" },
  { order: 999, code: "CN", label: "Cancelled",   color: "#dc3545" },
];

export const ALL_BOOKING_STATUSES = [...BOOKING_STATUSES, ...BOOKING_EXTRA_STATUSES];

export const BOOKING_STATUS_BY_CODE = Object.fromEntries(
  ALL_BOOKING_STATUSES.map((s) => [s.code, s])
);

export const STATUS = Object.fromEntries(
  ALL_BOOKING_STATUSES.map((s) => [s.code, s.code])
);

// Enquiry statuses reuse the booking codes, plus CV once converted to a booking.
export const ENQUIRY_CONVERTED = "CV";

export const ENQUIRY_STATUSES = [
  ...["OP", "MC", "CC", "BC", "PP", "NR", "CN"].map((code) => BOOKING_STATUS_BY_CODE[code]),
  { code: ENQUIRY_CONVERTED, label: "Booking Converted", color: "#b8a200" },
];

export const ENQUIRY_STATUS_BY_CODE = Object.fromEntries(
  ENQUIRY_STATUSES.map((s) => [s.code, s])
);

const UNKNOWN ={ code: "", label: "Unknown", color: "gray" };

export const getBookingStatus = (code) => BOOKING_STATUS_BY_CODE[code] || UNKNOWN;
