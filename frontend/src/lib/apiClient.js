/**
 * API Client - Axios Instance with Clerk Authentication
 * 
 * This client handles:
 * - Global base URL configuration
 * - Response/error handling
 * 
 * Usage: Use the useClerkAxios hook in components to get the configured client
 */

import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

// Get base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Response Interceptor
 * Handles errors and maintains consistent response format
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle various error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Log detailed error info for debugging
      console.error(`[API Error ${status}]`, data.message || data.error);

      if (status === 401) {
        console.warn('Authentication expired. Please log in again.');
      } else if (status === 403) {
        console.warn('Access denied: insufficient permissions.');
      } else if (status === 404) {
        console.warn('Resource not found.');
      } else if (status === 400) {
        console.warn('Invalid request data:', data.message);
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
 * Custom hook for injecting Clerk token into API requests
 * Must be called within a React component and must be called BEFORE making requests
 * 
 * @returns {AxiosInstance} axios instance with Clerk token automatically injected
 * 
 * @example
 * const api = useClerkAxios();
 * const response = await api.get('/trips');
 */
export const useClerkAxios = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Create request interceptor that injects Clerk token
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error fetching Clerk token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup: Remove interceptor when component unmounts
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  return apiClient;
};

export default apiClient;



