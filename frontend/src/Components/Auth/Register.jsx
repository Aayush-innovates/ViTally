import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiSmile, FiUpload, FiShield, FiCheck } from "react-icons/fi";
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
    lastDonationDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [geo, setGeo] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharLoading, setAadharLoading] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

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

  const handleAadharUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAadharFile(file);
    setAadharLoading(true);
    setError("");

    const formData = new FormData();
    formData.append('file', file);

    // Try direct API call first, then proxy as fallback
    const apiEndpoints = [
      'https://aadhar-parser-api.onrender.com/api/v1/aadhaar/parse-image',
      'https://vitally-mcwz.onrender.com/api/aadhar/parse-image' // Use your backend as proxy
    ];

    for (let i = 0; i < apiEndpoints.length; i++) {
      try {
        console.log(`Trying API endpoint ${i + 1}:`, apiEndpoints[i]);
        
        const response = await fetch(apiEndpoints[i], {
          method: 'POST',
          body: formData,
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Aadhar API Response:', result);
        
        // If we get a successful response, consider age verified
        if (result && (result.data || result.name || result.success !== false)) {
          setAgeVerified(true);
          setAadharLoading(false);
          return; // Success, exit the function
        }

      } catch (err) {
        console.error(`API endpoint ${i + 1} failed:`, err);
        
        // If this is the last endpoint, show error
        if (i === apiEndpoints.length - 1) {
          if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
            setError("Network error: Unable to connect to Aadhar parser service. Please check your internet connection or try again later.");
          } else if (err.message.includes('HTTP error')) {
            setError("Server error: The Aadhar parser service is currently unavailable. Please try again later.");
          } else {
            setError("Failed to verify Aadhar card. Please ensure the image is clear and try again.");
          }
          setAadharLoading(false);
        }
        // Continue to next endpoint
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    // For donors, require age verification
    if (formData.userType === 'donor' && !ageVerified) {
      setError("Please verify your age by uploading your Aadhar card.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Format last donation date to 'Month Date Year' (e.g., 'January 5 2025') for donors
      let formattedLastDonationDate = '';
      if (formData.userType === 'donor' && formData.lastDonationDate) {
        const dateObj = new Date(formData.lastDonationDate);
        if (!isNaN(dateObj.getTime())) {
          const month = dateObj.toLocaleString('en-US', { month: 'long' });
          const day = dateObj.getDate();
          const year = dateObj.getFullYear();
          formattedLastDonationDate = `${month} ${day} ${year}`;
        }
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: formData.userType,
        bloodGroup: formData.bloodGroup,
        ...(formData.userType === 'donor' && formattedLastDonationDate ? { lastDonationDate: formattedLastDonationDate } : {}),
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

            {formData.userType === 'donor' && (
              <div className={styles.formGroup}>
                <label>Last Donation Date</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="date"
                    name="lastDonationDate"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                    placeholder="Select last donation date"
                  />
                </div>
              </div>
            )}

            {/* Aadhar Age Verification Section - Only for Donors */}
            {formData.userType === 'donor' && (
              <div className={styles.formGroup}>
                <label>Age Verification (Required for Donors)</label>
                <div style={{ 
                  padding: '1rem', 
                  background: '#161212', 
                  borderRadius: '0.5rem', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <FiShield size={16} color="#F87171" />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#E5E7EB' }}>Upload Aadhar for Age Verification</span>
                  </div>
                  
                  {!ageVerified ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAadharUpload}
                        style={{ display: 'none' }}
                        id="aadhar-upload"
                      />
                      <label
                        htmlFor="aadhar-upload"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          background: aadharLoading ? '#374151' : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                          color: 'white',
                          borderRadius: '0.5rem',
                          cursor: aadharLoading ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          width: 'fit-content',
                          transition: 'all 0.2s'
                        }}
                      >
                        {aadharLoading ? (
                          <>Verifying...</>
                        ) : (
                          <>
                            <FiUpload size={14} />
                            Upload Aadhar Card
                          </>
                        )}
                      </label>
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: '#9CA3AF' 
                      }}>
                        Upload your Aadhar card to verify your age eligibility for blood donation
                      </p>
                    </>
                  ) : (
                    <div style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(34, 197, 94, 0.12)', 
                      borderRadius: '0.5rem', 
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FiCheck size={20} color="#22c55e" />
                      <div>
                        <div style={{ fontWeight: 600, color: '#22c55e', fontSize: '0.875rem' }}>
                          Age Verified ✓
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                          Your age has been successfully verified
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
