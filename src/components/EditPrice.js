import React, { useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch,
} from "@mui/material";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import "../App.css";

// Backend stores active_flag as a char: '1' = active, '0' = inactive.
const isActiveStatus = (status) =>
  status === 1 || status === '1' || status === true;

/**
 * Add / Edit dialog for the price between a From city and a To city.
 *
 * mode="edit" (default): `row` is a price record from GET /v1/admin/fromcityprice.
 *   The whole object is sent back on submit so unchanged fields (priceId,
 *   fromCityName, toCityName, ...) are not wiped to null. Backend updates by priceId.
 *
 * mode="add": shows From/To city dropdowns. `fromCities` / `toCities` are the
 *   option lists; `defaultFromCityId` pre-selects the currently filtered city.
 */
const EditPrice = ({
  row = {},
  mode = 'edit',
  fromCities = [],
  toCities = [],
  defaultFromCityId = '',
  onUpdated,
  onAdded,
}) => {
  const isAdd = mode === 'add';

  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [fromCityId, setFromCityId] = useState('');
  const [toCityId, setToCityId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const priceId = row.priceId ?? row.id;
  const fromCityName = row.fromCityName ?? row.fromLocation ?? '';
  const toCityName = row.toCityName ?? row.toLocation ?? '';
  const currentPrice = row.priceValue ?? row.price ?? row.Price ?? row.frieghtCharges ?? '';

  const handleOpen = () => {
    if (isAdd) {
      setFromCityId(defaultFromCityId || '');
      setToCityId('');
      setPrice('');
      setActive(true);
    } else {
      setPrice((currentPrice ?? '').toString());
      setActive(isActiveStatus(row.status));
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleSubmit = async () => {
    const numeric = Number(price);
    if (price === '' || Number.isNaN(numeric) || numeric < 0) {
      setError('Please enter a valid price');
      return;
    }
    if (isAdd && (!fromCityId || !toCityId)) {
      setError('Please select both From City and To City');
      return;
    }
    if (isAdd && fromCityId === toCityId) {
      setError('From City and To City cannot be the same');
      return;
    }

    const status = active ? '1' : '0';

    try {
      setSaving(true);

      if (isAdd) {
        const payload = {
          fromCityId: Number(fromCityId),
          toCityId: Number(toCityId),
          priceValue: numeric,
          status,
        };
        const created = await userService.addPrice(payload);
        alert('Price added successfully');
        if (onAdded) onAdded(created ?? payload);
      } else {
        // The update endpoint only accepts these three fields; the route stays fixed.
        // The response has no city names, so the table keeps them when it merges the row.
        const payload = {
          priceId,
          priceValue: numeric,
          status,
        };
        const updated = await userService.updatePrice(payload);
        alert('Price updated successfully');
        if (onUpdated) onUpdated(updated ?? payload);
      }

      setOpen(false);
    } catch (err) {
      console.error('Failed to save price', err);
      alert(getFriendlyErrorMessage(err, 'Failed to save price. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {isAdd ? (
        <Button variant="outlined" color="error" onClick={handleOpen} sx={{ float: 'right', mb: 1 }}>
          Add Price
        </Button>
      ) : (
        <Button className="btnRed-outlined" onClick={handleOpen} sx={{ fontSize: '10px' }}>
          Edit
        </Button>
      )}

      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
        <DialogTitle>{isAdd ? 'Add Price' : 'Edit Price'}</DialogTitle>
        <DialogContent className='mt-4'>
          <div className="row">
            {isAdd ? (
              <>
                <div className="form-group col-md-6">
                  <FormControl fullWidth variant="standard" margin="normal">
                    <InputLabel id="add-from-city">From City</InputLabel>
                    <Select labelId="add-from-city" value={fromCityId}
                      onChange={(e) => setFromCityId(e.target.value)}>
                      {fromCities.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.location}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="form-group col-md-6">
                  <FormControl fullWidth variant="standard" margin="normal">
                    <InputLabel id="add-to-city">To City</InputLabel>
                    <Select labelId="add-to-city" value={toCityId}
                      onChange={(e) => setToCityId(e.target.value)}>
                      {toCities.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.location}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </>
            ) : (
              <>
                <div className="form-group col-md-6">
                  <TextField fullWidth variant="standard" label="From City" margin="normal"
                    value={fromCityName} InputProps={{ readOnly: true }} />
                </div>
                <div className="form-group col-md-6">
                  <TextField fullWidth variant="standard" label="To City" margin="normal"
                    value={toCityName} InputProps={{ readOnly: true }} />
                </div>
              </>
            )}

            <div className="form-group col-md-12">
              <TextField fullWidth variant="standard" label="Price" margin="normal" type="number"
                autoComplete="off" value={price} onChange={(e) => setPrice(e.target.value)} focused />
              <span className="text-danger">{error}</span>
            </div>
            <div className="form-group col-md-12">
              <FormControlLabel
                control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
                label={active ? 'Active' : 'Inactive'}
                labelPlacement="start"
              />
            </div>
          </div>
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

export default EditPrice;
