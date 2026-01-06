/**
 * Environment configuration for API
 * Add these values to your .env file for production
 */

export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
}

// Default configuration for development
// In production, these will be replaced with actual values from environment
export const API_CONFIG: ApiConfig = {
  // API base URL - should be set in environment variables
  apiUrl: 'https://digital-zen.csmpoint.com/api',

  // API secret key - MUST BE CONFIGURED BEFORE DEPLOYMENT
  // This key must match the API_SECRET_KEY in api/config.php on the server
  // Generate a secure random key using: https://randomkeygen.com/
  // Example: 'k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6'
  // WARNING: Without this key, the extension will not be able to communicate with the API
  apiKey: '',
};
