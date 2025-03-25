import React, { useEffect, useState } from "react";
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
import EditUser from "./pages/EditUser.js";
import DeleteUser from "./pages/DeleteUser.js";

const isLocal = window.location.hostname === "localhost";

const App = () => {
  const [userRole, setUserRole] = useState(isLocal ? "1" : localStorage.getItem("userRole"));
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const newRole = localStorage.getItem("userRole");
      if (newRole !== userRole) {
        setUserRole(newRole);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userRole]);

  // Initial auth check
  useEffect(() => {
    if (!isLocal) {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
    setIsAuthChecked(true);
  }, [isLocal]);

  const isAuthenticated = isLocal || Boolean(userRole);

  if (!isAuthChecked) {
    return <div className="loading-screen">Loading authentication...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes (only accessible when not authenticated) */}
        {!isLocal && (
          <>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage setUserRole={setUserRole} />} 
            />
            <Route 
              path="/sso-login" 
              element={isAuthenticated ? <Navigate to="/" replace /> : <SSOLogin setUserRole={setUserRole} />} 
            />
          </>
        )}

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <OverviewPage /> : <Navigate to="/login" replace />} 
        />
        
        {/* Admin & Staff Routes (Roles 1 & 2) */}
        <Route 
          path="/create-mass" 
          element={isAuthenticated && ["1", "2"].includes(userRole) ? 
            <CreateRecordMass /> : 
            <Navigate to="/" replace />} 
        />
        <Route 
          path="/create-manual" 
          element={isAuthenticated && ["1", "2"].includes(userRole) ? 
            <CreateRecordManual /> : 
            <Navigate to="/" replace />} 
        />
        <Route 
          path="/monitor-emergency" 
          element={isAuthenticated && ["1", "2"].includes(userRole) ? 
            <MonitorEmergency /> : 
            <Navigate to="/" replace />} 
        />
        <Route 
          path="/generate-activation-code" 
          element={isAuthenticated && ["1", "2"].includes(userRole) ? 
            <GenerateActivationCode /> : 
            <Navigate to="/" replace />} 
        />

        {/* Admin Only Routes (Role 1) */}
        <Route 
          path="/manage-users" 
          element={isAuthenticated && userRole === "1" ? 
            <ManageUsers /> : 
            <Navigate to="/" replace />} 
        />
        <Route 
          path="/edit-user" 
          element={isAuthenticated && userRole === "1" ? 
            <EditUser /> : 
            <Navigate to="/" replace />} 
        />
        <Route 
          path="/delete-user" 
          element={isAuthenticated && userRole === "1" ? 
            <DeleteUser /> : 
            <Navigate to="/" replace />} 
        />

        {/* Viewers+ Routes (Roles 1, 2, 3) */}
        <Route 
          path="/view-records" 
          element={isAuthenticated && ["1", "2", "3"].includes(userRole) ? 
            <ViewRecords /> : 
            <Navigate to="/" replace />} 
        />

        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;