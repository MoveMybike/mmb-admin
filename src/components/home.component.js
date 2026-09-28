import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import homeimg from '../Sideimage.jpeg';

// Each card: label, the count keys the stats endpoint may use (first match
// wins), and the bookingStatus value passed to GET /getBookingByStatus.
const CARDS = [
  {
    label: "Active Shipment",
    status: "Y",
    keys: ["activeShipment", "activeShipments", "active"],
  },
  {
    label: "Ready For Pickup",
    status: "R",
    keys: [
      "readyForPickup", "readyForPickUp", "pickup", "pickUp",
      "pendingPickup", "readyForPickupCount", "totalPickup", "pickupCount",
    ],
  },
  {
    label: "Ready For Delivery",
    status: "D",
    keys: ["readyForDelivery", "readyForDeliver", "delivery"],
  },
];

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

  useEffect(() => {
    let active = true;
    userService.getDashboardCounts()
      .then((data) => {
        if (!active) return;
        setCounts(data || {});
        // Diagnostic: flag any card whose value couldn't be matched to a
        // field in the API response, and show the raw keys available.
        CARDS.forEach(({ label, keys }) => {
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
        {CARDS.map(({ label, status, keys }) => {
          const value = pickCount(counts, keys);
          return (
            <div className="col-md-4 col-sm-6 mb-3" key={label}>
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
