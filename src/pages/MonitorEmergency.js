import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";

const MonitorEmergency = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const audioRef = useRef(new Audio("/SOS_MORSE.mp3")); // Load the alert sound

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
    const socket = new WebSocket("wss://icttestalarm.com:3000");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const newAlert = JSON.parse(event.data);
        
        // Check if the alert is already in the list before adding
        setAlerts((prevAlerts) => {
          const alertExists = prevAlerts.some(alert => alert.alert_id === newAlert.alert_id);
          if (!alertExists) {
            playAlertSound();
            return [...prevAlerts, newAlert]; // Add the new alert
          }
          return prevAlerts;
        });

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
      const response = await axios.get("https://icttestalarm.com:3000/api/unhandled-alerts");
      const filteredAlerts = response.data.filter(alert => alert.status !== "C"); // Keep handled/unhandled, remove completed

      // Stop sound if all alerts are handled by other agents
      if (filteredAlerts.length === 0) {
        stopAlertSound();
      }

      setAlerts(filteredAlerts);
    } catch (error) {
      console.error("Error fetching unhandled alerts:", error.message);
    }
  };

  // Handle clicking an alert (Updates timestamp_handled in DB)
  const handleAlertClick = async (alert) => {
    setSelectedAlert(alert);
    stopAlertSound();

    try {
      await axios.post("https://icttestalarm.com:3000/api/update-handled-time", { alert_id: alert.alert_id });

      // Update status in UI to show it is being handled
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
      await axios.post("https://icttestalarm.com:3000/api/complete-alert", { alert_id });

      // Remove completed alert from UI
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.alert_id !== alert_id));
      setSelectedAlert(null);

      // Stop the alert sound when an alert is completed
      stopAlertSound();
    } catch (error) {
      console.error("Error marking alert as complete:", error.message);
    }
  };

  // Play the emergency alert sound in loop
  const playAlertSound = () => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.loop = true;
      audio.play().catch(error => {
        console.warn("Autoplay blocked. Waiting for user interaction.");
      });
    }
  };

  // Stop the emergency alert sound
  const stopAlertSound = () => {
    const audio = audioRef.current;
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
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "0.5rem" }}>Alert ID</th>
                <th style={{ border: "1px solid black", padding: "0.5rem" }}>Account Number</th>
                <th style={{ border: "1px solid black", padding: "0.5rem" }}>Time Raised</th>
                <th style={{ border: "1px solid black", padding: "0.5rem" }}>Latitude</th>
                <th style={{ border: "1px solid black", padding: "0.5rem" }}>Longitude</th>
                <th style={{ border: "1px solid black", padding: "0.5rem" }}>Action</th>
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
                  <td>{alert.alert_id}</td>
                  <td>{alert.account_number}</td>
                  <td>{new Date(alert.timestamp).toLocaleString()}</td>
                  <td>{alert.latitude}</td>
                  <td>{alert.longitude}</td>
                  <td>
                    <button onClick={() => handleCompleteAlert(alert.alert_id)}>Complete</button>
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
