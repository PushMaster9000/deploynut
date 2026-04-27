import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Fallback checks both keys just in case
        const token = localStorage.getItem('user_token');
        if (token) {
          const response = await apiClient.get('/api/auth/me');
          setUser({ ...response.data, name: response.data.username });
        }
      } catch (error) {
        console.warn("Old or invalid token cleared safely."); // The 401 will just trigger this and move on safely!
        localStorage.removeItem('user_token');
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setLoadingApp(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Extremely safe error parser
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
        username: name,
        email: email,
        password: password
      });
      
      // We don't get a token here anymore, we get a success message.
      // We return true so the UI can proceed to verification.
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
    // Let React Router handle the redirect smoothly, no window.location.href!
  };

  if (loadingApp) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-brand-green font-bold text-xl">Loading NutriVision...</div>;

  return (
    <UserContext.Provider value={{ user, login, signup, verifyEmail, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);