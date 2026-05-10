import axios from 'axios';

// Production + local development support
const API = axios.create({
  baseURL:
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : 'https://medicare-3isy.onrender.com/api',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
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

export default API;
