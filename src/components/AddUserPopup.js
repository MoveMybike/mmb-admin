import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField,
  FormControlLabel, Switch, FormGroup, Checkbox, FormLabel, Box, MenuItem,
} from "@mui/material";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import "../App.css";

// Roles an admin can assign. `key` is the exact authority string sent to and
// received from the API in the `role` array.
const ROLE_OPTIONS = [
  { key: "ROLE_ADMIN", label: "Admin" },
  { key: "ROLE_OPERATOR", label: "Operator" },
  { key: "ROLE_BOOKING_AGENT", label: "Booking Agent" },
  { key: "ROLE_CITY_MANAGER", label: "City Manager" },
];

// Maps whatever the API returns for roles (["ROLE_ADMIN"] / [{name: "..."}] /
// ["admin"] / ["Booking Agent"]) back to our ROLE_* keys.
const toRoleKeys = (roles = []) => {
  const norm = (s) =>
    "ROLE_" + s.toUpperCase().replace(/^ROLE_/, "").replace(/[\s-]+/g, "_");
  return roles
    .map((r) => norm(typeof r === "string" ? r : r?.name || ""))
    .filter((r) => ROLE_OPTIONS.some((o) => o.key === r));
};

const emailReg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
const mobileReg = /^[0-9]{10}$/;

const AddUserPopup = ({ user, label, onSaved }) => {
  const isEdit = Boolean(user);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    mobilenum: "",
    password: "",
    fromCityId: "",
  });
  const [roles, setRoles] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [cities, setCities] = useState([]);

  // Load the "From Location" city list once, the first time the dialog opens.
  useEffect(() => {
    if (!open || cities.length) return;
    Promise.resolve(userService.getFromCities())
      .then((res) => setCities(Array.isArray(res) ? res : res?.content || []))
      .catch((err) => console.error("Failed to load cities", err));
  }, [open, cities.length]);

  const resetFromProps = () => {
    setForm({
      username: user?.username || "",
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      mobilenum: user?.mobilenum || "",
      password: "",
      fromCityId: user?.fromCityId ?? user?.fromCity?.id ?? "",
    });
    setRoles(isEdit ? toRoleKeys(user?.roles) : []);
    setIsActive(isEdit ? String(user?.status).toUpperCase() === "Y" : true);
    setErrors({});
  };

  const handleOpen = () => { resetFromProps(); setOpen(true); };
  const handleClose = () => { setOpen(false); setErrors({}); };

  const setField = (name) => (e) =>
    setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const toggleRole = (key) =>
    setRoles((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );

  const validate = () => {
    const next = {};
    if (!isEdit && !form.username.trim()) next.username = "Username is required";
    if (!form.firstname.trim()) next.firstname = "First name is required";
    if (!form.email.trim() || !emailReg.test(form.email))
      next.email = "Valid email is required";
    if (!mobileReg.test(String(form.mobilenum)))
      next.mobilenum = "Enter a 10-digit mobile number";
    if (!isEdit && form.password.length < 6)
      next.password = "Password must be at least 6 characters";
    if (roles.length === 0) next.roles = "Select at least one role";
    if (!form.fromCityId) next.fromCityId = "Select the user's city";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim(),
      mobilenum: form.mobilenum,
      role: roles,
      fromCityId: form.fromCityId,
      status: isActive ? "Y" : "N",
      // Username and password are set only at creation and never change on edit.
      ...(isEdit
        ? { id: user.id }
        : { username: form.username.trim(), password: form.password }),
    };
    try {
      const saved = isEdit
        ? await userService.updateUser(payload)
        : await userService.addUser(payload);

      // Build the row to hand back so the table can update in place instead of
      // refetching the whole list. Prefer the server's response, fall back to
      // the form values, and attach the city name for the "From Location" cell.
      const fromCity = cities.find((c) => c.id === form.fromCityId);
      const fromServer = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
      const record = {
        ...(isEdit ? user : {}),
        ...payload,
        ...fromServer,
        id: fromServer.id ?? (isEdit ? user.id : saved),
        username: isEdit ? user.username : form.username.trim(),
        roles: fromServer.roles ?? roles,
        fromCityId: form.fromCityId,
        fromLocation: fromServer.fromLocation ?? fromCity?.fromLocation ?? "",
        status: isActive ? "Y" : "N",
      };
      delete record.password;

      alert(`User ${isEdit ? "updated" : "created"} successfully`);
      handleClose();
      if (onSaved) onSaved(record, isEdit);
    } catch (err) {
      console.error("Failed to save user", err);
      alert(getFriendlyErrorMessage(err, "Failed to save user. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        className={isEdit ? "btnRed-outlined" : "btnRed"}
        onClick={handleOpen}
        sx={{ fontSize: isEdit ? "11px" : "inherit" }}
        style={isEdit ? undefined : { display: "block", float: "right", margin: "20px 20px 0" }}
      >
        {label || (isEdit ? "Edit" : "Add User")}
      </Button>

      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <div className="row">
            <div className="form-group col-md-6">
              <TextField
                fullWidth variant="standard" label="Username" margin="normal" autoComplete="off"
                value={form.username} onChange={setField("username")}
                disabled={isEdit}
                error={!!errors.username} helperText={errors.username || " "}
              />
            </div>
            <div className="form-group col-md-6">
              <TextField
                fullWidth variant="standard" label="Mobile Number" margin="normal" autoComplete="off"
                value={form.mobilenum} onChange={setField("mobilenum")}
                error={!!errors.mobilenum} helperText={errors.mobilenum || " "}
              />
            </div>
            <div className="form-group col-md-6">
              <TextField
                fullWidth variant="standard" label="First Name" margin="normal" autoComplete="off"
                value={form.firstname} onChange={setField("firstname")}
                error={!!errors.firstname} helperText={errors.firstname || " "}
              />
            </div>
            <div className="form-group col-md-6">
              <TextField
                fullWidth variant="standard" label="Last Name" margin="normal" autoComplete="off"
                value={form.lastname} onChange={setField("lastname")}
                helperText=" "
              />
            </div>
            <div className="form-group col-md-6">
              <TextField
                fullWidth variant="standard" label="Email" margin="normal" autoComplete="off"
                value={form.email} onChange={setField("email")}
                error={!!errors.email} helperText={errors.email || " "}
              />
            </div>
            {!isEdit && (
              <div className="form-group col-md-6">
                <TextField
                  fullWidth variant="standard" type="password" label="Password" margin="normal" autoComplete="new-password"
                  value={form.password} onChange={setField("password")}
                  error={!!errors.password} helperText={errors.password || " "}
                />
              </div>
            )}
            <div className="form-group col-md-6">
              <TextField
                select
                fullWidth variant="standard" label="From Location" margin="normal"
                value={form.fromCityId}
                onChange={setField("fromCityId")}
                error={!!errors.fromCityId} helperText={errors.fromCityId || " "}
              >
                <MenuItem value="" disabled>
                  Select city
                </MenuItem>
                {cities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.fromLocation}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          <Box sx={{ mt: 1 }}>
            <FormLabel sx={{ fontSize: 14 }}>Roles</FormLabel>
            <FormGroup row>
              {ROLE_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={roles.includes(opt.key)}
                      onChange={() => toggleRole(opt.key)}
                    />
                  }
                  label={opt.label}
                />
              ))}
            </FormGroup>
            {errors.roles && <span className="text-danger">{errors.roles}</span>}
          </Box>

          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label="Active"
            labelPlacement="start"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} className="btnRed" disabled={saving}>
            {saving ? "Saving..." : "Submit"}
          </Button>
          <Button onClick={handleClose} className="btnRed-outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddUserPopup;
