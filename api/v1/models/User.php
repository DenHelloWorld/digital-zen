<?php
/**
 * User Model
 * 
 * Handles database operations for users (NO PASSWORDS)
 */

require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    private $table = 'users';

    public $id;
    public $email;
    public $name;
    public $picture;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Find user by email
     * 
     * @param string $email User email
     * @return array|false User data or false if not found
     */
    public function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Find user by ID
     * 
     * @param string $id User ID
     * @return array|false User data or false if not found
     */
    public function findById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Create new user
     * 
     * @return bool True on success, false on failure
     */
    public function create() {
        $query = "INSERT INTO " . $this->table . " 
                  (id, email, name, picture) 
                  VALUES (:id, :email, :name, :picture)";
        
        $stmt = $this->conn->prepare($query);

        // Generate UUID for user ID
        $this->id = $this->id ?? $this->generateUUID();

        // Bind values
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':picture', $this->picture);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Update user
     * 
     * @return bool True on success, false on failure
     */
    public function update() {
        $query = "UPDATE " . $this->table . " 
                  SET email = :email, 
                      name = :name, 
                      picture = :picture 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':picture', $this->picture);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    /**
     * Generate UUID v4
     * 
     * @return string UUID
     */
    private function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
