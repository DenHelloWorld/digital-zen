<?php

class GoogleAuthService {
    private const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
    
    /**
     * Validate Google OAuth token
     * 
     * IMPORTANT: The backend MUST verify the token on every request
     * to prevent identity forgery
     * 
     * Verifies:
     * 1. Token validity through Google API
     * 2. Audience (aud) - token must be issued for our OAuth client
     * 3. Issuer (iss) - token must be issued by Google
     * 
     * @param string $token Google OAuth access token
     * @return array|false Token info if valid, false otherwise
     */
    public function validateToken($token) {
        if (empty($token)) {
            error_log("Token validation failed: empty token");
            return false;
        }
        
        $url = self::GOOGLE_TOKEN_INFO_URL . '?access_token=' . urlencode($token);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("Token validation failed: Google API returned HTTP $httpCode");
            return false;
        }
        
        $tokenInfo = json_decode($response, true);
        
        if (!$tokenInfo) {
            error_log("Token validation failed: invalid JSON response from Google");
            return false;
        }
        
        // Validate audience (aud) - token must be issued for our OAuth client
        $expectedClientId = Config::getGoogleClientId();
        if (!isset($tokenInfo['aud'])) {
            error_log("Token validation failed: no audience (aud) field in token");
            return false;
        }
        
        if ($tokenInfo['aud'] !== $expectedClientId) {
            error_log("Token validation failed: audience mismatch. Expected: $expectedClientId, Got: " . $tokenInfo['aud']);
            return false;
        }
        
        // Validate issuer (iss) - token must be issued by Google
        if (isset($tokenInfo['iss'])) {
            $validIssuers = Config::getValidIssuers();
            if (!in_array($tokenInfo['iss'], $validIssuers, true)) {
                error_log("Token validation failed: invalid issuer (issuer mismatch)");
                return false;
            }
        }
        
        // Validate required fields are present and non-empty
        if (!isset($tokenInfo['sub']) || empty($tokenInfo['sub'])) {
            error_log("Token validation failed: missing required user identifier");
            return false;
        }
        
        if (!isset($tokenInfo['email']) || empty($tokenInfo['email'])) {
            error_log("Token validation failed: missing required email field");
            return false;
        }
        
        // Validate email format
        if (!filter_var($tokenInfo['email'], FILTER_VALIDATE_EMAIL)) {
            error_log("Token validation failed: invalid email format");
            return false;
        }
        
        // Validate that the email has been verified by Google
        // This prevents account takeover via unverified emails
        if (!isset($tokenInfo['email_verified'])) {
            error_log("Token validation failed: missing email verification status");
            return false;
        }

        // Google may return email_verified as a boolean or string ("true"/"false", "1"/"0")
        $emailVerifiedRaw = $tokenInfo['email_verified'];
        $emailVerified = is_bool($emailVerifiedRaw)
            ? $emailVerifiedRaw
            : filter_var($emailVerifiedRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        if ($emailVerified !== true) {
            error_log("Token validation failed: email is not verified");
            return false;
        }
        
        return $tokenInfo;
    }
    
    /**
     * Get user by google_id from token
     * 
     * Note: This method only validates 'sub' (Google ID), unlike createUser() which also requires 'email'.
     * This is intentional because getUser() retrieves existing users (email already in DB),
     * while createUser() needs email to create new user records.
     * 
     * @param array $tokenInfo Information from Google OAuth token (must contain 'sub')
     * @return array|false User data or false if not found
     */
    public function getUser($tokenInfo) {
        // Validate required user identifier field
        if (!isset($tokenInfo['sub']) || empty($tokenInfo['sub'])) {
            error_log("getUser: missing required user identifier in token");
            return false;
        }
        
        $db = Database::getInstance()->getConnection();
        
        // Check if user exists by google_id
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Update last login time
            $stmt = $db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $user['id']]);
        }
        
        return $user;
    }
    
    /**
     * Create a new user
     * 
     * @param array $tokenInfo Information from Google OAuth token (sub, email, name, picture)
     * @return array|false User data (existing or newly created) or false on error
     */
    public function createUser($tokenInfo) {
        // Validate required fields
        if (!isset($tokenInfo['sub']) || empty($tokenInfo['sub'])) {
            error_log("createUser: missing required user identifier in token");
            return false;
        }
        
        if (!isset($tokenInfo['email']) || empty($tokenInfo['email'])) {
            error_log("createUser: missing required email field in token");
            return false;
        }
        
        $db = Database::getInstance()->getConnection();
        
        // Check if user already exists
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        $existingUser = $stmt->fetch();
        
        if ($existingUser) {
            // Update last login time for existing user
            $updateStmt = $db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
            $updateStmt->execute(['id' => $existingUser['id']]);
            
            // Fetch and return updated user data to ensure last_login_at is current
            $stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->execute(['id' => $existingUser['id']]);
            return $stmt->fetch();
        }
        
        // Create new user
        $stmt = $db->prepare("
            INSERT INTO users (google_id, email, name, picture_url, last_login_at)
            VALUES (:google_id, :email, :name, :picture_url, NOW())
        ");
        
        $stmt->execute([
            'google_id' => $tokenInfo['sub'],
            'email' => $tokenInfo['email'],
            'name' => $tokenInfo['name'] ?? '',
            'picture_url' => $tokenInfo['picture'] ?? ''
        ]);
        
        // Return the newly created user
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        return $stmt->fetch();
    }
}