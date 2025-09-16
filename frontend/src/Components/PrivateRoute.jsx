import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedTypes }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && user && !allowedTypes.includes(user.userType)) {
    return <Navigate to="/login" replace />;
  }

  // If user exists and is authenticated, render the children
  return children;
};

export default PrivateRoute;
