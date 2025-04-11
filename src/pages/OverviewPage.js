import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@ui5/webcomponents-react";

const OverviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem("userRole");

  // Debug output
  console.log("Current role:", role);

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
    margin: "10px",
    backgroundColor: "#ffffff"
  };

  const titleStyle = {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#333"
  };

  const descriptionStyle = {
    fontSize: "1rem",
    color: "#666"
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Role to text mapping for display
  const roleNames = {
    "1": "Administrator",
    "2": "Manager",
    "3": "User",
    "9": "Super Admin"
  };

  // Tiles configuration - using numeric role IDs that match backend
  const tiles = [
    {
      roles: ["1", "9"], // Admin and Super Admin
      path: "/create-mass",
      title: "Mass Upload",
      description: "Upload multiple records at once",
      icon: "upload"
    },
    {
      roles: ["1", "9"], // Admin and Super Admin
      path: "/create-manual",
      title: "Manual Input",
      description: "Create a record manually",
      icon: "edit"
    },
    {
      roles: ["1", "2", "3", "9"], // All roles
      path: "/view-records",
      title: "View Records",
      description: "View all existing records",
      icon: "list"
    },
    {
      roles: ["1", "9"], // Admin and Super Admin
      path: "/manage-users",
      title: "Manage Users",
      description: "Add, edit or remove users",
      icon: "group"
    },
    {
      roles: ["1", "2", "9"], // Admin, Manager and Super Admin
      path: "/monitor-emergency",
      title: "Monitor Emergency",
      description: "Emergency response system",
      icon: "alert"
    }
  ];

  return (
    <div style={{ padding: "2rem" }}>
      {/* User Info Header */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "2rem",
        padding: "1rem",
        backgroundColor: "#f5f7fa",
        borderRadius: "8px"
      }}>
        <h2>Welcome to Emergency Monitoring System</h2>
        <p style={{ fontSize: "1.1rem" }}>
          Logged in as: <strong>{roleNames[role] || role}</strong>
        </p>
      </div>

      {/* Tiles Grid */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1.5rem"
      }}>
        {tiles
          .filter(tile => tile.roles.includes(role))
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
    </div>
  );
};

export default OverviewPage;