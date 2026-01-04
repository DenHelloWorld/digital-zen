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
     * @return string The Google OAuth Client ID
     * @throws ConfigurationException If GOOGLE_CLIENT_ID is not configured
     */
    public static function getGoogleClientId() {
        // Use $_ENV for better performance and consistency with modern PHP
        $clientId = $_ENV['GOOGLE_CLIENT_ID'] ?? null;

        if ($clientId === null || $clientId === '') {
            error_log("CRITICAL: GOOGLE_CLIENT_ID environment variable not set or empty. The application cannot safely verify Google OAuth tokens.");
            throw new ConfigurationException('GOOGLE_CLIENT_ID environment variable must be set and non-empty.');
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
    
    /**
     * Get JWT secret for token signing
     * 
     * CRITICAL: This must be a strong, random secret in production.
     * Generate with: openssl rand -base64 64
     * 
     * @return string|null The JWT secret or null if not set or empty
     */
    public static function getJWTSecret() {
        // Support both $_ENV and $_SERVER for flexibility
        // $_ENV works with PHP-FPM environment variables
        // $_SERVER works with Apache SetEnv directive
        $secret = $_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? null;
        
        if ($secret === null || trim($secret) === '') {
            error_log("WARNING: JWT_SECRET environment variable not set or empty");
            return null;
        }
        
        return $secret;
    }
    
    /**
     * Validate critical configuration at application startup
     * 
     * This should be called during application bootstrap to ensure
     * all required configuration is present before handling requests.
     * 
     * @throws ConfigurationException if critical configuration is missing
     */
    public static function validateStartupConfig() {
        $errors = [];
        
        // Validate JWT secret
        if (self::getJWTSecret() === null) {
            $errors[] = 'JWT_SECRET environment variable is required but not set. Generate with: openssl rand -base64 64';
        }
        
        // Validate Google Client ID
        try {
            self::getGoogleClientId();
        } catch (ConfigurationException $e) {
            $errors[] = $e->getMessage();
        }
        
        if (!empty($errors)) {
            $errorMessage = "Application configuration validation failed:\n" . implode("\n", $errors);
            error_log($errorMessage);
            throw new ConfigurationException($errorMessage);
        }
    }
}
