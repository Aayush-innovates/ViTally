import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSmile, FiLogOut, FiUser, FiMail, FiPhone, FiDroplet, FiCalendar, FiMapPin } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import profileService from "../services/profileService";
import "./Dashboard.css";

const DonorProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await profileService.getCurrentUserProfile();
        setProfile(res);
      } catch (err) {
        setError(err.message || "Failed to load profile");
        if (err.message.includes("401") || err.message.includes("log in")) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [logout, navigate]);

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
        <div className="dash-card profile-card">
          {loading ? (
            <div className="loading">Loading profile...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : profile ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  <FiUser size={48} />
                </div>
                <div className="profile-info">
                  <h2>{profile.name}</h2>
                  <p className="profile-email">
                    <FiMail /> {profile.email}
                  </p>
                  <p className="profile-specialty">
                    <FiDroplet /> {profile.bloodGroup || "Unknown Blood Group"}
                  </p>
                </div>
              </div>
              <div className="profile-details">
                {profile.phone && (
                  <div className="detail-item">
                    <FiPhone />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.lastDonationDate && (
                  <div className="detail-item">
                    <FiCalendar />
                    <span>Last Donation: {profile.lastDonationDate}</span>
                  </div>
                )}
                {profile.location && profile.location.lat && profile.location.lng && (
                  <div className="detail-item">
                    <FiMapPin />
                    <span>
                      Location: {profile.location.lat.toFixed(3)}, {profile.location.lng.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="error">No profile data available</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DonorProfile; 