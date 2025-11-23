// src/config/api.js
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5030/api',
};

console.log('🔧 API Configuration:', API_CONFIG);

export default API_CONFIG;