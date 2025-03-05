import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.js";
import SSOLogin from "./pages/SSOLogin.js"; // Import SSOLogin component
import OverviewPage from "./pages/OverviewPage.js";
import CreateRecordMass from "./pages/CreateRecordMass.js";
import CreateRecordManual from "./pages/CreateRecordManual.js";
import ViewRecords from "./pages/ViewRecords.js";
import MonitorEmergency from "./pages/MonitorEmergency.js";
import ManageUsers from "./pages/ManageUsers.js";
import GenerateActivationCode from "./pages/GenerateActivationCode.js";

const App = () => {
  const userRole = localStorage.getItem("userRole"); // Get user role from localStorage

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sso-login" element={<SSOLogin />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={userRole ? <OverviewPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/create-mass"
          element={userRole === "1" || userRole === "2" ? <CreateRecordMass /> : <Navigate to="/login" />}
        />
        <Route
          path="/create-manual"
          element={userRole === "1" || userRole === "2" ? <CreateRecordManual /> : <Navigate to="/login" />}
        />
        <Route
          path="/view-records"
          element={userRole === "1" || userRole === "2" || userRole === "3" ? <ViewRecords /> : <Navigate to="/login" />}
        />
        <Route
          path="/monitor-emergency"
          element={userRole === "1" || userRole === "2" ? <MonitorEmergency /> : <Navigate to="/login" />}
        />
        <Route
          path="/manage-users"
          element={userRole === "1" ? <ManageUsers /> : <Navigate to="/login" />}
        />
        <Route
          path="/generate-activation-code"
          element={userRole === "1" || userRole === "2" ? <GenerateActivationCode /> : <Navigate to="/login" />}
        />

        {/* Redirect all unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;