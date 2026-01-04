<?php

class UsersController {
    /**
     * Форматировать данные пользователя для ответа
     * 
     * @param array $user Массив с данными пользователя из БД
     * @return array Отформатированные данные пользователя
     */
    private function formatUserResponse($user) {
        return [
            'id' => $user['id'],
            'google_id' => $user['google_id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'picture_url' => $user['picture_url'],
            'created_at' => $user['created_at'],
            'last_login_at' => $user['last_login_at']
        ];
    }
    
    /**
     * Создать нового пользователя
     * Вызывается фронтендом при первом логине
     * 
     * @param array $tokenInfo Информация из Google OAuth токена (sub, email, name, picture)
     */
    public function create($tokenInfo) {
        try {
            // Defense-in-depth: валидация обязательных полей на входе в контроллер
            // даже если GoogleAuthService.createUser тоже это проверяет
            if (!isset($tokenInfo['sub']) || empty($tokenInfo['sub'])) {
                error_log("UsersController::create: missing or empty 'sub' field");
                Response::error('Invalid token information: missing user identifier', 400);
            }
            
            if (!isset($tokenInfo['email']) || empty($tokenInfo['email'])) {
                error_log("UsersController::create: missing or empty 'email' field");
                Response::error('Invalid token information: missing email', 400);
            }
            
            $googleAuth = new GoogleAuthService();
            
            // Создаём пользователя (или получаем существующего)
            $user = $googleAuth->createUser($tokenInfo);
            
            if (!$user) {
                // Логируем только google_id (не PII) для отладки
                $googleId = $tokenInfo['sub'] ?? 'unknown';
                error_log("User creation failed for google_id: $googleId");
                Response::error('User creation failed', 500);
            }
            
            Response::success($this->formatUserResponse($user));
        } catch (Exception $e) {
            error_log("User creation error: " . $e->getMessage());
            Response::error('User creation failed', 500);
        }
    }
    
    /**
     * Получить информацию о текущем пользователе
     * 
     * @param array $user Массив с данными пользователя из БД
     */
    public function me($user) {
        Response::success($this->formatUserResponse($user));
    }
}
