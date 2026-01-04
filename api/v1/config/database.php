<?php

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        // ⚠️ БЕЗОПАСНОСТЬ: Используй переменные окружения в продакшене
        // Никогда не коммить реальные пароли в git!
        $host = 'localhost';
        $dbname = 'u387418961_digital_zen_db';
        $username = 'u387418961_dz_user';
        $password = '=3XF9a-gTNxr@Ln'; // Генерируй 20+ символов случайных
        
        try {
            $this->connection = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            error_log("DB Error: " . $e->getMessage());
            // Используем Response для последовательного формата ошибок API
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database connection failed']);
            exit;
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}