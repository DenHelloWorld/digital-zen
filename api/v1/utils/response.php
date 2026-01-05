<?php
/**
 * Response Utility
 * 
 * Helper functions for sending consistent JSON responses
 */

class Response {
    /**
     * Set CORS headers
     */
    public static function setCorsHeaders() {
        // Get origin from request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        
        // For Chrome extensions, we need to allow specific origins
        if (strpos($origin, 'chrome-extension://') === 0) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 3600");
    }

    /**
     * Send success response
     * 
     * @param mixed $data Response data
     * @param int $statusCode HTTP status code
     */
    public static function success($data = null, $statusCode = 200) {
        self::setCorsHeaders();
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        echo json_encode([
            'success' => true,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send error response
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @param mixed $details Additional error details
     */
    public static function error($message, $statusCode = 400, $details = null) {
        self::setCorsHeaders();
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'success' => false,
            'error' => $message
        ];

        if ($details !== null && DEBUG_MODE) {
            $response['details'] = $details;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Handle OPTIONS request for CORS preflight
     */
    public static function handlePreflight() {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            self::setCorsHeaders();
            http_response_code(200);
            exit;
        }
    }
}
