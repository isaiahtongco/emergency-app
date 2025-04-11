import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@ui5/webcomponents-react";

const OverviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem("userRole"); // Get role from state or localStorage

  if (!role) {
    console.error("Role is missing. Redirecting to login."); // Debugging
    navigate("/login", { replace: true });
    return null;
  }

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

  const tiles = [
    {
      role: "admin",
      path: "/create-mass",
      title: "Mass Upload",
      description: "Upload multiple records at once.",
    },
    {
      role: "admin",
      path: "/create-manual",
      title: "Manual Input",
      description: "Create a record manually.",
    },
    {
      role: "user",
      path: "/view-records",
      title: "View Records",
      description: "View all existing records.",
    },
    {
      role: "admin",
      path: "/manage-users",
      title: "Manage Users",
      description: "Add, Change, or Remove Employee",
    },
    {
      role: "user",
      path: "/monitor-emergency",
      title: "Monitor Emergency",
      description: "Receive emergency responses from registered users.",
    },
  ];

  return (
    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", padding: "2rem", marginTop: "15%" }}>
      {tiles
        .filter((tile) => tile.role === role) // Filter tiles based on role
        .map((tile, index) => (
          <Card
            key={index}
            style={tileStyle}
            onClick={() => handleNavigation(tile.path)}
          >
            <div style={titleStyle}>{tile.title}</div>
            <div style={descriptionStyle}>{tile.description}</div>
          </Card>
        ))}
    </div>
  );
};

export default OverviewPage;