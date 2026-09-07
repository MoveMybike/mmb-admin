import React, { useEffect } from "react";
import { withRouter } from "./with-router";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const AuthVerify = (props) => {
  let location = props.router.location;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.jwt) {
      const decodedJwt = parseJwt(user.jwt);

      // No exp claim or already past exp -> session expired, log out.
      if (!decodedJwt || decodedJwt.exp * 1000 < Date.now()) {
        props.logOut();
      }
    }
  }, [location]);

  return <div></div>;
};

export default withRouter(AuthVerify);
