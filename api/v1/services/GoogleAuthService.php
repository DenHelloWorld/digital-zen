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
                error_log("Token validation failed: invalid issuer. Got: " . $tokenInfo['iss']);
                return false;
            }
        }
        
        return $tokenInfo;
    }
    
    /**
     * Get user by google_id from token
     * 
     * @param array $tokenInfo Information from Google OAuth token (must contain 'sub')
     * @return array|false User data or false if not found
     */
    public function getUser($tokenInfo) {
        // Validate required 'sub' field
        if (!isset($tokenInfo['sub']) || empty($tokenInfo['sub'])) {
            error_log("getUser: missing or empty 'sub' field in tokenInfo");
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
        // Validate required fields 'sub' and 'email'
        if (!isset($tokenInfo['sub']) || empty($tokenInfo['sub'])) {
            error_log("createUser: missing or empty 'sub' field in tokenInfo");
            return false;
        }
        
        if (!isset($tokenInfo['email']) || empty($tokenInfo['email'])) {
            error_log("createUser: missing or empty 'email' field in tokenInfo");
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
            
            // Return existing user data
            return $existingUser;
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
        
        // Возвращаем созданного пользователя
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        return $stmt->fetch();
    }
}