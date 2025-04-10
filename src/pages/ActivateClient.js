import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header"; // Import the Header component

const ActivateClient = () => {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterOrg, setFilterOrg] = useState("");
  const currentUser = localStorage.getItem("username"); // Retrieve the logged-in user

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await axios.get("https://icttestalarm.com:3000/api/activation-records");
    setRecords(res.data);
  };

  const handleRowClick = (accountNumber) => {
    setSelected((prev) =>
      prev.includes(accountNumber)
        ? prev.filter((id) => id !== accountNumber) // Deselect if already selected
        : [...prev, accountNumber] // Select if not already selected
    );
  };

  const handleSelectAll = () => {
    const allAccountNumbers = filteredRecords.map((record) => record.account_number);
    setSelected(allAccountNumbers); // Select all filtered records
  };

  const handleDeselectAll = () => {
    setSelected([]); // Clear all selections
  };

  const handleActivate = async () => {
    if (selected.length === 0) return;

    const selectedData = selected.map((accountNumber) => {
      return { accountNumber, activatedBy: currentUser }; // Include the current user
    });

    await axios.post("https://icttestalarm.com:3000/api/activate-accounts", {
      accounts: selectedData,
    });

    fetchRecords();
    setSelected([]);
  };

  const handleDeactivate = async () => {
    if (selected.length === 0) return;
    await axios.post("https://icttestalarm.com:3000/api/deactivate-account", {
      accountNumbers: selected,
      deactivatedBy: currentUser, // Include the current user in the payload
    });
    fetchRecords();
    setSelected([]);
  };

  const filteredRecords = records.filter((r) =>
    r.account_name?.toLowerCase().includes(filterOrg.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Header /> {/* Add the Header component here */}
      {/* Filter Bar */}
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <ui5-bar design="Header" style={{ width: "100%" }}>
          <div slot="startContent" style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ui5-input
                placeholder="Filter by Organization"
                value={filterOrg}
                onInput={(e) => setFilterOrg(e.target.value)}
                style={{ width: "200px" }}
              ></ui5-input>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <ui5-button design="Transparent" onClick={() => setFilterOrg("")}>Clear</ui5-button>
              <ui5-button design="Transparent" onClick={handleSelectAll}>Select All</ui5-button>
              <ui5-button design="Transparent" onClick={handleDeselectAll}>Deselect All</ui5-button>
              <ui5-button design="Emphasized" onClick={handleActivate}>
                Activate Selected ({selected.length})
              </ui5-button>
              <ui5-button design="Negative" onClick={handleDeactivate}>
                Deactivate Selected
              </ui5-button>
            </div>
          </div>
        </ui5-bar>
      </div>

      {/* Table */}
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        overflowX: "auto",
        boxShadow: "0 0 0.125rem 0 rgba(0,0,0,0.1)",
        borderRadius: "0.25rem"
      }}>
        <ui5-table no-data-text="No records available" style={{ width: "100%" }}>
          <ui5-table-header-row slot="headerRow">
            <ui5-table-header-cell width="150px">Account Number</ui5-table-header-cell>
            <ui5-table-header-cell width="200px">Organization</ui5-table-header-cell>
            <ui5-table-header-cell width="150px">First Name</ui5-table-header-cell>
            <ui5-table-header-cell width="150px">Last Name</ui5-table-header-cell>
            <ui5-table-header-cell width="200px">Email</ui5-table-header-cell>
            <ui5-table-header-cell width="150px">Activation Code</ui5-table-header-cell>
            <ui5-table-header-cell width="150px">Status</ui5-table-header-cell>
          </ui5-table-header-row>

          {filteredRecords.map((record) => (
            <ui5-table-row
              key={record.account_number}
              style={{
                backgroundColor: selected.includes(record.account_number) ? "#e0f7fa" : "transparent",
                cursor: "pointer",
              }}
              onClick={() => handleRowClick(record.account_number)}
            >
              <ui5-table-cell>{record.account_number}</ui5-table-cell>
              <ui5-table-cell>{record.account_name}</ui5-table-cell>
              <ui5-table-cell>{record.first_name}</ui5-table-cell>
              <ui5-table-cell>{record.last_name}</ui5-table-cell>
              <ui5-table-cell>{record.emergency_contact_email || "-"}</ui5-table-cell>
              <ui5-table-cell>{record.activation_code || "-"}</ui5-table-cell>
              <ui5-table-cell style={{
                color: record.status === "Activated" ? "green" : record.status === "Deactivated" ? "gray" : "red",
                fontWeight: "bold"
              }}>
                {record.status || "Not Activated"}
              </ui5-table-cell>
            </ui5-table-row>
          ))}
        </ui5-table>
      </div>
    </div>
  );
};

export default ActivateClient;
