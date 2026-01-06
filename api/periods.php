<?php
/**
 * Periods API Endpoint
 * This file handles CRUD operations for periods (create, read, update, delete)
 */

require_once 'helpers.php';

// Setup CORS headers first
setupCorsHeaders();

// Check API key for security
checkSecretKey();

// Connect to database
$database = connectToDatabase();

// Get request method (GET, POST, PUT, DELETE)
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Handle different request methods
if ($requestMethod === 'GET') {
    // Get periods
    handleGetPeriods($database);
    
} else if ($requestMethod === 'POST') {
    // Create new period
    handleCreatePeriod($database);
    
} else if ($requestMethod === 'PUT') {
    // Update existing period
    handleUpdatePeriod($database);
    
} else if ($requestMethod === 'DELETE') {
    // Delete period
    handleDeletePeriod($database);
    
} else {
    // Method not allowed
    sendErrorResponse('Method not allowed', 405);
}

/**
 * Handle GET request - retrieve periods by user email or user ID
 * 
 * @param PDO $database Database connection
 * @return void
 */
function handleGetPeriods($database) {
    // Get user_email or user_id from query parameters
    $userEmail = '';
    if (isset($_GET['user_email'])) {
        $userEmail = $_GET['user_email'];
    }
    
    $userId = '';
    if (isset($_GET['user_id'])) {
        $userId = $_GET['user_id'];
    }
    
    // Check that at least one parameter is provided
    if (empty($userEmail) && empty($userId)) {
        sendErrorResponse('user_email or user_id is required');
    }
    
    // Find user in database
    $user = findUserByEmailOrId($database, $userEmail, $userId);
    
    if (!$user) {
        // User not found, return empty periods
        sendSuccessResponse([
            'user' => null,
            'periods' => []
        ]);
        return;
    }
    
    // Get all periods for this user
    $periods = getUserPeriods($database, $user['id']);
    
    // Send response with periods
    sendSuccessResponse([
        'user' => [
            'id' => $user['id'],
            'email' => $user['user_email'],
            'user_id' => $user['user_external_id']
        ],
        'periods' => $periods
    ]);
}

/**
 * Handle POST request - create new period
 * 
 * @param PDO $database Database connection
 * @return void
 */
function handleCreatePeriod($database) {
    // Get data from request body
    $requestData = getRequestBody();
    
    // Check required fields
    if (!isset($requestData['user_email']) && !isset($requestData['user_id'])) {
        sendErrorResponse('user_email or user_id is required');
    }
    
    if (!isset($requestData['period'])) {
        sendErrorResponse('period data is required');
    }
    
    $userEmail = $requestData['user_email'] ?? '';
    $userId = $requestData['user_id'] ?? '';
    $periodData = $requestData['period'];
    
    // Validate period data
    if (!isset($periodData['id']) || !isset($periodData['name'])) {
        sendErrorResponse('period id and name are required');
    }
    
    // Find user
    $user = findUserByEmailOrId($database, $userEmail, $userId);
    
    if (!$user) {
        sendErrorResponse('User not found', 404);
    }
    
    // Create period
    try {
        createPeriod($database, $user['id'], $periodData);
        
        sendSuccessResponse([
            'message' => 'Period created successfully',
            'period_id' => $periodData['id']
        ]);
    } catch (Exception $error) {
        sendErrorResponse('Failed to create period: ' . $error->getMessage(), 500);
    }
}

/**
 * Handle PUT request - update existing period
 * 
 * @param PDO $database Database connection
 * @return void
 */
function handleUpdatePeriod($database) {
    // Get data from request body
    $requestData = getRequestBody();
    
    // Check required fields
    if (!isset($requestData['period_id'])) {
        sendErrorResponse('period_id is required');
    }
    
    if (!isset($requestData['period'])) {
        sendErrorResponse('period data is required');
    }
    
    $periodId = $requestData['period_id'];
    $periodData = $requestData['period'];
    
    // Check if period exists
    $existingPeriod = getPeriodById($database, $periodId);
    
    if (!$existingPeriod) {
        sendErrorResponse('Period not found', 404);
    }
    
    // Update period
    try {
        updatePeriod($database, $periodId, $periodData);
        
        sendSuccessResponse([
            'message' => 'Period updated successfully',
            'period_id' => $periodId
        ]);
    } catch (Exception $error) {
        sendErrorResponse('Failed to update period: ' . $error->getMessage(), 500);
    }
}

/**
 * Handle DELETE request - delete period
 * 
 * @param PDO $database Database connection
 * @return void
 */
function handleDeletePeriod($database) {
    // Get period_id from query parameters
    $periodId = '';
    if (isset($_GET['period_id'])) {
        $periodId = $_GET['period_id'];
    }
    
    if (empty($periodId)) {
        sendErrorResponse('period_id is required');
    }
    
    // Check if period exists
    $existingPeriod = getPeriodById($database, $periodId);
    
    if (!$existingPeriod) {
        sendErrorResponse('Period not found', 404);
    }
    
    // Delete period (cascade will delete associated websites and focused_times)
    try {
        deletePeriod($database, $periodId);
        
        sendSuccessResponse([
            'message' => 'Period deleted successfully',
            'period_id' => $periodId
        ]);
    } catch (Exception $error) {
        sendErrorResponse('Failed to delete period: ' . $error->getMessage(), 500);
    }
}

/**
 * Find user by email or user_id
 * 
 * @param PDO $database Database connection
 * @param string $email User email
 * @param string $userId User external ID
 * @return array|null User data or null if not found
 */
function findUserByEmailOrId($database, $email, $userId) {
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

/**
 * Get all periods for user
 * 
 * @param PDO $database Database connection
 * @param int $userId User ID
 * @return array Array of periods with their websites and focused times
 */
function getUserPeriods($database, $userId) {
    // Get all periods for this user
    $query = "SELECT * FROM periods WHERE user_id = :user_id ORDER BY created_at DESC";
    $statement = $database->prepare($query);
    $statement->bindParam(':user_id', $userId);
    $statement->execute();
    $periods = $statement->fetchAll();
    
    // For each period, get websites and focused times
    $result = [];
    foreach ($periods as $period) {
        $periodId = $period['id'];
        
        // Get websites for this period
        $websitesQuery = "SELECT * FROM websites WHERE period_id = :period_id";
        $websitesStatement = $database->prepare($websitesQuery);
        $websitesStatement->bindParam(':period_id', $periodId);
        $websitesStatement->execute();
        $websites = $websitesStatement->fetchAll();
        
        // Get focused times for this period
        $timesQuery = "SELECT * FROM focused_times WHERE period_id = :period_id";
        $timesStatement = $database->prepare($timesQuery);
        $timesStatement->bindParam(':period_id', $periodId);
        $timesStatement->execute();
        $focusedTimes = $timesStatement->fetchAll();
        
        // Format period data
        $periodData = [
            'id' => $period['id'],
            'name' => $period['period_name'],
            'description' => $period['period_description'],
            'startFrom' => $period['start_from'],
            'endTo' => $period['end_to'],
            'daysOfWeek' => json_decode($period['days_of_week'], true),
            'isFocused' => (bool)$period['is_focused'],
            'sessionStartTime' => $period['session_start_time'],
            'webSites' => [],
            'focusedTimes' => []
        ];
        
        // Format websites
        foreach ($websites as $website) {
            $periodData['webSites'][] = [
                'id' => $website['id'],
                'name' => $website['website_name'],
                'description' => $website['website_description'],
                'url' => $website['website_url'],
                'imageUrl' => $website['image_url'],
                'iconUrl' => $website['icon_url'],
                'type' => $website['website_type'],
                'isBlocked' => (bool)$website['is_blocked']
            ];
        }
        
        // Format focused times
        foreach ($focusedTimes as $time) {
            $periodData['focusedTimes'][] = [
                'id' => $time['id'],
                'periodId' => $time['period_id'],
                'startFrom' => $time['start_from'],
                'endTo' => $time['end_to']
            ];
        }
        
        $result[] = $periodData;
    }
    
    return $result;
}

/**
 * Get period by ID
 * 
 * @param PDO $database Database connection
 * @param string $periodId Period ID
 * @return array|null Period data or null if not found
 */
function getPeriodById($database, $periodId) {
    $query = "SELECT * FROM periods WHERE id = :period_id LIMIT 1";
    $statement = $database->prepare($query);
    $statement->bindParam(':period_id', $periodId);
    $statement->execute();
    
    $period = $statement->fetch();
    
    if ($period) {
        return $period;
    }
    
    return null;
}

/**
 * Create new period
 * 
 * @param PDO $database Database connection
 * @param int $userId User ID
 * @param array $periodData Period data
 * @return void
 */
function createPeriod($database, $userId, $periodData) {
    // Start transaction
    $database->beginTransaction();
    
    try {
        // Insert period
        $periodQuery = "INSERT INTO periods (
            id, user_id, period_name, period_description, 
            start_from, end_to, days_of_week, is_focused, session_start_time
        ) VALUES (
            :id, :user_id, :name, :description, 
            :start_from, :end_to, :days_of_week, :is_focused, :session_start_time
        )";
        
        $periodStatement = $database->prepare($periodQuery);
        
        $periodId = $periodData['id'];
        $periodName = $periodData['name'];
        $periodDescription = $periodData['description'] ?? '';
        $startFrom = $periodData['startFrom'] ?? null;
        $endTo = $periodData['endTo'] ?? null;
        $daysOfWeek = json_encode($periodData['daysOfWeek'] ?? []);
        $isFocused = isset($periodData['isFocused']) ? (int)$periodData['isFocused'] : 0;
        $sessionStartTime = $periodData['sessionStartTime'] ?? null;
        
        $periodStatement->bindParam(':id', $periodId);
        $periodStatement->bindParam(':user_id', $userId);
        $periodStatement->bindParam(':name', $periodName);
        $periodStatement->bindParam(':description', $periodDescription);
        $periodStatement->bindParam(':start_from', $startFrom);
        $periodStatement->bindParam(':end_to', $endTo);
        $periodStatement->bindParam(':days_of_week', $daysOfWeek);
        $periodStatement->bindParam(':is_focused', $isFocused);
        $periodStatement->bindParam(':session_start_time', $sessionStartTime);
        
        $periodStatement->execute();
        
        // Insert websites if provided
        if (isset($periodData['webSites']) && is_array($periodData['webSites'])) {
            foreach ($periodData['webSites'] as $website) {
                insertWebsite($database, $periodId, $website);
            }
        }
        
        // Insert focused times if provided
        if (isset($periodData['focusedTimes']) && is_array($periodData['focusedTimes'])) {
            foreach ($periodData['focusedTimes'] as $time) {
                insertFocusedTime($database, $periodId, $time);
            }
        }
        
        // Commit transaction
        $database->commit();
        
    } catch (Exception $error) {
        // Rollback on error
        $database->rollBack();
        throw $error;
    }
}

/**
 * Update existing period
 * 
 * @param PDO $database Database connection
 * @param string $periodId Period ID
 * @param array $periodData Updated period data
 * @return void
 */
function updatePeriod($database, $periodId, $periodData) {
    // Start transaction
    $database->beginTransaction();
    
    try {
        // Update period
        $periodQuery = "UPDATE periods SET 
            period_name = :name,
            period_description = :description,
            start_from = :start_from,
            end_to = :end_to,
            days_of_week = :days_of_week,
            is_focused = :is_focused,
            session_start_time = :session_start_time
        WHERE id = :id";
        
        $periodStatement = $database->prepare($periodQuery);
        
        $periodName = $periodData['name'] ?? '';
        $periodDescription = $periodData['description'] ?? '';
        $startFrom = $periodData['startFrom'] ?? null;
        $endTo = $periodData['endTo'] ?? null;
        $daysOfWeek = json_encode($periodData['daysOfWeek'] ?? []);
        $isFocused = isset($periodData['isFocused']) ? (int)$periodData['isFocused'] : 0;
        $sessionStartTime = $periodData['sessionStartTime'] ?? null;
        
        $periodStatement->bindParam(':id', $periodId);
        $periodStatement->bindParam(':name', $periodName);
        $periodStatement->bindParam(':description', $periodDescription);
        $periodStatement->bindParam(':start_from', $startFrom);
        $periodStatement->bindParam(':end_to', $endTo);
        $periodStatement->bindParam(':days_of_week', $daysOfWeek);
        $periodStatement->bindParam(':is_focused', $isFocused);
        $periodStatement->bindParam(':session_start_time', $sessionStartTime);
        
        $periodStatement->execute();
        
        // Delete existing websites and focused times
        $deleteWebsitesQuery = "DELETE FROM websites WHERE period_id = :period_id";
        $deleteWebsitesStatement = $database->prepare($deleteWebsitesQuery);
        $deleteWebsitesStatement->bindParam(':period_id', $periodId);
        $deleteWebsitesStatement->execute();
        
        $deleteTimesQuery = "DELETE FROM focused_times WHERE period_id = :period_id";
        $deleteTimesStatement = $database->prepare($deleteTimesQuery);
        $deleteTimesStatement->bindParam(':period_id', $periodId);
        $deleteTimesStatement->execute();
        
        // Insert new websites if provided
        if (isset($periodData['webSites']) && is_array($periodData['webSites'])) {
            foreach ($periodData['webSites'] as $website) {
                insertWebsite($database, $periodId, $website);
            }
        }
        
        // Insert new focused times if provided
        if (isset($periodData['focusedTimes']) && is_array($periodData['focusedTimes'])) {
            foreach ($periodData['focusedTimes'] as $time) {
                insertFocusedTime($database, $periodId, $time);
            }
        }
        
        // Commit transaction
        $database->commit();
        
    } catch (Exception $error) {
        // Rollback on error
        $database->rollBack();
        throw $error;
    }
}

/**
 * Delete period
 * 
 * @param PDO $database Database connection
 * @param string $periodId Period ID
 * @return void
 */
function deletePeriod($database, $periodId) {
    // Delete period (cascade will handle websites and focused_times)
    $query = "DELETE FROM periods WHERE id = :period_id";
    $statement = $database->prepare($query);
    $statement->bindParam(':period_id', $periodId);
    $statement->execute();
}

/**
 * Insert website for period
 * 
 * @param PDO $database Database connection
 * @param string $periodId Period ID
 * @param array $website Website data
 * @return void
 */
function insertWebsite($database, $periodId, $website) {
    $websiteQuery = "INSERT INTO websites (
        id, period_id, website_name, website_description,
        website_url, image_url, icon_url, website_type, is_blocked
    ) VALUES (
        :id, :period_id, :name, :description,
        :url, :image_url, :icon_url, :type, :is_blocked
    )";
    
    $websiteStatement = $database->prepare($websiteQuery);
    
    $websiteId = $website['id'];
    $websiteName = $website['name'];
    $websiteDescription = $website['description'] ?? '';
    $websiteUrl = $website['url'];
    $imageUrl = $website['imageUrl'] ?? '';
    $iconUrl = $website['iconUrl'] ?? '';
    $websiteType = $website['type'] ?? 'Default';
    $isBlocked = isset($website['isBlocked']) ? (int)$website['isBlocked'] : 0;
    
    $websiteStatement->bindParam(':id', $websiteId);
    $websiteStatement->bindParam(':period_id', $periodId);
    $websiteStatement->bindParam(':name', $websiteName);
    $websiteStatement->bindParam(':description', $websiteDescription);
    $websiteStatement->bindParam(':url', $websiteUrl);
    $websiteStatement->bindParam(':image_url', $imageUrl);
    $websiteStatement->bindParam(':icon_url', $iconUrl);
    $websiteStatement->bindParam(':type', $websiteType);
    $websiteStatement->bindParam(':is_blocked', $isBlocked);
    
    $websiteStatement->execute();
}

/**
 * Insert focused time for period
 * 
 * @param PDO $database Database connection
 * @param string $periodId Period ID
 * @param array $time Focused time data
 * @return void
 */
function insertFocusedTime($database, $periodId, $time) {
    $timeQuery = "INSERT INTO focused_times (
        id, period_id, start_from, end_to
    ) VALUES (
        :id, :period_id, :start_from, :end_to
    )";
    
    $timeStatement = $database->prepare($timeQuery);
    
    $timeId = $time['id'];
    $timeStartFrom = $time['startFrom'] ?? null;
    $timeEndTo = $time['endTo'] ?? null;
    
    $timeStatement->bindParam(':id', $timeId);
    $timeStatement->bindParam(':period_id', $periodId);
    $timeStatement->bindParam(':start_from', $timeStartFrom);
    $timeStatement->bindParam(':end_to', $timeEndTo);
    
    $timeStatement->execute();
}
