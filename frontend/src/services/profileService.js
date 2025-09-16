import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get current user's profile
const getCurrentUserProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Invalid response format from server');
    
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Please log in to view your profile');
      }
      throw new Error(error.response.data?.error || 'Failed to fetch profile');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('Error setting up the request: ' + error.message);
    }
  }
};

export default {
  getDoctorProfile: getCurrentUserProfile,
  getCurrentUserProfile
};
