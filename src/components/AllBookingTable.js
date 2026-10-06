import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import OrderView from "./OrderView";
import SideNavComponent from "./SideNavComponent";

function AllBookingTable() {
  const [bookdata, setBookdata] = React.useState();
  const [totalRows, setTotalRows] = React.useState(0);
  const [page, setPage] = React.useState(1); // react-data-table pages are 1-based
  const [perPage, setPerPage] = React.useState(50);
  const [direction, setDirection] = React.useState("FROM"); // "FROM" | "TO"
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  // City Managers are locked to their own city by the backend; they choose
  // whether to see bookings leaving it (From) or arriving at it (To).
  const isCityManagerOnly =
    (user?.roles || []).includes("ROLE_CITY_MANAGER") &&
    !(user?.roles || []).some((r) => r === "ROLE_ADMIN" || r === "ROLE_OPERATOR" || r === "ROLE_BOOKING_AGENT");

  const fetchBookings = React.useCallback((pageNo, size, dir) => {
    setLoading(true);
    setLoadError('');
    // backend pages are 0-based
    userService.getAllBookings(pageNo - 1, size, dir)
      .then((result) => {
        setBookdata(result.content || []);
        setTotalRows(result.totalCount || 0);
      })
      .catch((error) => {
        console.error('Failed to load bookings', error);
        setBookdata([]);
        setLoadError(getFriendlyErrorMessage(error, 'Unable to load bookings.'));
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchBookings(page, perPage, direction);
  }, [user.jwt, page, perPage, direction, fetchBookings]);

  const handleDirectionChange = (_event, next) => {
    if (!next) return; // exclusive toggle: ignore deselect
    setDirection(next);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleRowUpdate = (bookingId, updatedRowData) => {
    const updatedData = (bookdata || []).map((row) =>
      row.id === bookingId ? { ...row, ...updatedRowData } : row
    );
    setBookdata(updatedData);
  };

  // Add the newly created booking to the top of the table instead of refetching.
  const handleBookingAdded = (newBooking) => {
    if (!newBooking || !newBooking.id) {
      fetchBookings(page, perPage, direction);
      return;
    }
    setBookdata((rows) => {
      const list = rows || [];
      if (list.some((r) => r.id === newBooking.id)) return list;
      return [newBooking, ...list];
    });
    setTotalRows((t) => t + 1);
  };
  const renderContent = () => {
    if (loadError) {
      return (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>{loadError}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={() => fetchBookings(page, perPage, direction)}>
            Retry
          </button>
        </div>
      );
    }
    if (bookdata == null) {
      return <h2>Loading...</h2>;
    }
    return (
      <>
        {isCityManagerOnly && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{ fontWeight: 600 }}>Show bookings:</span>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={direction}
              onChange={handleDirectionChange}
            >
              <ToggleButton value="FROM">From my city</ToggleButton>
              <ToggleButton value="TO">To my city</ToggleButton>
            </ToggleButtonGroup>
          </div>
        )}
      <OrderView
        bookdata={bookdata}
        onUpdateRow={handleRowUpdate}
        onBookingAdded={handleBookingAdded}
        paginationServer
        paginationTotalRows={totalRows}
        paginationDefaultPage={page}
        paginationPerPage={perPage}
        progressPending={loading}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
      />
      </>
    );
  };

  return (
    <div className='row p-1 pt-5'>
      <div className='col-md-2'>
        <SideNavComponent />
      </div>
      <div className='col-md-10'>
        {renderContent()}
      </div>
    </div>
  );
}

export default AllBookingTable
