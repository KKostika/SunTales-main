import { jwtDecode } from 'jwt-decode';

// Keys used to store tokens and user info in localStorage
const ACCESS_KEY = 'access';
const REFRESH_KEY = 'refreshToken';
const ROLE_KEY = 'role';

// Retrieves access, refresh token and user role from localStorage
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);

// Stores access, refresh tokens and user role in localStorage
export const setAccessToken = (token) => localStorage.setItem(ACCESS_KEY, token);
export const setRefreshToken = (token) => localStorage.setItem(REFRESH_KEY, token);
export const setRole = (role) => localStorage.setItem(ROLE_KEY, role);

// Clears all stored tokens and role info from localStorage 
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
};

// Decodes the access token to extract payload data
export const getDecodedToken = () => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

export const isTokenExpired = () => {
  const decoded = getDecodedToken();
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token && !isTokenExpired();
};

// Extracts username from decoded token payload
export const getUsername = () => {
  const decoded = getDecodedToken();
  return decoded?.username || '';
};

// Extracts user ID from decoded token payload
export const getUserId = () => {
  const decoded = getDecodedToken();
  return decoded?.user_id || null;
};
