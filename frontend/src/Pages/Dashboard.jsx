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
  const [form, setForm] = useState({
    patientName: "",
    bloodGroup: "",
    unitsNeeded: "",
    urgency: "Medium",
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [donorLinks, setDonorLinks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState(null);

  const steps = [
    "Hospital Request",
    "AI Matching",
    "Donor Alerts",
    "Donor Response",
    "Hospital Dashboard",
    "Fulfilled",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching doctor profile...");
        const profile = await profileService.getCurrentUserProfile();
        console.log("Profile data received:", profile);
        setDoctorProfile(profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.bloodGroup || !form.unitsNeeded) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    simulateFlow();
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
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
        smsStatus: donorResponse.smsStatus
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
                ? { ...link, status: payload.response }
                : link
            ));
            
            // If accepted, move to fulfilled step
            if (payload.response === 'accepted') {
              setCurrentStepIndex(5);
            }
          }
        } catch (err) {
          console.error('Error processing donor response:', err);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [donorLinks]);

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-main">
          <div className="dash-card">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {/* Sidebar */}
      <div className="dash-sidebar">
        <div className="dash-brand">
          <FiDroplet className="dash-icon" />
          <span>ViTally</span>
        </div>
        <nav className="dash-nav">
          <Link to="/dashboard" className="dash-link">
            <FiHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/patient-request" className="dash-link">
            <FiFileText />
            <span>Patient Request</span>
          </Link>
        </nav>
        <button className="dash-logout" onClick={logout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="dash-main">
        <div className="dash-card">
          <h1>Blood Donation Request</h1>
          <p>Create a new blood donation request and find compatible donors</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group">
              <label>Patient Name *</label>
              <input
                type="text"
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                placeholder="Enter patient name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Blood Group *</label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                required
              >
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
            
            <div className="form-group">
              <label>Units Needed *</label>
              <input
                type="number"
                name="unitsNeeded"
                value={form.unitsNeeded}
                onChange={handleChange}
                placeholder="Enter units needed"
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Urgency Level</label>
              <select
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <button type="submit" className="submit-btn">
              Create Blood Request
            </button>
          </form>
        </div>

        {/* Progress Bar */}
        {currentStepIndex > 0 && (
          <div className="dash-card">
            <ProgressBar 
              steps={steps} 
              currentStepIndex={currentStepIndex} 
            />
          </div>
        )}

        {/* Donor Links */}
        {donorLinks.length > 0 && (
          <div className="dash-card">
            <h2>Matched Donors ({donorLinks.length} found)</h2>
            <p>Share these unique links with matched donors via SMS:</p>
            
            <div className="donors-container">
              {donorLinks.map((link, index) => (
                <div key={link.id} className="donor-card">
                  <div className="donor-info">
                    <h3>{link.donorName}</h3>
                    <p>{link.bloodGroup} • {link.compatibilityScore.toFixed(1)}% match • {link.distanceKm.toFixed(1)}km away</p>
                  </div>
                  <div className="donor-actions">
                    <button
                      onClick={() => copyToClipboard(link.link, index)}
                      className="copy-btn"
                    >
                      {copiedIndex === index ? <FiCheck /> : <FiCopy />}
                    </button>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-btn"
                    >
                      Open
                    </a>
                  </div>
                  <div className={`donor-status ${link.status}`}>
                    {link.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="waiting-indicator">
              Waiting for donor responses... ({donorLinks.filter(link => link.status === 'pending').length} pending)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

