import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: `${config.API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/300x200?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  // In production, image paths should be absolute or relative to the API
  if (!config.API_BASE_URL) return imagePath;
  return `${config.API_BASE_URL}${imagePath}`;
};

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 