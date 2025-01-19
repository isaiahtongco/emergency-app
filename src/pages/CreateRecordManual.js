import React, { useState } from "react";
import {
  Input,
  Button,
  MessageBox,
} from "@ui5/webcomponents-react";
import axios from 'axios';

const CreateRecordManual = () => {
  const [formData, setFormData] = useState({
    accountNumber: "",
    accountName: "",
    firstName: "",
    lastName: "",
    address: "",
  });
  const [phoneNumbers, setPhoneNumbers] = useState([""]);
  const [messageBoxProps, setMessageBoxProps] = useState(null);

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

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate and submit the form
  const handleSubmit = async () => {
    const { accountNumber, accountName, firstName, lastName, address } = formData;

    if (!accountNumber || !accountName || !firstName || !lastName || !address || phoneNumbers.some((num) => !num)) {
      setMessageBoxProps({
        open: true,
        title: "Validation Error",
        message: "All fields are mandatory, including at least one phone number.",
        onClose: () => setMessageBoxProps(null),
      });
      return;
    }

    try {
      const response = await axios.post('http://178.128.19.209:3000/api/ict_alarm_account', {
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
        {/* Account Number and Name */}
        <div>
          <label>Account Number</label>
          <Input
            placeholder="Possible Key"
            style={{ width: "100%" }}
            type="Number"
            value={formData.accountNumber}
            onInput={(e) => handleInputChange("accountNumber", e.target.value)}
          />
        </div>
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

        {/* Address */}
        <div style={{ gridColumn: "span 2" }}>
          <label>Address</label>
          <Input
            placeholder="Manual Entry or Pin in Google Maps"
            style={{ width: "100%" }}
            value={formData.address}
            onInput={(e) => handleInputChange("address", e.target.value)}
          />
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
          <Button
            design="Negative"
            onClick={() => removePhoneNumber(index)}
            style={{ marginLeft: "0.5rem" }}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button design="Positive" onClick={addPhoneNumber}>
        Add Phone Number
      </Button>

      {/* Submit Button */}
      <div style={{ marginTop: "2rem" }}>
        <Button design="Emphasized" onClick={handleSubmit}>
          Submit
        </Button>
      </div>

      {/* MessageBox */}
      {messageBoxProps && (
        <MessageBox
          open={messageBoxProps.open}
          title={messageBoxProps.title}
          onClose={messageBoxProps.onClose}
        >
          {messageBoxProps.message}
        </MessageBox>
      )}
    </div>
  );
};

export default CreateRecordManual;
