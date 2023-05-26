import React from "react";
import OrderView from "./OrderView";
import SideNavComponent from "./SideNavComponent";

function AllBookingTable() {
  const user = JSON.parse(localStorage.getItem('AllBooking'));
  const [bookdata, setBookdata] = React.useState(user);
  
  return (
    bookdata != null ? (
      <div className='row p-1 pt-5'>
        <div className='col-md-2'>
          <SideNavComponent />
        </div>
        <div className='col-md-10'>
          <OrderView bookdata={bookdata}/>
        </div>
    </div>
      ) : (
        "Loading"
      )
  );
}

export default AllBookingTable