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
  FiUsers,
} from "react-icons/fi";
import "./Dashboard.css";
import profileService from "../services/profileService";
import ProgressBar from "../Components/ProgressBar";
import bloodRequestRoutes from './routes/bloodRequests.js';

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
    unitsNeeded: 1, // Changed from 'units' to 'unitsNeeded'
    urgency: 'normal', // Changed from 'priority' to 'urgency'
    neededOn: ''
  });
  const [currentRequestId, setCurrentRequestId] = useState(null);

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

    try {
      console.log('Fetching compatible donors from backend proxy...');
      
      const response = await fetch('https://vitally-mcwz.onrender.com/api/donors', {
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
      console.error('Failed to fetch compatible donors:', err);
      throw err; // Re-throw to be handled by calling function
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
      const latitude = 19.0760;
      const longitude = 72.8777;
      
      // Call the blood compatibility API through backend proxy
      const compatibleDonors = await getCompatibleDonors(form.bloodGroup, latitude, longitude);
      
      // Step 2 -> Step 3: Create blood request and send SMS
      setCurrentStepIndex(3);
      
      const requestData = {
        patientName: form.patientName,
        bloodGroup: form.bloodGroup,
        unitsNeeded: form.unitsNeeded,
        urgency: form.urgency,
        donors: compatibleDonors
      };

      const response = await fetch('https://vitally-mcwz.onrender.com/api/blood-requests/create-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to create blood request');
      }

      const result = await response.json();
      const bloodRequest = result.data;

      // Create donor links with real data from the blood request
      const links = bloodRequest.donorResponses.map((donorResponse) => ({
        id: donorResponse.donorId,
        link: donorResponse.uniqueLink,
        donorName: donorResponse.donorName,
        bloodGroup: donorResponse.bloodGroup,
        compatibilityScore: donorResponse.compatibilityScore,
        distanceKm: donorResponse.distanceKm,
        donorId: donorResponse.donorId,
        status: donorResponse.status,
        smsStatus: donorResponse.smsStatus,
        smsSid: donorResponse.smsSid
      }));
      
      setDonorLinks(links);
      setCurrentRequestId(bloodRequest.requestId);

      // Step 3 -> Step 4: Waiting for responses
      setCurrentStepIndex(4);

      // Start polling for responses
      startPollingForResponses(bloodRequest.requestId);

    } catch (err) {
      console.error('Failed to get compatible donors:', err);
      setError('Unable to fetch compatible donors. Please try again.');
    }
  };

  // Add polling function to check for donor responses
  const startPollingForResponses = (requestId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`https://vitally-mcwz.onrender.com/api/blood-requests/status/${requestId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          const updatedLinks = result.data.donorResponses.map((donorResponse) => ({
            id: donorResponse.donorId,
            link: donorResponse.uniqueLink,
            donorName: donorResponse.donorName,
            bloodGroup: donorResponse.bloodGroup,
            compatibilityScore: donorResponse.compatibilityScore,
            distanceKm: donorResponse.distanceKm,
            donorId: donorResponse.donorId,
            status: donorResponse.status,
            smsStatus: donorResponse.smsStatus
          }));

          setDonorLinks(updatedLinks);

          // Check if any donor accepted
          const acceptedDonor = updatedLinks.find(link => link.status === 'accepted');
          if (acceptedDonor) {
            setCurrentStepIndex(5); // Move to fulfilled step
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling for responses:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000);
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

              {/* Update the form fields to match the backend expectations */}
              <div className="form-group">
                <div className="input-with-icon">
                  <FiDroplet className="input-icon" />
                  <select className="form-input" name="bloodGroup" value={form.bloodGroup} onChange={onFormChange}>
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
              <div className="form-group">
                <div className="input-with-icon">
                  <FiUsers className="input-icon" />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Units needed"
                    min="1"
                    name="unitsNeeded" // Changed from 'units' to 'unitsNeeded'
                    value={form.unitsNeeded} // Changed from 'units' to 'unitsNeeded'
                    onChange={onFormChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-with-icon">
                  <FiAlertCircle className="input-icon" />
                  <select className="form-input" name="urgency" value={form.urgency} onChange={onFormChange}> {/* Changed from 'priority' to 'urgency' */}
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
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
              <p>SMS notifications sent to donors. Track their responses below:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {donorLinks.map((donor, index) => (
                  <div key={donor.id} style={{ 
                    padding: 16, 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 12,
                    background: donor.status === 'accepted' ? '#f0fdf4' : 
                       donor.status === 'declined' ? '#fef2f2' : '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>{donor.donorName}</span>
                        <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                          {donor.bloodGroup} • {donor.compatibilityScore.toFixed(1)}% match • {donor.distanceKm.toFixed(1)}km away
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>SMS Status:</span>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: 4, 
                            fontSize: 10,
                            background: donor.smsStatus === 'sent' ? '#16a34a' : 
                                       donor.smsStatus === 'failed' ? '#ef4444' : '#f59e0b',
                            color: 'white'
                          }}>
                            {donor.smsStatus === 'sent' ? '✓ SENT' : 
                             donor.smsStatus === 'failed' ? '✗ FAILED' : '⏳ PENDING'}
                          </span>
                          {donor.smsSid && (
                            <span style={{ fontSize: 10, color: '#9ca3af' }}>
                              ID: {donor.smsSid.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        fontSize: 12,
                        fontWeight: 600,
                        background: donor.status === 'accepted' ? '#16a34a' : 
                                   donor.status === 'declined' ? '#ef4444' : '#64748b',
                        color: 'white'
                      }}>
                        {donor.status === 'accepted' ? '✅ ACCEPTED' : 
                         donor.status === 'declined' ? '❌ DECLINED' : '⏳ PENDING'}
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
              
              <div style={{ marginTop: 16, padding: 12, background: '#f1f5f9', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 14 }}>
                    Waiting for donor responses... ({donorLinks.filter(d => d.status === 'pending').length} pending)
                  </span>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                    <span>✓ {donorLinks.filter(d => d.status === 'accepted').length} accepted</span>
                    <span>❌ {donorLinks.filter(d => d.status === 'declined').length} declined</span>
                    <span>⏳ {donorLinks.filter(d => d.status === 'pending').length} pending</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
