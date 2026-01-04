<?php

class AuthMiddleware {
    /**
     * Authenticate user with JWT or Google OAuth token (backward compatibility)
     * 
     * New flow (JWT):
     * - Client sends JWT token in Authorization header
     * - Backend validates JWT and extracts user_id
     * - No external API calls needed
     * 
     * Legacy flow (Google OAuth - deprecated):
     * - Client sends Google OAuth token
     * - Backend validates with Google API
     * - Supported for backward compatibility during migration
     * 
     * @param bool $requireUser Whether an existing user is required
     * @return array Array with keys 'user' and 'tokenInfo'; each value may be an array or null.
     *               In the JWT flow, 'tokenInfo' is always null and 'user' may be null when $requireUser is false.
     *               In the Google OAuth flow, both may be arrays or null depending on validation results.
     */
    public function authenticate($requireUser = true) {
        $headers = getallheaders();
        
        // Get token from Authorization header
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader)) {
            Response::unauthorized('Authorization header missing');
        }
        
        // Check format "Bearer TOKEN"
        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            Response::unauthorized('Invalid authorization format');
        }
        
        $token = trim($matches[1]);
        
        if (empty($token)) {
            Response::unauthorized('Empty bearer token');
        }
        
        // Try JWT validation first (new flow)
        $jwtService = new JWTService();
        $jwtPayload = $jwtService->validateToken($token);
        
        if ($jwtPayload) {
            // JWT token is valid - extract user_id and get user from DB
            $userId = $jwtPayload['user_id'] ?? null;
            
            if (!$userId) {
                Response::unauthorized('Invalid JWT token: missing user_id');
            }
            
            // Get user from database
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
            $stmt->execute(['id' => $userId]);
            $user = $stmt->fetch();
            
            if (!$user && $requireUser) {
                Response::unauthorized('User account not found');
            }
            
            return ['user' => $user ?: null, 'tokenInfo' => null];
        }
        
        // Fallback to Google OAuth validation (legacy flow)
        // This allows backward compatibility during migration
        $googleAuth = new GoogleAuthService();
        $tokenInfo = $googleAuth->validateToken($token);
        
        if (!$tokenInfo) {
            Response::unauthorized('Invalid or expired token');
        }
        
        if (!$requireUser) {
            // For user creation, return only tokenInfo
            return ['tokenInfo' => $tokenInfo, 'user' => null];
        }
        
        // Get user (do NOT create automatically)
        $user = $googleAuth->getUser($tokenInfo);
        
        if (!$user) {
            Response::unauthorized('User account not found. Please contact support or try logging in again.');
        }
        
        return ['tokenInfo' => $tokenInfo, 'user' => $user];
    }
}