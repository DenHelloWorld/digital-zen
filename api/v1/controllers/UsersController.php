<?php

class UsersController {
    use UserResponseFormatter;
    
    /**
     * Create a new user
     * Called by frontend on first login
     * 
     * @param array $tokenInfo Information from Google OAuth token (sub, email, name, picture)
     */
    public function create($tokenInfo) {
        try {
            $googleAuth = new GoogleAuthService();
            
            // Create user (or get existing one)
            // GoogleAuthService.createUser already validates required fields
            $user = $googleAuth->createUser($tokenInfo);
            
            if (!$user) {
                // Log only google_id (not PII) for debugging
                $googleId = $tokenInfo['sub'] ?? 'unknown';
                error_log("User creation failed for google_id: $googleId");
                Response::error('User creation failed: unable to create or retrieve user record', 500);
            }
            
            Response::success($this->formatUserResponse($user));
        } catch (PDOException $e) {
            error_log("User creation error (database): " . $e->getMessage());
            Response::error('User creation failed due to a database error', 500);
        } catch (Exception $e) {
            error_log("User creation error: " . $e->getMessage());
            Response::error('User creation failed due to an internal server error', 500);
        }
    }
    
    /**
     * Получить информацию о текущем пользователе
     * 
     * @param array $user Массив с данными пользователя из БД
     */
    public function me($user) {
        Response::success($this->formatUserResponse($user));
    }
}
