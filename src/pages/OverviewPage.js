import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@ui5/webcomponents-react";

const OverviewPage = () => {
  const navigate = useNavigate();

  const tileStyle = {
    width: "250px",
    height: "150px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`); // ✅ Debugging output
    navigate(path);
  };

  const titleStyle = {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  };

  const descriptionStyle = {
    fontSize: "1rem",
    color: "#666",
  };

  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", padding: "2rem" }}>
      {/* Tile for Mass Upload */}
      <Card
        style={tileStyle}
        onClick={() => handleNavigation("/create-mass")}
      >
        <div style={titleStyle}>Mass Upload</div>
        <div style={descriptionStyle}>Upload multiple records at once.</div>
      </Card>

      {/* Tile for Manual Input */}
      <Card
        style={tileStyle}
        onClick={() => handleNavigation("/create-manual")}
      >
        <div style={titleStyle}>Manual Input</div>
        <div style={descriptionStyle}>Create a record manually.</div>
      </Card>

      {/* Tile for View Records */}
      <Card
        style={tileStyle}
        onClick={() => handleNavigation("/view-records")}
      >
        <div style={titleStyle}>View Records</div>
        <div style={descriptionStyle}>View all existing records.</div>
      </Card>

      {/* Tile for Monitor Emergency */}
      <Card
        style={tileStyle}
        onClick={() => handleNavigation("/monitor-emergency")}
      >
        <div style={titleStyle}>Monitor Emergency</div>
        <div style={descriptionStyle}>Receive emergency responses from registered users.</div>
      </Card>
    </div>
  );
};

export default OverviewPage;
