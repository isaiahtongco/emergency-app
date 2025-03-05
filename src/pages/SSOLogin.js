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
        localStorage.setItem("userRole", response.data.role); // Save user role in localStorage
        navigate("/dashboard"); // Redirect to dashboard
      }
    } catch (err) {
      console.error("SSO login failed:", err);
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google login failed")}
      />
    </GoogleOAuthProvider>
  );
};

export default SSOLogin;