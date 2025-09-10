import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const ROLE_KEY = 'role';
const USERNAME_KEY = 'username';
const EMAIL_KEY = 'email';
const LOGOUT_KEY = 'logoutTimestamp';

// 🔐 Token Storage
export const setTokens = (access, refresh) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

// Clears all stored tokens and user info from localStorage
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

// 👤 User Info
export const setUserInfo = ({ role, username, email }) => {
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(EMAIL_KEY, email);
};

export const getUserInfo = () => ({
  role: localStorage.getItem(ROLE_KEY),
  username: localStorage.getItem(USERNAME_KEY),
  email: localStorage.getItem(EMAIL_KEY),
});

export const getRole = () => localStorage.getItem(ROLE_KEY);

// 🔓 Sends login request to backend and stores tokens + user info on success
export const login = async (email, password) => {
  try {
    const response = await axios.post('/api/login/', { email, password });
    const { access, refresh, role, username, email: userEmail } = response.data;

    setTokens(access, refresh);
    setUserInfo({ role, username, email: userEmail });

    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

// 🚪 Logout Clears tokens and redirects user to login page
export const logout = () => {
  clearTokens();
  localStorage.setItem(LOGOUT_KEY, Date.now());
  window.location.href = '/login'; 

// 🔁 Refresh Access Token
export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const response = await axios.post('/api/token/refresh/', { refresh });
    const newAccess = response.data.access;
    localStorage.setItem(TOKEN_KEY, newAccess);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout();
    return false;
  }
};

// ✅ Check if access token exists and is still valid (not expired)
export const isLoggedIn = () => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

// ⏱ Auto Logout Timer
export const setupAutoLogout = () => {
  const token = getAccessToken();
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const timeout = decoded.exp * 1000 - Date.now();

    if (timeout > 0) {
      setTimeout(() => {
        logout();
      }, timeout);
    }
  } catch (error) {
    console.error('Auto logout setup failed:', error);
  }
};

// ⏳ Auto refreshes access token 1 minute before expiration
export const setupAutoRefresh = () => {
  const token = getAccessToken();
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const refreshTime = decoded.exp * 1000 - Date.now() - 60000; 

    if (refreshTime > 0) {
      setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);
    }
  } catch (error) {
    console.error('Auto refresh setup failed:', error);
  }
};
