import React, { useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch,
  Tabs, Tab, Box,
} from "@mui/material";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import { ALL_BOOKING_STATUSES } from "../constants/bookingStatus";
import "../App.css";

const PICKUP_OPTIONS = { 201: "Station", 202: "Door" };
const DELIVERY_OPTIONS = { 209: "Station", 208: "Door" };
const DOOR_PICKUP = 202;
const DOOR_DELIVERY = 208;

// Mirrors the backend status rules (BookingEditor):
// - terminal bookings accept only a reason;
// - route, booking date, addresses and service type change only while Open, Confirmed or Postponed;
// - charges and damage/assurance schemes change only while Open or Confirmed.
const TERMINAL_STATUSES = ['CL', 'CN', 'DL'];
const ROUTE_STATUSES = ['OP', 'BC', 'PP'];
const PRICE_STATUSES = ['OP', 'BC'];

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
// The charge components the user can edit. Tax and total are calculated by the server.
const PRICE_COMPONENTS = [
  ["frieghtCharges", "Freight Charges"],
  ["pickupCharge", "Pickup Charge"],
  ["deliveryCharge", "Delivery Charge"],
  ["doordelCharge", "Door Delivery Charge"],
  ["damageCharge", "Damage Charge"],
];

// Deep-ish clone so edits don't mutate the table row until save succeeds.
const cloneBooking = (row) => ({
  ...row,
  fromAdress: { ...(row.fromAdress || {}) },
  toAdress: { ...(row.toAdress || {}) },
  priceDetails: { ...(row.priceDetails || {}) },
});

// Blank and missing are the same thing when comparing values.
const norm = (v) => (v === undefined || v === null ? '' : String(v).trim());

// Only what changed is sent: null = unchanged, '' = clear the value, otherwise the new value.
const changed = (current, original) =>
  norm(current) === norm(original) ? null : norm(current);

// Changed sub-fields of an address group; null when nothing in the group changed.
const changedGroup = (current, original, defs) => {
  const cur = current || {};
  const orig = original || {};
  const out = {};
  defs.forEach(([k]) => {
    const v = changed(cur[k], orig[k]);
    if (v !== null) out[k] = v;
  });
  return Object.keys(out).length ? out : null;
};

const statusLabel = (code) => ALL_BOOKING_STATUSES.find((s) => s.code === code)?.label ?? code;

// A door pickup with no street and city on file means the customer still has to be contacted for it.
const initialContactCustomer = (row) =>
  Number(row.pickupType) === DOOR_PICKUP
  && !(norm(row.fromAdress?.streetDoorpick) && norm(row.fromAdress?.cityDoorpick));

// Same rule for the delivery side: a door delivery with no street and city on file.
const initialContactCustomerDelivery = (row) =>
  Number(row.deliveryType) === DOOR_DELIVERY
  && !(norm(row.toAdress?.streetDoordel) && norm(row.toAdress?.cityDoordel));

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
  const [contactCustomer, setContactCustomer] = useState(false);
  const [contactCustomerDelivery, setContactCustomerDelivery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Stored status decides what may be edited (the status itself is changed via approval, not here).
  const isTerminal = TERMINAL_STATUSES.includes(row.status);
  const canEditRoute = ROUTE_STATUSES.includes(row.status);
  const canEditPrice = PRICE_STATUSES.includes(row.status);

  // Address fields follow the service type: pickup address only for door pickup, delivery address only for door delivery.
  const isDoorPickup = Number(form.pickupType) === DOOR_PICKUP;
  const isDoorDelivery = Number(form.deliveryType) === DOOR_DELIVERY;

  // A new booking date can only be today or later, even if the current one is in the past.
  const today = new Date().toISOString().slice(0, 10);

  const handleOpen = () => {
    setForm(cloneBooking(row));
    setError('');
    setTab(0);
    setPriceEditable(false);
    setContactCustomer(initialContactCustomer(row));
    setContactCustomerDelivery(initialContactCustomerDelivery(row));
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

  const handleSubmit = async () => {
    // Build the BookingEditRequest body: only the fields that changed.
    const pickupChanged = norm(form.pickupType) !== norm(row.pickupType);
    const deliveryChanged = norm(form.deliveryType) !== norm(row.deliveryType);

    const payload = {
      bookingId: row.id ?? row.bookingId,
      senderName: changed(form.senderName, row.senderName),
      senderEmail: changed(form.senderEmail, row.senderEmail),
      senderMobileNumber: changed(form.senderMobileNumber, row.senderMobileNumber),
      bikeNumber: changed(form.bikeNumber, row.bikeNumber),
      bikeCC: changed(form.bikeCC, row.bikeCC),
      fromLocation: changed(form.fromLocation, row.fromLocation),
      toLocation: changed(form.toLocation, row.toLocation),
      bookingDate: changed(form.bookingDate, row.bookingDate),
      damageScheme: changed(form.damageScheme, row.damageScheme),
      assureScheme: changed(form.assureScheme, row.assureScheme),
      // The backend takes door/hub as booleans; null leaves the service type unchanged.
      doorPickup: pickupChanged ? Number(form.pickupType) === DOOR_PICKUP : null,
      doorDelivery: deliveryChanged ? Number(form.deliveryType) === DOOR_DELIVERY : null,
      // Door pickup saved without an address: the customer is contacted for it instead.
      contactCustomerPickup: isDoorPickup && contactCustomer ? true : null,
      contactCustomerDelivery: isDoorDelivery && contactCustomerDelivery ? true : null,
      // Reads from and writes to mmb_booking.reason: only sent when it differs from the stored value.
      reason: changed(form.reason, row.reason),
      fromAdress: changedGroup(form.fromAdress, row.fromAdress, FROM_ADDRESS_FIELDS),
      toAdress: changedGroup(form.toAdress, row.toAdress, TO_ADDRESS_FIELDS),
      priceDetails: null,
    };

    const priceChanged = PRICE_COMPONENTS.some(
      ([k]) => norm(form.priceDetails?.[k]) !== norm(row.priceDetails?.[k]));
    const routeOrServiceChanged = payload.fromLocation !== null || payload.toLocation !== null
      || pickupChanged || deliveryChanged;
    // The backend recalculates totals from the components, so send all of them whenever any of them
    // (or the route / service type) changes.
    if (priceChanged || routeOrServiceChanged) {
      payload.priceDetails = Object.fromEntries(
        PRICE_COMPONENTS.map(([k]) => [k, norm(form.priceDetails?.[k])]));
    }

    const fail = (message, tabIndex) => {
      setError(message);
      setTab(tabIndex);
    };

    // Validate only what is being sent, so a legacy value the user did not touch never blocks a save.
    if (payload.senderName === '') return fail('Sender name is required', 0);
    if (payload.senderEmail !== null && !/^\S+@\S+\.\S+$/.test(payload.senderEmail)) {
      return fail('Enter a valid email address', 0);
    }
    if (payload.senderMobileNumber !== null && !/^\d{10}$/.test(payload.senderMobileNumber)) {
      return fail('Mobile number must be 10 digits', 0);
    }
    if (payload.fromLocation === '') return fail('From location is required', 0);
    if (payload.toLocation === '') return fail('To location is required', 0);
    if (payload.bookingDate === '') return fail('Booking date is required', 0);
    if (payload.bookingDate !== null && payload.bookingDate < today) {
      return fail('Booking date must be today or a later date', 0);
    }
    if (payload.doorPickup === true && !contactCustomer
        && (!norm(form.fromAdress?.streetDoorpick) || !norm(form.fromAdress?.cityDoorpick))) {
      return fail('Pickup street and city are required for door pickup', 2);
    }
    if (payload.doorDelivery === true && !contactCustomerDelivery
        && (!norm(form.toAdress?.streetDoordel) || !norm(form.toAdress?.cityDoordel))) {
      return fail('Delivery street and city are required for door delivery', 2);
    }
    if (payload.priceDetails) {
      const bad = PRICE_COMPONENTS.find(([k]) => !/^\d+$/.test(norm(form.priceDetails?.[k])));
      if (bad) return fail(`${bad[1]} must be a whole number of zero or more`, 3);
      payload.priceDetails = Object.fromEntries(
        PRICE_COMPONENTS.map(([k]) => [k, Number(norm(form.priceDetails?.[k]))]));
    }

    // contactCustomerPickup is a modifier, not a change on its own.
    const hasChanges = Object.entries(payload).some(
      ([k, v]) => k !== 'bookingId' && k !== 'contactCustomerPickup' && k !== 'contactCustomerDelivery' && v !== null);
    if (!hasChanges) return fail('No changes to save', 0);

    try {
      setSaving(true);
      const updated = await userService.updateBooking(payload);
      const changedFields = updated?.changedFields ?? [];
      alert(changedFields.length
        ? `Booking updated: ${changedFields.join(', ')}`
        : 'No changes were made');
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
          {isTerminal && (
            <div className="text-danger mt-2">
              This booking is {statusLabel(row.status)} and can no longer be edited. You can still record a reason.
            </div>
          )}
          {!isTerminal && !canEditRoute && (
            <div className="text-muted mt-2">
              Route, booking date, addresses and service type are locked while the booking is {statusLabel(row.status)}.
            </div>
          )}

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
              <TextField fullWidth variant="standard" margin="normal" label="Status"
                value={statusLabel(row.status)} disabled />
            </div>
            <div className="form-group col-md-4">
              <TextField fullWidth variant="standard" margin="normal" type="date" label="Booking Date"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: today }}
                value={form.bookingDate ?? ''} disabled={!canEditRoute}
                onChange={(e) => setField('bookingDate', e.target.value)} />
            </div>

            {text('senderName', 'Sender Name', { disabled: isTerminal })}
            {text('senderMobileNumber', 'Mobile Number', { disabled: isTerminal })}
            {text('senderEmail', 'Email', { disabled: isTerminal })}

            {text('fromLocation', 'From Location', { disabled: !canEditRoute })}
            {text('toLocation', 'To Location', { disabled: !canEditRoute })}
            <div className="form-group col-md-4">
              <TextField fullWidth variant="standard" margin="normal" label="Total Charges (calculated)"
                value={form.totalCharges ?? ''} disabled />
            </div>

            <div className="form-group col-md-4">
              <FormControl fullWidth variant="standard" margin="normal">
                <InputLabel id="edit-pickup">Pickup Type</InputLabel>
                <Select labelId="edit-pickup" value={form.pickupType ?? ''} disabled={!canEditRoute}
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
                <Select labelId="edit-delivery" value={form.deliveryType ?? ''} disabled={!canEditRoute}
                  onChange={(e) => setField('deliveryType', e.target.value)}>
                  {Object.entries(DELIVERY_OPTIONS).map(([k, v]) => (
                    <MenuItem key={k} value={Number(k)}>{v} ({k})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="form-group col-md-4 d-flex align-items-end" style={{ gap: '12px' }}>
              <FormControlLabel
                control={<Switch checked={form.damageScheme === 'Y'} disabled={!canEditPrice}
                  onChange={(e) => setField('damageScheme', e.target.checked ? 'Y' : 'N')} />}
                label="Damage Scheme" />
              <FormControlLabel
                control={<Switch checked={form.assureScheme === 'Y'} disabled={!canEditPrice}
                  onChange={(e) => setField('assureScheme', e.target.checked ? 'Y' : 'N')} />}
                label="Assure Scheme" />
            </div>
            {text('reason', 'Reason for change (optional)')}
          </TabPanel>

          {/* Tab 2 - Items Details */}
          <TabPanel value={tab} index={1}>
            {text('bikeNumber', 'Bike Number', { disabled: isTerminal })}
            {text('bikeCC', 'Bike CC', { disabled: isTerminal })}
          </TabPanel>

          {/* Tab 3 - Address Details */}
          <TabPanel value={tab} index={2}>
            <div className="col-12">
              <h6 className="mt-1"><b>Pickup Address</b></h6>
              <div className="mb-2">
                <FormControlLabel
                  control={<Switch checked={contactCustomer} disabled={!canEditRoute || !isDoorPickup}
                    onChange={(e) => setContactCustomer(e.target.checked)} />}
                  label="Contact Customer for pickup address (address optional)" />
              </div>
              <div className="row">
                {FROM_ADDRESS_FIELDS.map(([name, label]) => (
                  <div className="form-group col-md-4" key={name}>
                    <TextField fullWidth variant="standard" margin="normal" autoComplete="off" label={label}
                      value={form.fromAdress?.[name] ?? ''} disabled={!canEditRoute || !isDoorPickup}
                      onChange={(e) => setNested('fromAdress', name, e.target.value)} />
                  </div>
                ))}
              </div>

              <h6 className="mt-3"><b>Delivery Address</b></h6>
              <div className="mb-2">
                <FormControlLabel
                  control={<Switch checked={contactCustomerDelivery} disabled={!canEditRoute || !isDoorDelivery}
                    onChange={(e) => setContactCustomerDelivery(e.target.checked)} />}
                  label="Contact Customer for delivery address (address optional)" />
              </div>
              <div className="row">
                {TO_ADDRESS_FIELDS.map(([name, label]) => (
                  <div className="form-group col-md-4" key={name}>
                    <TextField fullWidth variant="standard" margin="normal" autoComplete="off" label={label}
                      value={form.toAdress?.[name] ?? ''} disabled={!canEditRoute || !isDoorDelivery}
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
                control={<Switch checked={priceEditable} disabled={!canEditPrice}
                  onChange={(e) => setPriceEditable(e.target.checked)} />}
                label="Edit price details"
                labelPlacement="start"
              />
            </div>
            {PRICE_COMPONENTS.map(([name, label]) => (
              <div className="form-group col-md-3" key={name}>
                <TextField fullWidth variant="standard" margin="normal" type="number" label={label}
                  value={form.priceDetails?.[name] ?? ''}
                  onChange={(e) => setNested('priceDetails', name, e.target.value)}
                  disabled={!canEditPrice || !priceEditable} />
              </div>
            ))}
            <div className="form-group col-md-3">
              <TextField fullWidth variant="standard" margin="normal" label="Tax Amount (calculated)"
                value={form.priceDetails?.taxamt ?? ''} disabled />
            </div>
            <div className="form-group col-md-3">
              <TextField fullWidth variant="standard" margin="normal" label="Total Charges (calculated)"
                value={form.totalCharges ?? ''} disabled />
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
