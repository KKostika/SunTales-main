import React, { createContext, useEffect, useState } from 'react';
import {
  isLoggedIn,
  getRole,
  getUserInfo,
  refreshAccessToken,
  setupAutoLogout,
  logout,
} from './authServices';

// Creates a global authentication context to share auth state across the app
export const AuthContext = createContext();

// wraps the app and provides authentication-related data and functions
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const valid = isLoggedIn();
      if (!valid) {
        const refreshed = await refreshAccessToken();
        setIsAuthenticated(refreshed);
      } else {
        setIsAuthenticated(true);
      }

      setRole(getRole());
      setUser(getUserInfo());
      setupAutoLogout();
    };

    checkAuth();
  }, []);
  
  // Provides auth state and logout function to all child components
  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
