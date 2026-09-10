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
    keys: ["readyForPickup", "readyForPickUp", "pickup"],
  },
  {
    label: "Ready For Delivery",
    status: "D",
    keys: ["readyForDelivery", "readyForDeliver", "delivery"],
  },
];

const pickCount = (data, keys) => {
  if (!data) return null;
  for (const k of keys) {
    if (data[k] !== null && data[k] !== undefined) return data[k];
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
      .then((data) => { if (active) setCounts(data || {}); })
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
