import React, { useContext, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";

import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem, IconButton, Tooltip, Menu, ListItemIcon, ListItemText, Checkbox, Divider } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShareIcon from "@mui/icons-material/Share";
import SettingsIcon from "@mui/icons-material/Settings";
import AddEnquirypopup from './AddEnquirypopup';
import EditBooking from './EditBooking';
import { DetailPanel, DetailRow } from './DetailRow';
import { UserContext, UserDispatchContext } from '../Context/MyContext';

const OrderView = ({
  bookdata,
  onUpdateRow,
  paginationServer = false,
  paginationTotalRows = 0,
  paginationDefaultPage = 1,
  paginationPerPage = 50,
  progressPending = false,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [formCityData, setFdata] = useState([]);
  const [toCityData, setTdata] = useState([]);
  const userDetails = React.useContext(UserContext);
  const setUserDetails = useContext(UserDispatchContext);

  // Audit columns are hidden by default; users can turn them on via the gear menu.
  const AUDIT_COLUMNS = ['Created Date', 'Created By', 'Last Updated Date', 'Last Updated By'];
  const COL_PREF_KEY = 'allBookingsHiddenColumns';
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

  useEffect(() => {
      const cityData = userService.getFromAndToCities();
      cityData.then((result) => {
        setFdata(result.fromCities);
        setTdata(result.toCities);
      })
    }, []);


  const handleUpdate = (bookingId, approveStatus) => {
    const updatedRow = { status: approveStatus };
    onUpdateRow(bookingId, updatedRow);
  };
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
          priceDetails: {
            ...prevState.priceDetails,
            serviceCharge,
            frieghtCharges: userDetails.priceDetails.frieghtCharges,
            totalCharges: userDetails.priceDetails.frieghtCharges + serviceCharge + taxamt,
            taxamt
          },
        }));
      }
    }


  const handleSubmit = async () => {
    try {
      const bookingId = selectedRow.id; // Example booking ID
      const trackingStatus = selectedRow.status; // Example tracking status
      const approveStatus = selectedStatus; // Example approve status

      const result = await userService.approveBookings(bookingId, trackingStatus, approveStatus);
      handleUpdate(result.id, result.bookingStatus);
      alert("Booking approved successfully!");
      handleCloseDialog();
      console.log("Approval Result:", result);
    } catch (error) {
      alert(getFriendlyErrorMessage(error, "Failed to approve booking. Please try again."));
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
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button onClick={() => handleApprove(row)} className="btnRed" sx={{ fontSize: '10px' }}>
            Approve
          </Button>
          <EditBooking row={row} onUpdated={onUpdateRow} />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '180px',
    },
    {
      name: 'Name',
      selector: row => row.senderName,
      sortable: true,
      grow: 2,
      minWidth: '160px',
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
      grow: 2,
      minWidth: '170px',
    },
    {
      name: 'MobileNumber',
      selector: row => row.senderMobileNumber,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'From',
      selector: row => row.fromLocation,
      sortable: true,
      minWidth: '140px',
    },
    {
      name: 'To',
      selector: row => row.toLocation,
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
  const DOOR_PICKUP = 202;   // Station pickup: 201
  const DOOR_DELIVERY = 208; // Station delivery: 207

  const getServiceType = (data) => {
    const pickup = data.pickupType == DOOR_PICKUP ? 'Door' : 'Station';
    const delivery = data.deliveryType == DOOR_DELIVERY ? 'Door' : 'Station';
    return pickup + ' - ' + delivery;
  };

  const getFromAddress = (data) => {
    if (data.pickupType != DOOR_PICKUP) {
      return 'Station';
    }
    if (data.fromAdress != null && data.fromAdress.streetDoorpick != null) {
      return data.fromAdress.streetDoorpick + ' , ' + data.fromAdress.cityDoorpick
        + ' , ' + data.fromAdress.stateDoorpick + ' , ' + data.fromAdress.zipDoorpick;
    }
    return 'Contact Customer for Pickup address';
  };

  const getToAddress = (data) => {
    if (data.deliveryType != DOOR_DELIVERY) {
      return 'Station';
    }
    if (data.toAdress != null && data.toAdress.streetDoordel != null) {
      return data.toAdress.streetDoordel + ' , ' + data.toAdress.cityDoordel
        + ' , ' + data.toAdress.stateDoordel + ' , ' + data.toAdress.zipDoordel;
    }
    return 'Contact Customer for Delivery address';
  };

  // Labels returned by the address helpers when there is no real address to copy.
  const NON_ADDRESS_LABELS = [
    'Station',
    'Contact Customer for Pickup address',
    'Contact Customer for Delivery address',
  ];
  const isRealAddress = (value) => !!value && !NON_ADDRESS_LABELS.includes(value);

  const copyToClipboard = async (text) => {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      return true;
    } catch (err) {
      console.error('Copy failed', err);
      return false;
    }
  };

  const CopyButton = ({ value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      const ok = await copyToClipboard((value ?? '').toString());
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    };

    return (
      <Tooltip title={copied ? 'Copied' : 'Copy'}>
        <IconButton onClick={handleCopy} size="small" sx={{ ml: 0.5, p: '2px' }}>
          {copied
            ? <CheckIcon sx={{ fontSize: 14, color: 'green' }} />
            : <ContentCopyIcon sx={{ fontSize: 14 }} />}
        </IconButton>
      </Tooltip>
    );
  };

  // Falls back to an empty string so missing fields don't print "undefined".
  const val = (v) => (v === null || v === undefined || v === '' ? '' : v);

  const buildShareText = (data) => {
    const insurance = data.damageScheme === 'Y' ? 'Yes' : 'No';
    const dateOfShipment = val(data.bookingDate);
    const bikeCc = val(data.bikeCc ?? data.vehicleCc ?? data.cc);
    const bikeNumber = val(data.bikeNumber ?? data.vehicleNumber ?? data.bikeRegNo);
    const price = val(data.priceDetails?.totalCharges);
    const note = val(data.note ?? data.remarks ?? data.remark);

    return [
      `Date Of Shipment : ${dateOfShipment}`,
      `Name : ${val(data.senderName)}`,
      `Mobile Number : ${val(data.senderMobileNumber)}`,
      `From Location : ${val(data.fromLocation)}`,
      `To Location : ${val(data.toLocation)}`,
      `Service Type : ${getServiceType(data)} (Including Packing)`,
      `Insurance Opted : ${insurance}`,
      `Bike cc: ${bikeCc}`,
      `Bike Number : ${bikeNumber}`,
      `Price : ${price}`,
      '',
      `Pickup Address:`,
      `${getFromAddress(data)}`,
      '',
      `Delivery Address :`,
      `${getToAddress(data)}`,
      '',
      `Note:`,
      `${note}`,
      '',
      'Thanks',
      'movemybike.in',
      'Customer Support : 99000 49918',
    ].join('\n');
  };

  // Normalises an Indian mobile number to the wa.me format (91XXXXXXXXXX).
  const toWhatsAppNumber = (mobile) => {
    const digits = (mobile ?? '').toString().replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  };

  const ShareButton = ({ data }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [copied, setCopied] = useState(false);
    const open = Boolean(anchorEl);

    const openMenu = (e) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    const handleCopy = async () => {
      closeMenu();
      const ok = await copyToClipboard(buildShareText(data));
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    const handleWhatsApp = () => {
      closeMenu();
      const number = toWhatsAppNumber(data.senderMobileNumber);
      const text = encodeURIComponent(buildShareText(data));
      const url = number
        ? `https://wa.me/${number}?text=${text}`
        : `https://wa.me/?text=${text}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
      <>
        <Tooltip title={copied ? 'Details copied' : 'Share booking details'}>
          <Button
            onClick={openMenu}
            size="small"
            startIcon={copied ? <CheckIcon sx={{ color: 'green' }} /> : <ShareIcon />}
            sx={{ fontSize: '11px' }}
          >
            {copied ? 'Copied' : 'Share'}
          </Button>
        </Tooltip>
        <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
          <MenuItem onClick={handleWhatsApp}>
            <ListItemIcon><WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} /></ListItemIcon>
            <ListItemText>Send on WhatsApp</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopy}>
            <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Copy details</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  };

  const ExpandedComponent = ({ data }) => {
    const fromAddress = getFromAddress(data);
    const toAddress = getToAddress(data);
    return (
      <DetailPanel
        title={`Service Type : ${getServiceType(data)}`}
        action={<ShareButton data={data} />}
      >
        <DetailRow label="From Address">
          <b>{fromAddress}</b>
          {isRealAddress(fromAddress) && <CopyButton value={fromAddress} />}
        </DetailRow>
        <DetailRow label="To Address">
          <b>{toAddress}</b>
          {isRealAddress(toAddress) && <CopyButton value={toAddress} />}
        </DetailRow>
        <DetailRow label="Created Date"><b>{data.createDate}</b></DetailRow>
        <DetailRow label="Ph Number">
          <b>{data.senderMobileNumber}</b>
          {data.senderMobileNumber && <CopyButton value={data.senderMobileNumber} />}
        </DetailRow>
        <DetailRow label="Email"><b>{data.senderEmail}</b></DetailRow>
        <DetailRow label="Total Amt"><b>{data.priceDetails?.totalCharges}</b></DetailRow>
      </DetailPanel>
    )
  };
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
      <AddEnquirypopup fdata={formCityData} tdata={toCityData} bType="booking" />
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
          title="ALL Bookings"
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
          <p>Select a status for booking ID: {selectedRow?.id}</p>
          <Select
            value={selectedStatus}
            onChange={handleStatusChange}
            fullWidth
            displayEmpty
          >
            {/* Placeholder option */}
            <MenuItem value="" disabled>
              Select Status
            </MenuItem>
            {/* Dynamically rendered options */}
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