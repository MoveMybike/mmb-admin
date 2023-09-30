import React from 'react';
import DataTable from 'react-data-table-component';


const PartialOrderView = ({ bookdata }) => {
    const columns = [
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
            name: 'Email',
            selector: row => row.senderEmail,
            sortable: true,
        	hide: 'sm',
            grow: 2,
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
    )
}

export default PartialOrderView;