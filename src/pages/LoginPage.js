import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
const REACT_APP_USER_CAPTCHA_API_KEY = process.env.REACT_APP_USER_CAPTCHA_API_KEY;
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const captchaRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Verify CAPTCHA
    const captchaValue = captchaRef.current.getValue();
    if (!captchaValue) {
      setError("Please verify that you are not a robot.");
      return;
    }

    try {
      const response = await axios.post("https://icttestalarm.com:3000/api/login", {
        username,
        password,
        captcha: captchaValue, // Send CAPTCHA value to the server for verification
      });

      if (response.data.success) {
        localStorage.setItem("userRole", response.data.role); // Save user role in localStorage
        navigate("/"); // Redirect to the dashboard
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={REACT_APP_USER_CAPTCHA_API_KEY} // Replace with your reCAPTCHA site key
          onChange={() => setCaptchaVerified(true)}
        />
        <button type="submit" disabled={!captchaVerified}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={() => navigate("/sso-login")}>Login with Google</button>
    </div>
  );
};

export default LoginPage;