import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SSOLogin = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("https://icttestalarm.com:3000/api/sso-login", {
        token: credentialResponse.credential,
      });

      if (response.data.success) {
        localStorage.setItem("userRole", response.data.role);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("SSO login failed:", err);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID_AUTH}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign in with Google</h2>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error("Google login failed")}
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

// 🎨 Basic styling
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
  },
  title: {
    marginBottom: "1.5rem",
    color: "#333333",
  },
};

export default SSOLogin;
