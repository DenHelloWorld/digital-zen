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
        // Validate that tokenInfo is provided (it can be null when using JWT authentication)
        if ($tokenInfo === null) {
            error_log("User creation failed: no token information provided");
            Response::error('User creation requires valid authentication token', 400);
            return;
        }
        
        try {
            $googleAuth = new GoogleAuthService();
            
            // Create user (or get existing one)
            // GoogleAuthService::createUser() validates required fields (e.g. 'sub', 'email').
            // If validation fails it returns false (does not throw); the if (!$user) block below
            // handles this case by logging and returning an error response.
            $user = $googleAuth->createUser($tokenInfo);
            
            if (!$user) {
                // Log only google_id (not PII) for debugging
                $googleId = $tokenInfo['sub'] ?? 'unknown';
                
                // All validation is handled inside GoogleAuthService::createUser()
                // If we reach here, it's likely a database error or other internal issue
                error_log("User creation failed for google_id: $googleId; GoogleAuthService::createUser returned false");
                Response::error(
                    'User creation failed due to an internal error while creating your account',
                    500
                );
                return;
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
     * Get information about the current user
     * 
     * @param array $user Array with user data from the database
     */
    public function me($user) {
        if (!$user || !is_array($user)) {
            Response::error('User not found', 404);
            return;
        }
        Response::success($this->formatUserResponse($user));
    }
}
