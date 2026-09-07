import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem, TextField, Box, InputLabel, FormControl, CircularProgress, FormControlLabel, DialogContentText, Switch } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import moment from 'moment';
import "../App.css";
import axios from "axios";
import CustomSelect from './SelectComponent';
import {
  UserContext,
  UserDispatchContext,
} from "../Context/MyContext";
import { useContext } from "react";

const AddEnquirypopup = ({ fdata, tdata, bType }) => {
  const userDetails = React.useContext(UserContext);
  const setUserDetails = useContext(UserDispatchContext);
  const [enqDialogOpen, setEnqDialogOpen] = useState(false);
  const defaultError = {
    mobileError: null,
    nameError: null,
    emailError: null,
    fromCityError: null,
    toCityError: null,
    otherToCityError: null,
    otherFromCityError: null,
    dateError: null,
    bookType: null,
    serviceTypeError: null
  }
  const [defaultState, setDefaultState] = useState(defaultError);

  const handleChange = (e) => {
    if (e.target.name === 'totalCharges') {
      setUserDetails((prevState) => ({
        ...prevState,
        priceDetails: {
          ...prevState.priceDetails,
          totalCharges: e.target.value
        },
      }));
    } else {
      const updateItem = {
        ...userDetails,
        [e.target.name]: e.target.value,
      };
      setUserDetails(updateItem);
    }

  };
  const handleDate = (e) => {
    const updateItem = {
      ...userDetails,
      bookingDate: e,
    }
    setUserDetails(updateItem);
  };
  const handleEnqSubmit = async () => {
    if (!validate()) return;
    try {
      if (bType === 'booking') {
        // Add booking from the All Bookings page -> POST /createorder
        await userService.addBooking(userDetails);
      } else if (bType === 'cBooking') {
        await userService.convertBooking(userDetails);
      } else {
        await userService.addEnquiry(userDetails);
      }
      alert("Booking added Sucessfully");
      window.location.reload();
    } catch (error) {
      console.error("Failed to add booking", error);
      alert(getFriendlyErrorMessage(error, "Failed to add booking. Please try again."));
    }
  };
  const validate = () => {
    let emailError = "";
    let fromCityError = "";
    let toCityError = "";
    let mobileError = "";
    let nameError = "";
    let otherFromCityError = "";
    let otherToCityError = "";
    let serviceTypeError = "";
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{3})+$/;
    const pattern = new RegExp(/^[0-9\b]+$/);
    if (
      userDetails.serviceType === "" ||
      userDetails.serviceType === undefined ||
      userDetails.serviceType === "select"
    ) {
      serviceTypeError = "Please select Booking Type";
    }
    if (
      userDetails.fromLocation === "" ||
      userDetails.fromLocation === undefined ||
      userDetails.fromLocation === "select" ||
      (userDetails.fromLocation === userDetails.toLocation)
    ) {
      fromCityError = "Please select from location";
    }
    if (
      userDetails.toLocation === "" ||
      userDetails.toLocation === undefined ||
      userDetails.toLocation === "select"
    ) {
      toCityError = "Please select to location";
    }
    if (
      userDetails.fromLocation === 'Other' && userDetails.fromCityId === 0
    ) {
      otherFromCityError = "Please enter other location";
    }
    if (
      userDetails.toLocation === "Other" && userDetails.toCityId === 0
    ) {
      otherToCityError = "Please enter other location";
    }
    if (
      userDetails.senderEmail === "" ||
      userDetails.senderEmail === undefined ||
      reg.test(userDetails.senderEmail) === false
    ) {
      emailError = "Please enter Email";
    }
    if (
      userDetails.senderMobileNumber === "" ||
      userDetails.senderMobileNumber === undefined ||
      pattern.test(userDetails.senderMobileNumber) === false ||
      userDetails.senderMobileNumber.length !== 10
    ) {
      mobileError = "Please enter Mobile Number";
    }
    if (userDetails.senderName === "" || userDetails.senderName === undefined) {
      nameError = "Please enter Name";
    }

    if (
      mobileError ||
      emailError ||
      nameError ||
      fromCityError ||
      toCityError ||
      otherFromCityError ||
      otherToCityError ||
      serviceTypeError
    ) {
      setDefaultState({
        mobileError,
        emailError,
        nameError,
        fromCityError,
        toCityError,
        otherFromCityError,
        otherToCityError,
        serviceTypeError
      });
      return false;
    }
    return true;
  };
  const handleEnqClose = () => {
    setEnqDialogOpen(false);
    setUserDetails({
      bookingDate: new Date(),
      priceDetails: {
        totalCharges: 0,
        frieghtCharges: 0,
        taxamt: 0
      },
      serviceType: ''
    });
    setDefaultState(defaultError)
  }
  console.log(userDetails)
  
  return (
    <>
      <Button className='btnRed' onClick={() => setEnqDialogOpen(true)} style={{ left: "90%" }}>ADD</Button>
      <Dialog
        fullWidth
        variant="standard"
        maxWidth={'xs'}
        open={enqDialogOpen}
      >
        <DialogTitle>Add Booking {bType === 'booking' || bType === 'cBooking' ? null : 'Enquiry'}</DialogTitle>
        <DialogContent className='mt-4'>
          {/* <DialogContentText>
            You can set my maximum width and whether to adapt or not.
          </DialogContentText> */}

          <div className="row">
            <div className="form-group col-md-6">
              <CustomSelect
                name="fromCityId"
                options={fdata}
                inval={userDetails.fromCityId}
                fieldtype={"fromCityId"}
                value1={"fromLocation"}
                sh={"fromCityShortCode"}
              />
              {defaultState.fromCityError ? <span className="text-danger">
                {defaultState.fromCityError}
              </span> : null
              }
            </div>
            <div className="form-group col-md-6">
              <CustomSelect
                name="toCityId"
                options={tdata}
                inval={userDetails.toCityId}
                fieldtype={"toCityId"}
                value1={"toLocation"}
                sh={"toCityShortcode"}
              />
              {defaultState.toCityError ? <span className="text-danger">
                {defaultState.toCityError}
              </span> : null
              }
            </div>
            {userDetails.fromCityId === 0 ?
              <div className="form-group col-md-6">
                <TextField
                  fullWidth
                  variant="standard"
                  label="Other From City"
                  name="fromLocation"
                  value={userDetails.fromLocation !== 'Other' ? userDetails.fromLocation : ''}
                  onChange={handleChange}
                  margin="normal"
                  autoComplete='off'
                  focused
                />
                <span className="text-danger">
                  {defaultState.otherFromCityError}
                </span>
              </div>
              : null}
            {userDetails.toCityId === 0 ?
              <div className="form-group col-md-6">
                <TextField
                  fullWidth
                  variant="standard"
                  label="Other To City"
                  name="toLocation"
                  value={userDetails.toLocation !== 'Other' ? userDetails.toLocation : ''}
                  onChange={handleChange}
                  margin="normal"
                  autoComplete='off'
                  focused
                />
                <span className="text-danger">
                  {defaultState.otherToCityError}
                </span>
              </div>
              : null}
            <div className="form-group col-md-6">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Booking Date"
                  name="bookingDate"
                  value={dayjs(userDetails.bookingDate)}
                  onChange={handleDate}
                  fieldtype={"bookingDate"}
                  minDate={dayjs()}
                  slotProps={{ textField: { variant: "standard" } }}
                />
              </LocalizationProvider>
            </div>
            <div className="col-md-6">
              <TextField
                fullWidth
                variant="standard"
                label="Name"
                name="senderName"
                value={userDetails.senderName}
                onChange={handleChange}
                margin="normal"
                autoComplete='off'
                focused
              />
              <span className="text-danger">
                {defaultState.nameError}
              </span>
            </div>
            <div className="form-group col-md-6">
              <TextField
                fullWidth
                variant="standard"
                label="Mobile Number"
                name="senderMobileNumber"
                value={userDetails.senderMobileNumber}
                onChange={handleChange}
                pattern="[6-9]{1}[0-9]{4}[0-9]{5}"
                margin="normal"
                autoComplete='off'
                focused
              />
              <span className="text-danger">
                {defaultState.mobileError}
              </span>
            </div>
            <div className="form-group col-md-6">
              <FormControl fullWidth margin="normal" variant="standard" >
                <InputLabel id="booking-type-label">Booking Type</InputLabel>
                <Select
                  labelId="booking-type-label"
                  id="booking-type"
                  name="serviceType"
                  value={userDetails.serviceType || 'Select'}
                  onChange={handleChange}
                  focused
                >
                  <MenuItem value="1">Door-Door</MenuItem>
                  <MenuItem value="4">Hub-Hub</MenuItem>
                  <MenuItem value="2">Door-Hub</MenuItem>
                  <MenuItem value="3">Hub-Door</MenuItem>
                </Select>
              </FormControl>
              <span className="text-danger">
                {defaultState.serviceTypeError}
              </span>
            </div>
            <div className="form-group col-md-6">
              <TextField
                fullWidth
                variant="standard"
                label="Email"
                name="senderEmail"
                value={userDetails.senderEmail}
                onChange={handleChange}
                margin="normal"
                autoComplete='off'
                focused
              />
              <span className="text-danger">
                {defaultState.emailError}
              </span>
            </div>
            <Box sx={{ width: '250px' }} className="form-group col-md-6">
              <TextField
                fullWidth
                label="Price"
                name="totalCharges"
                value={userDetails.priceDetails.totalCharges}
                onChange={handleChange}
                margin="normal"
                disabled={userDetails.fromCityId === 0 || userDetails.toCityId === 0 ? false : true}
                variant='standard'
                focused
                type='number'
              />
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEnqSubmit} className="btnRed"> Submit </Button>
          <Button onClick={handleEnqClose} className="btnRed-outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddEnquirypopup;