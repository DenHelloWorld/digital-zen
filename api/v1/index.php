<?php

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

spl_autoload_register(function ($className) {
    $dirs = ['controllers', 'services', 'middleware', 'utils', 'config', 'traits', 'exceptions'];
    foreach ($dirs as $dir) {
        $file = __DIR__ . "/$dir/$className.php";
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';

// Validate critical configuration at startup
// This ensures deployment issues are caught early with clear error messages
// rather than causing runtime 500 errors
try {
    Config::validateStartupConfig();
} catch (ConfigurationException $e) {
    error_log("Application startup failed: " . $e->getMessage() . ". Please review the JWT_AUTH_SETUP.md documentation for configuration requirements.");
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Application configuration error',
        'message' => 'The application is not properly configured. Please check server logs for details.'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/v1', '', $path);
$pathParts = array_values(array_filter(explode('/', $path)));

$authMiddleware = new AuthMiddleware();
$user = null;
$tokenInfo = null;

/**
 * Authentication Flow:
 * 
 * NEW FLOW (JWT-based):
 * 1. User authenticates with Google in the Chrome extension
 * 2. Extension sends POST request to /auth/google with Google OAuth token
 *    - This endpoint validates Google token and creates/gets user
 *    - Returns JWT token for subsequent requests
 * 3. Extension stores JWT token
 * 4. Subsequent requests use JWT token in Authorization header
 *    - JWT is validated without external API calls
 *    - Fast and scalable
 * 
 * LEGACY FLOW (backward compatibility):
 * 1. User authenticates with Google in the Chrome extension
 * 2. Extension sends POST request to /users with Google OAuth token in Authorization header
 *    - This endpoint validates the token but does NOT require an existing user in DB
 *    - Creates a new user record or returns existing user
 * 3. Subsequent requests to other endpoints require an existing user in DB
 *    - Token is validated AND user must exist in database
 * 
 * This allows gradual migration from Google tokens to JWT tokens.
 */

// Skip authentication for specific public endpoints
// SECURITY NOTE: Using explicit whitelist to prevent accidental exposure of new endpoints
$publicEndpoints = ['auth/google'];
$currentEndpoint = implode('/', array_slice($pathParts, 0, 2));

if (in_array($currentEndpoint, $publicEndpoints, true)) {
    // Public endpoint - no auth required
    $user = null;
    $tokenInfo = null;
}
// For /users (creation) token validation is needed, but existing user is not required
elseif (($pathParts[0] ?? '') === 'users' && $method === 'POST') {
    $authResult = $authMiddleware->authenticate(false);
    $user = $authResult['user'] ?? null;
    $tokenInfo = $authResult['tokenInfo'];
} elseif (($pathParts[0] ?? '') !== 'health') {
    // For all other endpoints, authentication is required
    $authResult = $authMiddleware->authenticate(true);
    $user = $authResult['user'];
    $tokenInfo = $authResult['tokenInfo'] ?? null;
}

try {
    switch ($pathParts[0] ?? '') {
        case 'health':
            Response::success(['status' => 'ok']);
            break;
        
        case 'auth':
            // Authentication endpoints - no auth required (they provide auth)
            $controller = new AuthController();
            if ($method === 'POST' && ($pathParts[1] ?? '') === 'google') {
                // POST /auth/google - Exchange Google OAuth token for JWT
                $controller->loginWithGoogle();
            } else {
                Response::error('Endpoint not found', 404);
            }
            break;
            
        case 'users':
            $controller = new UsersController();
            if ($method === 'POST') {
                // Create user on first login
                // Validate that tokenInfo is set (should be set by authentication on line 86-89)
                if ($tokenInfo === null) {
                    Response::error('Authentication required', 401);
                    break;
                }
                $controller->create($tokenInfo);
            } elseif ($method === 'GET' && ($pathParts[1] ?? '') === 'me') {
                // Get information about the current user
                // Validate that user is set (should be set by authentication on line 90-94)
                if ($user === null) {
                    Response::error('Authentication required', 401);
                    break;
                }
                $controller->me($user);
            } else {
                Response::error('Method not allowed', 405);
            }
            break;
            
        case 'periods':
            $controller = new PeriodsController();
            if ($method === 'GET') {
                $controller->index($user['id']);
            } elseif ($method === 'POST') {
                $data = json_decode(file_get_contents('php://input'), true);
                $controller->create($user['id'], $data);
            }
            break;
            
        default:
            Response::error('Endpoint not found', 404);
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error', 500);
}