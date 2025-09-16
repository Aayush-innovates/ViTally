import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) return <div/>;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

export default GuestRoute;

