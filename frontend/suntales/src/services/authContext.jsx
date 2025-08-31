import React, { createContext, useEffect, useState } from 'react';
import {
  isLoggedIn,
  getRole,
  getUserInfo,
  refreshAccessToken,
  setupAutoLogout,
  logout,
} from './authServices';

export const AuthContext = createContext();

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

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
