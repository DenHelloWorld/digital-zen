<?php

/**
 * Authentication Controller
 * 
 * Handles authentication endpoints for different auth providers.
 * Each provider endpoint validates credentials and returns a JWT token.
 */
class AuthController {
    
    /**
     * Exchange Google OAuth token for JWT token
     * 
     * Flow:
     * 1. Client sends Google OAuth access token in Authorization header
     * 2. Backend validates token with Google
     * 3. Backend creates/gets user in database
     * 4. Backend generates JWT token with user_id
     * 5. Backend returns JWT token to client
     * 
     * POST /auth/google
     * Headers: Authorization: Bearer <google_oauth_token>
     * Response: { "success": true, "data": { "token": "jwt_token", "user": {...} } }
     */
    public function loginWithGoogle() {
        // Get Google OAuth token from Authorization header
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader)) {
            Response::error('Authorization header missing', 401);
            return;
        }
        
        // Check format "Bearer <token>"
        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            Response::error('Invalid authorization format', 401);
            return;
        }
        
        $googleToken = trim($matches[1]);
        
        if (empty($googleToken)) {
            Response::error('Empty bearer token', 401);
            return;
        }
        
        try {
            // Validate Google token and get user info
            $googleAuth = new GoogleAuthService();
            $tokenInfo = $googleAuth->validateToken($googleToken);
            
            if (!$tokenInfo) {
                Response::error('Invalid or expired Google token', 401);
                return;
            }
            
            // Create or get user in database
            $user = $googleAuth->createUser($tokenInfo);
            
            if (!$user) {
                error_log('Failed to create/get user for Google ID: ' . ($tokenInfo['sub'] ?? 'unknown'));
                Response::error('Failed to create user account', 500);
                return;
            }
            
            // Generate JWT token
            $jwtService = new JWTService();
            $jwtToken = $jwtService->generateToken($user['id'], [
                'email' => $user['email'],
                'name' => $user['name']
            ]);
            
            // Return JWT token and user data
            Response::success([
                'token' => $jwtToken,
                'user' => $this->formatUserResponse($user)
            ]);
            
        } catch (Exception $e) {
            error_log('Google auth error: ' . $e->getMessage());
            Response::error('Authentication failed', 500);
        }
    }
    
    /**
     * Format user data for API response
     * 
     * @param array $user User data from database
     * @return array Formatted user data
     */
    private function formatUserResponse($user) {
        return [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'picture_url' => $user['picture_url'] ?? '',
            'created_at' => $user['created_at'],
            'last_login_at' => $user['last_login_at']
        ];
    }
}
