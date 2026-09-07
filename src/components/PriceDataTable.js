import React from "react";
import userService from "../services/user.service";
import SideNavComponent from "./SideNavComponent";
import DataTable from 'react-data-table-component';
import AddCity from "./AddCity";
import CustomSelect from "./SelectComponent";
import EditPrice from "./EditPrice";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import { Alert, FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";

function PriceDataTable() {
  const [bookdata, setBookdata] = React.useState();
  const [fCity, setFCity] = React.useState('');
  const [formCityData, setFdata] = React.useState([]);
  const [toCityData, setTdata] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState('all'); // all | active | inactive
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  //   const columns = [
  //     {
  //         name: 'Name',
  //         selector: row => row.toLocation,
  //         sortable: true,
  //         grow: 2,
  //     },
  //     {
  //       name: 'ShortCode',
  //       selector: row => row.toCityShortCode,
  //       sortable: true,
  //       grow: 2,
  //     },
  //     {
  //       name: 'status',
  //       selector: row => row.status === 1 ? 'Active' : 'Inactive',
  //       sortable: true,
  //       grow: 2,
  //     },
  //     {
  //               name: "Actions",
  //               cell: (row) => (
  //                 <div>
  //                   <AddCity cName={row.toLocation} cCode={row.toCityShortCode} cId={row.id} cStatus={row} bType="toCity" label="Update" row={row}/>
  //                 </div>
  //               ),
  //               ignoreRowClick: true,
  //               button: true
  //             },
  // ];

  // React.useEffect(() => {
  //   let mounted = true;
  //   const fetchData = async () => {
  //     try {
  //       // If getToCities is a function, call it. Otherwise treat it as a value.
  //       const raw = typeof userService.getFromAndToCitiesPrice === 'function'
  //         ? await userService.getFromAndToCitiesPrice(user?.jwt)
  //         : userService.getFromAndToCitiesPrice;

  //       // If raw is a promise-like object, await it to be safe
  //       const result = raw && typeof raw.then === 'function' ? await raw : raw;
  //       console.log(result)
  //       if (mounted) setBookdata(result);
  //     } catch (err) {
  //       console.error('Failed to load from cities', err);
  //     }
  //   };

  //   fetchData();
  //   return () => { mounted = false; };
  // }, [user?.jwt]);
  // The backend field names vary a little between endpoints, so read each
  // value through a small list of fallbacks.
  const pick = (row, ...keys) => {
    for (const key of keys) {
      if (row[key] !== null && row[key] !== undefined && row[key] !== '') return row[key];
    }
    return '';
  };

  // The backend updates the row identified by priceId, so match on that.
  const handlePriceUpdated = (updated) => {
    const updatedId = updated?.priceId ?? updated?.id;
    setBookdata((rows) =>
      (rows || []).map((r) =>
        (r.priceId ?? r.id) === updatedId ? { ...r, ...updated } : r
      )
    );
  };

  // Maps the filter dropdown value to the API's `status` param.
  const statusParam = (filter) =>
    filter === 'active' ? '1' : filter === 'inactive' ? '0' : undefined;

  const handlePriceAdded = () => {
    // Reload so the new row shows with its server-generated priceId / names.
    if (fCity) loadPrices(fCity, statusFilter);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    if (fCity) loadPrices(fCity, value);
  };

  const priceLoaded = fCity && !loadError && Array.isArray(bookdata);

  // "2026-09-06T02:35:07" -> "2026-09-06 02:35"
  const fmtDateTime = (value) => {
    if (!value) return '';
    const [date, time = ''] = value.toString().split('T');
    return `${date} ${time.slice(0, 5)}`.trim();
  };

  const priceColumns = [
    {
      name: 'From City',
      selector: row => pick(row, 'fromCityName', 'fromLocation', 'fromCity'),
      sortable: true,
      grow: 2,
      minWidth: '140px',
    },
    {
      name: 'To City',
      selector: row => pick(row, 'toCityName', 'toLocation', 'toCity'),
      sortable: true,
      grow: 2,
      minWidth: '140px',
    },
    {
      name: 'Price',
      selector: row => pick(row, 'priceValue', 'price', 'Price', 'frieghtCharges', 'freightCharges', 'amount'),
      sortable: true,
      minWidth: '90px',
    },
    {
      name: 'Status',
      selector: row => {
        const s = row.status;
        return (s === 1 || s === '1' || s === true) ? 'Active' : 'Inactive';
      },
      sortable: true,
      minWidth: '90px',
    },
    {
      name: 'Created Date',
      selector: row => fmtDateTime(row.createDate),
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Created By',
      selector: row => pick(row, 'createdBy'),
      sortable: true,
      minWidth: '120px',
    },
    {
      name: 'Last Updated Date',
      selector: row => fmtDateTime(row.lastUpdateDate),
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Last Updated By',
      selector: row => pick(row, 'lastUpdatedBy'),
      sortable: true,
      minWidth: '130px',
    },
    {
      name: 'Actions',
      cell: (row) => <EditPrice row={row} onUpdated={handlePriceUpdated} />,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '110px',
    },
  ];

  const loadPrices = (fromCityId, filter = statusFilter) => {
    setLoadError('');
    setLoading(true);
    userService.getPricesByFromCity(fromCityId, statusParam(filter))
      .then((result) => {
        setBookdata(Array.isArray(result) ? result : (result?.content || []));
      })
      .catch((error) => {
        console.error('Failed to load prices for from city', error);
        setBookdata([]);
        setLoadError(getFriendlyErrorMessage(error, 'Unable to load price details.'));
      })
      .finally(() => setLoading(false));
  };

  const handleFromCityChange = (fromCityId) => {
    setFCity(fromCityId);
    setBookdata(undefined);
    setLoadError('');
    if (!fromCityId) return;
    loadPrices(fromCityId, statusFilter);
  };

  React.useEffect(() => {
      const cityData = userService.getFromAndToCities()
      setTimeout(() => {
        cityData.then((result) => {
          setFdata(result.fromCities);
          setTdata(result.toCities);
        })
      }, 1000);
    }, []);
  const handleSort = (column, sortDirection) => console.log(column.selector, sortDirection);
  return (
      <div className='row p-1 pt-5'>
        <div className='col-md-2'>
          <SideNavComponent />
        </div>
        <div className='col-md-10'>
          {/* <AddCity bType="toCity" label="ADD"/>
          <DataTable
              title="To Cities"
              columns={columns}
              data={bookdata}
              pagination
              highlightOnHover
              pointerOnHover
              onSort={handleSort}
          /> */}
          <Grid container spacing={2} alignItems="flex-end" className="mt-2">
            <Grid item xs={12} sm={priceLoaded ? 6 : 4}>
                <FormControl fullWidth variant="standard" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="from-select-label">Select City</InputLabel>
                    <Select
                      labelId="from-select-label"
                      id="from-select"
                      value={fCity}
                      label="Select City"
                      onChange={(e) => handleFromCityChange(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {formCityData.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
            </Grid>
            <Grid item xs={12} sm={priceLoaded ? 6 : 'auto'}>
              <EditPrice
                mode="add"
                fromCities={formCityData}
                toCities={toCityData}
                defaultFromCityId={fCity}
                onAdded={handlePriceAdded}
              />
            </Grid>
          </Grid>

          {loadError && (
            <Alert severity="error" className="mt-3" onClose={() => setLoadError('')}>
              {loadError}
            </Alert>
          )}

          {fCity && !loadError && (
            <>
              <FormControl variant="standard" sx={{ minWidth: 160, mt: 2 }}>
                <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <div className="table-scroll">
                <DataTable
                  title="Price Details"
                  columns={priceColumns}
                  data={bookdata || []}
                  progressPending={loading}
                  noDataComponent="No prices found for the selected City"
                  pagination
                  highlightOnHover
                  pointerOnHover
                  onSort={handleSort}
                />
              </div>
            </>
          )}
        </div>
      </div>
  )
}

export default PriceDataTable