import React, { useState, useRef, useEffect } from "react";
import {
  Input,
  Button,
  ComboBox,
  ComboBoxItem,
  MessageBox,
  Dialog, 
  MessageStrip
} from "@ui5/webcomponents-react";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    contact_number: "",
    emergency_contact_num: "",
    birthdate: "",
    address_line1: "",
    address_line2: ""
  });

  const [showMap, setShowMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStrip, setMessageStrip] = useState({
    show: false,
    message: "",
    type: "Information"
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMap = useRef(null);

  const showMessage = (message, type = "Information") => {
    setMessageStrip({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setMessageStrip(prev => ({...prev, show: false}));
    }, 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const { email, role_id, first_name, last_name, birthdate, address_line1 } = formData;
  
    if (!email || !role_id || !first_name || !last_name || !birthdate || !address_line1) {
      showMessage("Please fill out all required fields marked with *.", "Critical");
      return false;
    }
  
    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address (e.g., example@domain.com).", "Critical");
      return false;
    }
  
    return true;
  };

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => console.log("Google Maps Loaded");
      document.body.appendChild(script);
    }
  }, []);

  const openGoogleMaps = () => {
    setShowMap(true);
    setTimeout(initMap, 300);
  };

  const initMap = () => {
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 14.5995, lng: 120.9842 },
      zoom: 12,
    });

    googleMap.current = map;

    map.addListener("click", (event) => {
      placeMarker(event.latLng, map);
    });
  };

  const placeMarker = (location, map) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position: location,
      map: map,
    });

    markerRef.current = marker;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: location }, (results, status) => {
      if (status === "OK" && results[0]) {
        setFormData((prev) => ({
          ...prev,
          address_line1: results[0].formatted_address
        }));
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('https://icttestalarm.com:3000/api/manage-users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'An unknown error occurred.');
      }

      showMessage(`User created successfully with username: ${result.username}`, "Positive");

      setFormData({
        username: "",
        email: "",
        role_id: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        contact_number: "",
        emergency_contact_num: "",
        birthdate: "",
        address_line1: "",
        address_line2: "",
      });

    } catch (error) {
      showMessage(error.message || 'Failed to create user.', "Negative");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMapModal = () => setShowMap(false);

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ backgroundColor: "blue", color: "white", textAlign: "center", padding: "1rem", marginBottom: "2rem" }}>
        Create New User
      </h2>

      {messageStrip.show && (
        <MessageStrip 
          design={messageStrip.type}
          hideCloseButton
          style={{ marginBottom: "1rem" }}
        >
          {messageStrip.message}
        </MessageStrip>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Username (optional)</label>
          <Input
            placeholder="Leave blank to auto-generate"
            value={formData.username}
            onInput={(e) => handleInputChange("username", e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Email Address *</label>
          <Input
            type="email"
            value={formData.email}
            onInput={(e) => handleInputChange("email", e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Role *</label>
          <ComboBox
                placeholder="Select Role"
                onChange={(e) => handleInputChange("role_id", e.target.value.split(" - ")[0])}
                >
                <ComboBoxItem text="1 - Admin" />
                <ComboBoxItem text="2 - User" />
                <ComboBoxItem text="3 - Viewer" />
           </ComboBox>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>First Name *</label>
          <Input value={formData.first_name} onInput={(e) => handleInputChange("first_name", e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Middle Name</label>
          <Input value={formData.middle_name} onInput={(e) => handleInputChange("middle_name", e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Last Name *</label>
          <Input value={formData.last_name} onInput={(e) => handleInputChange("last_name", e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Contact Number</label>
          <Input value={formData.contact_number} onInput={(e) => handleInputChange("contact_number", e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Emergency Contact Number</label>
          <Input value={formData.emergency_contact_num} onInput={(e) => handleInputChange("emergency_contact_num", e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Birthdate *</label>
          <Input type="date" value={formData.birthdate} onInput={(e) => handleInputChange("birthdate", e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <div style={{ flex: 3, display: "flex", flexDirection: "column" }}>
          <label>Address Line 1 *</label>
          <Input
            style={{ width: "80%" }}
            placeholder="Manual Entry or Pin via Google Maps"
            value={formData.address_line1}
            onInput={(e) => handleInputChange("address_line1", e.target.value)}
          />
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button onClick={openGoogleMaps}>Google Pin</Button>
        </div>
      </div>

      {/* <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column" }}>
        <label>Address Line 2</label>
        <Input
          style={{ width: "80%" }}
          value={formData.address_line2}
          onInput={(e) => handleInputChange("address_line2", e.target.value)}
        />
      </div> */}

      {showMap && (
        <Dialog open={showMap} headerText="Select Location" onAfterClose={closeMapModal}>
          <div ref={mapRef} style={{ width: "100%", height: "400px" }}></div>
          <Button design="Emphasized" onClick={closeMapModal}>Confirm Location</Button>
        </Dialog>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Button design="Emphasized" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateUser;