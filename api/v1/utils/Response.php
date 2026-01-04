<?php

class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public static function success($data) {
        self::json(['success' => true, 'data' => $data], 200);
    }
    
    public static function error($message, $code = 500) {
        self::json(['success' => false, 'error' => $message], $code);
    }
    
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
}