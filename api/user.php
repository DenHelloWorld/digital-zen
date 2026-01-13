<?php
/**
 * User Data API Endpoint
 * This file handles saving and retrieving user data (periods and websites)
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
    // Get user data
    handleGetUserData($database);

} else if ($requestMethod === 'POST') {
    // Save user data
    handleSaveUserData($database);

} else {
    // Method not allowed
    sendErrorResponse('Method not allowed', 405);
}

/**
 * Handle GET request - retrieve user data
 *
 * @param PDO $database Database connection
 * @return void
 */
function handleGetUserData($database) {
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
    $user = findUser($database, $userEmail, $userId);

    if (!$user) {
        // User not found, return empty data
        sendSuccessResponse([
            'user' => null,
            'periods' => []
        ]);
        return;
    }

    // Get all periods for this user
    $periods = getUserPeriods($database, $user['id']);

    // Send response with user data
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
 * Handle POST request - save user data
 *
 * @param PDO $database Database connection
 * @return void
 */
function handleSaveUserData($database) {
    // Get data from request body
    $requestData = getRequestBody();

    // Check required fields
    if (!isset($requestData['user_email'])) {
        sendErrorResponse('user_email is required');
    }

    if (!isset($requestData['user_id'])) {
        sendErrorResponse('user_id is required');
    }

    $userEmail = $requestData['user_email'];
    $userId = $requestData['user_id'];

    // Find or create user
    $user = findUser($database, $userEmail, $userId);

    if (!$user) {
        // Create new user
        $user = createUser($database, $userEmail, $userId);
    }

    // Get periods from request (if provided)
    $periods = [];
    if (isset($requestData['periods']) && is_array($requestData['periods'])) {
        $periods = $requestData['periods'];
    }

    // Save periods for this user
    saveUserPeriods($database, $user['id'], $periods);

    // Send success response
    sendSuccessResponse([
        'message' => 'Data saved successfully',
        'user_id' => $user['id']
    ]);
}

/**
 * Create new user
 *
 * @param PDO $database Database connection
 * @param string $email User email
 * @param string $userId User external ID
 * @return array Created user data
 */
function createUser($database, $email, $userId) {
    // Prepare SQL query
    $query = "INSERT INTO users (user_email, user_external_id) VALUES (:email, :user_id)";

    // Prepare statement
    $statement = $database->prepare($query);

    // Bind parameters
    $statement->bindParam(':email', $email);
    $statement->bindParam(':user_id', $userId);

    // Execute query
    $statement->execute();

    // Get inserted user ID
    $insertedId = $database->lastInsertId();

    // Return user data
    return [
        'id' => $insertedId,
        'user_email' => $email,
        'user_external_id' => $userId
    ];
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
 * Save periods for user
 * This function uses database transaction to ensure data consistency
 *
 * @param PDO $database Database connection
 * @param int $userId User ID
 * @param array $periods Array of periods to save
 * @return void
 */
function saveUserPeriods($database, $userId, $periods) {
    // Start database transaction for data consistency
    // If any operation fails, all changes will be rolled back
    $database->beginTransaction();

    try {
        // Delete all existing periods for this user first
        $deleteQuery = "DELETE FROM periods WHERE user_id = :user_id";
        $deleteStatement = $database->prepare($deleteQuery);
        $deleteStatement->bindParam(':user_id', $userId);
        $deleteStatement->execute();

        // Insert each period
        foreach ($periods as $period) {
            // Insert period
            $periodQuery = "INSERT INTO periods (
                id, user_id, period_name, period_description,
                start_from, end_to, days_of_week, is_focused, session_start_time
            ) VALUES (
                :id, :user_id, :name, :description,
                :start_from, :end_to, :days_of_week, :is_focused, :session_start_time
            )";

            $periodStatement = $database->prepare($periodQuery);

            $periodId = $period['id'];
            $periodName = $period['name'];
            $periodDescription = $period['description'] ?? '';
            $startFrom = $period['startFrom'] ?? null;
            $endTo = $period['endTo'] ?? null;
            $daysOfWeek = json_encode($period['daysOfWeek'] ?? []);
            $isFocused = isset($period['isFocused']) ? (int)$period['isFocused'] : 0;
            $sessionStartTime = $period['sessionStartTime'] ?? null;

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

            // Insert websites for this period
            if (isset($period['webSites']) && is_array($period['webSites'])) {
                foreach ($period['webSites'] as $website) {
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
            }

            // Insert focused times for this period
            if (isset($period['focusedTimes']) && is_array($period['focusedTimes'])) {
                foreach ($period['focusedTimes'] as $time) {
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
            }
        }

        // All operations successful - commit transaction
        $database->commit();

    } catch (Exception $error) {
        // Something went wrong - rollback all changes
        $database->rollBack();

        // Re-throw the error to be handled by caller
        throw $error;
    }
}
