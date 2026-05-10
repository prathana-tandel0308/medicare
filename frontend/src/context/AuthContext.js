import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base API URL for local + production
  const API_BASE =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : 'https://medicare-3isy.onrender.com/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    // Set axios global base URL
    axios.defaults.baseURL = API_BASE;

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, [API_BASE]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    axios.defaults.baseURL = API_BASE;
    axios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${token}`;

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization'];

    setUser(null);

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
