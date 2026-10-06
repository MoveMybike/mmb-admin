import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import OrderView from "./OrderView";
import SideNavComponent from "./SideNavComponent";
import { STATUS, BOOKING_STATUS_BY_CODE } from "../constants/bookingStatus";

// Headings for the dashboard cards; other codes fall back to the status label.
const STATUS_TITLES = {
  [STATUS.BC]: "Active Shipment",
  [STATUS.RP]: "Ready for Pickup",
  [STATUS.OD]: "Out for Delivery",
};

function StatusBookingTable() {
  const { status } = useParams();
  const navigate = useNavigate();
  const [bookdata, setBookdata] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const load = React.useCallback(() => {
    setLoading(true);
    setLoadError('');
    userService.getBookingsByStatus(status)
      .then((result) => {
        setBookdata(Array.isArray(result) ? result : (result?.content || []));
      })
      .catch((error) => {
        console.error('Failed to load bookings by status', error);
        setBookdata([]);
        setLoadError(getFriendlyErrorMessage(error, 'Unable to load bookings.'));
      })
      .finally(() => setLoading(false));
  }, [status]);

  React.useEffect(() => {
    load();
  }, [user.jwt, load]);

  const handleRowUpdate = (bookingId, updatedRowData) => {
    setBookdata((rows) =>
      (rows || []).map((row) =>
        row.id === bookingId ? { ...row, ...updatedRowData } : row
      )
    );
  };

  const title = STATUS_TITLES[status]
    || (BOOKING_STATUS_BY_CODE[status] ? BOOKING_STATUS_BY_CODE[status].label : `Bookings - ${status}`);

  const renderContent = () => {
    if (loadError) {
      return (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>{loadError}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={load}>Retry</button>
        </div>
      );
    }
    if (bookdata == null) {
      return <h2>Loading...</h2>;
    }
    return (
      <OrderView
        bookdata={bookdata}
        onUpdateRow={handleRowUpdate}
        progressPending={loading}
      />
    );
  };

  return (
    <div className='row p-1 pt-5'>
      <div className='col-md-2'>
        <SideNavComponent />
      </div>
      <div className='col-md-10'>
        <div className="d-flex align-items-center mb-2" style={{ gap: '12px' }}>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/home')}>
            &larr; Back
          </button>
          <h5 className="mb-0">{title}</h5>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default StatusBookingTable;
