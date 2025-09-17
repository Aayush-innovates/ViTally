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
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import "./Dashboard.css";
import profileService from "../services/profileService";
import ProgressBar from "../Components/ProgressBar";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Flow state
  const steps = [
    'Hospital Request',
    'AI Matching',
    'Donor Alerts',
    'Donor Response',
    'Hospital Dashboard',
    'Fulfilled'
  ];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [donorLinks, setDonorLinks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: '',
    units: 1,
    priority: 'normal',
    neededOn: ''
  });

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

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getCompatibleDonors = async (bloodGroup, latitude, longitude) => {
    const requestData = {
      blood_group: bloodGroup,
      latitude: latitude,
      longitude: longitude
    };

    // Try direct API call first, then your backend as proxy
    const apiEndpoints = [
      'https://blood-compatibility-model.onrender.com/get_donors',
      'https://vitally-mcwz.onrender.com/api/donors' // Use your backend as proxy
    ];

    for (let i = 0; i < apiEndpoints.length; i++) {
      try {
        console.log(`Trying donors API endpoint ${i + 1}:`, apiEndpoints[i]);
        
        const response = await fetch(apiEndpoints[i], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const donors = await response.json();
        console.log('Compatible donors received:', donors);
        return donors;
      } catch (err) {
        console.error(`Donors API endpoint ${i + 1} failed:`, err);
        
        // If this is the last endpoint, throw the error
        if (i === apiEndpoints.length - 1) {
          throw err;
        }
        // Continue to next endpoint
      }
    }
  };

  const simulateFlow = async () => {
    // Step 0 -> Step 1: Hospital Request submitted
    setCurrentStepIndex(1);
    
    // Step 1 -> Step 2: AI matching
    await new Promise(r => setTimeout(r, 800));
    setCurrentStepIndex(2);
    
    try {
      // Get doctor's location (using Mumbai as default for demo)
      const latitude = 19.0760; // You can get this from doctor's profile or geolocation
      const longitude = 72.8777;
      
      // Call the blood compatibility API
      const compatibleDonors = await getCompatibleDonors(form.bloodGroup, latitude, longitude);
      
      // Create donor links with real data
      const baseRequestId = Math.random().toString(36).slice(2, 10);
      const links = compatibleDonors.map((donor, i) => {
        const donorId = `${baseRequestId}_${donor.donor_id}`;
        return {
          id: donorId,
          link: `https://vi-tally.vercel.app/donor/respond/${donorId}`,
          donorName: donor.name,
          bloodGroup: donor.blood_group,
          compatibilityScore: donor.compatibility_score,
          distanceKm: donor.distance_km,
          donorId: donor.donor_id,
          status: 'pending'
        };
      });
      
      setDonorLinks(links);
    } catch (err) {
      console.error('Failed to get compatible donors:', err);
      
      // Fallback: Create mock donors if API fails
      console.log('Using fallback mock donors...');
      const baseRequestId = Math.random().toString(36).slice(2, 10);
      const mockDonors = [
        { name: "John Smith", blood_group: form.bloodGroup, compatibility_score: 95.5, distance_km: 1.2, donor_id: 1 },
        { name: "Sarah Johnson", blood_group: form.bloodGroup, compatibility_score: 88.3, distance_km: 2.5, donor_id: 2 },
        { name: "Mike Wilson", blood_group: form.bloodGroup, compatibility_score: 82.1, distance_km: 3.8, donor_id: 3 }
      ];
      
      const links = mockDonors.map((donor, i) => {
        const donorId = `${baseRequestId}_${donor.donor_id}`;
        return {
          id: donorId,
          link: `https://vi-tally.vercel.app/donor/respond/${donorId}`,
          donorName: donor.name,
          bloodGroup: donor.blood_group,
          compatibilityScore: donor.compatibility_score,
          distanceKm: donor.distance_km,
          donorId: donor.donor_id,
          status: 'pending'
        };
      });
      
      setDonorLinks(links);
      setError('Using demo data - API temporarily unavailable');
    }
  };

  useEffect(() => {
    // Listen for donor response in localStorage to simulate webhook/callback
    const onStorage = (e) => {
      if (e.key === 'donor_response') {
        try {
          const payload = JSON.parse(e.newValue || '{}');
          // Check if any of our donor links received a response
          const matchingLink = donorLinks.find(link => link.id === payload.requestId);
          if (matchingLink) {
            // Update the specific donor's status
            setDonorLinks(prev => prev.map(link => 
              link.id === payload.requestId 
                ? { ...link, status: payload.decision, respondedAt: payload.at }
                : link
            ));
            
            // If we have at least one acceptance, move to next step
            const hasAcceptance = donorLinks.some(link => link.status === 'accepted') || payload.decision === 'accepted';
            if (hasAcceptance && currentStepIndex === 2) {
              setCurrentStepIndex(3);
              // Simulate fulfillment after a short delay
              setTimeout(() => setCurrentStepIndex(4), 900);
              setTimeout(() => setCurrentStepIndex(5), 1800);
            }
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [donorLinks, currentStepIndex]);

  const onSubmitRequest = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.bloodGroup) {
      setError('Please select a blood group');
      return;
    }
    
    setError(null);
    setCurrentStepIndex(0);
    setDonorLinks([]);
    simulateFlow();
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

        {/* Progress Bar Section */}
        <ProgressBar steps={steps} currentStepIndex={currentStepIndex} />

        <section className="dash-grid">
          <div className="dash-card request-form">
            <h2>New Blood Request</h2>
            <form className="dash-form" onSubmit={onSubmitRequest}>
              <div className="form-group">
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="Patient Name"
                    className="form-input"
                    name="patientName"
                    value={form.patientName}
                    onChange={onFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <FiDroplet className="input-icon" />
                  <select className="form-input" name="bloodGroup" value={form.bloodGroup} onChange={onFormChange} required>
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
                    name="units"
                    value={form.units}
                    onChange={onFormChange}
                  />
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <FiAlertCircle className="input-icon" />
                    <select className="form-input" name="priority" value={form.priority} onChange={onFormChange}>
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
                  <input type="date" className="form-input" name="neededOn" value={form.neededOn} onChange={onFormChange} />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Submit Request
              </button>
            </form>
          </div>

          {donorLinks.length > 0 && (
            <div className="dash-card">
              <h3>Matched Donors ({donorLinks.length} found)</h3>
              <p>Share these unique links with matched donors via SMS:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {donorLinks.map((donor, index) => (
                  <div key={donor.id} style={{ 
                    padding: 12, 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 8,
                    background: donor.status === 'accepted' ? '#f0fdf4' : 
                               donor.status === 'declined' ? '#fef2f2' : '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{donor.donorName}</span>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {donor.bloodGroup} • {donor.compatibilityScore.toFixed(1)}% match • {donor.distanceKm.toFixed(1)}km away
                        </div>
                      </div>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        fontSize: 12,
                        background: donor.status === 'accepted' ? '#16a34a' : 
                                   donor.status === 'declined' ? '#ef4444' : '#64748b',
                        color: 'white'
                      }}>
                        {donor.status === 'accepted' ? 'ACCEPTED' : 
                         donor.status === 'declined' ? 'DECLINED' : 'PENDING'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input 
                        className="form-input" 
                        style={{ flex: 1, fontSize: 12 }} 
                        value={donor.link} 
                        readOnly 
                      />
                      <button 
                        className="submit-btn" 
                        style={{ padding: '8px 12px', fontSize: 12 }}
                        onClick={() => copyToClipboard(donor.link, index)}
                      >
                        {copiedIndex === index ? <FiCheck /> : <FiCopy />}
                      </button>
                      <a 
                        className="submit-btn" 
                        style={{ padding: '8px 12px', fontSize: 12 }}
                        href={donor.link} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </div>
                    {donor.respondedAt && (
                      <p style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                        Responded: {new Date(donor.respondedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>
                Waiting for donor responses... ({donorLinks.filter(d => d.status === 'pending').length} pending)
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
