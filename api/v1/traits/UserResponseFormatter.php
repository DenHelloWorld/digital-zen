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
        
        // If google_id is present in the user data, it will be included in the API response.
        // SECURITY NOTE: This trait only formats HTTP responses and does not make any policy
        // decisions about which fields are sensitive. Controllers are responsible for removing
        // google_id from the $user array before calling this method when they do not want it
        // exposed (e.g., for certain endpoints or client types).
        if (isset($user['google_id'])) {
            $response['google_id'] = $user['google_id'];
        }
        
        return $response;
    }
}
