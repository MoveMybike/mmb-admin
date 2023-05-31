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