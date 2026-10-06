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

const renderLink = ({ to, label }) => (
  <NavLink key={to} className="nav-link" to={to}>
    {label}
  </NavLink>
);

// Roles come from the stored login user (set by AuthService.login).
const readStoredRoles = () => {
  try {
    return JSON.parse(localStorage.getItem("user"))?.roles || [];
  } catch (e) {
    return [];
  }
};

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
    const roles = readStoredRoles();
    const hasRole = (...names) => names.some((n) => roles.includes(n));

    // City Managers: Bookings only. Operators: Bookings + Booking Enquiry.
    // Everyone else (Admin, Booking Agent, ...) keeps the full menu.
    const isCityManagerOnly =
      hasRole("ROLE_CITY_MANAGER") && !hasRole("ROLE_ADMIN", "ROLE_OPERATOR", "ROLE_BOOKING_AGENT");
    const isOperatorOnly = hasRole("ROLE_OPERATOR") && !hasRole("ROLE_ADMIN");

    const operatorLinks = [
      { to: "/bookings", label: "Bookings" },
      { to: "/enquiries", label: "Booking Enquiry" },
    ];
    const fullLinks = [
      { to: "/bookings", label: "Bookings" },
      { to: "/enquiries", label: "Booking Enquiry" },
      { to: "/fromCities", label: "From City" },
      { to: "/toCities", label: "To City" },
      { to: "/prices", label: "Price" },
      { to: "/users", label: "User Management" },
    ];

    let content;
    if (isCityManagerOnly) {
      content = [{ to: "/bookings", label: "Bookings" }].map(renderLink);
    } else if (isOperatorOnly) {
      content = operatorLinks.map(renderLink);
    } else {
      content = fullLinks.map(renderLink);
    }

    return (
      <Navbar dark expand="md" id="main-nav" >
        <NavbarToggler
          onClick={this.toggle}
          style={{ position: "absolute", right: "10px" }}
        />
        <Collapse isOpen={this.state.isNavOpen} navbar>
          <Nav navbar className="sideNav">
            <NavItem>{content}</NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default SideNavComponent;
