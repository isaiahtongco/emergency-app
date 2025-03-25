import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SSOLogin = (props) => {
  const navigate = useNavigate();
  const [renderGoogleLogin, setRenderGoogleLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSuccess = async (credentialResponse) => {
    try {
      setErrorMessage(""); // Clear previous errors
      const response = await axios.post(
        "https://icttestalarm.com:3000/api/sso-login",
        { token: credentialResponse.credential }
      );

      if (response.data?.success) {
        localStorage.setItem("userRole", response.data.role);
        props.setUserRole(response.data.role); // Update App.js state
        navigate("/", { replace: true });
      } else {
        setErrorMessage(response.data?.message || "Authentication failed");
      }
    } catch (err) {
      console.error("SSO error:", err);
      setErrorMessage(
        err.response?.data?.message || 
        "Login failed. Please try again."
      );
    }
  };

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem("userRole")) {
      navigate("/", { replace: true });
    }
    setRenderGoogleLogin(true);
  }, [navigate]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID_AUTH}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign in with Google</h2>
          {errorMessage && (
            <div style={styles.error}>
              {errorMessage}
            </div>
          )}
          {renderGoogleLogin && (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setErrorMessage("Google login failed")}
              useOneTap={true}
              auto_select={true}
              theme="filled_blue"
              size="large"
            />
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
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
};

export default SSOLogin;