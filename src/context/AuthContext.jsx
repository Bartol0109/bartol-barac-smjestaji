import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

const AuthContext = createContext(null);

// Axios interceptor za dodavanje tokena u zaglavlje
axios.interceptors.request.use(
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

// Axios interceptor za obradu grešaka
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Ako je token istekao ili nije valjan, odjavimo korisnika
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Postavimo token u axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Prvo postavimo stored user da ne blokiramo rendering
          setUser(JSON.parse(storedUser));
          setLoading(false);
          
          // Zatim u pozadini provjerimo token
          const response = await axios.get(`${API_URL}/api/auth/me`);
          
          // Ažuriramo podatke o korisniku ako su različiti
          if (JSON.stringify(response.data) !== storedUser) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Ako token nije valjan, odjavimo korisnika
          logout();
          if (!location.pathname.includes('/login')) {
            navigate('/login');
          }
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location]);

  const login = async (userData) => {
    setUser(userData.user);
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('token', userData.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    if (!location.pathname.includes('/login')) {
      navigate('/login');
    }
  };

  // Ne blokiramo rendering dok se provjerava token
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 