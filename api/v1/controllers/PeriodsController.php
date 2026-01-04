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
        }
        
        if (!isset($data['name']) || empty($data['name'])) {
            Response::error('Invalid request: period name is required', 400);
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
            $errorCode = 'PERIOD_CREATE_' . bin2hex(random_bytes(4));
            error_log(sprintf(
                '[%s] Database error during period creation for user_id=%s, period_id=%s: %s',
                $errorCode,
                (string) $userId,
                isset($data['id']) ? (string) $data['id'] : 'unknown',
                $e->getMessage()
            ));
            Response::error(
                'Unable to create period. Please try again later. Reference code: ' . $errorCode,
                500
            );
        } catch (Exception $e) {
            $this->db->rollBack();
            $errorCode = 'PERIOD_CREATE_' . bin2hex(random_bytes(4));
            error_log(sprintf(
                '[%s] Unexpected error during period creation for user_id=%s, period_id=%s: %s',
                $errorCode,
                (string) $userId,
                isset($data['id']) ? (string) $data['id'] : 'unknown',
                $e->getMessage()
            ));
            Response::error(
                'Unable to create period. Please try again later. Reference code: ' . $errorCode,
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