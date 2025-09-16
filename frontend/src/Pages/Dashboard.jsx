import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  FiSmile,
  FiLogOut,
  FiFileText,
  FiHome,
  FiUser,
  FiDroplet,
  FiAlertCircle,
  FiCalendar,
  FiBriefcase,
  FiPhoneOutgoing,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser as FiProfile,
} from "react-icons/fi";
import "./Dashboard.css";
import profileService from "../services/profileService";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching doctor profile...");
        const profile = await profileService.getDoctorProfile();
        console.log("Profile data received:", profile);
        setDoctorProfile(profile);
      } catch (err) {
        console.error("Error in fetchDoctorProfile:", err);
        setError(err.message || "Failed to load profile");

        // If unauthorized, redirect to login
        if (err.message.includes("401") || err.message.includes("token")) {
          console.log("Authentication error, redirecting to login...");
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dash-page">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <FiSmile className="dash-icon" />
          <span>ViTally</span>
        </div>
        <button className="dash-logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </aside>

      <main className="dash-main">
        {/* Doctor Profile Section */}
        <div className="dash-card profile-card">
          {loading ? (
            <div className="loading">Loading profile...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : doctorProfile ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  <FiUser size={48} />
                </div>
                <div className="profile-info">
                  <h2>Dr. {doctorProfile.name}</h2>
                  <p className="profile-email">
                    <FiMail /> {doctorProfile.email}
                  </p>
                  <p className="profile-specialty">
                    <FiBriefcase />{" "}
                    {doctorProfile.userType === "doctor" ? "Doctor" : "User"}
                  </p>
                </div>
              </div>
              <div className="profile-details">
                {doctorProfile.phone && (
                  <div className="detail-item">
                    <FiPhoneOutgoing />
                    <span>{doctorProfile.phone}</span>
                  </div>
                )}
                {doctorProfile.hospitalName && (
                  <div className="detail-item">
                    <FiMapPin />
                    <span>{doctorProfile.hospitalName}</span>
                  </div>
                )}
                {doctorProfile.licenseNumber && (
                  <div className="detail-item">
                    <FiBriefcase />
                    <span>License: {doctorProfile.licenseNumber}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="error">No profile data available</div>
          )}
        </div>

        <section className="dash-grid">
          <div className="dash-card request-form">
            <h2>New Blood Request</h2>
            <form className="dash-form">
              <div className="form-group">
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="Patient Name"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <FiDroplet className="input-icon" />
                  <select className="form-input">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <input
                    type="number"
                    placeholder="Units Required"
                    className="form-input"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FiAlertCircle className="input-icon" />
                    <select className="form-input">
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <FiCalendar className="input-icon" />
                  <input type="date" className="form-input" />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Submit Request
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
