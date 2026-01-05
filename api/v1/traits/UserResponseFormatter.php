<?php

/**
 * Trait for formatting user data for API responses
 * 
 * This trait provides a consistent way to format user data across different controllers.
 */
trait UserResponseFormatter {
    /**
     * Format user data for API response
     * 
     * @param array $user User data from database
     * @param bool $includeGoogleId Whether to include google_id in the response (default: false for security)
     * @return array Formatted user data
     */
    protected function formatUserResponse($user, $includeGoogleId = false) {
        $response = [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'picture_url' => $user['picture_url'] ?? '',
            'created_at' => $user['created_at'],
            'last_login_at' => $user['last_login_at']
        ];
        
        // Only include google_id if explicitly requested
        // SECURITY NOTE: google_id is a sensitive identifier that can be used to track users
        // across different services. Only expose it when there's a specific need (e.g., admin endpoints).
        if ($includeGoogleId && isset($user['google_id'])) {
            $response['google_id'] = $user['google_id'];
        }
        
        return $response;
    }
}
