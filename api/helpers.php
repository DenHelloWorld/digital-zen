<?php
/**
 * Helper Functions File
 * Contains simple functions that are used in API
 */

require_once 'config.php';

/**
 * Connect to database
 * This function creates connection to MySQL database
 * 
 * @return PDO Database connection object
 */
function connectToDatabase() {
    // Database connection string
    $connectionString = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    
    try {
        // Create new connection
        $database = new PDO($connectionString, DB_USER, DB_PASS);
        
        // Set error mode - will throw exceptions
        $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Return results as associative array
        $database->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        
        return $database;
        
    } catch (PDOException $error) {
        // If connection failed, return error
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to connect to database'
        ]);
        exit();
    }
}

/**
 * Check secret key
 * This function checks that request came from our application
 * 
 * @return void
 */
function checkSecretKey() {
    // Get all request headers
    $headers = getallheaders();
    
    // Get key from X-API-Key header (case-insensitive)
    $receivedKey = '';
    
    // Try different case variations since some servers normalize headers
    if (isset($headers['X-API-Key'])) {
        $receivedKey = $headers['X-API-Key'];
    } elseif (isset($headers['x-api-key'])) {
        $receivedKey = $headers['x-api-key'];
    } elseif (isset($headers['X-Api-Key'])) {
        $receivedKey = $headers['X-Api-Key'];
    } else {
        // Fallback: search case-insensitively
        foreach ($headers as $name => $value) {
            if (strtolower($name) === 'x-api-key') {
                $receivedKey = $value;
                break;
            }
        }
    }
    
    // Trim whitespace from received key
    $receivedKey = trim($receivedKey);
    
    // Check that key is not empty and matches our key
    $isKeyValid = !empty(API_SECRET_KEY) && $receivedKey === API_SECRET_KEY;
    
    if (!$isKeyValid) {
        // If key is invalid, return 401 error (Unauthorized)
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid API key'
        ]);
        exit();
    }
}

/**
 * Setup CORS headers
 * CORS allows requests from other domains (from Chrome extension)
 * 
 * @return void
 */
function setupCorsHeaders() {
    // Get origin (where request came from)
    $origin = '';
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        $origin = $_SERVER['HTTP_ORIGIN'];
    }
    
    // Allow requests only from Chrome extension
    // TODO: For production, consider restricting to specific extension ID
    // Example: if ($origin === 'chrome-extension://YOUR_EXTENSION_ID_HERE')
    if (strpos($origin, 'chrome-extension://') === 0) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    }
    
    // Allowed methods
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    
    // Allowed headers
    header("Access-Control-Allow-Headers: Content-Type, X-API-Key");
    
    // Content type - JSON
    header("Content-Type: application/json; charset=UTF-8");
    
    // If this is OPTIONS preflight request, respond OK immediately
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Get data from request body
 * This function reads JSON from POST/PUT request body
 * 
 * @return array Data from request as associative array
 */
function getRequestBody() {
    // Read request content
    $jsonString = file_get_contents('php://input');
    
    // Convert JSON to array
    $data = json_decode($jsonString, true);
    
    // If no data, return empty array
    if ($data === null) {
        return [];
    }
    
    return $data;
}

/**
 * Send success response
 * 
 * @param mixed $data Data to send
 * @return void
 */
function sendSuccessResponse($data) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    exit();
}

/**
 * Send error response
 * 
 * @param string $message Error message
 * @param int $code HTTP error code (400, 404, 500, etc.)
 * @return void
 */
function sendErrorResponse($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit();
}

/**
 * Find user by email or user_id
 * 
 * @param PDO $database Database connection
 * @param string $email User email
 * @param string $userId User external ID
 * @return array|null User data or null if not found
 */
function findUser($database, $email, $userId) {
    // Prepare SQL query
    $query = "SELECT * FROM users WHERE user_email = :email OR user_external_id = :user_id LIMIT 1";
    
    // Prepare statement
    $statement = $database->prepare($query);
    
    // Bind parameters
    $statement->bindParam(':email', $email);
    $statement->bindParam(':user_id', $userId);
    
    // Execute query
    $statement->execute();
    
    // Get result
    $user = $statement->fetch();
    
    // Return user or null
    if ($user) {
        return $user;
    }
    
    return null;
}
