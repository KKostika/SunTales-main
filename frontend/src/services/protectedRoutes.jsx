import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getDecodedToken } from './tokenUtils';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isLoggedIn = isAuthenticated();
  const decodedToken = getDecodedToken();

  // Αν δεν υπάρχει έγκυρο token → redirect στο login
  if (!isLoggedIn || !decodedToken) {
    return <Navigate to="/login" replace />;
  }

  const userRole = decodedToken.role;

  // Αν δεν επιτρέπεται ο ρόλος → redirect στο unauthorized
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Αν όλα είναι εντάξει → εμφάνισε το protected component
  return children;
};

export default ProtectedRoute;

