<?php
/**
 * Simple test file to verify PHP is working
 * Access: https://digital-zen.csmpoint.com/api/test.php
 * 
 * This file does NOT require API key - it's just for testing
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'OK',
    'message' => 'PHP is working!',
    'php_version' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'timestamp' => date('Y-m-d H:i:s'),
], JSON_PRETTY_PRINT);
