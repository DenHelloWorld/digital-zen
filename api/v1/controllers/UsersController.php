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
            $googleAuth = new GoogleAuthService();
            
            // Создаём пользователя (или получаем существующего)
            // GoogleAuthService.createUser уже валидирует обязательные поля
            $user = $googleAuth->createUser($tokenInfo);
            
            if (!$user) {
                // Логируем только google_id (не PII) для отладки
                $googleId = $tokenInfo['sub'] ?? 'unknown';
                error_log("User creation failed for google_id: $googleId");
                Response::error('User creation failed: unable to create or retrieve user record', 500);
            }
            
            Response::success($this->formatUserResponse($user));
        } catch (PDOException $e) {
            error_log("User creation error (database): " . $e->getMessage());
            Response::error('User creation failed due to a database error', 500);
        } catch (Exception $e) {
            error_log("User creation error: " . $e->getMessage());
            Response::error('User creation failed due to an internal server error', 500);
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
