/// <reference types="vite/client" />

// Frontend Environment Configuration
// Vite bundles variables prefixed with VITE_

export const clientEnv = {
  // Base URL for backend API requests (e.g. 'https://api.ateliermanager.com/api' in production or '/api' in local dev)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  isProduction: import.meta.env.PROD,
  appVersion: '1.0.0',
};
