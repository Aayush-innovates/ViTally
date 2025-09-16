import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user?.name || 'User'}</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>
        <h2>Dashboard</h2>
        <p>This is your {user?.userType} dashboard.</p>
        {/* Add dashboard content here */}
      </main>
    </div>
  );
};

export default Dashboard;
