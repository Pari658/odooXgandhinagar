/**
 * API Client - Axios Instance with JWT Authentication
 *
 * Attaches the stored JWT as a Bearer token on every outgoing request.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`[API Error ${status}]`, data.message || data.error);

      if (status === 401) {
        const isAuthEndpoint = error.config?.url?.includes('/auth/login')
          || error.config?.url?.includes('/auth/register');
        if (!isAuthEndpoint) {
          localStorage.removeItem(TOKEN_KEY);
          console.warn('Authentication expired. Please log in again.');
        }
      } else if (status === 403) {
        console.warn('Access denied: insufficient permissions.');
      }
    } else if (error.request) {
      console.error('No response from server:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Returns the shared axios instance (token injection is global via interceptor).
 */
export const useApi = () => apiClient;

export default apiClient;
