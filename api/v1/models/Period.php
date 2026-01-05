<?php
/**
 * Period Model
 * 
 * Handles database operations for focus periods
 */

require_once __DIR__ . '/../config/database.php';

class Period {
    private $conn;
    private $table = 'periods';

    public $id;
    public $user_id;
    public $name;
    public $description;
    public $start_from;
    public $end_to;
    public $days_of_week;
    public $is_focused;
    public $session_start_time;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get all periods for a user
     * 
     * @param string $userId User ID
     * @return array Array of periods
     */
    public function getAllByUser($userId) {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    /**
     * Get period by ID
     * 
     * @param string $id Period ID
     * @param string $userId User ID (for authorization)
     * @return array|false Period data or false if not found
     */
    public function getById($id, $userId) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Create new period
     * 
     * @return bool True on success, false on failure
     */
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  (id, user_id, name, description, start_from, end_to, days_of_week, is_focused, session_start_time) 
                  VALUES (:id, :user_id, :name, :description, :start_from, :end_to, :days_of_week, :is_focused, :session_start_time)";
        
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':start_from', $this->start_from);
        $stmt->bindParam(':end_to', $this->end_to);
        $stmt->bindParam(':days_of_week', $this->days_of_week);
        $stmt->bindParam(':is_focused', $this->is_focused);
        $stmt->bindParam(':session_start_time', $this->session_start_time);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Update period
     * 
     * @return bool True on success, false on failure
     */
    public function update() {
        $query = "UPDATE " . $this->table . " 
                  SET name = :name, 
                      description = :description, 
                      start_from = :start_from, 
                      end_to = :end_to, 
                      days_of_week = :days_of_week, 
                      is_focused = :is_focused, 
                      session_start_time = :session_start_time 
                  WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':start_from', $this->start_from);
        $stmt->bindParam(':end_to', $this->end_to);
        $stmt->bindParam(':days_of_week', $this->days_of_week);
        $stmt->bindParam(':is_focused', $this->is_focused);
        $stmt->bindParam(':session_start_time', $this->session_start_time);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Delete period
     * 
     * @param string $id Period ID
     * @param string $userId User ID (for authorization)
     * @return bool True on success, false on failure
     */
    public function delete($id, $userId) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $userId);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}
