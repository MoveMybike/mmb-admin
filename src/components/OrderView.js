import React, { useState }  from 'react';
import DataTable from 'react-data-table-component';
import userService from "../services/user.service";

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem } from "@mui/material";

const OrderView = ({ bookdata }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("")

    const statusMapping = {
        O: { label: "Open", color: "lightgreen" },
        R: { label: "Cancelled", color: "red" },
        P: { label: "Postponed", color: "orange" },
        U: { label: "Customer Confirmation", color: "vilot" },
        M: { label: "MMMB Confirmation", color: "purple" },
        N: { label: "No Response", color: "gray" },
        Y: { label: "Booking Confirmed", color: "green" },
        F: { label: "Feedback", color: "pink" },
        C: { label: "Closed", color: "coffe" },
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
      const handleSubmit = async () => {
        try {
          const bookingId = selectedRow.id; // Example booking ID
          const trackingStatus = selectedRow.status; // Example tracking status
          const approveStatus = selectedStatus; // Example approve status
      
          const result = await userService.approveBookings(bookingId, trackingStatus, approveStatus);
          alert("Booking approved successfully!");
          console.log("Approval Result:", result);
        } catch (error) {
          alert("Failed to approve booking. Please try again.");
          console.error("Approval Error:", error);
        }
      };
      
      const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
      };
    const columns = [
        {
            name: "Actions",
            cell: (row) => (
              <button onClick={() => handleApprove(row)} className="btn-approve">
                Approve
              </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
          },
        {
            name: 'Name',
            selector: row => row.senderName,
            sortable: true,
            grow: 2
        },
        {
            name: "Booking Status",
            selector: (row) => row.status,
            cell: (row) => {
              const status = statusMapping[row.status] || { label: "Unknown", color: "gray" };
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
            name: 'MobileNumber',
            selector: row => row.senderMobileNumber,
            sortable: true,
        	hide: 'sm',
        },
        {
            name: 'From',
            selector: row => row.fromLocation,
            sortable: true,
        	hide: 'sm',
        },
        {
            name: 'To',
            selector: row => row.toLocation,
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
                    <h6>From Address</h6>
                </div>
                <div className='col-md-8'>
                    <h6><b>{data.fromAdress.cityDoorpick != null ? data.fromAdress.streetDoorpick+' , '+data.fromAdress.cityDoorpick+' , '+data.fromAdress.stateDoorpick+' , '+data.fromAdress.zipDoorpick : 'Station'}</b></h6>
                </div>
            </div>
            <div className='col-md-6 row'>
                <div className='col-md-4'>
                    <h6>To Address</h6>
                </div>
                <div className='col-md-8'>
                    <h6><b>{data.toAdress.cityDoordel != null ? data.toAdress.streetDoordel+' , '+data.toAdress.cityDoordel+' , '+data.toAdress.stateDoordel+' , '+data.toAdress.zipDoordel : 'Station'}</b></h6>
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
                    <h6>Ph Number</h6>
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
            <div className='col-md-6 row'>
                <div className='col-md-4'>
                    <h6>Total Amt</h6>
                </div>
                <div className='col-md-8'>
                <h6><b>{data.priceDetails.totalCharges}</b></h6>
                </div>
            </div>
        </div>
        )
    };
    const handleSort = (column, sortDirection) => console.log(column.selector, sortDirection);
    return (
        <>
          <DataTable
            title="ALL Bookings"
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
        </>
      );
}

export default OrderView;