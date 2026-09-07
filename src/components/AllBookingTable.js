import React from "react";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import OrderView from "./OrderView";
import SideNavComponent from "./SideNavComponent";

function AllBookingTable() {
  const [bookdata, setBookdata] = React.useState();
  const [totalRows, setTotalRows] = React.useState(0);
  const [page, setPage] = React.useState(1); // react-data-table pages are 1-based
  const [perPage, setPerPage] = React.useState(50);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchBookings = React.useCallback((pageNo, size) => {
    setLoading(true);
    setLoadError('');
    // backend pages are 0-based
    userService.getAllBookings(pageNo - 1, size)
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
    fetchBookings(page, perPage);
  }, [user.jwt, page, perPage, fetchBookings]);

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
  const renderContent = () => {
    if (loadError) {
      return (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>{loadError}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={() => fetchBookings(page, perPage)}>
            Retry
          </button>
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
        paginationServer
        paginationTotalRows={totalRows}
        paginationDefaultPage={page}
        paginationPerPage={perPage}
        progressPending={loading}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
      />
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
