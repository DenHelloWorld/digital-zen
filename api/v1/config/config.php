<?php
/**
 * API Configuration
 * 
 * Contains API settings including security keys and CORS configuration
 */

// API Security Key - Should be set via environment variable in production
define('API_SECRET_KEY', getenv('API_SECRET_KEY') ?: 'your-secret-key-here-change-in-production');

// Allowed origins for CORS
define('ALLOWED_ORIGINS', [
    'chrome-extension://*', // Allow all Chrome extensions (will be validated by secret key)
]);

// API Version
define('API_VERSION', 'v1');

// Enable/Disable debug mode
define('DEBUG_MODE', getenv('DEBUG_MODE') === 'true');
