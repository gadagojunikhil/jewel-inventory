import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        // Verify token with backend
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const setAuthData = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    changePassword,
    checkAuth,
    setAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;