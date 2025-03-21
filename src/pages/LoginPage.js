import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
const isLocal = window.location.hostname === "localhost"; // ✅ Detect local

const LoginPage = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
};

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    let captchaToken = null;

    if (!isLocal) {
      if (!executeRecaptcha) {
        setError("reCAPTCHA is not ready yet. Please try again.");
        return;
      }
  
      captchaToken = await executeRecaptcha("login");
      console.log("reCAPTCHA token:", captchaToken); // Debug log
  
      if (!captchaToken) {
        setError("reCAPTCHA verification failed. Please try again.");
        return;
      }
    }

    try {
      const response = await axios.post("https://icttestalarm.com:3000/api/login", {
        username,
        password,
        captcha: isLocal ? "bypass" : captchaToken, // ✅ Bypass reCAPTCHA locally
      });

      console.log("Login response:", response.data); // Debug log

      if (response.data.success) {
        localStorage.setItem("userRole", response.data.role);
        console.log("User role set in localStorage:", response.data.role); // Debug log
        navigate("/");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("❌ Login error:", err); // Debug log
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        {/* Hide reCAPTCHA when running locally */}
        {!isLocal && <p>reCAPTCHA Enabled</p>}

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={() => navigate("/sso-login")}>Login with Google</button>
    </div>
  );
};

export default LoginPage;