import React from "react";
import userService from "../services/user.service";
import SideNavComponent from "./SideNavComponent";
import PartialOrderView from "./PartialOrderView";

function BookingEnquiryTable() {
  const [bookdata, setBookdata] = React.useState();
  const [totalRows, setTotalRows] = React.useState(0);
  const [page, setPage] = React.useState(1); // react-data-table pages are 1-based
  const [perPage, setPerPage] = React.useState(50);
  const [loading, setLoading] = React.useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEnquiries = React.useCallback((pageNo, size) => {
    setLoading(true);
    // backend pages are 0-based
    userService.getPartialBookings(pageNo - 1, size)
      .then((result) => {
        setBookdata(result.content || []);
        setTotalRows(result.totalCount || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchEnquiries(page, perPage);
  }, [user.jwt, page, perPage, fetchEnquiries]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleEnqRowUpdate = (enqId, updatedRowData) => {
    const updatedData = bookdata.map((row) =>
      row.id === enqId ? { ...row, ...updatedRowData } : row
    );
    setBookdata(updatedData);
  };
  return (
    bookdata != null ? (
      <div className='row p-1 pt-5'>
        <div className='col-md-2'>
          <SideNavComponent />
        </div>
        <div className='col-md-10'>
          <PartialOrderView
            bookdata={bookdata}
            handleEnqRowUpdate={handleEnqRowUpdate}
            paginationServer
            paginationTotalRows={totalRows}
            paginationDefaultPage={page}
            paginationPerPage={perPage}
            progressPending={loading}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
          />
        </div>
    </div>
      ) : (
        <div className='row p-1 pt-5'>
        <div className='col-md-2'>
          <SideNavComponent />
        </div>
        <div className='col-md-10'>
          <h2>Loading...</h2>
        </div>
    </div>

      )
  );
}

export default BookingEnquiryTable
