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
            // Валидация обязательного поля 'sub'
            if (!isset($tokenInfo['sub']) || empty($tokenInfo['sub'])) {
                error_log("UsersController::create: missing or empty 'sub' field in tokenInfo");
                Response::error('Invalid token information', 400);
            }
            
            $googleAuth = new GoogleAuthService();
            
            // Создаём пользователя (или получаем существующего)
            $user = $googleAuth->createUser($tokenInfo);
            
            if (!$user) {
                error_log("User creation failed: createUser returned empty result");
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
