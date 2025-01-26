import React, { useState, useRef, useEffect } from "react";
import {
  Input,
  Button,
  MessageBox,
  Dialog
} from "@ui5/webcomponents-react";
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const CreateRecordManual = () => {
  const [formData, setFormData] = useState({
    accountName: "",
    firstName: "",
    lastName: "",
    address: "",
  });
  const [phoneNumbers, setPhoneNumbers] = useState([""]);
  const [messageBoxProps, setMessageBoxProps] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMap = useRef(null);

  // Add a new phone number input
  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  // Update a phone number
  const updatePhoneNumber = (index, value) => {
    const updatedNumbers = [...phoneNumbers];
    updatedNumbers[index] = value;
    setPhoneNumbers(updatedNumbers);
  };

  // Remove a phone number
  const removePhoneNumber = (index) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  // Load Google Maps script dynamically
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => console.log("Google Maps Loaded");
      document.body.appendChild(script);
    }
  }, []);

  // Open map modal
  const openGoogleMaps = () => {
    setShowMap(true);
    setTimeout(initMap, 300); // Wait for modal to render
  };

  // Initialize Google Map
  const initMap = () => {
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 14.5995, lng: 120.9842 }, // Default: Manila, PH
      zoom: 12,
    });

    googleMap.current = map;

    map.addListener("click", (event) => {
      placeMarker(event.latLng, map);
    });
  };

  // Place marker and fetch address
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
          address: results[0].formatted_address,
        }));
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  // Close map modal
  const closeMapModal = () => setShowMap(false);

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate and submit form
  const handleSubmit = async () => {
    const { accountName, firstName, lastName, address } = formData;

    if (!accountName || !firstName || !lastName || !address || phoneNumbers.some((num) => !num)) {
      setMessageBoxProps({
        open: true,
        title: "Validation Error",
        message: "All fields are mandatory, including at least one phone number.",
        onClose: () => setMessageBoxProps(null),
      });
      return;
    }

    try {
      const response = await axios.post('https://152.42.241.82:3000/api/ict_alarm_account', {
        ...formData,
        phoneNumbers,
      });

      setMessageBoxProps({
        open: true,
        title: "Success",
        message: response.data.message || "Record saved successfully!",
        onClose: () => setMessageBoxProps(null),
      });
    } catch (error) {
      setMessageBoxProps({
        open: true,
        title: "Error",
        message: error.response?.data?.error || "Failed to save record.",
        onClose: () => setMessageBoxProps(null),
      });
    }
  };

  

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create Record (Manual Input)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Account Name */}
        <div>
          <label>Account Name</label>
          <Input
            placeholder="Organization Name or Alias"
            style={{ width: "100%" }}
            value={formData.accountName}
            onInput={(e) => handleInputChange("accountName", e.target.value)}
          />
        </div>

        {/* First Name and Last Name */}
        <div>
          <label>First Name</label>
          <Input
            placeholder="First Name"
            style={{ width: "100%" }}
            value={formData.firstName}
            onInput={(e) => handleInputChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <label>Last Name</label>
          <Input
            placeholder="Last Name"
            style={{ width: "100%" }}
            value={formData.lastName}
            onInput={(e) => handleInputChange("lastName", e.target.value)}
          />
        </div>

        {/* Address with Google Pin Button */}
        <div style={{ gridColumn: "span 2", display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label>Address</label>
            <Input
              placeholder="Manual Entry or Pin in Google Maps"
              style={{ width: "100%" }}
              value={formData.address}
              onInput={(e) => handleInputChange("address", e.target.value)}
            />
          </div>
          <Button design="Transparent" onClick={openGoogleMaps}>
            Google Pin
          </Button>
        </div>
      </div>

      {/* Phone Numbers */}
      <h3 style={{ marginTop: "2rem" }}>Emergency Contacts</h3>
      {phoneNumbers.map((number, index) => (
        <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
          <Input
            placeholder="Phone Number"
            value={number}
            onInput={(e) => updatePhoneNumber(index, e.target.value)}
          />
          <Button design="Negative" onClick={() => removePhoneNumber(index)} style={{ marginLeft: "0.5rem" }}>
            Remove
          </Button>
        </div>
      ))}
      <Button design="Positive" onClick={addPhoneNumber}>Add Phone Number</Button>

      {/* Submit Button */}
      <div style={{ marginTop: "2rem" }}>
        <Button design="Emphasized" onClick={handleSubmit}>Submit</Button>
      </div>

      {/* Google Maps Dialog */}
      {showMap && (
        <Dialog open={showMap} headerText="Select Location" onAfterClose={closeMapModal}>
          <div ref={mapRef} style={{ width: "100%", height: "400px" }}></div>
          <Button design="Emphasized" onClick={closeMapModal}>Confirm Location</Button>
        </Dialog>
      )}

      {/* MessageBox */}
      {messageBoxProps && (
        <MessageBox open={messageBoxProps.open} title={messageBoxProps.title} onClose={messageBoxProps.onClose}>
          {messageBoxProps.message}
        </MessageBox>
      )}
    </div>
  );
};

export default CreateRecordManual;