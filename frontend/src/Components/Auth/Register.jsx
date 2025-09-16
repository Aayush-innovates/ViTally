import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiSmile } from "react-icons/fi";
import { FaHospital, FaNotesMedical } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    bloodGroup: "",
    userType: "donor",
    hospitalName: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [geo, setGeo] = useState(null);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleUserType = (type) => {
    setFormData({
      ...formData,
      userType: type,
      ...(type !== 'doctor' && { hospitalName: '', licenseNumber: '' })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: formData.userType,
        bloodGroup: formData.bloodGroup,
        ...(formData.userType === 'donor' && geo ? { location: geo } : {}),
        ...(formData.userType === 'doctor' && {
          hospitalName: formData.hospitalName,
          licenseNumber: formData.licenseNumber
        })
      };

      const result = await register(userData);
      if (result.success) {
        navigate('/login', { state: { registered: true } });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    }
    
    setLoading(false);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Capture geolocation for donors
  const requestGeo = async () => {
    if (formData.userType !== 'donor' || !navigator.geolocation) return;
    const coords = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
    setGeo(coords);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><FiSmile /></span>
          <h1>ViTally</h1>
        </div>
        <div className={styles.illustration}>
          <div className={styles.illustrationContent}>
            <h2>Welcome to ViTally</h2>
            <p>Your trusted blood donation platform connecting donors with those in need.</p>
          </div>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h2>Create Account</h2>
            <p>Please enter your details to sign up</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <div className={styles.toggleButtons}>
            <button
              type="button"
              className={`${styles.toggleButton} ${formData.userType === 'donor' ? styles.active : ''}`}
              onClick={() => toggleUserType('donor')}
            >
              <span className={styles.toggleIcon}><FiUser /></span>
              I'm a Donor
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${formData.userType === 'doctor' ? styles.active : ''}`}
              onClick={() => toggleUserType('doctor')}
            >
              <span className={styles.toggleIcon}><FaNotesMedical /></span>
              I'm a Doctor
            </button>
          </div>

          <form onSubmit={(e) => { requestGeo(); handleSubmit(e); }} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <div className={styles.inputWithIcon}>
                <FiUser className={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
              <label>Phone Number</label>
              <div className={styles.inputWithIcon}>
                <FiPhone className={styles.inputIcon} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Blood Group</label>
              <div className={styles.selectWrapper}>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your blood group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.userType === 'doctor' && (
              <>
                <div className={styles.formGroup}>
                  <label>Hospital Name</label>
                  <div className={styles.inputWithIcon}>
                    <FaHospital className={styles.inputIcon} />
                    <input
                      type="text"
                      name="hospitalName"
                      placeholder="Enter hospital name"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Medical License Number</label>
                  <div className={styles.inputWithIcon}>
                    <FaNotesMedical className={styles.inputIcon} />
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="Enter license number"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.inputWithIcon}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
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

            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <div className={styles.inputWithIcon}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
                <button 
                  type="button" 
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className={styles.loginLink}>
              Already have an account?{' '}
              <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
