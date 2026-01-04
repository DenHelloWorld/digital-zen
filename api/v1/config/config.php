<?php

/**
 * Application configuration
 * 
 * Environment variables must be set in the hosting environment for the application to work properly.
 * 
 * Required environment variables:
 * - GOOGLE_CLIENT_ID: OAuth 2.0 Client ID from Google Cloud Console
 * - CHROME_EXTENSION_ID: The Chrome extension ID (found at chrome://extensions/)
 * 
 * For local development:
 * - Use a .env file with vlucas/phpdotenv library, OR
 * - Set variables in your web server configuration (Apache/Nginx), OR
 * - Set them in your system environment
 * 
 * For production (Hostinger):
 * - Set variables through the hosting control panel's environment variable settings
 */
class Config {
    /**
     * Get Google OAuth Client ID
     * This must match the client ID configured in the Chrome extension manifest.
     * 
     * @return string|null The Google OAuth Client ID or null if not set
     * @throws Exception if GOOGLE_CLIENT_ID is not set in environment
     */
    public static function getGoogleClientId() {
        // Use $_ENV for better performance and consistency with modern PHP
        $clientId = $_ENV['GOOGLE_CLIENT_ID'] ?? null;
        
        if ($clientId === null || trim($clientId) === '') {
            $errorMsg = "CRITICAL: GOOGLE_CLIENT_ID environment variable is not set. OAuth authentication will not work.";
            error_log($errorMsg);
            throw new Exception($errorMsg);
        }
        
        return $clientId;
    }
    
    /**
     * Get expected token issuer for Google OAuth tokens
     * 
     * @return array Valid issuers for Google OAuth tokens
     */
    public static function getValidIssuers() {
        return [
            'https://accounts.google.com',
            'accounts.google.com'
        ];
    }
}
