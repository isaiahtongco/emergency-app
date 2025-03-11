import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.js";
import SSOLogin from "./pages/SSOLogin.js";
import OverviewPage from "./pages/OverviewPage.js";
import CreateRecordMass from "./pages/CreateRecordMass.js";
import CreateRecordManual from "./pages/CreateRecordManual.js";
import ViewRecords from "./pages/ViewRecords.js";
import MonitorEmergency from "./pages/MonitorEmergency.js";
import ManageUsers from "./pages/ManageUsers.js";
import GenerateActivationCode from "./pages/GenerateActivationCode.js";

const isLocal = window.location.hostname === "localhost"; // ✅ Detect local environment
const userRole = isLocal ? "1" : localStorage.getItem("userRole"); // ✅ Skip login locally
const isAuthenticated = isLocal || userRole !== null; // ✅ Skip auth locally

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {!isLocal && <Route path="/login" element={<LoginPage />} />}
        {!isLocal && <Route path="/sso-login" element={<SSOLogin />} />}

        {/* Protected Routes (Skip login if local) */}
        <Route path="/" element={isAuthenticated ? <OverviewPage /> : <Navigate to="/login" />} />
        <Route path="/create-mass" element={isAuthenticated && (userRole === "1" || userRole === "2") ? <CreateRecordMass /> : <Navigate to="/" />} />
        <Route path="/create-manual" element={isAuthenticated && (userRole === "1" || userRole === "2") ? <CreateRecordManual /> : <Navigate to="/" />} />
        <Route path="/view-records" element={isAuthenticated && (userRole === "1" || userRole === "2" || userRole === "3") ? <ViewRecords /> : <Navigate to="/" />} />
        <Route path="/monitor-emergency" element={isAuthenticated && (userRole === "1" || userRole === "2") ? <MonitorEmergency /> : <Navigate to="/" />} />
        <Route path="/manage-users" element={isAuthenticated && userRole === "1" ? <ManageUsers /> : <Navigate to="/" />} />
        <Route path="/generate-activation-code" element={isAuthenticated && (userRole === "1" || userRole === "2") ? <GenerateActivationCode /> : <Navigate to="/" />} />

        {/* Redirect all unknown routes */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
