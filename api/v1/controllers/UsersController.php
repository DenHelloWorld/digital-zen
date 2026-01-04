<?php

class UsersController {
    /**
     * Создать нового пользователя
     * Вызывается фронтендом при первом логине
     */
    public function create($tokenInfo) {
        $googleAuth = new GoogleAuthService();
        
        // Создаём пользователя
        $user = $googleAuth->createUser($tokenInfo);
        
        if (!$user) {
            Response::error('User creation failed', 500);
        }
        
        Response::success([
            'id' => $user['id'],
            'google_id' => $user['google_id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'picture_url' => $user['picture_url'],
            'created_at' => $user['created_at'],
            'last_login_at' => $user['last_login_at']
        ]);
    }
    
    /**
     * Получить информацию о текущем пользователе
     */
    public function me($user) {
        Response::success([
            'id' => $user['id'],
            'google_id' => $user['google_id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'picture_url' => $user['picture_url'],
            'created_at' => $user['created_at'],
            'last_login_at' => $user['last_login_at']
        ]);
    }
}
