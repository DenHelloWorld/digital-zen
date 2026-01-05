<?php
/**
 * Period Controller
 * 
 * Handles CRUD operations for focus periods
 */

require_once __DIR__ . '/../models/Period.php';
require_once __DIR__ . '/../models/Website.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/response.php';

class PeriodController {
    /**
     * Get user ID from email in request header
     */
    private static function getUserId() {
        $headers = getallheaders();
        
        $userEmail = null;
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'x-user-email') {
                $userEmail = $value;
                break;
            }
        }

        if (!$userEmail) {
            Response::error('User email is required in X-User-Email header', 401);
            return false;
        }

        // Validate email format
        if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format', 400);
            return false;
        }

        // Find user by email
        $userModel = new User();
        $user = $userModel->findByEmail($userEmail);

        if (!$user) {
            Response::error('User not found. Please register first.', 404);
            return false;
        }

        return $user['id'];
    }

    /**
     * Get all periods for user
     */
    public static function getAll() {
        $userId = self::getUserId();
        if (!$userId) {
            return;
        }

        $periodModel = new Period();
        $periods = $periodModel->getAllByUser($userId);

        // Get websites for each period
        $websiteModel = new Website();
        foreach ($periods as &$period) {
            $period['webSites'] = $websiteModel->getAllByPeriod($period['id']);
            $period['days_of_week'] = json_decode($period['days_of_week'], true);
            $period['focusedTimes'] = []; // TODO: Implement focused times
        }

        Response::success($periods);
    }

    /**
     * Get single period by ID
     */
    public static function getById($id) {
        $userId = self::getUserId();
        if (!$userId) {
            return;
        }

        $periodModel = new Period();
        $period = $periodModel->getById($id, $userId);

        if (!$period) {
            Response::error('Period not found', 404);
        }

        // Get websites for period
        $websiteModel = new Website();
        $period['webSites'] = $websiteModel->getAllByPeriod($period['id']);
        $period['days_of_week'] = json_decode($period['days_of_week'], true);
        $period['focusedTimes'] = []; // TODO: Implement focused times

        Response::success($period);
    }

    /**
     * Create new period
     * 
     * Expected POST body matches IFocus.Period interface
     */
    public static function create() {
        $userId = self::getUserId();
        if (!$userId) {
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields
        if (!isset($data['id']) || !isset($data['name'])) {
            Response::error('ID and name are required', 400);
        }

        $periodModel = new Period();
        $periodModel->id = $data['id'];
        $periodModel->user_id = $userId;
        $periodModel->name = $data['name'];
        $periodModel->description = $data['description'] ?? '';
        $periodModel->start_from = isset($data['startFrom']) ? $data['startFrom'] : null;
        $periodModel->end_to = isset($data['endTo']) ? $data['endTo'] : null;
        $periodModel->days_of_week = json_encode($data['daysOfWeek'] ?? []);
        $periodModel->is_focused = $data['isFocused'] ?? false;
        $periodModel->session_start_time = isset($data['sessionStartTime']) ? $data['sessionStartTime'] : null;

        if ($periodModel->create()) {
            // Create websites if provided
            if (isset($data['webSites']) && is_array($data['webSites'])) {
                $websiteModel = new Website();
                foreach ($data['webSites'] as $site) {
                    $websiteModel->id = $site['id'];
                    $websiteModel->period_id = $data['id'];
                    $websiteModel->name = $site['name'];
                    $websiteModel->description = $site['description'] ?? '';
                    $websiteModel->url = $site['url'];
                    $websiteModel->image_url = $site['imageUrl'] ?? '';
                    $websiteModel->icon_url = $site['iconUrl'] ?? '';
                    $websiteModel->type = $site['type'] ?? 'Default';
                    $websiteModel->is_blocked = $site['isBlocked'] ?? false;
                    $websiteModel->create();
                }
            }

            Response::success(['id' => $data['id']], 201);
        } else {
            Response::error('Failed to create period', 500);
        }
    }

    /**
     * Update period
     */
    public static function update($id) {
        $userId = self::getUserId();
        if (!$userId) {
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $periodModel = new Period();
        
        // Verify period exists and belongs to user
        $existingPeriod = $periodModel->getById($id, $userId);
        if (!$existingPeriod) {
            Response::error('Period not found', 404);
        }

        $periodModel->id = $id;
        $periodModel->user_id = $userId;
        $periodModel->name = $data['name'] ?? $existingPeriod['name'];
        $periodModel->description = $data['description'] ?? $existingPeriod['description'];
        $periodModel->start_from = isset($data['startFrom']) ? $data['startFrom'] : $existingPeriod['start_from'];
        $periodModel->end_to = isset($data['endTo']) ? $data['endTo'] : $existingPeriod['end_to'];
        $periodModel->days_of_week = isset($data['daysOfWeek']) ? json_encode($data['daysOfWeek']) : $existingPeriod['days_of_week'];
        $periodModel->is_focused = isset($data['isFocused']) ? $data['isFocused'] : $existingPeriod['is_focused'];
        $periodModel->session_start_time = isset($data['sessionStartTime']) ? $data['sessionStartTime'] : $existingPeriod['session_start_time'];

        if ($periodModel->update()) {
            // Update websites if provided
            if (isset($data['webSites']) && is_array($data['webSites'])) {
                $websiteModel = new Website();
                
                // Delete existing websites
                $websiteModel->deleteByPeriod($id);
                
                // Create new websites
                foreach ($data['webSites'] as $site) {
                    $websiteModel->id = $site['id'];
                    $websiteModel->period_id = $id;
                    $websiteModel->name = $site['name'];
                    $websiteModel->description = $site['description'] ?? '';
                    $websiteModel->url = $site['url'];
                    $websiteModel->image_url = $site['imageUrl'] ?? '';
                    $websiteModel->icon_url = $site['iconUrl'] ?? '';
                    $websiteModel->type = $site['type'] ?? 'Default';
                    $websiteModel->is_blocked = $site['isBlocked'] ?? false;
                    $websiteModel->create();
                }
            }

            Response::success(['id' => $id]);
        } else {
            Response::error('Failed to update period', 500);
        }
    }

    /**
     * Delete period
     */
    public static function delete($id) {
        $userId = self::getUserId();
        if (!$userId) {
            return;
        }

        $periodModel = new Period();
        
        if ($periodModel->delete($id, $userId)) {
            Response::success(['id' => $id]);
        } else {
            Response::error('Failed to delete period or period not found', 404);
        }
    }
}
