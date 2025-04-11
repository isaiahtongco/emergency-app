import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const SSOLogin = ({ setUserRole }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const decodedToken = jwtDecode(credentialResponse.credential);
      const email = decodedToken.email;

      const response = await axios.post(
        "https://icttestalarm.com:3000/api/sso-login-employee",
        { email }
      );

      if (response.data?.message === "SSO login successful") {
        const { role, email, user_id } = response.data.user;
        
        // Store all user data
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userId", user_id);
        
        // Update parent state
        setUserRole(role);
        
        // Navigate to overview
        navigate("/overview", { 
          replace: true,
          state: {
            role,
            email,
            userId: user_id
          }
        });
      }
    } catch (error) {
      console.error("SSO Error:", error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID_AUTH}>
        {isLoading ? (
          <div style={{ margin: '20px' }}>
            <p>Authenticating...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                color: 'red',
                marginBottom: '20px',
                padding: '10px',
                border: '1px solid red',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("Google authentication failed")}
              useOneTap
              theme="filled_blue"
              size="large"
            />
          </>
        )}
      </GoogleOAuthProvider>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    padding: "2rem",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    marginBottom: "1.5rem",
    color: "#333333",
  },
  error: {
    color: "#d32f2f",
    backgroundColor: "#fdecea",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb",
  },
  successMessage: {
    textAlign: "center",
    marginTop: "1rem",
  },
  navigateButton: {
    padding: "0.75rem",
    backgroundColor: "#007aff",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "1rem",
  },
};

export default SSOLogin;