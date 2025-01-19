import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";

const MonitorEmergency = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [audio] = useState(new Audio("/SOS_MORSE.mp3")); // Load the alert sound

  const mapContainerStyle = {
    width: "100%",
    height: "50vh",
  };

  const center = selectedAlert
    ? { lat: parseFloat(selectedAlert.latitude), lng: parseFloat(selectedAlert.longitude) }
    : userLocation || { lat: 14.5995, lng: 120.9842 }; // Default to Manila

  useEffect(() => {
    // Fetch user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error fetching user location:", error);
        setUserLocation({ lat: 14.5995, lng: 120.9842 }); // Default to Manila
      }
    );

    // Fetch unhandled alerts every 5 seconds
    fetchUnhandledAlerts();
    const interval = setInterval(fetchUnhandledAlerts, 5000);

    // Establish WebSocket connection
    // const socket = new WebSocket("ws://152.42.241.82:3000");
    // const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    // const host = window.location.hostname;
    // const wsPort = "8080"; // Change if your WebSocket server is on another port

    const socket = new WebSocket("wss://152.42.241.82:3000");
    // const socket = new WebSocket(`${protocol}${host}:${wsPort}/ws`);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
          const newAlert = JSON.parse(event.data);
          setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
          playAlertSound();
      } catch (error) {
          console.error("Error parsing WebSocket message:", event.data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      clearInterval(interval);
      socket.close();
      stopAlertSound();
    };
  }, []);

  // Fetch unhandled and handled alerts (excluding completed ones)
  const fetchUnhandledAlerts = async () => {
    try {
      const response = await axios.get("https://152.42.241.82:3000/api/unhandled-alerts");
      const filteredAlerts = response.data.filter(alert => alert.status !== "C"); // Keep handled/unhandled, remove completed
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error("Error fetching unhandled alerts:", error.message);
    }
  };

  // Handle clicking an alert (Updates timestamp_handled in DB)
  const handleAlertClick = async (alert) => {
    setSelectedAlert(alert);
    stopAlertSound();

    // Send request to update timestamp_handled (without marking as completed)
    try {
      await axios.post("https://152.42.241.82:3000/api/update-handled-time", { alert_id: alert.alert_id });

      // Update status in UI (to reflect handling time)
      setAlerts((prevAlerts) =>
        prevAlerts.map((a) =>
          a.alert_id === alert.alert_id ? { ...a, timestamp_handled: new Date().toISOString() } : a
        )
      );
    } catch (error) {
      console.error("Error updating handled timestamp:", error.message);
    }
  };

  // Mark alert as completed
  const handleCompleteAlert = async (alert_id) => {
    try {
      await axios.post("https://152.42.241.82:3000/api/complete-alert", { alert_id });

      // Remove completed alert from UI
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.alert_id !== alert_id));
      setSelectedAlert(null);
    } catch (error) {
      console.error("Error marking alert as complete:", error.message);
    }
  };

  // Play the emergency alert sound in loop
  const playAlertSound = () => {
    audio.loop = true;
    audio.play();
  };

  // Stop the emergency alert sound
  const stopAlertSound = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Map Section */}
      <div style={{ height: "50%" }}>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={14}>
            {selectedAlert && (
              <Marker
                position={{
                  lat: parseFloat(selectedAlert.latitude),
                  lng: parseFloat(selectedAlert.longitude),
                }}
              />
            )}
            {userLocation && !selectedAlert && <Marker position={userLocation} label="You are here" />}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Alerts and Contact Info Section */}
      <div style={{ height: "50%", display: "flex" }}>
        {/* Alerts List */}
        <div style={{ flex: 1, padding: "1rem", overflowY: "auto", borderRight: "1px solid #ccc" }}>
          <h3>Alerts</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Alert ID</th>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Account Number</th>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Time Raised</th>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Latitude</th>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Longitude</th>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alert.alert_id}
                  style={{
                    cursor: "pointer",
                    backgroundColor: alert.status?.trim().toUpperCase() === "N" ? "red" : "transparent",
                    color: alert.status?.trim().toUpperCase() === "N" ? "white" : "black",
                  }}
                  onClick={() => handleAlertClick(alert)}
                >
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{alert.alert_id}</td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{alert.account_number}</td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{new Date(alert.timestamp).toLocaleString()}</td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{alert.latitude}</td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{alert.longitude}</td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    <button
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleCompleteAlert(alert.alert_id)}
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Contact Information */}
        <div style={{ flex: 1, padding: "1rem" }}>
          <h3>Contact Information</h3>
          {selectedAlert ? (
            <div>
              <p><strong>Account Name:</strong> {selectedAlert.account_name || "N/A"}</p>
              <p><strong>Name:</strong> {selectedAlert.first_name} {selectedAlert.last_name}</p>
              <p><strong>Phone Numbers:</strong> {selectedAlert.phone_numbers || "N/A"}</p>
            </div>
          ) : (
            <p>Select an alert to view contact details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorEmergency;
