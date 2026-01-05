<?php
/**
 * Database and API Configuration
 * This file contains all main settings
 */

// === DATABASE SETTINGS ===
// Database server address
define('DB_HOST', 'localhost');

// Database name
define('DB_NAME', 'u387418961_digital_zen_db');

// Database username
define('DB_USER', 'u387418961_dz_user');

// Database password (needs to be filled during deployment)
define('DB_PASS', '');

// === SECURITY SETTINGS ===
// Secret key for request verification
// Only application with this key can make requests to API
// IMPORTANT: Generate random string and put it here
define('API_SECRET_KEY', '');

// === ERROR SETTINGS ===
// Show errors or not (0 = hide, 1 = show)
// Should be 0 in production
error_reporting(E_ALL);
ini_set('display_errors', 0);

// === TIME SETTINGS ===
// Timezone
date_default_timezone_set('UTC');
