import React, { useEffect, useState, useRef } from "react";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/Toast.js";
import "@ui5/webcomponents/dist/Bar.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/ComboBox.js";
import "@ui5/webcomponents/dist/DatePicker.js";

const ViewRecords = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    alertId: "",
    accountNumber: "",
    status: "",
    date: ""
  });

  // Create a ref for the toast component
  const toastRef = useRef(null);

  const showToast = (message) => {
    if (toastRef.current) {
      toastRef.current.textContent = message;
      toastRef.current.open = true;
    }
  };

  const fetchHandledAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://icttestalarm.com:3000/api/view-records");
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", response.status, errorText);
        setAlerts([]);
        setFilteredAlerts([]);
        showToast("Error fetching data. Please try again.");
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setAlerts(data);
        setFilteredAlerts(data);
        showToast("Data refreshed successfully!");
      } else {
        console.error("Unexpected API response format:", data);
        setAlerts([]);
        setFilteredAlerts([]);
        showToast("Unexpected data format received.");
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setAlerts([]);
      setFilteredAlerts([]);
      showToast("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHandledAlerts();
  }, []);

  useEffect(() => {
    const filtered = alerts.filter(alert => {
      const alertId = (alert.alert_id || '').toString().toLowerCase();
      const accountNumber = (alert.account_number || '').toString().toLowerCase();
      const status = (alert.status || '').toLowerCase();
      const date = alert.timestamp ? new Date(alert.timestamp).toLocaleDateString().toLowerCase() : '';

      return (
        alertId.includes((filters.alertId || '').toLowerCase()) &&
        accountNumber.includes((filters.accountNumber || '').toLowerCase()) &&
        status.includes((filters.status || '').toLowerCase()) &&
        date.includes((filters.date || '').toLowerCase())
      );
    });
    setFilteredAlerts(filtered);
  }, [filters, alerts]);

  const handleFilterChange = (e, field) => {
    setFilters({
      ...filters,
      [field]: e.target.value
    });
  };

  const handleStatusChange = (e) => {
    setFilters({
      ...filters,
      status: e.detail.item.textContent
    });
  };

  const handleClearFilters = () => {
    setFilters({
      alertId: "",
      accountNumber: "",
      status: "",
      date: ""
    });
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>No alert data available</p>
        <ui5-button onClick={fetchHandledAlerts}>Refresh Data</ui5-button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <ui5-toast ref={toastRef}></ui5-toast>
      
      {/* Header */}
      <ui5-bar design="Header" style={{ width: '100%' }}>
        <h2 slot="startContent" style={{ margin: 0, color: 'white' }}>Handled & Completed Alerts</h2>
      </ui5-bar>
      
      {/* Filter Bar */}
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <ui5-bar design="Header" style={{ width: '100%' }}>
          <div slot="startContent" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            width: '100%',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ui5-label>Filters:</ui5-label>
              <ui5-input 
                placeholder="Alert ID" 
                value={filters.alertId}
                onInput={(e) => handleFilterChange(e, 'alertId')}
                style={{ width: '150px' }}
              ></ui5-input>
              <ui5-input 
                placeholder="Account Number" 
                value={filters.accountNumber}
                onInput={(e) => handleFilterChange(e, 'accountNumber')}
                style={{ width: '180px' }}
              ></ui5-input>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ui5-comboBox 
                placeholder="Status"
                onSelectionChange={handleStatusChange}
                style={{ width: '180px' }}
              >
                <ui5-cb-item text="Handled"></ui5-cb-item>
                <ui5-cb-item text="Completed"></ui5-cb-item>
              </ui5-comboBox>
              <ui5-date-picker 
                placeholder="Date"
                value={filters.date}
                onChange={(e) => handleFilterChange(e, 'date')}
                style={{ width: '180px' }}
              ></ui5-date-picker>
              <ui5-button design="Transparent" onClick={handleClearFilters}>Clear</ui5-button>
              <ui5-button design="Emphasized" onClick={fetchHandledAlerts}>Refresh Data</ui5-button>
            </div>
          </div>
        </ui5-bar>
      </div>
      
      {/* Table */}
      <div style={{ 
        width: '100%',
        maxWidth: '1200px',
        overflowX: 'auto',
        boxShadow: '0 0 0.125rem 0 rgba(0,0,0,0.1)',
        borderRadius: '0.25rem'
      }}>
        <ui5-table 
          no-data-text="No alerts available" 
          style={{ width: '100%' }}
        >
          <ui5-table-header-row slot="headerRow">
            <ui5-table-header-cell width="100px">Alert ID</ui5-table-header-cell>
            <ui5-table-header-cell width="150px">Account Number</ui5-table-header-cell>
            <ui5-table-header-cell width="200px">Time Raised</ui5-table-header-cell>
            <ui5-table-header-cell width="120px">Latitude</ui5-table-header-cell>
            <ui5-table-header-cell width="120px">Longitude</ui5-table-header-cell>
            <ui5-table-header-cell width="120px">Status</ui5-table-header-cell>
          </ui5-table-header-row>
          
          {filteredAlerts.map((alert) => (
            <ui5-table-row key={alert.alert_id}>
              <ui5-table-cell>{alert.alert_id}</ui5-table-cell>
              <ui5-table-cell>{alert.account_number}</ui5-table-cell>
              <ui5-table-cell>{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '-'}</ui5-table-cell>
              <ui5-table-cell>{alert.latitude || '-'}</ui5-table-cell>
              <ui5-table-cell>{alert.longitude || '-'}</ui5-table-cell>
              <ui5-table-cell style={{
                color: alert.status === "Completed" ? "green" : "orange",
                fontWeight: "bold"
              }}>
                {alert.status || '-'}
              </ui5-table-cell>
            </ui5-table-row>
          ))}
        </ui5-table>
      </div>
    </div>
  );
};

export default ViewRecords;