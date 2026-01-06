<?php
/**
 * API Index - Shows available endpoints
 */

header('Content-Type: application/json; charset=UTF-8');

echo json_encode([
    'name' => 'Digital Zen API',
    'version' => '1.0.0',
    'endpoints' => [
        [
            'path' => '/api/user',
            'methods' => ['GET', 'POST'],
            'description' => 'User data management',
        ],
        [
            'path' => '/api/periods',
            'methods' => ['GET', 'POST', 'PUT', 'DELETE'],
            'description' => 'Periods CRUD operations',
        ],
    ],
    'authentication' => 'X-API-Key header required',
    'documentation' => 'See README.md for details',
], JSON_PRETTY_PRINT);
