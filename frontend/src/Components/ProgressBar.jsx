import React from "react";

const ProgressBar = ({ steps, currentStepIndex = 0 }) => {
  return (
    <div className="dash-card" style={{ marginTop: 16 }}>
      <div className="progress-container" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                className={`progress-dot${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}`}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: isCompleted ? '#16a34a' : isActive ? '#2563eb' : '#cbd5e1',
                  boxShadow: isActive ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none'
                }}
              />
              <span style={{ color: isCompleted || isActive ? '#0f172a' : '#64748b', fontWeight: isActive ? 600 : 500 }}>{step}</span>
              {index !== steps.length - 1 && (
                <div style={{ width: 32, height: 2, background: index < currentStepIndex ? '#16a34a' : '#e2e8f0' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar; 