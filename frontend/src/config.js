// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: 'http://127.0.0.1:8000'
  },
  production: {
    // For Render deployment - will be injected via environment variable
    API_BASE_URL: (import.meta.env.VITE_API_URL || 'https://cyberbuddy-backend-sf0g.onrender.com').replace(/\/$/, '')
  }
};

// Determine current environment - be more explicit about production detection
const isDevelopment = import.meta.env.DEV || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0';

const environment = isDevelopment ? 'development' : 'production';

// Force production URL if we're on a .onrender.com domain
let finalApiUrl = config[environment].API_BASE_URL;
if (window.location.hostname.includes('onrender.com')) {
  finalApiUrl = import.meta.env.VITE_API_URL || 'https://cyberbuddy-backend-sf0g.onrender.com';
}

// Debug logging for troubleshooting
console.log('Environment detected:', environment);
console.log('Hostname:', window.location.hostname);
console.log('Final API_BASE_URL:', finalApiUrl);
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);

export const API_BASE_URL = finalApiUrl;

export default config;
