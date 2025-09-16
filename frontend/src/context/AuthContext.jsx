import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data?.data) {
          setUser(data.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
      setLoading(false);
    };
    if (token) fetchUser(); else setLoading(false);
  }, []);

  const login = async (email, password, userType, location) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userType, location }),
        credentials: 'include'
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (userData) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
