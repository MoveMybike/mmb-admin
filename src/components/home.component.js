import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import homeimg from '../Sideimage.jpeg';
import { STATUS } from "../constants/bookingStatus";

// Each card: label, the count keys the stats endpoint may use (first match
// wins), the bookingStatus value passed to GET /getBookingByStatus, and
// optionally `roles` — if set, the card is shown only to those roles.
const CARDS = [
  {
    label: "Active Shipment",
    status: STATUS.BC,
    keys: ["activeShipment", "activeShipments", "active"],
  },
  {
    label: "Ready for Pickup",
    status: STATUS.RP,
    keys: [
      "readyForPickup", "readyForPickUp", "pickup", "pickUp",
      "pendingPickup", "readyForPickupCount", "totalPickup", "pickupCount",
    ],
  },
  {
    label: "At Source Hub",
    status: STATUS.SH,
    keys: ["atSourceHub", "sourceHub", "atSource"],
  },
  {
    label: "At Destination Hub",
    status: STATUS.DH,
    keys: ["atDestinationHub", "destinationHub", "atDestination"],
  },
  {
    label: "In Transit",
    status: STATUS.IT,
    keys: ["inTransit", "transit"],
    roles: ["ROLE_ADMIN", "ROLE_OPERATOR"],
  },
  {
    label: "Out for Delivery",
    status: STATUS.OD,
    keys: ["readyForDelivery", "readyForDeliver", "delivery"],
  },
  {
    label: "Closed",
    status: STATUS.CL,
    keys: ["closed"],
    roles: ["ROLE_ADMIN"],
  },
];

// Statuses a City Manager may view (mirrors the backend's CITY_MANAGER_VIEW_STATUSES).
const CITY_MANAGER_STATUSES = [STATUS.RP, STATUS.SH, STATUS.DH, STATUS.OD];

const readStoredRoles = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.roles || [];
  } catch (e) {
    return [];
  }
};

// Case/punctuation-insensitive so "readyForPickup", "ReadyForPickUp",
// "ready_for_pick_up" etc. all match the same candidate key.
const normalizeKey = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const pickCount = (data, keys) => {
  if (!data) return null;
  const entries = Object.keys(data).map((k) => [normalizeKey(k), k]);
  for (const wanted of keys) {
    const target = normalizeKey(wanted);
    const hit = entries.find(([norm]) => norm === target);
    if (hit) {
      const value = data[hit[1]];
      if (value !== null && value !== undefined) return value;
    }
  }
  return null;
};

export default function Home() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only show cards the signed-in user's roles are allowed to see. A City Manager
  // (no other booking role) is further limited to the statuses the backend allows them.
  const userRoles = readStoredRoles();
  const isCityManagerOnly =
    userRoles.includes("ROLE_CITY_MANAGER") &&
    !userRoles.some((r) => ["ROLE_ADMIN", "ROLE_OPERATOR", "ROLE_BOOKING_AGENT"].includes(r));
  const visibleCards = CARDS.filter(
    (card) =>
      (!card.roles || card.roles.some((r) => userRoles.includes(r))) &&
      (!isCityManagerOnly || CITY_MANAGER_STATUSES.includes(card.status))
  );

  useEffect(() => {
    let active = true;
    userService.getDashboardCounts()
      .then((data) => {
        if (!active) return;
        setCounts(data || {});
        // Diagnostic: flag any visible card whose value couldn't be matched to a
        // field in the API response, and show the raw keys available.
        visibleCards.forEach(({ label, keys }) => {
          if (pickCount(data, keys) === null) {
            console.warn(
              `[Home] No matching field for "${label}". Tried: ${keys.join(", ")}. ` +
              `dashboardStats keys: ${data ? Object.keys(data).join(", ") : "(no data)"}`
            );
          }
        });
      })
      .catch((err) => {
        console.error('Failed to load dashboard counts', err);
        if (active) setError(getFriendlyErrorMessage(err, 'Unable to load dashboard counts.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="container" style={{ padding: '3%' }}>
      <h3 className="text-center" style={{ marginBottom: '24px' }}>Welcome to MMB Tracker</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row justify-content-center">
        {visibleCards.map(({ label, status, keys }) => {
          const value = pickCount(counts, keys);
          return (
            <div className="col-lg col-md-4 col-sm-6 mb-3" key={label}>
              <div
                className="card h-100 text-center dashboard-card"
                role="button"
                onClick={() => navigate(`/bookings/status/${status}`)}
                style={{ cursor: 'pointer', marginTop: 0 }}
              >
                <div className="card-body">
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#b02a37' }}>
                    {loading ? '…' : (value ?? '-')}
                  </div>
                  <div style={{ fontSize: '14px', color: '#555' }}>{label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <img src={homeimg} alt="home" width={300} />
      </div>
    </div>
  );
}
