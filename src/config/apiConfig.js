// config/apiConfig.js
// Configuration file to avoid circular import issues

// Get the base URL from environment variables or use defaults
const getApiBaseUrl = () => {
    // Check for environment variables first
    if (process.env.REACT_APP_FASTAPI_URL) {
      return process.env.REACT_APP_FASTAPI_URL;
    }
    
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Development defaults
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:8000';
    }
    
    // Production: use current origin (works with CloudFront)
    return window.location.origin;
  };
  
  const API_CONFIG = {
    baseUrl: getApiBaseUrl(),
    fastApiPath: '/fastapi',
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheEnabled: true,
  };
  
  // Export individual values
  export const FASTAPI_BASE_URL = API_CONFIG.baseUrl;
  export const FASTAPI_FULL_URL = `${API_CONFIG.baseUrl}${API_CONFIG.fastApiPath}`;
  export const API_TIMEOUT = API_CONFIG.timeout;
  export const RETRY_ATTEMPTS = API_CONFIG.retryAttempts;
  export const RETRY_DELAY = API_CONFIG.retryDelay;
  export const CACHE_ENABLED = API_CONFIG.cacheEnabled;
  
  // Export the full config
  export default API_CONFIG;
  
  // Debug function to check configuration
  export const debugApiConfig = () => {
    console.log('API Configuration:', {
      baseUrl: API_CONFIG.baseUrl,
      fullUrl: FASTAPI_FULL_URL,
      nodeEnv: process.env.NODE_ENV,
      envVars: {
        REACT_APP_FASTAPI_URL: process.env.REACT_APP_FASTAPI_URL,
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      },
      windowOrigin: window.location.origin,
    });
  };