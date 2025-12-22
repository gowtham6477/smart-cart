import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error message indicates token needs refresh
    const errorMessage = error.response?.data?.message || '';
    const needsTokenRefresh = errorMessage.includes('User ID not found in token') ||
                              errorMessage.includes('Please log out and log in again');

    // Handle 401 Unauthorized or token refresh needed
    if ((error.response?.status === 401 || needsTokenRefresh) && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Show a message if it's a token refresh issue
      if (needsTokenRefresh) {
        alert('Your session has expired. Please log in again.');
      }

      window.location.href = '/auth/login';

      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

