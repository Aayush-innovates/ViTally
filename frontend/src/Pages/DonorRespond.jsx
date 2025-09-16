import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";

const DonorRespond = () => {
  const { requestId } = useParams();

  const onRespond = (decision) => {
    // Persist to localStorage to simulate backend callback
    const payload = { requestId, decision, at: new Date().toISOString() };
    localStorage.setItem('donor_response', JSON.stringify(payload));
    alert(`Response submitted: ${decision.toUpperCase()}. You may close this page.`);
  };

  const disabled = useMemo(() => !requestId, [requestId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 10px 30px rgba(2,8,23,0.08)', width: 460 }}>
        <h2 style={{ marginTop: 0 }}>Blood Donation Request</h2>
        <p>You've been matched as a potential donor. Please respond to the hospital's request.</p>
        <p style={{ color: '#64748b' }}>Request ID: <strong>{requestId}</strong></p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="submit-btn" disabled={disabled} onClick={() => onRespond('accepted')}>Accept</button>
          <button className="submit-btn" disabled={disabled} style={{ background: '#ef4444' }} onClick={() => onRespond('declined')}>Decline</button>
        </div>
        <p style={{ marginTop: 16, color: '#64748b' }}>Have an account? <Link to="/login">Log in</Link> to manage your profile.</p>
      </div>
    </div>
  );
};

export default DonorRespond; 