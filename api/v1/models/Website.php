<?php
/**
 * Website Model
 * 
 * Handles database operations for websites within periods
 */

require_once __DIR__ . '/../config/database.php';

class Website {
    private $conn;
    private $table = 'websites';

    public $id;
    public $period_id;
    public $name;
    public $description;
    public $url;
    public $image_url;
    public $icon_url;
    public $type;
    public $is_blocked;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get all websites for a period
     * 
     * @param string $periodId Period ID
     * @return array Array of websites
     */
    public function getAllByPeriod($periodId) {
        $query = "SELECT * FROM " . $this->table . " WHERE period_id = :period_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':period_id', $periodId);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    /**
     * Get website by ID
     * 
     * @param string $id Website ID
     * @return array|false Website data or false if not found
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Create new website
     * 
     * @return bool True on success, false on failure
     */
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  (id, period_id, name, description, url, image_url, icon_url, type, is_blocked) 
                  VALUES (:id, :period_id, :name, :description, :url, :image_url, :icon_url, :type, :is_blocked)";
        
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':period_id', $this->period_id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':url', $this->url);
        $stmt->bindParam(':image_url', $this->image_url);
        $stmt->bindParam(':icon_url', $this->icon_url);
        $stmt->bindParam(':type', $this->type);
        $stmt->bindParam(':is_blocked', $this->is_blocked);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Update website
     * 
     * @return bool True on success, false on failure
     */
    public function update() {
        $query = "UPDATE " . $this->table . " 
                  SET name = :name, 
                      description = :description, 
                      url = :url, 
                      image_url = :image_url, 
                      icon_url = :icon_url, 
                      type = :type, 
                      is_blocked = :is_blocked 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':url', $this->url);
        $stmt->bindParam(':image_url', $this->image_url);
        $stmt->bindParam(':icon_url', $this->icon_url);
        $stmt->bindParam(':type', $this->type);
        $stmt->bindParam(':is_blocked', $this->is_blocked);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Delete website
     * 
     * @param string $id Website ID
     * @return bool True on success, false on failure
     */
    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Delete all websites for a period
     * 
     * @param string $periodId Period ID
     * @return bool True on success, false on failure
     */
    public function deleteByPeriod($periodId) {
        $query = "DELETE FROM " . $this->table . " WHERE period_id = :period_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':period_id', $periodId);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}
