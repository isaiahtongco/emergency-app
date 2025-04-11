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
import ActivateClient  from "./pages/ActivateClient.js"; // Import the new component  

const isLocal = window.location.hostname === "localhost";

const App = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Set role with storage persistence
  const setUserRoleWithStorage = (role) => {
    localStorage.setItem("userRole", role);
    setUserRole(role);
  };

  // Sync auth across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userRole") {
        setUserRole(localStorage.getItem("userRole"));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Initial auth check
  useEffect(() => {
    setIsAuthChecked(true);
  }, []);

  const isAuthenticated = Boolean(userRole);

  // Enhanced role checking with route protection
  const ProtectedRoute = ({ requiredRoles, element }) => {
    const role = localStorage.getItem("userRole");
    
    if (!role) {
      return <Navigate to="/login" replace />;
    }
    
    if (!requiredRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
    
    return element;
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
        {/* Public Routes - Only accessible when NOT authenticated */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage setUserRole={setUserRoleWithStorage} />} 
        />
        <Route 
          path="/sso-login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <SSOLogin setUserRole={setUserRoleWithStorage} />} 
        />

        {/* Protected Routes with Role Requirements */}
        <Route 
          path="/" 
          element={<ProtectedRoute requiredRoles={["1", "2", "3", "9"]} element={<OverviewPage />} />} 
        />
        <Route 
          path="/overview" 
          element={<ProtectedRoute requiredRoles={["1", "2", "3", "9"]} element={<OverviewPage />} />} 
        />

        {/* Data Entry Routes (Roles 1, 9) */}
        <Route 
          path="/create-mass" 
          element={<ProtectedRoute requiredRoles={["1", "9"]} element={<CreateRecordMass />} />} 
        />
        <Route 
          path="/create-manual" 
          element={<ProtectedRoute requiredRoles={["1", "9"]} element={<CreateRecordManual />} />} 
        />

        {/* Monitoring Routes (Roles 1, 2, 9) */}
        <Route 
          path="/monitor-emergency" 
          element={<ProtectedRoute requiredRoles={["1", "2", "9"]} element={<MonitorEmergency />} />} 
        />

        {/* Admin Tools (Roles 1, 2, 9) */}
        <Route 
          path="/generate-activation-code" 
          element={<ProtectedRoute requiredRoles={["1", "2", "9"]} element={<GenerateActivationCode />} />} 
        />

        {/* User Management (Roles 1, 9) */}
        <Route 
          path="/manage-users" 
          element={<ProtectedRoute requiredRoles={["1", "9"]} element={<ManageUsers />} />} 
        />
        <Route 
          path="/edit-user" 
          element={<ProtectedRoute requiredRoles={["1", "9"]} element={<EditUser />} />} 
        />

        {/* Super Admin Only (Role 9) */}
        <Route 
          path="/delete-user" 
          element={<ProtectedRoute requiredRoles={["9"]} element={<DeleteUser />} />} 
        />

        {/* Super Admin Only (Role 9) */}
        <Route 
          path="/activate-client" 
          element={<ProtectedRoute requiredRoles={["1", "9"]} element={<ActivateClient />} />} 
        />

        {/* Viewers (Roles 1, 2, 3, 9) */}
        <Route 
          path="/view-records" 
          element={<ProtectedRoute requiredRoles={["1", "2", "3", "9"]} element={<ViewRecords />} />} 
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