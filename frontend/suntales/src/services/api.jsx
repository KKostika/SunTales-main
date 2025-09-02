import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from './tokenUtils';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👉 Request interceptor: προσθέτει access token
api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 👉 Response interceptor: χειρίζεται 401 και κάνει refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Μην προσπαθείς να κάνεις refresh στο ίδιο το refresh endpoint
    if (originalRequest.url.includes('/token/refresh')) {
      return Promise.reject(error);
    }

    // Αν το access token έχει λήξει
    if (error.response?.status === 401 && !originalRequest._isRetryAttempt) {
      originalRequest._isRetryAttempt = true;

      const refreshToken = getRefreshToken();

      // Αν δεν υπάρχει refresh token, redirect σε login
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios
          .post(`${BASE_URL}/token/refresh/`, { refresh: refreshToken })
          .then(({ data }) => {
            setAccessToken(data.access);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
            processQueue(null, data.access);
            originalRequest.headers.Authorization = `Bearer ${data.access}`;
            resolve(api(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            clearTokens();
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;

