import React, { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Chip, Stack, TextField, MenuItem } from "@mui/material";
import userService from "../services/user.service";
import { getFriendlyErrorMessage } from "../services/setup-interceptors";
import SideNavComponent from "./SideNavComponent";
import AddUserPopup from "./AddUserPopup";

const roleLabel = (r) => {
  const name = (typeof r === "string" ? r : r?.name || "")
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/[\s-]+/g, "_");
  const map = {
    ADMIN: "Admin",
    OPERATOR: "Operator",
    BOOKING_AGENT: "Booking Agent",
    CITY_MANAGER: "City Manager",
  };
  return map[name] || name || "-";
};

// A user is active only when status is "Y".
const isActiveUser = (row) => String(row?.status).toUpperCase() === "Y";

// Status filter options. "" = all users (default).
const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "Y", label: "Active" },
  { value: "N", label: "Inactive" },
];

function UserManagementTable() {
  const [users, setUsers] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1); // react-data-table pages are 1-based
  const [perPage, setPerPage] = useState(50);
  const [statusFilter, setStatusFilter] = useState(""); // "" | "Y" | "N"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadUsers = useCallback((pageNo, size, status) => {
    setLoading(true);
    setError("");
    // backend pages are 0-based
    return userService
      .getUsers(pageNo - 1, size, status)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.content || [];
        setUsers(list);
        setTotalRows(
          data?.totalCount ?? data?.totalElements ?? list.length ?? 0
        );
      })
      .catch((err) => {
        console.error("Failed to load users", err);
        setError(getFriendlyErrorMessage(err, "Unable to load users."));
        setUsers([]);
        setTotalRows(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers(page, perPage, statusFilter);
  }, [page, perPage, statusFilter, loadUsers]);

  const reload = () => loadUsers(page, perPage, statusFilter);

  // After an add/edit, patch the table in place rather than refetching the list.
  const handleSaved = (record, wasEdit) => {
    if (!record || record.id == null) {
      reload();
      return;
    }
    setUsers((rows) => {
      const list = rows || [];
      const idx = list.findIndex((u) => u.id === record.id);
      if (idx === -1) {
        if (!wasEdit) setTotalRows((t) => t + 1);
        return [record, ...list];
      }
      const copy = [...list];
      copy[idx] = { ...copy[idx], ...record };
      return copy;
    });
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // start from the first page whenever the filter changes
  };

  const toggleStatus = async (row) => {
    const nextStatus = isActiveUser(row) ? "N" : "Y";
    const verb = nextStatus === "Y" ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${verb} ${row.username}?`)) return;
    setBusyId(row.id);
    try {
      await userService.updateUserStatus(row.id, nextStatus);
      await reload();
    } catch (err) {
      console.error("Failed to update user status", err);
      alert(getFriendlyErrorMessage(err, "Failed to update user status."));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { name: "Username", selector: (row) => row.username, sortable: true, grow: 1 },
    {
      name: "Name",
      selector: (row) => `${row.firstname || ""} ${row.lastname || ""}`.trim(),
      sortable: true,
      grow: 1,
    },
    { name: "Email", selector: (row) => row.email, sortable: true, grow: 1.5 },
    { name: "Mobile", selector: (row) => row.mobilenum, sortable: true, minWidth: "120px" },
    {
      name: "From Location",
      selector: (row) => row.fromLocation || row.fromCity?.fromLocation || "-",
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Roles",
      cell: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(row.roles || []).map((r, i) => (
            <Chip key={i} size="small" label={roleLabel(r)} />
          ))}
        </Stack>
      ),
      grow: 1,
    },
    {
      name: "Status",
      selector: (row) => (isActiveUser(row) ? "Active" : "Inactive"),
      cell: (row) => (
        <span style={{ color: isActiveUser(row) ? "green" : "#b02a37", fontWeight: 600 }}>
          {isActiveUser(row) ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
      minWidth: "110px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <AddUserPopup user={row} label="Edit" onSaved={handleSaved} />
          <Button
            size="small"
            className="btnRed-outlined"
            disabled={busyId === row.id}
            onClick={() => toggleStatus(row)}
            sx={{ fontSize: "11px" }}
          >
            {isActiveUser(row) ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "220px",
    },
  ];

  return (
    <div className="row p-1 pt-5">
      <div className="col-md-2">
        <SideNavComponent />
      </div>
      <div className="col-md-10">
        <AddUserPopup label="ADD" onSaved={handleSaved} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "12px 0",
          }}
        >
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            sx={{ minWidth: 160 }}
          >
            {STATUS_FILTERS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <DataTable
          title="User Management"
          columns={columns}
          data={users || []}
          progressPending={loading || users === null}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationDefaultPage={page}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          highlightOnHover
          pointerOnHover
        />
      </div>
    </div>
  );
}

export default UserManagementTable;
