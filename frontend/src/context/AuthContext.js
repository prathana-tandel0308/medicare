import { createContext, useState, useEffect } from 'react';
import API from '../api'; // Importing the central API file we just made

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/api/auth/me')
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token'); // Token is bad, remove it
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  // Register function
  const register = async (userData) => {
    const res = await API.post('/api/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
