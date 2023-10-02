import React from 'react';
import DataTable from 'react-data-table-component';


const OrderView = ({ bookdata }) => {
    const columns = [
        {
            name: 'Name',
            selector: row => row.senderName,
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
    )
}

export default OrderView;