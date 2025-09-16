import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";
import { FiMail, FiLock, FiEye, FiEyeOff, FiSmile } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('donor');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let coords = undefined;
      if (userType === 'donor' && navigator.geolocation) {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(undefined),
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });
      }

      const result = await login(formData.email, formData.password, userType, coords);
      if (result.success) {
        navigate(userType === 'doctor' ? '/patient-request' : '/dashboard');
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    }

    setLoading(false);
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.authContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><FiSmile /></span>
          <h1>ViTally</h1>
        </div>
        <div className={styles.illustration}>
          <div className={styles.illustrationContent}>
            <h2>Welcome Back</h2>
            <p>Log in to connect with donors and recipients in seconds.</p>
          </div>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h2>Sign In</h2>
            <p>Please enter your credentials to continue</p>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.toggleButtons}>
            <button
              type="button"
              className={`${styles.toggleButton} ${userType === 'donor' ? styles.active : ''}`}
              onClick={() => setUserType('donor')}
            >
              I'm a Donor
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${userType === 'doctor' ? styles.active : ''}`}
              onClick={() => setUserType('doctor')}
            >
              I'm a Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <div className={styles.inputWithIcon}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.passwordHeader}>
                <label>Password</label>
                <a href="/forgot-password" className={styles.forgotPassword}>
                  Forgot Password?
                </a>
              </div>
              <div className={styles.inputWithIcon}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className={styles.loginLink}>
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
