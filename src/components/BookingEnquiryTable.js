import React from "react";
import userService from "../services/user.service";
import SideNavComponent from "./SideNavComponent";
import PartialOrderView from "./PartialOrderView";

function BookingEnquiryTable() {
  const [bookdata, setBookdata] = React.useState();
  const user = JSON.parse(localStorage.getItem('user'));
  
  React.useEffect(() => {
    const userData = userService.getPartialBookings()
    userData.then((result) => {
      console.log(result);
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
          <PartialOrderView bookdata={bookdata}/>
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