import React, { useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch,
  Tabs, Tab, Box,
} from "@mui/material";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import "../App.css";

const STATUS_OPTIONS = {
  O: "Open",
  R: "Cancelled",
  P: "Postponed",
  U: "Customer Confirmation",
  M: "MMMB Confirmation",
  N: "No Response",
  Y: "Booking Confirmed",
  F: "Feedback",
  C: "Closed",
};

const PICKUP_OPTIONS = { 201: "Station", 202: "Door" };
const DELIVERY_OPTIONS = { 209: "Station", 208: "Door" };

const FROM_ADDRESS_FIELDS = [
  ["streetDoorpick", "Street"],
  ["lmDoorpick", "Landmark"],
  ["localityDoorpick", "Locality"],
  ["cityDoorpick", "City"],
  ["stateDoorpick", "State"],
  ["zipDoorpick", "Zip"],
];
const TO_ADDRESS_FIELDS = [
  ["streetDoordel", "Street"],
  ["lmDoordel", "Landmark"],
  ["localityDoordel", "Locality"],
  ["cityDoordel", "City"],
  ["stateDoordel", "State"],
  ["zipDoordel", "Zip"],
];
const PRICE_FIELDS = [
  ["frieghtCharges", "Freight Charges"],
  ["pickupCharge", "Pickup Charge"],
  ["deliveryCharge", "Delivery Charge"],
  ["doordelCharge", "Door Delivery Charge"],
  ["damageCharge", "Damage Charge"],
  ["taxamt", "Tax Amount"],
  ["totalCharges", "Total Charges"],
];

// Deep-ish clone so edits don't mutate the table row until save succeeds.
const cloneBooking = (row) => ({
  ...row,
  fromAdress: { ...(row.fromAdress || {}) },
  toAdress: { ...(row.toAdress || {}) },
  priceDetails: { ...(row.priceDetails || {}) },
});

const TabPanel = ({ value, index, children }) => (
  <Box hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && <div className="row">{children}</div>}
  </Box>
);

const EditBooking = ({ row, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(cloneBooking(row));
  const [priceEditable, setPriceEditable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // A new booking date can only be today or later, even if the current one is in the past.
  const today = new Date().toISOString().slice(0, 10);

  const handleOpen = () => {
    setForm(cloneBooking(row));
    setError('');
    setTab(0);
    setPriceEditable(false);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const setField = (name, value) =>
    setForm((f) => ({ ...f, [name]: value }));
  const setNested = (group, name, value) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [name]: value } }));

  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

  const handleSubmit = async () => {
    if (!form.senderName || !form.senderName.trim()) {
      setError('Sender name is required');
      setTab(0);
      return;
    }
    if (form.senderMobileNumber && !/^\d{10}$/.test(String(form.senderMobileNumber))) {
      setError('Mobile number must be 10 digits');
      setTab(0);
      return;
    }
    if (form.bookingDate && form.bookingDate < today) {
      setError('Booking date must be today or a later date');
      setTab(0);
      return;
    }

    // Build the exact BookingEditRequest body the backend expects.
    const strKeys = (src, defs) =>
      Object.fromEntries(defs.map(([k]) => [k, src?.[k] ?? null]));
    const numKeys = (src, defs) =>
      Object.fromEntries(defs.map(([k]) => [k, num(src?.[k])]));

    const payload = {
      bookingId: row.id ?? form.bookingId ?? form.id,
      senderName: form.senderName,
      senderEmail: form.senderEmail,
      senderMobileNumber: form.senderMobileNumber,
      bikeNumber: form.bikeNumber ?? null,
      bikeCC: form.bikeCC ?? null,
      fromLocation: form.fromLocation,
      toLocation: form.toLocation,
      bookingDate: form.bookingDate,
      damageScheme: form.damageScheme,
      assureScheme: form.assureScheme,
      totalCharges: num(form.totalCharges),
      fromAdress: strKeys(form.fromAdress, FROM_ADDRESS_FIELDS),
      toAdress: strKeys(form.toAdress, TO_ADDRESS_FIELDS),
      priceDetails: numKeys(form.priceDetails, PRICE_FIELDS),
    };

    try {
      setSaving(true);
      const updated = await userService.updateBooking(payload);
      alert('Booking updated successfully');
      if (onUpdated) onUpdated(row.id, updated ?? payload);
      setOpen(false);
    } catch (err) {
      console.error('Failed to update booking', err);
      alert(getFriendlyErrorMessage(err, 'Failed to update booking. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  // Simple text field bound to a top-level form key.
  const text = (name, label, extra = {}) => (
    <div className="form-group col-md-4" key={name}>
      <TextField fullWidth variant="standard" margin="normal" autoComplete="off" label={label}
        value={form[name] ?? ''} onChange={(e) => setField(name, e.target.value)} {...extra} />
    </div>
  );

  return (
    <>
      <Button className="btnRed-outlined" onClick={handleOpen} sx={{ fontSize: '10px' }}>
        Edit
      </Button>

      <Dialog fullWidth maxWidth="md" open={open} onClose={handleClose}>
        <DialogTitle>Edit Booking {form.trackId ? `- ${form.trackId}` : ''}</DialogTitle>
        <DialogContent className="mt-2">
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Shipment Information" />
            <Tab label="Items Details" />
            <Tab label="Address Details" />
            <Tab label="Price Details" />
          </Tabs>

          {/* Tab 1 - Shipment Information */}
          <TabPanel value={tab} index={0}>
            <div className="form-group col-md-4">
              <TextField fullWidth variant="standard" margin="normal" label="Track Id"
                value={form.trackId ?? ''} disabled />
            </div>
            <div className="form-group col-md-4">
              <FormControl fullWidth variant="standard" margin="normal">
                <InputLabel id="edit-status">Status</InputLabel>
                <Select labelId="edit-status" value={form.status ?? ''}
                  onChange={(e) => setField('status', e.target.value)}>
                  {Object.entries(STATUS_OPTIONS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="form-group col-md-4">
              <TextField fullWidth variant="standard" margin="normal" type="date" label="Booking Date"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
                value={form.bookingDate ?? ''} onChange={(e) => setField('bookingDate', e.target.value)} />
            </div>

            {text('senderName', 'Sender Name')}
            {text('senderMobileNumber', 'Mobile Number')}
            {text('senderEmail', 'Email')}

            {text('fromLocation', 'From Location')}
            {text('toLocation', 'To Location')}
            {text('totalCharges', 'Total Charges', { type: 'number' })}

            <div className="form-group col-md-4">
              <FormControl fullWidth variant="standard" margin="normal">
                <InputLabel id="edit-pickup">Pickup Type</InputLabel>
                <Select labelId="edit-pickup" value={form.pickupType ?? ''}
                  onChange={(e) => setField('pickupType', e.target.value)}>
                  {Object.entries(PICKUP_OPTIONS).map(([k, v]) => (
                    <MenuItem key={k} value={Number(k)}>{v} ({k})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="form-group col-md-4">
              <FormControl fullWidth variant="standard" margin="normal">
                <InputLabel id="edit-delivery">Delivery Type</InputLabel>
                <Select labelId="edit-delivery" value={form.deliveryType ?? ''}
                  onChange={(e) => setField('deliveryType', e.target.value)}>
                  {Object.entries(DELIVERY_OPTIONS).map(([k, v]) => (
                    <MenuItem key={k} value={Number(k)}>{v} ({k})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="form-group col-md-4 d-flex align-items-end" style={{ gap: '12px' }}>
              <FormControlLabel
                control={<Switch checked={form.damageScheme === 'Y'}
                  onChange={(e) => setField('damageScheme', e.target.checked ? 'Y' : 'N')} />}
                label="Damage Scheme" />
              <FormControlLabel
                control={<Switch checked={form.assureScheme === 'Y'}
                  onChange={(e) => setField('assureScheme', e.target.checked ? 'Y' : 'N')} />}
                label="Assure Scheme" />
            </div>
          </TabPanel>

          {/* Tab 2 - Items Details */}
          <TabPanel value={tab} index={1}>
            {text('bikeNumber', 'Bike Number')}
            {text('bikeCC', 'Bike CC')}
          </TabPanel>

          {/* Tab 3 - Address Details */}
          <TabPanel value={tab} index={2}>
            <div className="col-12">
              <h6 className="mt-1"><b>Pickup Address</b></h6>
              <div className="row">
                {FROM_ADDRESS_FIELDS.map(([name, label]) => (
                  <div className="form-group col-md-4" key={name}>
                    <TextField fullWidth variant="standard" margin="normal" autoComplete="off" label={label}
                      value={form.fromAdress?.[name] ?? ''}
                      onChange={(e) => setNested('fromAdress', name, e.target.value)} />
                  </div>
                ))}
              </div>

              <h6 className="mt-3"><b>Delivery Address</b></h6>
              <div className="row">
                {TO_ADDRESS_FIELDS.map(([name, label]) => (
                  <div className="form-group col-md-4" key={name}>
                    <TextField fullWidth variant="standard" margin="normal" autoComplete="off" label={label}
                      value={form.toAdress?.[name] ?? ''}
                      onChange={(e) => setNested('toAdress', name, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>

          {/* Tab 4 - Price Details (locked by default; toggle to edit) */}
          <TabPanel value={tab} index={3}>
            <div className="col-12 d-flex justify-content-end">
              <FormControlLabel
                control={<Switch checked={priceEditable}
                  onChange={(e) => setPriceEditable(e.target.checked)} />}
                label="Edit price details"
                labelPlacement="start"
              />
            </div>
            {PRICE_FIELDS.map(([name, label]) => (
              <div className="form-group col-md-3" key={name}>
                <TextField fullWidth variant="standard" margin="normal" type="number" label={label}
                  value={form.priceDetails?.[name] ?? ''}
                  onChange={(e) => setNested('priceDetails', name, e.target.value)}
                  disabled={!priceEditable} />
              </div>
            ))}

            <div className="form-group col-md-3">
              <FormControl fullWidth variant="standard" margin="normal">
                <InputLabel id="edit-payment-option">Payment Option</InputLabel>
                <Select labelId="edit-payment-option" value={form.paymentOption ?? ''}
                  onChange={(e) => setField('paymentOption', e.target.value)}>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="form-group col-md-3">
              <FormControl fullWidth variant="standard" margin="normal">
                <InputLabel id="edit-payment-status">Payment Status</InputLabel>
                <Select labelId="edit-payment-status" value={form.paymentStatus ?? ''}
                  onChange={(e) => setField('paymentStatus', e.target.value)}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </div>
          </TabPanel>

          <span className="text-danger">{error}</span>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} className="btnRed" disabled={saving}>
            {saving ? 'Saving...' : 'Submit'}
          </Button>
          <Button onClick={handleClose} className="btnRed-outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditBooking;
