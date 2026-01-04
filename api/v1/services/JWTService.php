<?php

/**
 * JWT Service for token generation and validation
 * 
 * This service handles JWT token creation and validation for session management.
 * Uses HS256 algorithm for signing tokens.
 */
class JWTService {
    private const ALGORITHM = 'HS256';
    private const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
    
    /**
     * Generate a JWT token for a user
     * 
     * @param int $userId User ID to encode in the token
     * @param array $additionalClaims Optional additional claims to include
     * @return string JWT token
     */
    public function generateToken($userId, $additionalClaims = []) {
        $secret = Config::getJWTSecret();
        
        if (empty($secret)) {
            throw new Exception('JWT_SECRET not configured');
        }
        
        $issuedAt = time();
        $expiresAt = $issuedAt + self::TOKEN_EXPIRY;
        
        $header = [
            'typ' => 'JWT',
            'alg' => self::ALGORITHM
        ];
        
        // Ensure additional claims cannot override critical JWT fields
        $protectedClaims = ['iss', 'iat', 'exp', 'user_id'];
        
        // Remove any protected claims from additional claims, safely handling non-array input
        $sanitizedAdditionalClaims = array_diff_key((array) $additionalClaims, array_flip($protectedClaims));
        
        $payload = array_merge([
            'iss' => 'digital-zen-api', // Fixed issuer for security
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'user_id' => $userId
        ], $sanitizedAdditionalClaims);
        
        $headerEncoded = $this->base64UrlEncode(json_encode($header));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));
        
        $signature = $this->sign($headerEncoded . '.' . $payloadEncoded, $secret);
        
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signature;
    }
    
    /**
     * Validate and decode a JWT token
     * 
     * @param string $token JWT token to validate
     * @return array|false Decoded payload if valid, false otherwise
     */
    public function validateToken($token) {
        $secret = Config::getJWTSecret();
        
        if (empty($secret)) {
            throw new Exception('JWT_SECRET not configured');
        }
        
        if (empty($token)) {
            error_log('JWT validation failed: empty token');
            return false;
        }
        
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            error_log('JWT validation failed: invalid token format');
            return false;
        }
        
        list($headerEncoded, $payloadEncoded, $signatureProvided) = $parts;
        
        // Decode and validate header
        $header = json_decode($this->base64UrlDecode($headerEncoded), true);
        
        if (!$header) {
            error_log('JWT validation failed: invalid header');
            return false;
        }
        
        // Validate algorithm in header matches expected algorithm
        if (!isset($header['alg']) || $header['alg'] !== self::ALGORITHM) {
            // Use generic error message to avoid revealing implementation details
            error_log('JWT validation failed: algorithm mismatch');
            return false;
        }
        
        // Verify signature
        $signatureExpected = $this->sign($headerEncoded . '.' . $payloadEncoded, $secret);
        
        // Perform timing-safe comparison and add more specific logging for failure reasons
        $signatureLengthsMatch = strlen($signatureExpected) === strlen($signatureProvided);
        $signatureValid = hash_equals($signatureExpected, $signatureProvided);

        if (!$signatureValid) {
            if (!$signatureLengthsMatch) {
                error_log('JWT validation failed: invalid signature (length mismatch)');
            } else {
                error_log('JWT validation failed: invalid signature (content mismatch)');
            }
            return false;
        }
        
        // Decode payload
        $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);
        
        if (!$payload) {
            error_log('JWT validation failed: invalid payload');
            return false;
        }
        
        // Check expiration: token is invalid once current time is equal to or after exp (valid strictly before exp timestamp)
        if (isset($payload['exp']) && time() >= $payload['exp']) {
            error_log('JWT validation failed: token expired');
            return false;
        }
        
        // Validate issuer claim
        if (isset($payload['iss']) && $payload['iss'] !== 'digital-zen-api') {
            // Use generic error message to avoid revealing expected issuer value
            error_log('JWT validation failed: invalid issuer');
            return false;
        }
        
        // Validate required claims
        if (!isset($payload['user_id'])) {
            error_log('JWT validation failed: missing user_id claim');
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Sign data using HMAC SHA256
     * 
     * @param string $data Data to sign
     * @param string $secret Secret key
     * @return string Base64 URL-encoded signature
     */
    private function sign($data, $secret) {
        $signature = hash_hmac('sha256', $data, $secret, true);
        return $this->base64UrlEncode($signature);
    }
    
    /**
     * Base64 URL encode
     * 
     * @param string $data Data to encode
     * @return string Base64 URL-encoded string
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     * 
     * @param string $data Data to decode
     * @return string Decoded string
     */
    private function base64UrlDecode($data) {
        $base64 = strtr($data, '-_', '+/');
        $padding = strlen($base64) % 4;
        
        if ($padding !== 0) {
            $base64 .= str_repeat('=', 4 - $padding);
        }
        
        return base64_decode($base64);
    }
}
