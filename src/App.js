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

  // Enhanced auth sync with storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userRole") {
        const newRole = localStorage.getItem("userRole");
        if (newRole !== userRole) {
          setUserRole(newRole);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userRole]);

  // Initial auth check with error handling
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (!isLocal) {
          const role = localStorage.getItem("userRole");
          setUserRole(role);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, [isLocal]);

  const isAuthenticated = isLocal || Boolean(userRole);

  // Role checking utility function
  const hasAccess = (requiredRoles) => {
    return isAuthenticated && requiredRoles.includes(userRole);
  };

  if (!isAuthChecked) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.2rem"
      }}>
        Verifying authentication...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {!isLocal && (
          <>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/" replace state={{ from: "login" }} /> : 
                  <LoginPage setUserRole={setUserRole} />
              } 
            />
            <Route 
              path="/sso-login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/" replace state={{ from: "sso-login" }} /> : 
                  <SSOLogin setUserRole={setUserRole} />
              } 
            />
          </>
        )}

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <OverviewPage /> : 
              <Navigate to="/login" replace state={{ from: "root" }} />
          } 
        />

        {/* Data Entry Routes (Roles 1, 9) */}
        <Route 
          path="/create-mass" 
          element={
            hasAccess(["1", "9"]) ? 
              <CreateRecordMass /> : 
              <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/create-manual" 
          element={
            hasAccess(["1", "9"]) ? 
              <CreateRecordManual /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* Monitoring Routes (Roles 1, 2, 9) */}
        <Route 
          path="/monitor-emergency" 
          element={
            hasAccess(["1", "2", "9"]) ? 
              <MonitorEmergency /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* Admin Tools (Roles 1, 2, 9) */}
        <Route 
          path="/generate-activation-code" 
          element={
            hasAccess(["1", "2", "9"]) ? 
              <GenerateActivationCode /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* User Management (Roles 1, 9) */}
        <Route 
          path="/manage-users" 
          element={
            hasAccess(["1", "9"]) ? 
              <ManageUsers /> : 
              <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/edit-user" 
          element={
            hasAccess(["1", "9"]) ? 
              <EditUser /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* Super Admin Only (Role 9) */}
        <Route 
          path="/delete-user" 
          element={
            hasAccess(["9"]) ? 
              <DeleteUser /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* Viewers (Roles 1, 2, 3, 9) */}
        <Route 
          path="/view-records" 
          element={
            hasAccess(["1", "2", "3", "9"]) ? 
              <ViewRecords /> : 
              <Navigate to="/" replace />
          } 
        />

        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;