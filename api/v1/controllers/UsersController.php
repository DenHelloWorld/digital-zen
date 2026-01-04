<?php

class UsersController {
    /**
     * Форматировать данные пользователя для ответа
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
     */
    public function create($tokenInfo) {
        try {
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
     */
    public function me($user) {
        Response::success($this->formatUserResponse($user));
    }
}
