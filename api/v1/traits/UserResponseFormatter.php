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
