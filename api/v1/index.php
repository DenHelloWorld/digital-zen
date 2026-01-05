<?php
/**
 * Digital Zen API - Main Entry Point
 * Version 1.0
 * 
 * This API provides backend services for the Digital Zen Chrome extension.
 * All requests must include X-API-Key header for authentication.
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Include dependencies
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/utils/response.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/PeriodController.php';

// Handle CORS preflight
Response::handlePreflight();

// Verify API key for all requests
if (!AuthMiddleware::verifyApiKey()) {
    exit;
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path if API is in subdirectory
$basePath = '/api/v1';
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}

// Remove trailing slash
$path = rtrim($path, '/');

// Route requests
try {
    switch ($path) {
        // Auth / User routes
        case '/user':
            if ($method === 'POST') {
                AuthController::registerOrGet();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;

        case '/health':
            if ($method === 'GET') {
                AuthController::healthCheck();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;

        // Period routes
        case '/periods':
            if ($method === 'GET') {
                PeriodController::getAll();
            } elseif ($method === 'POST') {
                PeriodController::create();
            } else {
                Response::error('Method not allowed', 405);
            }
            break;

        default:
            // Handle /periods/{id} routes
            if (preg_match('/^\/periods\/([^\/]+)$/', $path, $matches)) {
                $id = $matches[1];
                
                if ($method === 'GET') {
                    PeriodController::getById($id);
                } elseif ($method === 'PUT') {
                    PeriodController::update($id);
                } elseif ($method === 'DELETE') {
                    PeriodController::delete($id);
                } else {
                    Response::error('Method not allowed', 405);
                }
            } else {
                Response::error('Not found', 404);
            }
            break;
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error', 500, DEBUG_MODE ? $e->getMessage() : null);
}
