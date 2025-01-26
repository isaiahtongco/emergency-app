import React, { useState, useEffect } from "react";
import {
  Table,
  TableRow,
  TableCell,
  TableHeaderRow,
  TableHeaderCell,
  Button,
  Input,
  ComboBox,
  ComboBoxItem
} from "@ui5/webcomponents-react";
import axios from "axios";

const ViewRecords = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filters, setFilters] = useState({
    alertId: "",
    accountNumber: "",
    status: "",
    date: "",
  });

  // 📌 Fetch handled and completed alerts
  useEffect(() => {
    fetchHandledAlerts();
  }, []);

  const fetchHandledAlerts = async () => {
    try {
      const response = await axios.get("https://icttestalarm.com:3000/api/view-records");
      setAlerts(response.data);
      setFilteredAlerts(response.data); // ✅ Set default filtered data
    } catch (error) {
      console.error("Error fetching handled alerts:", error);
    }
  };

  // 📌 Filter function
  const applyFilters = () => {
    let filtered = alerts;

    if (filters.alertId) {
      filtered = filtered.filter(alert => alert.alert_id.toString().includes(filters.alertId));
    }

    if (filters.accountNumber) {
      filtered = filtered.filter(alert => alert.account_number.toString().includes(filters.accountNumber));
    }

    if (filters.status) {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    if (filters.date) {
      filtered = filtered.filter(alert => new Date(alert.timestamp).toLocaleDateString().includes(filters.date));
    }

    setFilteredAlerts(filtered);
  };

  // 📌 Reset Filters
  const resetFilters = () => {
    setFilters({ alertId: "", accountNumber: "", status: "", date: "" });
    setFilteredAlerts(alerts);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ backgroundColor: "blue", color: "white", textAlign: "center", padding: "1rem", marginBottom: "1rem" }}>
        Handled & Completed Alerts
      </h2>

      {/* 📌 Smart Filter Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Input
          placeholder="Filter by Alert ID"
          value={filters.alertId}
          onInput={(e) => setFilters({ ...filters, alertId: e.target.value })}
        />
        <Input
          placeholder="Filter by Account Number"
          value={filters.accountNumber}
          onInput={(e) => setFilters({ ...filters, accountNumber: e.target.value })}
        />
        <ComboBox
          placeholder="Filter by Status"
          onSelectionChange={(e) => setFilters({ ...filters, status: e.target.selectedOption?.textContent || "" })}
        >
          <ComboBoxItem text="Handled" />
          <ComboBoxItem text="Completed" />
        </ComboBox>
        <Input
          type="date"
          placeholder="Filter by Date"
          value={filters.date}
          onInput={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <Button onClick={applyFilters}>Apply Filters</Button>
        <Button onClick={resetFilters} design="Transparent">Reset</Button>
      </div>

      {/* 📌 Fixed UI5 Table */}
      <Table growing="Scroll" style={{ width: "100%" }}>
        <TableHeaderRow>
          <TableHeaderCell>Alert ID</TableHeaderCell>
          <TableHeaderCell>Account Number</TableHeaderCell>
          <TableHeaderCell>Time Raised</TableHeaderCell>
          <TableHeaderCell>Latitude</TableHeaderCell>
          <TableHeaderCell>Longitude</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableHeaderRow>

        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <TableRow key={alert.alert_id}>
              <TableCell>{alert.alert_id}</TableCell>
              <TableCell>{alert.account_number}</TableCell>
              <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
              <TableCell>{alert.latitude}</TableCell>
              <TableCell>{alert.longitude}</TableCell>
              <TableCell
                style={{
                  color: alert.status === "Completed" ? "green" : "orange",
                }}
              >
                {alert.status}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan="6" style={{ textAlign: "center" }}>
              No records found
            </TableCell>
          </TableRow>
        )}
      </Table>
    </div>
  );
};

export default ViewRecords;
