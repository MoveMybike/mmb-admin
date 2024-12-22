import React,{ useState,useEffect }   from 'react';
import DataTable from 'react-data-table-component';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem,TextField,Box, InputLabel, FormControl,CircularProgress } from "@mui/material";
// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import userService from "../services/user.service";
import moment from 'moment';
// import DatePicker from "react-datepicker";
// // import Moment from "moment";
// import "react-datepicker/dist/react-datepicker.css";
const PartialOrderView = ({ bookdata ,handleEnqRowUpdate}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("")
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    const [formCityData, setFdata] = useState([]);
    const [toCityData, setTdata] = useState([]);
    const [priceData, setPriceDetails] = useState(0);

    const [fromCityId, setFromCityId] = useState(0);
    const [toCityId, setToCityId] = useState(0);

    const [updatedValue, setUpdatedValue] = useState(priceData)

    const [selectedOption, setSelectedOption] = useState("");

    const statusMapping = {
        O: { label: "Open", color: "lightgreen" },
        R: { label: "Cancelled", color: "red" },
        P: { label: "Postponed", color: "orange" },
        U: { label: "Customer Confirmation", color: "vilot" },
        M: { label: "MMMB Confirmation", color: "purple" },
        N: { label: "No Response", color: "gray" },
        Y: { label: "Booking Confirmed", color: "green" }
      };
      const handleUpdate = (bookingId,approveStatus) => {
        // Example of updating the row with new data
        const updatedRow = { enquiryStatus: approveStatus}; // Simulate an updated status
        handleEnqRowUpdate(bookingId, updatedRow);
      };
      useEffect(() => {
        const cityData = userService.getFromAndToCities()
        setTimeout(() => {
          cityData.then((result) => {
            console.log(result);
            setFdata(result.fromCities);
            setTdata(result.toCities);
            setLoading(false);
          })
        }, 1000);
      }, []);

      useEffect(() => {
        fetchPriceDetails();
      }, [fromCityId, toCityId]);
      useEffect(() => {
        const defaultFrom = formCityData.find((city) => city.location === formData.fromLocation);
        const defaultTo = toCityData.find((city) => city.location === formData.toLocation);
    let fromshortcode=""
        let toshortcode=""
        if (defaultFrom) {
          setFromCityId(defaultFrom.id);
          fromshortcode=defaultFrom.shortcode;
        }
        if (defaultTo) 
          {
            setToCityId(defaultTo.id);
            toshortcode=defaultTo.shortcode;
          }
        setFormData((prevData) => ({
          ...prevData,
        fromCityShortCode: fromshortcode,
        toCityShortcode :toshortcode
        }));
      }, [formCityData, toCityData, formData.fromLocation, formData.toLocation]);

      const fetchPriceDetails = async () => {
        if (fromCityId && toCityId) {
          try {
            const data = await userService.getFromAndToCitiesPrice(fromCityId, toCityId);
            setPriceDetails(data);
          } catch (error) {
            console.error('Failed to fetch price details:', error);
          }
        }
      };
    
  
      const handleConvertClick = (row) => {
        setFormData({
          senderName: row.senderName,
          senderMobileNumber: row.senderMobileNumber,
          toLocation: row.toCity,
          fromLocation: row.fromCity,
          senderEmail: row.senderEmail,
          fromCityShortCode :"",
          toCityShortcode:"",
          // bookingDate: row.bookingDate ? moment(row.bookingDate, 'MM/dd/yyyy').toDate() : null,
          bookingDate: row.bookingDate,
          // serviceType : "",
          // price : updatedValue,
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
            totalCharges: updatedValue,
            frieghtCharges: formData.priceData,
            taxamt: 0,
            deliveryCharge: 0,
            pickupCharge: 0,
            doordelCharge: 0,
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
        setSelectedStatus(""); // Reset the selected status
      };
      const handleCloseDialogConvert = () => {
        setOpenDialog(false);
        setSelectedOption(0)
        setFormData(null)
        setFromCityId(0);
        setPriceDetails(0)
        setUpdatedValue(0)
      };
      const handleSubmit = async () => {
        try {
        const enqId = selectedRow.id; // Example booking ID
        const enqStatus = selectedStatus; // Example tracking status
      
          const result = await userService.approveEnqiry(enqId, enqStatus);
          handleUpdate(result.id,result.enquiryStatus)
          alert("Enquiry Submited successfully!");
          console.log("Approval Result:", result);
          handleCloseDialog();
        } catch (error) {
          alert("Failed to approve booking. Please try again.");
          console.error("Approval Error:", error);
        }
      };
      
      const handleConvert = async () => {
        alert("Enquiry Booking")
        console.log("Form submitted with data: ", formData);
       const response=userService.convertBooking(formData);
       console.log("convert response",response)
        // Perform API call or processing here
        setOpenDialog(false);
        // try {
        // const enqId = selectedRow.id; // Example booking ID
        // const enqStatus = selectedStatus; // Example tracking status
      
        //   const result = await userService.approveEnqiry(enqId, enqStatus);
        //   alert("Enquiry Submited successfully!");
        //   console.log("Approval Result:", result);
        // } catch (error) {
        //   alert("Failed to approve booking. Please try again.");
        //   console.error("Approval Error:", error);
        // }
      };
      const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
      };

      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));

        if (name === "fromCity") {
          setFromCityId(parseInt(e.target.value));
        } else if (name === "toCity") {
          setToCityId(parseInt(e.target.value));
        }
        if(name==="serviceType")
        {
        // let servicePrice=0;
        //   if(value==1)
        //     servicePrice=1200;
        //   else if(value==3 || value ==4)
        //      servicePrice=600;
        //  const priceVal=priceData+servicePrice;
        //  setPriceDetails(priceVal);
        handleDropdownChange(e);
        }
        if(name==="price")
        {
          handleMainValueChange(e)
        }
      };

      const handleMainValueChange = (event) => {
        const value = parseInt(event.target.value, 10) || 0;
        setPriceDetails(value);
    
        // Update updatedValue if a dependent selection exists
        if (selectedOption === "1") {
          setUpdatedValue(value + 1000);
        } else if (selectedOption === "2" || selectedOption === "3") {
          setUpdatedValue(value + 500);
        } else if (selectedOption === "4") {
          setUpdatedValue(value);
        }
        let taxamt=updatedValue * 0.18;
        setFormData((prevData) => ({
          ...prevData,
          priceDetails: {
          ...prevData.priceDetails,
           totalCharges: updatedValue,
           frieghtCharges: value,
           taxamt: taxamt,
          },
        }));
      };
    
      const handleDropdownChange = (event) => {
        const value = event.target.value;
    
        let newValue = priceData;
    
        if (value === "1") {
          newValue = priceData + 1000; // Add 1000 for option 1
          formDateSet(1)
        } else if (value === "2" || value === "3") {
          newValue = priceData + 500; // Add 500 for option 2 or 3
        } else if (value === "4") {
          newValue = priceData; // No change for option 4
        }
        let taxamt = parseInt(newValue) * 0.18;
        
        setUpdatedValue(newValue+taxamt);

        setFormData((prevData) => ({
          ...prevData,
          priceDetails: {
          ...prevData.priceDetails,
           totalCharges: updatedValue,
           frieghtCharges: newValue,
           taxamt: taxamt,
          },
        }));
        setSelectedOption(value);
      };
      
      const formDateSet=(val)=>
        {
          let pickupCharge=0;
          let doordelCharge=0;
         let pickupType=1;
         let deliveryType=1;
          if(val=1)
          {
            pickupType=2;
            deliveryType=2;
             pickupCharge=500;
             doordelCharge=500;
          }
          else if(val==2)
          {
            pickupType=2;
            pickupCharge=500;
            doordelCharge=0;
          }
          else if(val==3)
          {
            deliveryType=2;
            pickupCharge=0;
            doordelCharge=500;
          }
          setFormData((prevData) => ({
            ...prevData,
            deliveryType:deliveryType,
            pickupType:pickupType,
            priceDetails: {
            ...prevData.priceDetails,
              deliveryCharge: 0,
              pickupCharge: pickupCharge,
              doordelCharge: doordelCharge,
              damageCharge: 0,
            },
          }));
        } 
    const columns = [
        {
            name: "Actions",
            cell: (row) => (
            <div style={{ display: "flex", gap: "5px" }}>
                {/* <button
                  onClick={() => handleConvertClick(row)}
                  className="btn-enq"
                  style={{ width: "70px" }}
                >
                  Convert
                </button> */}
                <button
                  onClick={() => handleApprove(row)}
                  className="btn-approve"
                  style={{ width: "70px" }}
                >
                  Approve
                </button>
              </div>
            ),
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
            grow: 2
          },
        {
            name: 'Name',
            selector: row => row.senderName,
            sortable: true,
            grow: 2,
        },
        {
            name: 'MobileNumber',
            selector: row => row.senderMobileNumber,
            sortable: true,
        	hide: 'sm',
        },
        {
            name: 'From',
            selector: row => row.fromCity,
            sortable: true,
        	hide: 'sm',
        },
        {
            name: 'To',
            selector: row => row.toCity,
            sortable: true,
        	hide: 'sm',
        },
        {
            name: 'Booking Date',
            selector: row => row.bookingDate,
            sortable: true,
        	hide: 'sm',
        },
        {
            name: 'Created Date',
            selector: row => row.createDateTime.slice(0,10),
            sortable: true
        }
    ];
    const ExpandedComponent = ({ data }) =>{
        return(
        <div className='row pl-5 expndeddata'>
            <div className='col-md-6 row'>
                <div className='col-md-4'>
                    <h6>From City</h6>
                </div>
                <div className='col-md-8'>
                    <h6><b>{data.fromCity}</b></h6>
                </div>
            </div>
            <div className='col-md-6 row'>
                <div className='col-md-4'>
                    <h6>To Address</h6>
                </div>
                <div className='col-md-8'>
                    <h6><b>{data.toCity}</b></h6>
                </div>
            </div>
            <div className='col-md-6 row'>
                <div className='col-md-4'>
                <h6>Created Date</h6>
                </div>
                <div className='col-md-8'>
                    <h6><b>{data.createDateTime}</b></h6>
                </div>
            </div>
            <div className='col-md-6 row'>
                <div className='col-md-4'>
                    <h6>Mobile Number</h6>
                </div>
                <div className='col-md-8'>
                <h6><b>{data.senderMobileNumber}</b></h6>
                </div>
            </div>
            <div className='col-md-6 row'>
                <div className='col-md-4'>
                    <h6>Email</h6>
                </div>
                <div className='col-md-8'>
                <h6><b>{data.senderEmail}</b></h6>
                </div>
            </div>
        </div>
        )
    };
    const handleSort = (column, sortDirection) => console.log(column.selector, sortDirection);
    return (
        <>
        <DataTable
            title="Booking Enquiry"
            columns={columns}
            data={bookdata}
            expandableRows expandableRowsComponent={ExpandedComponent}
            pagination
            highlightOnHover
		        pointerOnHover
            onSort={handleSort}
            
        />
         {/* Dialog for Approve */}
         <Dialog open={dialogOpen} onClose={handleCloseDialog}>
         <DialogTitle>Approve Booking</DialogTitle>
         <DialogContent>
           <p>Select a status for Enquiry ID: {selectedRow?.id}</p>
           <Select
             value={selectedStatus}
             onChange={handleStatusChange}
             fullWidth
           >
             {Object.keys(statusMapping).map((key) => (
               <MenuItem key={key} value={key}>
                 {statusMapping[key].label}
               </MenuItem>
             ))}
           </Select>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleCloseDialog}>Cancel</Button>
           <Button onClick={handleSubmit} color="primary" disabled={!selectedStatus}>
             Submit
           </Button>
         </DialogActions>
       </Dialog>
        {/* Dialog Component */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Convert Booking</DialogTitle>
        <DialogContent>
<Box
  sx={{
    display: 'flex', // Enables horizontal layout
    gap: 2,          // Adds space between the fields
    flexWrap: 'wrap', // Wraps to the next row if needed
  }}
>
    <Box sx={{ width: '250px' }}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="from-city-label">From City</InputLabel>
        <Select
          labelId="from-city-label"
          id="from-city-select"
          name="fromLocation"
          value={formData.fromLocation || ""}
          onChange={handleChange}
        >
    
          {formCityData.length > 0 ? (
            formCityData.map((fromCity) => (
              <MenuItem key={fromCity.id} value={fromCity.location}>
                {fromCity.location}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No Cities Available</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
    <Box sx={{ width: '250px' }}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="to-city-label">To City</InputLabel>
        <Select
          labelId="to-city-label"
          id="from-city-select"
          name="toLocation"
          value={formData.toLocation || ""}
          onChange={handleChange}
        >
    
          {formCityData.length > 0 ? (
            toCityData.map((toCity) => (
              <MenuItem key={toCity.id} value={toCity.location}>
                {toCity.location}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No Cities Available</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
<Box sx={{ width: '250px' }}>
    <TextField
      fullWidth
      label="Name"
      name="senderName"
      value={formData.senderName || ""}
      onChange={handleChange}
      margin="normal"
    />
  </Box>
  <Box sx={{ width: '250px' }}>
    <TextField
      fullWidth
      label="Mobile Number"
      name="senderMobileNumber"
      value={formData.senderMobileNumber || ""}
      onChange={handleChange}
      margin="normal"
    />
  </Box>
  <Box sx={{ width: '250px' }}>
          <TextField
            fullWidth
            label="Email"
            name="senderEmail"
            value={formData.senderEmail || ""}
            onChange={handleChange}
            margin="normal"
          />
          </Box>
          <Box sx={{ width: '250px' }}>
          <TextField
            fullWidth
            label="Booking Date"
            name="bookingDate"
            value={formData.bookingDate || ""}
            onChange={handleChange}
            margin="normal"
          />
          </Box>
          {/* <Box sx={{ width: '250px' }}>
          <DatePicker
          selected={formData.bookingDate}
          name="bookingDate"
          //   onChange={date => setStartDate(date)}
          onChange={handleChange}
          minDate={new Date()}
          dateFormat="MM/dd/yyyy"
    />
          </Box> */}
      {/* Booking Type Dropdown */}
      <Box sx={{ width: '250px' }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="booking-type-label">Booking Type</InputLabel>
          <Select
            labelId="booking-type-label"
            id="booking-type"
            name="serviceType"
            value={selectedOption}
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
        <Box sx={{ width: '250px' }}>
        <TextField
            type="number"
            fullWidth
            label="Price"
            name="price"
            value={formData.price || updatedValue!=0 ? updatedValue:priceData}
            onChange={handleChange}
            margin="normal"
            disabled 
          />
  </Box>
      </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogConvert}>Cancel</Button>
          <Button onClick={handleConvert} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
     </>
    )
}

export default PartialOrderView;