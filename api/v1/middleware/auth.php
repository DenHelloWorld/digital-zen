<?php
/**
 * Authentication Middleware
 * 
 * Validates API requests using a secret key passed in the X-API-Key header
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/response.php';

class AuthMiddleware {
    /**
     * Verify API key from request headers
     * 
     * @return bool True if authenticated, false otherwise
     */
    public static function verifyApiKey() {
        $headers = getallheaders();
        
        // Get API key from header (case-insensitive)
        $apiKey = null;
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'x-api-key') {
                $apiKey = $value;
                break;
            }
        }

        if (!$apiKey) {
            Response::error('API key is required', 401);
            return false;
        }

        if ($apiKey !== API_SECRET_KEY) {
            Response::error('Invalid API key', 403);
            return false;
        }

        return true;
    }

    /**
     * Verify user token from Authorization header
     * 
     * @return string|false User ID if valid, false otherwise
     */
    public static function verifyUserToken() {
        $headers = getallheaders();
        
        $authHeader = null;
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }

        if (!$authHeader) {
            Response::error('Authorization token is required', 401);
            return false;
        }

        // Extract Bearer token
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
            
            // Decode and verify JWT token
            $userId = self::verifyJWT($token);
            if (!$userId) {
                Response::error('Invalid or expired token', 403);
                return false;
            }
            
            return $userId;
        }

        Response::error('Invalid authorization format', 401);
        return false;
    }

    /**
     * Verify JWT token and extract user ID
     * 
     * @param string $token JWT token
     * @return string|false User ID or false if invalid
     */
    private static function verifyJWT($token) {
        try {
            // Split token into parts
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;
            }

            list($header, $payload, $signature) = $parts;

            // Verify signature
            $validSignature = hash_hmac('sha256', "$header.$payload", API_SECRET_KEY, true);
            $validSignature = self::base64UrlEncode($validSignature);

            if ($signature !== $validSignature) {
                return false;
            }

            // Decode payload
            $payloadData = json_decode(self::base64UrlDecode($payload), true);

            // Check expiration
            if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
                return false;
            }

            // Return user ID
            return $payloadData['user_id'] ?? false;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Generate JWT token for user
     * 
     * @param string $userId User ID
     * @param int $expiryHours Token expiry in hours (default: 720 = 30 days)
     * @return string JWT token
     */
    public static function generateJWT($userId, $expiryHours = 720) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'iat' => time(),
            'exp' => time() + ($expiryHours * 3600)
        ]);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", API_SECRET_KEY, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";
    }

    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
