<?php

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $host = $_ENV['DB_HOST'] ?? null;
        $dbname = $_ENV['DB_NAME'] ?? null;
        $username = $_ENV['DB_USER'] ?? null;
        $password = $_ENV['DB_PASSWORD'] ?? null;

        if (
            $host === null || trim($host) === '' ||
            $dbname === null || trim($dbname) === '' ||
            $username === null || trim($username) === '' ||
            $password === null || trim($password) === ''
        ) {
            error_log("DB Error: Required database environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD) must all be configured.");
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database configuration error']);
            exit;
        }

        try {
            $this->connection = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4',
                ]
            );
        } catch (PDOException $e) {
            error_log("DB Error: " . $e->getMessage());
            // Use consistent JSON format for API errors
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
