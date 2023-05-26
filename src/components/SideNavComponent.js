import React, { Component } from "react";
import {
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { NavLink , Link } from "react-router-dom";

export class SideNavComponent extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }
  render() {
    return (
      <Navbar dark expand="md" id="main-nav" >
        <NavbarToggler
          onClick={this.toggle}
          style={{ position: "absolute", right: "10px" }}
        />
        <Collapse isOpen={this.state.isNavOpen} navbar>
          <Nav navbar className="sideNav">
            <NavItem>
              <NavLink className="nav-link" to="/bookings">
                Bookings
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default SideNavComponent;
