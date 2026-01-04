<?php

/**
 * Application configuration
 * 
 * Environment variables should be set in the hosting environment.
 * For local development, you can use a .env file or set them directly.
 */
class Config {
    /**
     * Get Google OAuth Client ID
     * This must match the client ID configured in the Chrome extension manifest.
     * 
     * @return string|null The Google OAuth Client ID or null if not set
     */
    public static function getGoogleClientId() {
        // Try to get from environment variable first
        $clientId = getenv('GOOGLE_CLIENT_ID');
        
        if ($clientId === false) {
            error_log("WARNING: GOOGLE_CLIENT_ID environment variable not set");
            return null;
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
