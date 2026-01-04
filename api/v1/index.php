<?php

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

spl_autoload_register(function ($className) {
    $dirs = ['controllers', 'services', 'middleware', 'utils', 'config'];
    foreach ($dirs as $dir) {
        $file = __DIR__ . "/$dir/$className.php";
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

require_once __DIR__ . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/v1', '', $path);
$pathParts = array_values(array_filter(explode('/', $path)));

$authMiddleware = new AuthMiddleware();
$user = null;

if (($pathParts[0] ?? '') !== 'health') {
    $user = $authMiddleware->authenticate();
}

try {
    switch ($pathParts[0] ?? '') {
        case 'health':
            Response::success(['status' => 'ok']);
            break;
            
        case 'periods':
            $controller = new PeriodsController();
            if ($method === 'GET') {
                $controller->index($user['id']);
            } elseif ($method === 'POST') {
                $data = json_decode(file_get_contents('php://input'), true);
                $controller->create($user['id'], $data);
            }
            break;
            
        default:
            Response::error('Endpoint not found', 404);
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error', 500);
}