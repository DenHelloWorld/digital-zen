<?php

class PeriodsController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function index($userId) {
        $stmt = $this->db->prepare("
            SELECT * FROM periods 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        ");
        
        $stmt->execute(['user_id' => $userId]);
        $periods = $stmt->fetchAll();
        
        foreach ($periods as &$period) {
            $period['webSites'] = $this->getWebsites($period['id']);
            $period['focusedTimes'] = $this->getFocusedTimes($period['id']);
            $period['daysOfWeek'] = json_decode($period['days_of_week'], true) ?? [];
        }
        
        Response::success($periods);
    }
    
    public function create($userId, $data) {
        // Validate required fields
        if (!isset($data['id']) || empty($data['id'])) {
            Response::error('Invalid request: period ID is required', 400);
            return;
        }
        
        if (!isset($data['name']) || empty($data['name'])) {
            Response::error('Invalid request: period name is required', 400);
            return;
        }
        
        $this->db->beginTransaction();
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO periods (
                    id, user_id, name, description, 
                    start_from, end_to, days_of_week, is_focused
                )
                VALUES (
                    :id, :user_id, :name, :description,
                    :start_from, :end_to, :days_of_week, :is_focused
                )
            ");
            
            $stmt->execute([
                'id' => $data['id'],
                'user_id' => $userId,
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'start_from' => $data['startFrom'] ?? null,
                'end_to' => $data['endTo'] ?? null,
                'days_of_week' => json_encode($data['daysOfWeek'] ?? []),
                'is_focused' => $data['isFocused'] ?? false
            ]);
            
            if (!empty($data['webSites'])) {
                foreach ($data['webSites'] as $site) {
                    $this->createWebsite($data['id'], $site);
                }
            }
            
            if (!empty($data['focusedTimes'])) {
                foreach ($data['focusedTimes'] as $time) {
                    $this->createFocusedTime($data['id'], $time);
                }
            }
            
            $this->db->commit();
            Response::success(['message' => 'Period created']);
            
        } catch (PDOException $e) {
            $this->db->rollBack();
            // Generate error code with fallback if random_bytes() fails
            try {
                $randomPart = bin2hex(random_bytes(4));
            } catch (Exception $randomException) {
                error_log("Failed to generate random bytes for error code: " . $randomException->getMessage());
                $randomPart = uniqid('', true); // Fallback to uniqid
            }
            $errorCode = 'PERIOD_CREATE_' . time() . '_' . $randomPart;
            // Sanitize user-controlled values to prevent log injection
            $sanitizedUserId = filter_var((string) $userId, FILTER_SANITIZE_NUMBER_INT);
            $sanitizedPeriodId = isset($data['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $data['id']) : 'unknown';
            error_log(sprintf(
                '[%s] Database error during period creation for user_id=%s, period_id=%s: %s',
                $errorCode,
                $sanitizedUserId,
                $sanitizedPeriodId,
                $e->getMessage()
            ));
            Response::error(
                'Database error occurred while creating period. This may be a temporary issue. Please try again. If the problem persists, contact support with reference code: ' . $errorCode,
                500
            );
        } catch (Exception $e) {
            $this->db->rollBack();
            // Generate error code with fallback if random_bytes() fails
            try {
                $randomPart = bin2hex(random_bytes(4));
            } catch (Exception $randomException) {
                error_log("Failed to generate random bytes for error code: " . $randomException->getMessage());
                $randomPart = uniqid('', true); // Fallback to uniqid
            }
            $errorCode = 'PERIOD_CREATE_' . time() . '_' . $randomPart;
            // Sanitize user-controlled values to prevent log injection
            $sanitizedUserId = filter_var((string) $userId, FILTER_SANITIZE_NUMBER_INT);
            $sanitizedPeriodId = isset($data['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $data['id']) : 'unknown';
            error_log(sprintf(
                '[%s] Unexpected error during period creation for user_id=%s, period_id=%s: %s',
                $errorCode,
                $sanitizedUserId,
                $sanitizedPeriodId,
                $e->getMessage()
            ));
            Response::error(
                'An unexpected error occurred while creating period. Please try again. If the problem persists, contact support with reference code: ' . $errorCode,
                500
            );
        }
    }
    
    private function getWebsites($periodId) {
        $stmt = $this->db->prepare("SELECT * FROM websites WHERE period_id = :period_id");
        $stmt->execute(['period_id' => $periodId]);
        return $stmt->fetchAll();
    }
    
    private function getFocusedTimes($periodId) {
        $stmt = $this->db->prepare("SELECT * FROM focused_times WHERE period_id = :period_id");
        $stmt->execute(['period_id' => $periodId]);
        return $stmt->fetchAll();
    }
    
    private function createWebsite($periodId, $site) {
        // Validate required fields
        if (
            !isset($site['id']) || !is_string($site['id']) || trim($site['id']) === '' ||
            !isset($site['name']) || !is_string($site['name']) || trim($site['name']) === '' ||
            !isset($site['url']) || !is_string($site['url']) || trim($site['url']) === ''
        ) {
            error_log("createWebsite: Missing or empty required fields (id, name, or url) in website data");
            throw new Exception('Invalid website data: missing or empty required fields');
        }

        // Validate URL format
        if (filter_var($site['url'], FILTER_VALIDATE_URL) === false) {
            error_log("createWebsite: Invalid URL format in website data: " . $site['url']);
            throw new Exception('Invalid website data: url must be a valid URL');
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO websites (id, period_id, name, url, image_url, icon_url, type, is_blocked)
            VALUES (:id, :period_id, :name, :url, :image_url, :icon_url, :type, :is_blocked)
        ");
        
        $stmt->execute([
            'id' => $site['id'],
            'period_id' => $periodId,
            'name' => $site['name'],
            'url' => $site['url'],
            'image_url' => $site['imageUrl'] ?? '',
            'icon_url' => $site['iconUrl'] ?? '',
            'type' => $site['type'] ?? 'Default',
            'is_blocked' => $site['isBlocked'] ?? false
        ]);
    }
    
    private function createFocusedTime($periodId, $time) {
        // Validate required fields
        if (!isset($time['id']) || !is_string($time['id']) || trim($time['id']) === '') {
            error_log("createFocusedTime: Missing or empty required field 'id' in focused time data");
            throw new Exception('Invalid focused time data: missing or empty required field id');
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO focused_times (id, period_id, start_from, end_to)
            VALUES (:id, :period_id, :start_from, :end_to)
        ");
        
        $stmt->execute([
            'id' => $time['id'],
            'period_id' => $periodId,
            'start_from' => $time['startFrom'] ?? null,
            'end_to' => $time['endTo'] ?? null
        ]);
    }
}