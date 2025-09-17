import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiDroplet, FiUser, FiCalendar, FiAlertCircle, FiCheck, FiX } from "react-icons/fi";

const DonorRespond = () => {
  const { requestId } = useParams();
  const [hasResponded, setHasResponded] = useState(false);
  const [response, setResponse] = useState(null);

  // Mock request details - in real app, fetch from backend using requestId
  const requestDetails = useMemo(() => ({
    patientName: "John Doe",
    bloodGroup: "O+",
    units: 2,
    priority: "urgent",
    neededOn: "2024-01-15",
    hospitalName: "City General Hospital",
    doctorName: "Dr. Smith"
  }), []);

  useEffect(() => {
    // Check if already responded
    const existingResponse = localStorage.getItem(`donor_response_${requestId}`);
    if (existingResponse) {
      const parsed = JSON.parse(existingResponse);
      setResponse(parsed.decision);
      setHasResponded(true);
    }
  }, [requestId]);

  const onRespond = (decision) => {
    const payload = { 
      requestId, 
      decision, 
      at: new Date().toISOString(),
      requestDetails
    };
    
    // Store individual response
    localStorage.setItem(`donor_response_${requestId}`, JSON.stringify(payload));
    // Also store in global key for dashboard listening
    localStorage.setItem('donor_response', JSON.stringify(payload));
    
    setResponse(decision);
    setHasResponded(true);
  };

  const disabled = useMemo(() => !requestId, [requestId]);

  if (hasResponded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,8,23,0.08)', width: 460, textAlign: 'center' }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: 32, 
            background: response === 'accepted' ? '#16a34a' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            {response === 'accepted' ? <FiCheck size={32} color="white" /> : <FiX size={32} color="white" />}
          </div>
          <h2 style={{ marginTop: 0, color: response === 'accepted' ? '#16a34a' : '#ef4444' }}>
            {response === 'accepted' ? 'Request Accepted!' : 'Request Declined'}
          </h2>
          <p>Thank you for your response. The hospital has been notified.</p>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Request ID: <strong>{requestId}</strong>
          </p>
          <Link to="/login" style={{ 
            display: 'inline-block', 
            marginTop: 16, 
            padding: '12px 24px', 
            background: '#2563eb', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: 8 
          }}>
            Log in to manage your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 16 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,8,23,0.08)', width: 460, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <FiDroplet size={24} color="#f59e0b" />
          </div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Blood Donation Request</h2>
          <p style={{ color: '#64748b', margin: 0 }}>You've been matched as a potential donor</p>
        </div>

        {/* Request Details */}
        <div style={{ 
          background: '#f8fafc', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 24,
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Request Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUser size={16} color="#64748b" />
              <span style={{ fontSize: 14 }}><strong>Patient:</strong> {requestDetails.patientName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiDroplet size={16} color="#64748b" />
              <span style={{ fontSize: 14 }}><strong>Blood Group:</strong> {requestDetails.bloodGroup}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAlertCircle size={16} color="#64748b" />
              <span style={{ fontSize: 14 }}><strong>Priority:</strong> {requestDetails.priority.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCalendar size={16} color="#64748b" />
              <span style={{ fontSize: 14 }}><strong>Needed by:</strong> {requestDetails.neededOn}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUser size={16} color="#64748b" />
              <span style={{ fontSize: 14 }}><strong>Hospital:</strong> {requestDetails.hospitalName}</span>
            </div>
          </div>
        </div>

        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
          Request ID: <strong>{requestId}</strong>
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button 
            className="submit-btn" 
            disabled={disabled} 
            onClick={() => onRespond('accepted')}
            style={{ flex: 1, background: '#16a34a' }}
          >
            Accept Request
          </button>
          <button 
            className="submit-btn" 
            disabled={disabled} 
            onClick={() => onRespond('declined')}
            style={{ flex: 1, background: '#ef4444' }}
          >
            Decline Request
          </button>
        </div>
        
        <p style={{ marginTop: 16, color: '#64748b', fontSize: 14, textAlign: 'center' }}>
          Have an account? <Link to="/login" style={{ color: '#2563eb' }}>Log in</Link> to manage your profile.
        </p>
      </div>
    </div>
  );
};

export default DonorRespond;
