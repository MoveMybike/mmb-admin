import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControlLabel, Switch } from "@mui/material";
import userService from "../services/user.service";
import "../App.css";

const AddCity = ({ cName = "", cCode = "", cId = "", bType , label, cStatus }) => {
  const [open, setOpen] = useState(false);
  const [cityName, setCityName] = useState(cName);
  const [cityShortCode, setCityShortCode] = useState(cCode);
  const [isActive, setIsActive] = useState(cStatus?.status === 1 || false);
  const [errors, setErrors] = useState({ cityName: "", cityShortCode: "" });

  const validate = () => {
    const next = { cityName: "", cityShortCode: "" };
    if (!cityName.trim()) next.cityName = "Please enter city name";
    if (!cityShortCode.trim()) next.cityShortCode = "Please enter city short code";
    setErrors(next);
    return !next.cityName && !next.cityShortCode;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const isFrom = bType === 'fromCity';
    const isUpdate = Boolean(cCode);
    const methodName = `${isUpdate ? 'update' : 'add'}${isFrom ? 'From' : 'To'}Cities`;
    const method = userService[methodName];

    const payload = isFrom
      ? { fromLocation: cityName, fromCityShortCode: cityShortCode, status: isActive ? 1 : 0, id: cId }
      : { toLocation: cityName, toCityShortCode: cityShortCode, status: isActive ? 1 : 0, id: cId };

    try {
      if (typeof method !== 'function') throw new Error(`Service method ${methodName} not found`);
      // Support both sync and async service methods
      await Promise.resolve(method(payload));
      alert("City saved successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to save city");
    }
  };

  return (
    <>
      <Button className={cName ? 'btnRed-outlined' : 'btnRed'} onClick={() => setOpen(true)} style={{ display: 'block', float: 'right', margin: '20px 20px 0' }}>{label}</Button>
      <Dialog fullWidth maxWidth="xs" open={open}>
        <DialogTitle>{cName ? "Edit City" : "Add City"}</DialogTitle>
        <DialogContent className='mt-4'>
          <div className="row">
            <div className="form-group col-md-6">
              <TextField fullWidth variant="standard" label="City Name" margin="normal" autoComplete="off"
                value={cityName} onChange={(e) => setCityName(e.target.value)} focused />
              <span className="text-danger">{errors.cityName}</span>
            </div>
            <div className="form-group col-md-6">
              <TextField fullWidth variant="standard" label="City ShortCode" margin="normal" autoComplete="off"
                value={cityShortCode} onChange={(e) => setCityShortCode(e.target.value)} focused />
              <span className="text-danger">{errors.cityShortCode}</span>
            </div>
            <div className="form-group col-md-6">
              <FormControlLabel control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="Active" labelPlacement="start" />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} className="btnRed">Submit</Button>
          <Button onClick={() => { setOpen(false); setErrors({ cityName: "", cityShortCode: "" }); }} className="btnRed-outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddCity;