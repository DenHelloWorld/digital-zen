<?php

class GoogleAuthService {
    private const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
    
    /**
     * Валидация Google OAuth токена
     * 
     * ВАЖНО: Бэкенд ДОЛЖЕН проверять токен на каждом запросе
     * для предотвращения подделки identity
     */
    public function validateToken($token) {
        if (empty($token)) {
            return false;
        }
        
        $url = self::GOOGLE_TOKEN_INFO_URL . '?access_token=' . urlencode($token);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            return false;
        }
        
        $tokenInfo = json_decode($response, true);
        
        return $tokenInfo;
    }
    
    /**
     * Получить пользователя по google_id из токена
     * 
     * @param array $tokenInfo Информация из Google OAuth токена (должен содержать 'sub')
     * @return array|false Данные пользователя или false если не найден
     */
    public function getUser($tokenInfo) {
        $db = Database::getInstance()->getConnection();
        
        // Проверяем существует ли пользователь по google_id
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Обновляем время последнего входа
            $stmt = $db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $user['id']]);
        }
        
        return $user;
    }
    
    /**
     * Создать нового пользователя
     * 
     * @param array $tokenInfo Информация из Google OAuth токена (sub, email, name, picture)
     * @return array Данные пользователя (существующего или созданного)
     */
    public function createUser($tokenInfo) {
        $db = Database::getInstance()->getConnection();
        
        // Проверяем, не существует ли уже пользователь
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        $existingUser = $stmt->fetch();
        
        if ($existingUser) {
            return $existingUser;
        }
        
        // Создаём нового пользователя
        $stmt = $db->prepare("
            INSERT INTO users (google_id, email, name, picture_url, last_login_at)
            VALUES (:google_id, :email, :name, :picture_url, NOW())
        ");
        
        $stmt->execute([
            'google_id' => $tokenInfo['sub'],
            'email' => $tokenInfo['email'] ?? '',
            'name' => $tokenInfo['name'] ?? '',
            'picture_url' => $tokenInfo['picture'] ?? ''
        ]);
        
        // Возвращаем созданного пользователя
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        return $stmt->fetch();
    }
}