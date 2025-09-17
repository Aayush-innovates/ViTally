import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DonorResponse.css';

const DonorResponse = () => {
  const { requestId, token } = useParams();
  const [donorInfo, setDonorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonorInfo();
  }, [requestId, token]);

  const fetchDonorInfo = async () => {
    try {
      const res = await fetch(`https://vitally-mcwz.onrender.com/api/blood-requests/donor-info/${requestId}/${token}`);
      const result = await res.json();

      if (result.success) {
        setDonorInfo(result.data);
      } else {
        setError('Invalid or expired link');
      }
    } catch (err) {
      setError('Failed to load donor information');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (responseType) => {
    setSubmitting(true);
    try {
      const res = await fetch(`https://vitally-mcwz.onrender.com/api/blood-requests/donor-response/${requestId}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          response: responseType,
          donorInfo: donorInfo
        })
      });

      const result = await res.json();
      
      if (result.success) {
        setResponse(responseType);
      } else {
        setError('Failed to submit response');
      }
    } catch (err) {
      setError('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="donor-response-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donor-response-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (response) {
    return (
      <div className="donor-response-container">
        <div className="success-message">
          <h2>✅ Response Submitted!</h2>
          <p>
            {response === 'accepted' 
              ? `Thank you ${donorInfo.donorName}! Your willingness to help save ${donorInfo.patientName}'s life is truly appreciated. The hospital will contact you shortly with details.`
              : `Thank you ${donorInfo.donorName} for your response. We understand you cannot donate at this time.`
            }
          </p>
          <div className="patient-info">
            <h3>Request Details:</h3>
            <p><strong>Patient:</strong> {donorInfo.patientName}</p>
            <p><strong>Blood Type Needed:</strong> {donorInfo.bloodGroup}</p>
            <p><strong>Units Needed:</strong> {donorInfo.unitsNeeded}</p>
            <p><strong>Urgency:</strong> {donorInfo.urgency}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-response-container">
      <div className="donor-response-card">
        <div className="header">
          <h1>🩸 Blood Donation Request</h1>
          <div className="urgency-badge">{donorInfo.urgency} Priority</div>
        </div>

        <div className="patient-details">
          <h2>Patient Information</h2>
          <div className="detail-row">
            <span>Patient Name:</span>
            <span>{donorInfo.patientName}</span>
          </div>
          <div className="detail-row">
            <span>Blood Type Needed:</span>
            <span>{donorInfo.bloodGroup}</span>
          </div>
          <div className="detail-row">
            <span>Units Needed:</span>
            <span>{donorInfo.unitsNeeded}</span>
          </div>
        </div>

        <div className="donor-match">
          <h2>Your Match Details</h2>
          <div className="detail-row">
            <span>Your Name:</span>
            <span>{donorInfo.donorName}</span>
          </div>
          <div className="detail-row">
            <span>Your Blood Type:</span>
            <span>{donorInfo.donorBloodGroup}</span>
          </div>
          <div className="detail-row">
            <span>Compatibility Score:</span>
            <span>{donorInfo.compatibilityScore.toFixed(1)}%</span>
          </div>
          <div className="detail-row">
            <span>Distance:</span>
            <span>{donorInfo.distanceKm.toFixed(1)} km</span>
          </div>
        </div>

        <div className="action-section">
          <h2>Can you help save a life?</h2>
          <p>Every donation can save up to 3 lives. Your contribution matters!</p>
          
          <div className="action-buttons">
            <button 
              className="accept-btn"
              onClick={() => handleResponse('accepted')}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : '✅ Yes, I can donate'}
            </button>
            <button 
              className="decline-btn"
              onClick={() => handleResponse('declined')}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : '❌ Sorry, I cannot donate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorResponse; 