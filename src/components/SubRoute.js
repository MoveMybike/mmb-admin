import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import SubAdminHome from "./SubAdminHome";

class SubRoute extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };
  }


  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

    return (
      <div>
        <h1>Home</h1>
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<SubAdminHome />} />
            <Route path="/bookings" element={<SubAdminHome />} />
          </Routes>
        </div>

        {/* <AuthVerify logOut={this.logOut}/> */}
      </div>
    );
  }
}

export default SubRoute;
