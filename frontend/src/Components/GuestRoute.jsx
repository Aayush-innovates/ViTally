import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { loading, user } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) return <div/>;
  if (token) {
    if (user?.userType === 'doctor') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/profile" replace />;
  }
  return children;
};

export default GuestRoute;

