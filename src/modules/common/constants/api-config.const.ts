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
  
  // API secret key - should be set in environment variables
  // This must match the API_SECRET_KEY in api/config.php
  apiKey: '',
};
