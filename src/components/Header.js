import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear all stored user data
    navigate("/login", { replace: true }); // Redirect to the login page
  };

  return (
    <ui5-bar design="Header" style={{ width: "100%", padding: "0 1rem" }}>
      <h2 slot="startContent" style={{ margin: 0, color: "white" }}>STAR Emergency App</h2>
      <ui5-button
        slot="endContent"
        design="Transparent"
        icon="log"
        tooltip="Logout"
        onClick={handleLogout}
      ></ui5-button>
    </ui5-bar>
  );
};

export default Header;
