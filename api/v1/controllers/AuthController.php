<?php
/**
 * Auth Controller
 * 
 * Handles user registration by email (NO PASSWORD)
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/response.php';

class AuthController {
    /**
     * Register or get user by email (no password needed)
     * 
     * Expected POST body:
     * {
     *   "email": "string",
     *   "name": "string" (optional),
     *   "picture": "string" (optional)
     * }
     */
    public static function registerOrGet() {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields
        if (!isset($data['email'])) {
            Response::error('Email is required', 400);
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format', 400);
        }

        $userModel = new User();

        // Check if user exists
        $existingUser = $userModel->findByEmail($data['email']);
        
        if ($existingUser) {
            // User exists - update name/picture if provided
            if (isset($data['name']) || isset($data['picture'])) {
                $userModel->id = $existingUser['id'];
                $userModel->email = $data['email'];
                $userModel->name = $data['name'] ?? $existingUser['name'];
                $userModel->picture = $data['picture'] ?? $existingUser['picture'];
                $userModel->update();
            }

            Response::success([
                'user' => [
                    'id' => $existingUser['id'],
                    'email' => $data['email'],
                    'name' => $data['name'] ?? $existingUser['name'],
                    'picture' => $data['picture'] ?? $existingUser['picture']
                ]
            ], 200);
        } else {
            // Create new user
            $userModel->email = $data['email'];
            $userModel->name = $data['name'] ?? null;
            $userModel->picture = $data['picture'] ?? null;

            if ($userModel->create()) {
                Response::success([
                    'user' => [
                        'id' => $userModel->id,
                        'email' => $data['email'],
                        'name' => $data['name'] ?? null,
                        'picture' => $data['picture'] ?? null
                    ]
                ], 201);
            } else {
                Response::error('Failed to create user', 500);
            }
        }
    }

    /**
     * Health check endpoint
     */
    public static function healthCheck() {
        Response::success([
            'status' => 'ok',
            'version' => API_VERSION,
            'timestamp' => time()
        ]);
    }
}
