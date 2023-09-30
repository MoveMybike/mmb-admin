import React from "react";
import userService from "../services/user.service";
import SideNavComponent from "./SideNavComponent";
import DataTable from 'react-data-table-component';

function FromCitiDataTable() {
  const [bookdata, setBookdata] = React.useState();
  const user = JSON.parse(localStorage.getItem('user'));
  const columns = [
    {
        name: 'Name',
        selector: row => row.fromLocation,
        sortable: true,
        grow: 2,
    },
    {
      name: 'ShortCode',
      selector: row => row.fromCityShortCode,
      sortable: true,
      grow: 2,
    },
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
      grow: 2,
    },
    {
      name: 'status',
      selector: row => row.status,
      sortable: true,
      grow: 2,
    },
];

  React.useEffect(() => {
    const userData = userService.getFromCities
    userData.then((result) => {
      setBookdata(result)
    })
  }, [user.jwt]); 
  const handleSort = (column, sortDirection) => console.log(column.selector, sortDirection);
  return (
    bookdata != null ? (
      <div className='row p-1 pt-5'>
        <div className='col-md-2'>
          <SideNavComponent />
        </div>
        <div className='col-md-10'>
          <DataTable
              title="From Cities"
              columns={columns}
              data={bookdata}
              pagination
              highlightOnHover
              pointerOnHover
              onSort={handleSort}
              
          />
        </div>
    </div>
      ) : (
        "Loading"
      )
  );
}

export default FromCitiDataTable