import React, { Component } from "react";

import homeimg from '../Sideimage.jpeg'

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: ""
    };
  }


  render() {
    return (
      <div className="container text-center" style={{padding:'5%'}}>
          <h3 style={{marginBottom:'20px'}}>Welcome to MMB Tracker</h3>
          <img src={homeimg} alt="home" width={300}/>
      </div>
    );
  }
}
