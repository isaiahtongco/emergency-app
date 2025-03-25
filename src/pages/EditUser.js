import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  ComboBox,
  ComboBoxItem,
  MessageStrip
} from "@ui5/webcomponents-react";

const EditUser = () => {
  const [usernameSearch, setUsernameSearch] = useState("");
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
    address_line2: "",
    password: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [messageStrip, setMessageStrip] = useState({
    show: false,
    message: "",
    type: "Information"
  });

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

  const handleSearch = async () => {
    if (!usernameSearch) {
      showMessage("Please enter a username to search", "Critical");
      return;
    }

    try {
      const response = await fetch(`https://icttestalarm.com:3000/api/manage-users/get?username=${usernameSearch}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "User not found");
      }

      setFormData({
        ...result.user,
        password: "" // Don't show the hashed password
      });
      setIsEditing(true);
      showMessage("User found. You can now edit the details.", "Positive");

    } catch (error) {
      showMessage(error.message, "Negative");
      setIsEditing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://icttestalarm.com:3000/api/manage-users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      showMessage("User updated successfully", "Positive");
      
    } catch (error) {
      showMessage(error.message, "Negative");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ backgroundColor: "blue", color: "white", textAlign: "center", padding: "1rem", marginBottom: "2rem" }}>
        Edit User (Admin Only)
      </h2>

      {messageStrip.show && (
        <MessageStrip design={messageStrip.type} hideCloseButton style={{ marginBottom: "1rem" }}>
          {messageStrip.message}
        </MessageStrip>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <Input
          placeholder="Enter username to edit"
          value={usernameSearch}
          onInput={(e) => setUsernameSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button design="Emphasized" onClick={handleSearch}>Search</Button>
      </div>

      {isEditing && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Username</label>
              <Input value={formData.username} disabled />
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
                value={`${formData.role_id} - ${formData.role_id === "1" ? "Admin" : formData.role_id === "2" ? "User" : "Viewer"}`}
                onChange={(e) => handleInputChange("role_id", e.target.value.split(" - ")[0])}
              >
                <ComboBoxItem text="1 - Admin" />
                <ComboBoxItem text="2 - User" />
                <ComboBoxItem text="3 - Viewer" />
              </ComboBox>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>First Name *</label>
              <Input 
                value={formData.first_name} 
                onInput={(e) => handleInputChange("first_name", e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Middle Name</label>
              <Input 
                value={formData.middle_name} 
                onInput={(e) => handleInputChange("middle_name", e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Last Name *</label>
              <Input 
                value={formData.last_name} 
                onInput={(e) => handleInputChange("last_name", e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Contact Number</label>
              <Input 
                value={formData.contact_number} 
                onInput={(e) => handleInputChange("contact_number", e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Emergency Contact Number</label>
              <Input 
                value={formData.emergency_contact_num} 
                onInput={(e) => handleInputChange("emergency_contact_num", e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Birthdate *</label>
              <Input 
                type="date" 
                value={formData.birthdate} 
                onInput={(e) => handleInputChange("birthdate", e.target.value)} 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>New Password (leave blank to keep current)</label>
              <Input 
                type="password" 
                value={formData.password} 
                onInput={(e) => handleInputChange("password", e.target.value)} 
              />
            </div>
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Button design="Emphasized" onClick={handleSubmit}>Update User</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditUser;