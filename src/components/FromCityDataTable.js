import React from "react";
import userService from "../services/user.service";
import SideNavComponent from "./SideNavComponent";
import DataTable from 'react-data-table-component';
import AddCity from "./AddCity";

function FromCityDataTable() {
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
      name: 'status',
      selector: row => row.status === 1 ? 'Active' : 'Inactive',
      sortable: true,
      grow: 2,
    },
    {
          name: "Actions",
          cell: (row) => (
            <div>
              <AddCity cName={row.fromLocation} cCode={row.fromCityShortCode} cId={row.id} bType="fromCity" cStatus={row.status} label="Update" row={row}/>
            </div>
          ),
          ignoreRowClick: true,
          button: true
        },
];

  React.useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // If getFromCities is a function, call it. Otherwise treat it as a value.
        const raw = typeof userService.getFromCities === 'function'
          ? await userService.getFromCities(user?.jwt)
          : userService.getFromCities;

        // If raw is a promise-like object, await it to be safe
        const result = raw && typeof raw.then === 'function' ? await raw : raw;

        if (mounted) setBookdata(result);
      } catch (err) {
        console.error('Failed to load from cities', err);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [user?.jwt]); 
  const handleSort = (column, sortDirection) => console.log(column.selector, sortDirection);
  return (
    bookdata != null ? (
      <div className='row p-1 pt-5'>
        <div className='col-md-2'>
          <SideNavComponent />
        </div>
        <div className='col-md-10'>
          <AddCity bType="fromCity" label="ADD"/>
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

export default FromCityDataTable