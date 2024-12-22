import React from "react";
import userService from "../services/user.service";
import OrderView from "./OrderView";
import SideNavComponent from "./SideNavComponent";

function AllBookingTable() {
  const [bookdata, setBookdata] = React.useState();
  const user = JSON.parse(localStorage.getItem('user'));
  
  React.useEffect(() => {
    const userData = userService.getAllBookings()
    userData.then((result) => {
      setBookdata(result)
    })
  }, [user.jwt]); 
  const handleRowUpdate = (bookingId, updatedRowData) => {
    const updatedData = bookdata.map((row) =>
      row.id === bookingId ? { ...row, ...updatedRowData } : row
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
          <OrderView bookdata={bookdata} onUpdateRow={handleRowUpdate} />
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

export default AllBookingTable