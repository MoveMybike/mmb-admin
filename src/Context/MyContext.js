import React, { createContext, useState } from "react";

// Create two context:
// UserContext: to query the context state
// UserDispatchContext: to mutate the context state
const UserContext = createContext();
const UserDispatchContext = createContext();

// A "provider" is used to encapsulate only the
// components that needs the state in this context
function UserProvider({ children }) {
  // let day = new Date();
  // let formatDate = Moment(day).format('DD/MM/YYYY');
  //const [startDate, setStartDate] = useState(formatDate);
  const [userDetails, setUserDetails] = useState({

    bookingDate: new Date(),
    pickupType: 1,
    deliveryType: 1,
    damageScheme: "N",
    bookingType: 1,
    toAdress: {
      streetDoordel: "",
      cityDoordel: "",
      stateDoordel: "",
      zipDoordel: "",
    },
    fromAdress: {
      streetDoorpick: "",
      cityDoorpick: "",
      stateDoorpick: "",
      zipDoorpick: "",
    },
    assureScheme: "N",
    priceDetails: {
      totalCharges: 0,
      frieghtCharges: 0,
      taxamt: 0,
      serviceCharge: 0,
      doordelCharge: 0,
      damageCharge: 0,
    },
    serviceType: ''
  });
  return (
    <UserContext.Provider value={userDetails}>
      <UserDispatchContext.Provider value={setUserDetails}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext, UserDispatchContext };
