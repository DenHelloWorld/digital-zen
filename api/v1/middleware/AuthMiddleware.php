<?php

class AuthMiddleware {
    /**
     * Аутентификация пользователя по OAuth токену
     * 
     * ВАЖНО: Бэкенд проверяет токен на каждом запросе для безопасности
     * 
     * @param bool $requireUser Требуется ли существующий пользователь
     * @return array|null Если requireUser=false, может вернуть null для user
     */
    public function authenticate($requireUser = true) {
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
        
        if (!$requireUser) {
            // Для создания пользователя возвращаем только tokenInfo
            return ['tokenInfo' => $tokenInfo, 'user' => null];
        }
        
        // Получаем пользователя (НЕ создаём автоматически)
        $user = $googleAuth->getUser($tokenInfo);
        
        if (!$user) {
            Response::unauthorized('User not found. Please register first.');
        }
        
        return ['tokenInfo' => $tokenInfo, 'user' => $user];
    }
}