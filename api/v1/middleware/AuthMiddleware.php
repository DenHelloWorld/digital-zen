<?php

class AuthMiddleware {
    /**
     * Аутентификация пользователя по OAuth токену
     * 
     * ВАЖНО: Бэкенд проверяет токен на каждом запросе для безопасности
     */
    public function authenticate() {
        $headers = getallheaders();
        
        // Получаем токен из заголовка Authorization
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader)) {
            Response::unauthorized('Authorization header missing');
        }
        
        // Проверяем формат "Bearer TOKEN"
        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            Response::unauthorized('Invalid authorization format');
        }
        
        $token = trim($matches[1]);
        
        if (empty($token)) {
            Response::unauthorized('Empty bearer token');
        }
        
        // Валидируем токен с Google
        $googleAuth = new GoogleAuthService();
        $tokenInfo = $googleAuth->validateToken($token);
        
        if (!$tokenInfo) {
            Response::unauthorized('Invalid or expired token');
        }
        
        // Получаем или создаём пользователя
        $user = $googleAuth->getOrCreateUser($tokenInfo);
        
        if (!$user) {
            Response::error('User creation failed', 500);
        }
        
        return $user;
    }
}