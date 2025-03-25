import React, { useState } from "react";
import {
  Input,
  Button,
  MessageStrip,
  Dialog
} from "@ui5/webcomponents-react";

const DeleteUser = () => {
  const [username, setUsername] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
    if (!username) {
      showMessage("Please enter a username to search", "Critical");
      return;
    }

    try {
      const response = await fetch(`https://icttestalarm.com:3000/api/manage-users/get?username=${username}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "User not found");
      }

      setUserDetails(result.user);
      showMessage("User found. You can now delete this account.", "Positive");

    } catch (error) {
      showMessage(error.message, "Negative");
      setUserDetails(null);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch('https://icttestalarm.com:3000/api/manage-users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      showMessage("User deleted successfully", "Positive");
      setUsername("");
      setUserDetails(null);
      setShowConfirmDialog(false);

    } catch (error) {
      showMessage(error.message, "Negative");
      setShowConfirmDialog(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ backgroundColor: "red", color: "white", textAlign: "center", padding: "1rem", marginBottom: "2rem" }}>
        Delete User (Admin Only)
      </h2>

      {messageStrip.show && (
        <MessageStrip design={messageStrip.type} hideCloseButton style={{ marginBottom: "1rem" }}>
          {messageStrip.message}
        </MessageStrip>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <Input
          placeholder="Enter username to delete"
          value={username}
          onInput={(e) => setUsername(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button design="Emphasized" onClick={handleSearch}>Search</Button>
      </div>

      {userDetails && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "4px" }}>
          <h3>User Details</h3>
          <p><strong>Username:</strong> {userDetails.username}</p>
          <p><strong>Name:</strong> {userDetails.first_name} {userDetails.last_name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Role:</strong> {userDetails.role_id === "1" ? "Admin" : userDetails.role_id === "2" ? "User" : "Viewer"}</p>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Button design="Negative" onClick={() => setShowConfirmDialog(true)}>Delete User</Button>
          </div>
        </div>
      )}

      <Dialog
        open={showConfirmDialog}
        headerText="Confirm Deletion"
        onAfterClose={() => setShowConfirmDialog(false)}
      >
        <div style={{ padding: "1rem" }}>
          <p>Are you sure you want to permanently delete user <strong>{username}</strong>?</p>
          <p>This action cannot be undone.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <Button design="Transparent" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button design="Negative" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteUser;