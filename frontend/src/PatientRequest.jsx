import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientRequest.css';

const PatientRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    bloodGroup: '',
    unitsRequired: '',
    urgency: 'normal',
    hospitalName: '',
    hospitalContact: '',
    hospitalAddress: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Blood group options
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Urgency levels with icons
  const urgencyLevels = [
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      setError('Patient name is required');
      return false;
    }
    if (!formData.bloodGroup) {
      setError('Please select a blood group');
      return false;
    }
    if (!formData.unitsRequired || isNaN(formData.unitsRequired) || formData.unitsRequired < 1) {
      setError('Please enter a valid number of units');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/patient-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      // Navigate to success page or show success message
      navigate('/request-success');
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-container">
      <div className="request-header">
        <h1>Emergency Blood Request</h1>
        <p>Fill out the form below to submit a new request.</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              className="form-control"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient's full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="patientAge">Patient Age</label>
            <input
              type="number"
              id="patientAge"
              name="patientAge"
              className="form-control"
              value={formData.patientAge}
              onChange={handleChange}
              min="0"
              max="120"
              placeholder="Enter patient's age"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              className="form-control"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select blood group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* <div className="form-group">
            <label htmlFor="unitsRequired">Units Required (in ml)</label>
            <input
              type="number"
              id="unitsRequired"
              name="unitsRequired"
              className="form-control"
              value={formData.unitsRequired}
              onChange={handleChange}
              min="1"
              placeholder="Enter number of units"
              required
            />
          </div> */}

          <div className="form-group">
            <label htmlFor="urgency">Urgency</label>
            <select
              id="urgency"
              name="urgency"
              className="form-control"
              value={formData.urgency}
              onChange={handleChange}
            >
              {urgencyLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* <div className="form-group">
            <label htmlFor="hospitalName">Hospital Name</label>
            <input
              type="text"
              id="hospitalName"
              name="hospitalName"
              className="form-control"
              value={formData.hospitalName}
              onChange={handleChange}
              placeholder="Enter hospital name"
            />
          </div> */}
{/* 
          <div className="form-group">
            <label htmlFor="hospitalContact">Hospital Contact</label>
            <input
              type="tel"
              id="hospitalContact"
              name="hospitalContact"
              className="form-control"
              value={formData.hospitalContact}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </div> */}

          {/* <div className="form-group full-width">
            <label htmlFor="hospitalAddress">Hospital Address</label>
            <textarea
              id="hospitalAddress"
              name="hospitalAddress"
              className="form-control"
              value={formData.hospitalAddress}
              onChange={handleChange}
              placeholder="Enter hospital address"
              rows="3"
            />
          </div> */}
        </div>

        <button 
          type="submit" 
          className="btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default PatientRequest;
