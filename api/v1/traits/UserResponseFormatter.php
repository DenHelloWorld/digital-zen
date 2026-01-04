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
     * @return array Formatted user data
     */
    protected function formatUserResponse($user) {
        $response = [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'picture_url' => $user['picture_url'] ?? '',
            'created_at' => $user['created_at'],
            'last_login_at' => $user['last_login_at']
        ];
        
        // Include google_id in the API response if present in the user data.
        // Note: this trait only formats HTTP responses and does not control JWT token payloads.
        // Controllers can choose whether to expose google_id by deciding what user data to pass here
        // or how to use the formatted response (e.g., login vs. profile endpoints).
        if (isset($user['google_id'])) {
            $response['google_id'] = $user['google_id'];
        }
        
        return $response;
    }
}
