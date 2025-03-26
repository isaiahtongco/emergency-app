import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
const isLocal = window.location.hostname === "localhost"; // ✅ Detect local

const LoginPage = (props) => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <LoginForm {...props} />
    </GoogleReCaptchaProvider>
  );
};

const LoginForm = ({ setUserRole }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let captchaToken = null;

      if (!isLocal) {
        if (!executeRecaptcha) {
          throw new Error("reCAPTCHA not ready");
        }
        captchaToken = await executeRecaptcha("login");
        if (!captchaToken) {
          throw new Error("reCAPTCHA verification failed");
        }
      }

      const response = await axios.post(
        "https://icttestalarm.com:3000/api/login",
        {
          username,
          password,
          captcha: isLocal ? "bypass" : captchaToken,
        }
      );

      if (response.data.success) {
        localStorage.setItem("userRole", response.data.role);
        setUserRole(response.data.role); // This will now work
        navigate("/", { replace: true });
        window.location.reload();
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* 🔷 Banner Image (Change the path as needed) */}
      <img src="/banner.jpg" alt="App Banner" style={styles.banner} />

      {/* 🔒 Login Card */}
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome to STAR Emergency App</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            style={styles.input}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            style={styles.input}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLocal && <p style={styles.recaptcha}>🔐 Protected by Google reCAPTCHA</p>}

          <button type="submit" style={styles.loginButton}>Login</button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <hr style={{ width: "100%", margin: "1rem 0" }} />

        <button onClick={() => navigate("/sso-login")} style={styles.googleButton}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

// 🎨 Styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f5",
    padding: "2rem",
  },
  banner: {
    width: "100%",
    maxWidth: "500px",
    marginBottom: "2rem",
    borderRadius: "10px",
    objectFit: "cover",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "1.5rem",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  loginButton: {
    padding: "0.75rem",
    backgroundColor: "#007aff",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  googleButton: {
    padding: "0.75rem",
    backgroundColor: "#DB4437",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  recaptcha: {
    fontSize: "0.85rem",
    color: "#888",
    marginTop: "-0.5rem",
  },
  error: {
    color: "red",
    marginTop: "1rem",
  },
};

export default LoginPage;
