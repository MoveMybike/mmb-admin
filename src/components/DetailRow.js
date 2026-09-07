import React from 'react';

// Shared building blocks for the expanded-row detail panels used across the
// data grids (All Bookings, Booking Enquiry, ...). Styling lives in App.css
// (.detail-panel / .detail-grid / .detail-row) so every view looks the same.

export const DetailPanel = ({ title, action, children }) => (
  <div className="detail-panel">
    {(title || action) && (
      <div className="detail-panel__header">
        {action && <div className="detail-panel__action">{action}</div>}
        {title && <div className="detail-panel__title">{title}</div>}
      </div>
    )}
    <div className="detail-grid">{children}</div>
  </div>
);

export const DetailRow = ({ label, children }) => (
  <div className="detail-row">
    <span className="detail-row__label">{label}</span>
    <span className="detail-row__value">{children}</span>
  </div>
);

export default DetailRow;
