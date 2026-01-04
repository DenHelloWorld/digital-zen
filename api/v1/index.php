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
$tokenInfo = null;

// Для /users (создание) нужна валидация токена, но не требуется существующий user
if (($pathParts[0] ?? '') === 'users' && $method === 'POST') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader)) {
        Response::unauthorized('Authorization header missing');
    }
    
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        Response::unauthorized('Invalid authorization format');
    }
    
    $token = trim($matches[1]);
    
    if (empty($token)) {
        Response::unauthorized('Empty bearer token');
    }
    
    $googleAuth = new GoogleAuthService();
    $tokenInfo = $googleAuth->validateToken($token);
    
    if (!$tokenInfo) {
        Response::unauthorized('Invalid or expired token');
    }
} elseif (($pathParts[0] ?? '') !== 'health') {
    // Для всех остальных эндпоинтов требуется аутентификация
    $user = $authMiddleware->authenticate();
}

try {
    switch ($pathParts[0] ?? '') {
        case 'health':
            Response::success(['status' => 'ok']);
            break;
            
        case 'users':
            $controller = new UsersController();
            if ($method === 'POST') {
                // Создание пользователя при первом логине
                $controller->create($tokenInfo);
            } elseif ($method === 'GET' && ($pathParts[1] ?? '') === 'me') {
                // Получить информацию о текущем пользователе
                $controller->me($user);
            } else {
                Response::error('Method not allowed', 405);
            }
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