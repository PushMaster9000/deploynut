import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('user_token') || localStorage.getItem('access_token');
        if (token) {
          const response = await apiClient.get('/api/auth/me', {
             headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ ...response.data, name: response.data.username });
          localStorage.setItem('user_token', token);
        }
      } catch (error) {
        console.warn("Old or invalid token cleared safely.");
        localStorage.removeItem('user_token');
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setLoadingApp(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const parseApiError = (error, defaultMessage) => {
    try {
        if (error.response?.data?.detail) {
            const detail = error.response.data.detail;
            if (typeof detail === 'string') return detail;
            if (Array.isArray(detail)) return detail[0].msg;
        }
    } catch (e) {}
    return defaultMessage;
  };

  const signup = async (name, email, password) => {
    try {
      const response = await apiClient.post('/api/auth/signup', {
        name: name, // FIXED: Changed 'username' to 'name' to match Backend Schema
        email: email,
        password: password
      });
      
      return true;
    } catch (error) {
      throw new Error(parseApiError(error, "Signup failed. Please check your details."));
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await apiClient.post('/api/auth/verify', { email, code });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('user_token', access_token);
      setUser({ ...userData, name: userData.username });
      return true;
    } catch (error) {
      throw new Error(parseApiError(error, "Verification failed. Invalid code."));
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('user_token', access_token);
      setUser({ ...userData, name: userData.username });
    } catch (error) {
      throw new Error(parseApiError(error, "Login failed. Invalid credentials."));
    }
  };

  const logout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('access_token');
    setUser(null);
  };

  if (loadingApp) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-brand-green font-bold text-xl">Loading NutriVision...</div>;

  return (
    <UserContext.Provider value={{ user, login, signup, verifyEmail, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);