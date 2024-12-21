import React,{ useState,useEffect }   from 'react';
import DataTable from 'react-data-table-component';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem,TextField,Box, InputLabel, FormControl,CircularProgress } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import userService from "../services/user.service";

const PartialOrderView = ({ bookdata }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("")
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    const [formCityData, setFdata] = useState({});
    const [toCityData, setTdata] = useState({});
    const [priceData, setPriceDetails] = useState(0);
    const statusMapping = {
        O: { label: "Open", color: "lightgreen" },
        R: { label: "Cancelled", color: "red" },
        P: { label: "Postponed", color: "orange" },
        U: { label: "Customer Confirmation", color: "vilot" },
        M: { label: "MMMB Confirmation", color: "purple" },
        N: { label: "No Response", color: "gray" },
        Y: { label: "Booking Confirmed", color: "green" }
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
  
      const handleConvertClick = (row) => {
        setFormData({
          senderName: row.senderName,
          senderMobileNumber: row.senderMobileNumber,
          toCity: row.toCity,
          fromCity: row.fromCity,
          senderEmail: row.senderEmail,
          bookingDate: row.bookingDate,
          serviceType : "",
          price : 0
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
      };
      const handleSubmit = async () => {
        alert("Enquiry Test")
        try {
        const enqId = selectedRow.id; // Example booking ID
        const enqStatus = selectedStatus; // Example tracking status
      
          const result = await userService.approveEnqiry(enqId, enqStatus);
          alert("Enquiry Submited successfully!");
          console.log("Approval Result:", result);
        } catch (error) {
          alert("Failed to approve booking. Please try again.");
          console.error("Approval Error:", error);
        }
      };
      
      const handleConvert = async () => {
        alert("Enquiry Test")
        console.log("Form submitted with data: ", formData);
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
      };
    const columns = [
        {
            name: "Actions",
            cell: (row) => (
            <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => handleConvertClick(row)}
                  className="btn-enq"
                  style={{ width: "70px" }}
                >
                  Convert
                </button>
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
           <p>Select a status for booking ID: {selectedRow?.id}</p>
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
          name="fromCity"
          value={formData.fromCity || ""}
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
          name="toCity"
          value={formData.toCity || ""}
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
        {/* <Box sx={{ width: '200px' }}>
        <DatePicker
          label="Booking Date"
          value={formData.bookingDate} // Controlled value for DatePicker
          onChange={handleChange('bookingDate')} // Update the date in state
          renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
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
            value={formData.serviceType | ""}
            onChange={handleChange}
          >
            <MenuItem value="1">Door-Door</MenuItem>
            <MenuItem value="2">Hub-Hub</MenuItem>
            <MenuItem value="3">Door-Hub</MenuItem>
            <MenuItem value="4">Hub-Door</MenuItem>
          </Select>
        </FormControl>
        </Box>
        <Box sx={{ width: '250px' }}>
        <TextField
            fullWidth
            label="Price"
            name="price"
            value={formData.price || 0}
            onChange={handleChange}
            margin="normal"
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