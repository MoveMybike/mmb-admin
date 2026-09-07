import React, { useState, useEffect, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem, TextField, Box, InputLabel, FormControl, IconButton, Tooltip, Menu, ListItemText, Checkbox, Divider } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import userService from "../services/user.service";
import "../App.css";
import AddEnquirypopup from './AddEnquirypopup';
import { UserContext, UserDispatchContext } from '../Context/MyContext';
import CustomSelect from './SelectComponent';
import { DetailPanel, DetailRow } from './DetailRow';


const PartialOrderView = ({
  bookdata,
  handleEnqRowUpdate,
  paginationServer = false,
  paginationTotalRows = 0,
  paginationDefaultPage = 1,
  paginationPerPage = 50,
  progressPending = false,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const userDetails = React.useContext(UserContext);
  const setUserDetails = useContext(UserDispatchContext);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("")
  const [openDialog, setOpenDialog] = useState(false);
  const [formCityData, setFdata] = useState([]);
  const [toCityData, setTdata] = useState([]);
  const [priceData, setPriceDetails] = useState(0);

  // Audit columns are hidden by default; users can turn them on via the gear menu.
  const AUDIT_COLUMNS = ['Created Date', 'Created By', 'Last Updated Date', 'Last Updated By'];
  const COL_PREF_KEY = 'bookingEnquiryHiddenColumns';
  const [colMenuAnchor, setColMenuAnchor] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(COL_PREF_KEY);
      return saved ? JSON.parse(saved) : AUDIT_COLUMNS;
    } catch (e) {
      return AUDIT_COLUMNS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COL_PREF_KEY, JSON.stringify(hiddenColumns));
    } catch (e) {
      /* ignore storage failures */
    }
  }, [hiddenColumns]);
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

  const [updatedValue, setUpdatedValue] = useState(priceData)

  const [selectedOption, setSelectedOption] = useState("");
  const defaultCloseData = {
    bookingDate: new Date(),
    priceDetails: {
      totalCharges: 0,
      frieghtCharges: 0,
      taxamt: 0
    },
    serviceType: ''
  }

  const statusMapping = {
    O: { label: "Open", color: "lightgreen" },
    R: { label: "Cancelled", color: "red" },
    P: { label: "Postponed", color: "orange" },
    U: { label: "Customer Confirmation", color: "vilot" },
    M: { label: "MMMB Confirmation", color: "purple" },
    N: { label: "No Response", color: "gray" },
    Y: { label: "Booking Confirmed", color: "green" },
    Z : { label: "Booking Converted", color: "Yellow" }
  };
  const handleUpdate = (bookingId, approveStatus) => {
    // Example of updating the row with new data
    const updatedRow = { enquiryStatus: approveStatus }; // Simulate an updated status
    handleEnqRowUpdate(bookingId, updatedRow);
  };

  useEffect(() => {
    const cityData = userService.getFromAndToCities()
    setTimeout(() => {
      cityData.then((result) => {
        setFdata(result.fromCities);
        setTdata(result.toCities);
      })
    }, 1000);
  }, []);


  useEffect(() => {
    fetchPriceDetails1();
  }, [userDetails.fromCityId && userDetails.toCityId]);
  useEffect(() => {
    totalAmountCal1();
  }, [userDetails.serviceType, userDetails.priceDetails.frieghtCharges]);

  const fetchPriceDetails1 = async () => {
    if (userDetails.fromCityId && userDetails.toCityId) {
      try {
        const data = await userService.getFromAndToCitiesPrice(userDetails.fromCityId, userDetails.toCityId);
        setUserDetails((prevState) => ({
          ...prevState,
          priceDetails: {
            ...prevState.priceDetails,
            frieghtCharges: data
          },
        }));
      } catch (error) {
        console.error('Failed to fetch price details:', error);
      }
    }
  }
  const totalAmountCal1 = () => {
    if (userDetails.fromCityId && userDetails.toCityId) {
      const sType = userDetails.serviceType;
      const serviceCharge = sType === '1' ? 1200 : sType === '2' || sType === '3' ? 600 : null;
      const taxamt = (userDetails.priceDetails.frieghtCharges + serviceCharge) * 0.18;
      setUserDetails((prevState) => ({
        ...prevState,
        pickupType: userDetails.serviceType ===1 || userDetails.serviceType ===2 ? 2 : 1,
        deliveryType: userDetails.serviceType ===1 || userDetails.serviceType ===3 ? 2 : 1,
        priceDetails: {
          ...prevState.priceDetails,
          serviceCharge,
          frieghtCharges: userDetails.priceDetails.frieghtCharges,
          totalCharges: userDetails.priceDetails.frieghtCharges + serviceCharge + taxamt,
          taxamt,
          pickupCharge: userDetails.serviceType ===1 || userDetails.serviceType ===2 ? 600 : 0,
          doordelCharge: userDetails.serviceType ===1 || userDetails.serviceType ===3 ? 600 : 0
        },
      }));
    }
  }

  console.log(userDetails)
  const handleConvertClick = (row) => {
    setSelectedRow(row);
    const fromCityVer = formCityData.find((city) => city.location === row.fromCity);
    const fromCityId = fromCityVer !== undefined ? fromCityVer.id : null;
    const toCityVer = toCityData.find((city) => city.location === row.toCity);
    const toCityId = toCityVer !== undefined ? toCityVer.id : 0;
    const toCityShortcode= toCityVer !== undefined ? toCityVer.shortcode : " ";
    const fromCityShortcode= fromCityVer !== undefined ? fromCityVer.shortcode : " ";
    setUserDetails({
      senderName: row.senderName,
      senderMobileNumber: row.senderMobileNumber,
      toLocation: row.toCity,
      fromLocation: row.fromCity,
      senderEmail: row.senderEmail,
      fromCityId,
      toCityId,
      fromCityShortCode: fromCityShortcode,
      toCityShortcode: toCityShortcode,
      // bookingDate: row.bookingDate ? moment(row.bookingDate, 'MM/dd/yyyy').toDate() : null,
      bookingDate: row.bookingDate,
      damageScheme :'N',
      assureScheme : 'N',
      pickupType: userDetails.serviceType ===1 || userDetails.serviceType ===2 ? 2 : 1,
      deliveryType: userDetails.serviceType ===1 || userDetails.serviceType ===3 ? 2 : 1,
      // serviceType : "",
      priceDetails: {
        totalCharges: updatedValue,
        frieghtCharges: userDetails.priceData,
        taxamt: userDetails.taxamt,
        deliveryCharge: 0,
        pickupCharge: userDetails.serviceType ===1 || userDetails.serviceType ===2 ? 600 : 0,
        doordelCharge: userDetails.serviceType ===1 || userDetails.serviceType ===3 ? 600 : 0,
        damageCharge: 0,
      },

    });
    setOpenDialog(true);
  };

  const handleApprove = (row) => {
    setSelectedRow(row);
    setDialogOpen(true); // Open the dialog
  };
  const handleCloseDialog = () => {
    setDialogOpen(false); // Close the dialog
    setSelectedRow(null); // Clear the selected row
    setUserDetails(defaultCloseData);
    setSelectedStatus(""); // Reset the selected status
  };

  const handleCloseDialogConvert = () => {
    setOpenDialog(false);
    setSelectedOption(0)
    setUserDetails(defaultCloseData);
  };
  const handleSubmit = async () => {
    try {
      const enqId = selectedRow.id; // Example booking ID
      const enqStatus = selectedStatus; // Example tracking status
      const result = await userService.approveEnqiry(enqId, enqStatus);
      handleUpdate(result.id, result.enquiryStatus)
      alert("Enquiry Submited successfully!");
      handleCloseDialog();
    } catch (error) {
      alert("Failed to approve booking. Please try again.");
      console.error("Approval Error:", error);
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
  const handleConvert = async () => {
    // validate();
    // if (validate()) {
    setOpenDialog(false);
    try {
    const enqId = selectedRow.id; // Example booking ID
    const enqStatus = userDetails; // Example tracking status

      const result = await userService.convertBooking(userDetails, enqId);
      alert("Booking Converstion Submited  successfully!");
      // Mark the enquiry as converted so the Convert button disables right away.
      handleEnqRowUpdate(enqId, { enquiryStatus: 'Z' });
      console.log("Approval Result:", result);
    } catch (error) {
      alert("Failed to Convert Booking. Please try again.");
      console.error("Approval Error:", error);
    }
    
  };
  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleDate = (e) => {
    setUserDetails((prevData) => ({
      ...prevData,
      bookingDate: e,
    }));
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const columns = [
    {
      name: "Actions",
      cell: (row) => {
        const isConverted = row.enquiryStatus === 'Z';
        return (
          <div style={{ display: "flex", gap: "5px" }}>
            <Button
              onClick={() => handleConvertClick(row)}
              className="btnRed"
              style={{ width: "50px", fontSize: '10px' }}
              disabled={isConverted}
              title={isConverted ? 'Booking already converted' : 'Convert'}
            >
              Convert
            </Button>
            {/* <AddEnquirypopup fdata={formCityData} tdata={toCityData} bType="pBooking" label="Convert" row={row}/> */}
            <Button
              onClick={() => handleApprove(row)}
              className="btnRed-outlined"
              style={{ width: "50px", fontSize: '10px' }}
            >
              Approve
            </Button>
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "140px"
    },
    {
      name: "Enquiry Status",
      selector: (row) => row.enquiryStatus,
      cell: (row) => {
        const status = statusMapping[row.enquiryStatus] || { label: "Unknown", color: "gray" };
        return (
          <span style={{ color: status.color, fontWeight: "bold" }}>
            {status.label}
          </span>
        );
      },
      sortable: true,
      grow: 2,
      minWidth: '170px',
    },
    {
      name: 'Name',
      selector: row => row.senderName,
      sortable: true,
      grow: 2,
      minWidth: '160px',
    },
    {
      name: 'MobileNumber',
      selector: row => row.senderMobileNumber,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'From',
      selector: row => row.fromCity,
      sortable: true,
      minWidth: '140px',
    },
    {
      name: 'To',
      selector: row => row.toCity,
      sortable: true,
      minWidth: '140px',
    },
    {
      name: 'Booking Date',
      selector: row => row.bookingDate,
      sortable: true,
      minWidth: '140px',
    },
    {
      name: 'Created Date',
      selector: row => (row.createDate ? row.createDate.slice(0, 10) : ''),
      sortable: true,
      minWidth: '140px',
    },
    {
      name: 'Created By',
      selector: row => row.createdBy || '',
      sortable: true,
      minWidth: '130px',
    },
    {
      name: 'Last Updated Date',
      selector: row => (row.lastUpdateDate ? row.lastUpdateDate.slice(0, 10) : ''),
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Last Updated By',
      selector: row => row.lastUpdatedBy || '',
      sortable: true,
      minWidth: '140px',
    }
  ];
  const ExpandedComponent = ({ data }) => {
    return (
      <DetailPanel>
        <DetailRow label="From City"><b>{data.fromCity}</b></DetailRow>
        <DetailRow label="To City"><b>{data.toCity}</b></DetailRow>
        <DetailRow label="Created Date"><b>{data.createDate}</b></DetailRow>
        <DetailRow label="Mobile Number"><b>{data.senderMobileNumber}</b></DetailRow>
        <DetailRow label="Email"><b>{data.senderEmail}</b></DetailRow>
      </DetailPanel>
    )
  };
  // console.log(userDetails)
  const handleSort = (column, sortDirection) => console.log(column.selector, sortDirection);

  const visibleColumns = columns.filter((c) => !hiddenColumns.includes(c.name));
  const openColMenu = (e) => setColMenuAnchor(e.currentTarget);
  const closeColMenu = () => setColMenuAnchor(null);
  const toggleColumn = (name) =>
    setHiddenColumns((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  const resetColumns = () => {
    setHiddenColumns(AUDIT_COLUMNS);
    closeColMenu();
  };

  return (
    <>
      <AddEnquirypopup fdata={formCityData} tdata={toCityData} bType="pBooking" label="ADD"/>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Tooltip title="Show / hide columns">
          <IconButton onClick={openColMenu} size="small">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={colMenuAnchor} open={Boolean(colMenuAnchor)} onClose={closeColMenu}>
          {columns
            .filter((c) => c.name && c.name !== 'Actions')
            .map((c) => (
              <MenuItem key={c.name} dense onClick={() => toggleColumn(c.name)}>
                <Checkbox size="small" checked={!hiddenColumns.includes(c.name)} />
                <ListItemText>{c.name}</ListItemText>
              </MenuItem>
            ))}
          <Divider />
          <MenuItem dense onClick={resetColumns}>
            <ListItemText>Reset to default</ListItemText>
          </MenuItem>
        </Menu>
      </div>
      <div className="table-scroll">
        <DataTable
          title="Booking Enquiry"
          columns={visibleColumns}
          data={bookdata}
          expandableRows expandableRowsComponent={ExpandedComponent}
          pagination
          paginationServer={paginationServer}
          paginationTotalRows={paginationTotalRows}
          paginationDefaultPage={paginationDefaultPage}
          paginationPerPage={paginationPerPage}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          progressPending={progressPending}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
          highlightOnHover
          pointerOnHover
          onSort={handleSort}
        />
      </div>
      {/* Dialog for Approve */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Approve Booking</DialogTitle>
        <DialogContent className='mt-4'>
          <p>Select a status for Enquiry ID: {selectedRow?.id}</p>
          <Select
            value={selectedStatus}
            onChange={handleStatusChange}
            fullWidth
            variant="standard"
          >
            {Object.keys(statusMapping).map((key) => (
              <MenuItem key={key} value={key}>
                {statusMapping[key].label}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} className="btnRed">Cancel</Button>
          <Button onClick={handleSubmit} className="btnRed-outlined" disabled={!selectedStatus}>Convert</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog Component */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth={'xs'}>
        <DialogTitle>Convert Booking</DialogTitle>
        <DialogContent className='mt-4'>
          <Box
            sx={{
              display: 'flex', // Enables horizontal layout
              gap: 2,          // Adds space between the fields
              flexWrap: 'wrap', // Wraps to the next row if needed
            }}
          >
            <Box sx={{ width: '175px' }}>
              <CustomSelect
                name="fromCityId"
                options={formCityData}
                inval={userDetails.fromCityId}
                fieldtype={"fromCityId"}
                value1={"fromLocation"}
                sh={"fromCityShortCode"}
              />
              {userDetails.fromCityId === null ? <span className='ml-2'>{userDetails.fromLocation} </span>: null }
            </Box>
            <Box sx={{ width: '175px' }}>
              <CustomSelect
                name="toCityId"
                options={toCityData}
                inval={userDetails.toCityId}
                fieldtype={"toCityId"}
                value1={"toLocation"}
                sh={"toCityShortcode"}
              />
              {userDetails.toCityId === null ? <span className='ml-2'>{userDetails.toLocation} </span>: null }
            </Box>
            <Box sx={{ width: '175px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Name"
                name="senderName"
                value={userDetails.senderName || ""}
                onChange={handleChange}
                margin="normal"
              />
            </Box>
            <Box sx={{ width: '175px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Mobile Number"
                name="senderMobileNumber"
                value={userDetails.senderMobileNumber || ""}
                onChange={handleChange}
                margin="normal"
              />
            </Box>
            <Box sx={{ width: '175px' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Email"
                name="senderEmail"
                value={userDetails.senderEmail || ""}
                onChange={handleChange}
                margin="normal"
              />
            </Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label="Booking Date"
                name="bookingDate"
                value={dayjs(userDetails.bookingDate)}
                onChange={handleDate}
                minDate={dayjs()}
                slotProps={{ textField: { variant: "standard" } }}
              />
            </LocalizationProvider>
            {/* Booking Type Dropdown */}
            <Box sx={{ width: '175px' }}>
              <FormControl fullWidth
                variant="standard" margin="normal">
                <InputLabel id="booking-type-label">Booking Type</InputLabel>
                <Select
                  labelId="booking-type-label"
                  id="booking-type"
                  name="serviceType"
                  value={userDetails.serviceType || 'Select'}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="1">Door-Door</MenuItem>
                  <MenuItem value="4">Hub-Hub</MenuItem>
                  <MenuItem value="2">Door-Hub</MenuItem>
                  <MenuItem value="3">Hub-Door</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: '175px' }}>
              <TextField
                type="number"
                fullWidth
                variant="standard"
                label="Price"
                name="totalCharges"
                value={userDetails.priceDetails.totalCharges}
                onChange={handleChange}
                margin="normal"
                disabled
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogConvert} className="btnRed">Cancel</Button>
          <Button onClick={handleConvert} className="btnRed-outlined">Convert Booking</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PartialOrderView;