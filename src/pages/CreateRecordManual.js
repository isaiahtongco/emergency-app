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
  const [mobileNumbers, setMobileNumbers] = useState([""]);
  const [emails, setEmails] = useState([""]);
  const [emergencyContacts, setEmergencyContacts] = useState([""]);
  const [messageBoxProps, setMessageBoxProps] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMap = useRef(null);

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // // Function to add new field entry
  // const addField = (setFunction) => {
  //   setFunction((prev) => [...prev, ""]);
  // };

  // // Function to update field values
  // const updateField = (index, value, setFunction) => {
  //   setFunction((prev) => {
  //     const updated = [...prev];
  //     updated[index] = value;
  //     return updated;
  //   });
  // };

  // // Function to remove field entry
  // const removeField = (index, setFunction) => {
  //   setFunction((prev) => prev.filter((_, i) => i !== index));
  // };

  // Validate form before submission
  const validateForm = () => {
    const { firstName, lastName, address, mobileNumber } = formData;
    if (!firstName || !lastName || !address || !mobileNumber) {
      setMessageBoxProps({
        open: true,
        title: "Validation Error",
        message: "First Name, Last Name, Address, and Mobile Number are required fields.",
        onClose: () => setMessageBoxProps(null),
      });
      return false;
    }
    return true;
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

  // Open Google Maps modal
  const openGoogleMaps = () => {
    setShowMap(true);
    setTimeout(initMap, 300);
  };

  // Initialize Google Map
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

  // Validate and submit the form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // const { accountNumber, accountName, firstName, lastName, address } = formData;
    const { accountNumber, accountName, firstName, lastName, address, mobileNumber, email, emergencyContact } = formData;

    try {
      const response = await axios.post('https://152.42.241.82:3000/api/ict_alarm_account', {
        accountNumber,
        accountName,
        firstName,
        lastName,
        address,
        phoneNumbers: [mobileNumber], // ✅ Send as `phoneNumbers` (matching the backend)
        email,
        emergencyContact
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

  // Close Google Maps modal
  const closeMapModal = () => setShowMap(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ backgroundColor: "blue", color: "white", textAlign: "center", padding: "1rem", marginBottom: "1rem" }}>
        Create Record (Manual Input)
      </h2>

      {/* Contact Information */}
      <h3 style={{ marginTop: "2rem" }}>Basic Information</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

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
      </div>

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

      {/* Address with Google Pin Button */}
      <div style={{ gridColumn: "span 2", display: "flex", gap: "1rem", marginTop: "2rem" }}>
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

      {/* Contact Information */}
      <h3 style={{ marginTop: "2rem" }}>Contact Information</h3>
      <div>
        <label>Mobile Number</label>
        <Input
          placeholder="Enter Mobile Number"
          style={{ width: "100%" }}
          value={formData.mobileNumber}
          onKeyPress={(event) => {
            if (!/[0-9]/.test(event.key)) {
              event.preventDefault();
            }
          }}
          onInput={(e) => handleInputChange("mobileNumber", e.target.value)}
        />
      </div>
      <div>
        <label>Email Address</label>
        <Input
          placeholder="Enter Email Address"
          style={{ width: "100%" }}
          value={formData.email}
          onInput={(e) => handleInputChange("email", e.target.value)}
        />
      </div>
      <div>
        <label>Emergency Contact Number</label>
        <Input
          placeholder="Enter Emergency Contact Number"
          style={{ width: "100%" }}
          value={formData.emergencyContact}
          onInput={(e) => handleInputChange("emergencyContact", e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div style={{ marginTop: "2rem" }}>
        <Button design="Emphasized" onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  
      

  );
};

export default CreateRecordManual;
