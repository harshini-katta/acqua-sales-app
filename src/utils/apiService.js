// utils/apiService.js - Fixed version addressing the retry and header issues
import axios from 'axios';
import { useState, useRef } from 'react';

// Get base URL directly - works in all environments
const getBaseUrl = () => {
  return "https://d28c5r6pnnqv4m.cloudfront.net";
};

const BASE_URL = getBaseUrl();
const FASTAPI_URL = `${BASE_URL}/fastapi`;

// Create axios instances with safer headers
const apiClient = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const cacheableApiClient = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    // Removed Accept-Encoding header - browser handles this automatically
  },
});

// Add logging interceptors
[apiClient, cacheableApiClient].forEach((client, index) => {
  const clientName = index === 0 ? 'API' : 'CACHE-API';
  
  client.interceptors.request.use(
    (config) => {
      console.log(`[${clientName}] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error(`[${clientName}] Request error:`, error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      const cacheStatus = response.headers['x-cache'] || 'Unknown';
      const age = response.headers['age'] || '0';
      console.log(`[${clientName}] ✓ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (Cache: ${cacheStatus}, Age: ${age}s)`);
      return response;
    },
    (error) => {
      const status = error.response?.status || 'Network Error';
      const url = error.config?.url || 'unknown';
      const method = error.config?.method?.toUpperCase() || 'unknown';
      console.error(`[${clientName}] ✗ ${method} ${url} - ${status}:`, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
});

// Retry utility with better error handling
export const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[RETRY] Attempt ${attempt}/${maxRetries}`);
      const result = await apiCall();
      console.log(`[RETRY] ✓ Succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      const errorMsg = error.response?.data?.detail || error.message;
      console.warn(`[RETRY] ✗ Attempt ${attempt} failed:`, errorMsg);
      
      // Don't retry on certain errors
      if (error.response) {
        const status = error.response.status;
        // Don't retry on 4xx errors (except 429 rate limit)
        if (status >= 400 && status < 500 && status !== 429) {
          console.log(`[RETRY] Not retrying ${status} error`);
          break;
        }
      }
      
      if (attempt === maxRetries) {
        console.error(`[RETRY] Failed after ${maxRetries} attempts`);
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`[RETRY] Waiting ${Math.round(delay)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

class ApiService {
  // Products endpoints (cacheable)
  static async getProducts(skip = 0, limit = 100, forceRefresh = false) {
    const client = forceRefresh ? apiClient : cacheableApiClient;
    let url = `/odoo/products?skip=${skip}&limit=${limit}&cacheable=${!forceRefresh}`;
    if (forceRefresh) {
      url += `&cb=${Date.now()}`;
    }
    return retryApiCall(() => client.get(url), 3, 1000);
  }

  // Customers endpoints
  static async getCustomers(cacheable = true) {
    const client = cacheable ? cacheableApiClient : apiClient;
    return retryApiCall(() => 
      client.get(`/odoo/contacts/external-contacts?cacheable=${cacheable}`), 
      3, 1000
    );
  }

  // Orders endpoints
  static async createOrder(orderData) {
    return retryApiCall(() => apiClient.post('/odoo/orders', orderData), 3, 2000);
  }

  static async getOrders() {
    return retryApiCall(() => apiClient.get('/odoo/orders'), 3, 1000);
  }

  // Authentication endpoints
  static async login(credentials) {
    return retryApiCall(() => apiClient.post('/api/login', credentials), 2, 1000);
  }

  static async register(userData) {
    return retryApiCall(() => apiClient.post('/api/register', userData), 2, 1000);
  }

  static async getProfile(token) {
    return retryApiCall(() => apiClient.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }), 2, 1000);
  }

  // Dashboard and stats
  static async getDashboard() {
    return retryApiCall(() => apiClient.get('/odoo/dashboard'), 3, 1000);
  }

  static async getDashboardStats() {
    return retryApiCall(() => apiClient.get('/odoo/order-management/stats/dashboard'), 3, 1000);
  }

  // Order Management
  static async getEnhancedOrders() {
    return retryApiCall(() => apiClient.get('/odoo/order-management/orders/enhanced'), 3, 1000);
  }

  static async updateOrderStatus(orderId, statusData) {
    return retryApiCall(() => 
      apiClient.put(`/odoo/order-management/orders/${orderId}/status`, statusData), 
      2, 1500
    );
  }

  static async getOrderStats() {
    return retryApiCall(() => apiClient.get('/odoo/order-management/stats/orders'), 3, 1000);
  }

  // Companies endpoints
  static async getCompanies() {
    return retryApiCall(() => apiClient.get('/odoo/companies'), 3, 1000);
  }

  static async createCompany(formData) {
    return retryApiCall(() => apiClient.post('/odoo/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    }), 2, 2000);
  }

  // Batch load for form data - with abort controller for cleanup
  static async batchLoad(operations, abortController = null) {
    const results = {};
    const errors = {};
    
    console.log(`[BATCH] Starting ${operations.length} operations sequentially...`);
    
    for (const { key, operation, delay = 200 } of operations) {
      // Check if operation was aborted
      if (abortController?.signal.aborted) {
        console.log(`[BATCH] Aborted batch loading`);
        break;
      }
      
      try {
        console.log(`[BATCH] Loading ${key}...`);
        results[key] = await operation();
        console.log(`[BATCH] ✓ ${key} loaded successfully`);
        
        if (delay > 0 && !abortController?.signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (abortController?.signal.aborted) {
          console.log(`[BATCH] Operation ${key} aborted`);
          break;
        }
        console.error(`[BATCH] ✗ ${key} failed:`, error.response?.data?.detail || error.message);
        errors[key] = error;
      }
    }
    
    console.log(`[BATCH] Completed: ${Object.keys(results).length} success, ${Object.keys(errors).length} errors`);
    return { results, errors };
  }

  // Enhanced batch load with cache optimization (alias for compatibility)
  static async batchLoadCacheable(operations, abortController = null) {
    return this.batchLoad(operations, abortController);
  }

  // Health check
  static async healthCheck() {
    return retryApiCall(() => apiClient.get('/health'), 2, 500);
  }

  // Utility methods
  static getErrorMessage(error) {
    if (!error.response && error.code !== 'ECONNABORTED') {
      return 'Network connection failed. Please check your internet connection.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    if (error.response && error.response.status >= 500) {
      return 'Server error occurred. Please try again later.';
    }
    return error.response?.data?.detail || error.message || 'An unknown error occurred.';
  }

  static isNetworkError(error) {
    return !error.response && error.code !== 'ECONNABORTED';
  }

  static isTimeoutError(error) {
    return error.code === 'ECONNABORTED';
  }

  static isServerError(error) {
    return error.response && error.response.status >= 500;
  }

  // Get cache info from response
  static getCacheInfo(response) {
    return {
      cached: response.headers['x-cache'] === 'Hit from cloudfront',
      age: parseInt(response.headers['age'] || '0', 10),
      cacheControl: response.headers['cache-control'],
      etag: response.headers['etag']
    };
  }

  // Debug function
  static debug() {
    console.log('API Service Configuration:', {
      baseUrl: BASE_URL,
      fastapiUrl: FASTAPI_URL,
      userAgent: navigator.userAgent,
      origin: window.location.origin
    });
  }
}

export default ApiService;

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = async (apiCall, onSuccess, onError) => {
    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(abortControllerRef.current);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      const errorMessage = ApiService.getErrorMessage(err);
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { loading, error, execute, abort };
};