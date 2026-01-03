# Быстрый старт: Интеграция PHP Backend на Hostinger

> Краткое руководство по интеграции PHP бэкенда на Hostinger для Digital Zen

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ ПО БЕЗОПАСНОСТИ

**Перед началом работы:**

1. **Пароли:** Используй генератор паролей для создания сильных, уникальных паролей (20+ символов)
2. **Credentials:** Никогда не коммить пароли и ключи API в git
3. **HTTPS:** Обязательно используй SSL сертификат (бесплатный Let's Encrypt на Hostinger)
4. **Extension ID:** Замени все плейсхолдеры `{YOUR_EXTENSION_ID}` на реальный ID
5. **Domain:** Замени `{YOUR_DOMAIN}` на реальный домен
6. **Environment Variables:** В продакшене используй переменные окружения вместо хардкода

## 🎯 Цель

Добавить возможность синхронизации данных между устройствами через PHP API на Hostinger.

## ✅ Что нужно сделать

### 1. Настройка Hostinger (30 минут)

#### Шаг 1: Создать базу данных MySQL

1. Войти в cPanel на Hostinger
2. Найти "MySQL Databases"
3. Создать базу данных: `digital_zen_db`
4. Создать пользователя: `dz_user` с сильным паролем
5. Назначить все привилегии пользователю для базы данных

#### Шаг 2: Выполнить SQL скрипт

Открыть phpMyAdmin и выполнить:

```sql
-- Таблица пользователей
-- Chrome Extension уже управляет аутентификацией через Google OAuth
-- Мы просто используем email как идентификатор пользователя
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица периодов фокусировки
CREATE TABLE periods (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_from DATETIME NULL,
    end_to DATETIME NULL,
    days_of_week JSON,
    is_focused BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица сайтов
CREATE TABLE websites (
    id VARCHAR(36) PRIMARY KEY,
    period_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    image_url TEXT,
    icon_url TEXT,
    type VARCHAR(50) DEFAULT 'Default',
    is_blocked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
    INDEX idx_period_id (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица времени фокусировки
CREATE TABLE focused_times (
    id VARCHAR(36) PRIMARY KEY,
    period_id VARCHAR(36) NOT NULL,
    start_from DATETIME NULL,
    end_to DATETIME NULL,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
    INDEX idx_period_id (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. Загрузка PHP файлов на Hostinger (1 час)

#### Структура папок

```
public_html/
└── api/
    └── v1/
        ├── .htaccess
        ├── index.php
        ├── config/
        │   └── database.php
        ├── controllers/
        │   └── PeriodsController.php
        ├── services/
        │   └── UserService.php
        ├── middleware/
        │   └── AuthMiddleware.php
        └── utils/
            └── Response.php
```

#### Файл `.htaccess`

```apache
RewriteEngine On

# CORS для Chrome Extension
# ⚠️ ВАЖНО: Замени {YOUR_EXTENSION_ID} на реальный ID твоего расширения
# ID можно найти на chrome://extensions/ (включи режим разработчика)
Header always set Access-Control-Allow-Origin "chrome-extension://{YOUR_EXTENSION_ID}"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, X-User-Email, X-User-Name"
Header always set Access-Control-Allow-Credentials "true"

# Обработка OPTIONS запросов
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Маршрутизация на index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Файл `config/database.php`

```php
<?php

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        // ⚠️ БЕЗОПАСНОСТЬ: Используй переменные окружения в продакшене
        // Никогда не коммить реальные пароли в git!
        $host = 'localhost';
        $dbname = 'digital_zen_db';
        $username = 'dz_user';
        $password = '{STRONG_PASSWORD_20_CHARS}'; // Генерируй 20+ символов случайных
        
        try {
            $this->connection = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $e) {
            error_log("DB Error: " . $e->getMessage());
            die("Database connection failed");
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
}
```

#### Файл `utils/Response.php`

```php
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
```

#### Файл `services/UserService.php`

```php
<?php

class UserService {
    /**
     * Получить или создать пользователя по email
     * 
     * Chrome Extension уже обрабатывает Google OAuth аутентификацию,
     * поэтому мы просто используем email для идентификации пользователя.
     */
    public function getOrCreateUserByEmail($email, $name = null) {
        $db = Database::getInstance()->getConnection();
        
        // Проверяем существует ли пользователь
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Обновляем время последнего входа
            $stmt = $db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $user['id']]);
            return $user;
        }
        
        // Создаём нового пользователя
        $stmt = $db->prepare("
            INSERT INTO users (email, name, last_login_at)
            VALUES (:email, :name, NOW())
        ");
        
        $stmt->execute([
            'email' => $email,
            'name' => $name ?? ''
        ]);
        
        // Возвращаем созданного пользователя
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }
}
```

#### Файл `middleware/AuthMiddleware.php`

```php
<?php

class AuthMiddleware {
    /**
     * Аутентификация пользователя по email из заголовка
     * 
     * Chrome Extension уже проверил пользователя через Google OAuth,
     * поэтому мы доверяем email, который он отправляет.
     */
    public function authenticate() {
        $headers = getallheaders();
        
        // Получаем email из заголовка X-User-Email
        $userEmail = $headers['X-User-Email'] ?? '';
        
        if (empty($userEmail)) {
            Response::unauthorized('User email header missing');
        }
        
        // Валидируем формат email
        if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            Response::unauthorized('Invalid email format');
        }
        
        // Получаем или создаём пользователя
        $userService = new UserService();
        $userName = $headers['X-User-Name'] ?? null;
        $user = $userService->getOrCreateUserByEmail($userEmail, $userName);
        
        if (!$user) {
            Response::error('User creation failed', 500);
        }
        
        return $user;
    }
}
```

#### Файл `controllers/PeriodsController.php`

```php
<?php

class PeriodsController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function index($userId) {
        $stmt = $this->db->prepare("
            SELECT * FROM periods 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        ");
        
        $stmt->execute(['user_id' => $userId]);
        $periods = $stmt->fetchAll();
        
        foreach ($periods as &$period) {
            $period['webSites'] = $this->getWebsites($period['id']);
            $period['focusedTimes'] = $this->getFocusedTimes($period['id']);
            $period['daysOfWeek'] = json_decode($period['days_of_week'], true) ?? [];
        }
        
        Response::success($periods);
    }
    
    public function create($userId, $data) {
        $this->db->beginTransaction();
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO periods (
                    id, user_id, name, description, 
                    start_from, end_to, days_of_week, is_focused
                )
                VALUES (
                    :id, :user_id, :name, :description,
                    :start_from, :end_to, :days_of_week, :is_focused
                )
            ");
            
            $stmt->execute([
                'id' => $data['id'],
                'user_id' => $userId,
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'start_from' => $data['startFrom'] ?? null,
                'end_to' => $data['endTo'] ?? null,
                'days_of_week' => json_encode($data['daysOfWeek'] ?? []),
                'is_focused' => $data['isFocused'] ?? false
            ]);
            
            if (!empty($data['webSites'])) {
                foreach ($data['webSites'] as $site) {
                    $this->createWebsite($data['id'], $site);
                }
            }
            
            if (!empty($data['focusedTimes'])) {
                foreach ($data['focusedTimes'] as $time) {
                    $this->createFocusedTime($data['id'], $time);
                }
            }
            
            $this->db->commit();
            Response::success(['message' => 'Period created']);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            Response::error('Failed to create period', 500);
        }
    }
    
    private function getWebsites($periodId) {
        $stmt = $this->db->prepare("SELECT * FROM websites WHERE period_id = :period_id");
        $stmt->execute(['period_id' => $periodId]);
        return $stmt->fetchAll();
    }
    
    private function getFocusedTimes($periodId) {
        $stmt = $this->db->prepare("SELECT * FROM focused_times WHERE period_id = :period_id");
        $stmt->execute(['period_id' => $periodId]);
        return $stmt->fetchAll();
    }
    
    private function createWebsite($periodId, $site) {
        $stmt = $this->db->prepare("
            INSERT INTO websites (id, period_id, name, url, image_url, icon_url, type, is_blocked)
            VALUES (:id, :period_id, :name, :url, :image_url, :icon_url, :type, :is_blocked)
        ");
        
        $stmt->execute([
            'id' => $site['id'],
            'period_id' => $periodId,
            'name' => $site['name'],
            'url' => $site['url'],
            'image_url' => $site['imageUrl'] ?? '',
            'icon_url' => $site['iconUrl'] ?? '',
            'type' => $site['type'] ?? 'Default',
            'is_blocked' => $site['isBlocked'] ?? false
        ]);
    }
    
    private function createFocusedTime($periodId, $time) {
        $stmt = $this->db->prepare("
            INSERT INTO focused_times (id, period_id, start_from, end_to)
            VALUES (:id, :period_id, :start_from, :end_to)
        ");
        
        $stmt->execute([
            'id' => $time['id'],
            'period_id' => $periodId,
            'start_from' => $time['startFrom'] ?? null,
            'end_to' => $time['endTo'] ?? null
        ]);
    }
}
```

#### Файл `index.php` (главный роутер)

```php
<?php

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

spl_autoload_register(function ($className) {
    $dirs = ['controllers', 'services', 'middleware', 'utils', 'config'];
    foreach ($dirs as $dir) {
        $file = __DIR__ . "/$dir/$className.php";
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

require_once __DIR__ . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/v1', '', $path);
$pathParts = array_values(array_filter(explode('/', $path)));

$authMiddleware = new AuthMiddleware();
$user = null;

if (($pathParts[0] ?? '') !== 'health') {
    $user = $authMiddleware->authenticate();
}

try {
    switch ($pathParts[0] ?? '') {
        case 'health':
            Response::success(['status' => 'ok']);
            break;
            
        case 'periods':
            $controller = new PeriodsController();
            if ($method === 'GET') {
                $controller->index($user['id']);
            } elseif ($method === 'POST') {
                $data = json_decode(file_get_contents('php://input'), true);
                $controller->create($user['id'], $data);
            }
            break;
            
        default:
            Response::error('Endpoint not found', 404);
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error', 500);
}
```

### 3. Интеграция с Angular Extension (2 часа)

#### Создать файл `src/modules/common/services/backend-sync.service.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IFocus } from '../models/focus.model';
import { GoogleAuthService } from './google-auth.service';

@Injectable({ providedIn: 'root' })
export class BackendSyncService {
  readonly #http = inject(HttpClient);
  readonly #googleAuth = inject(GoogleAuthService);
  
  // ⚠️ ВАЖНО: Замени {YOUR_DOMAIN} на реальный домен
  // Пример: 'https://mysite.com/api/v1' или 'https://digital-zen.hostinger-site.com/api/v1'
  readonly #apiUrl = 'https://{YOUR_DOMAIN}/api/v1';
  
  /**
   * Получить все периоды с сервера
   */
  async pullPeriods(): Promise<IFocus.Period[]> {
    const headers = await this.#getHeaders();
    
    const response = await firstValueFrom(
      this.#http.get<{ success: boolean; data: IFocus.Period[] }>(
        `${this.#apiUrl}/periods`,
        { headers }
      )
    );
    
    return response.data;
  }
  
  /**
   * Отправить период на сервер
   */
  async pushPeriod(period: IFocus.Period): Promise<void> {
    const headers = await this.#getHeaders();
    
    await firstValueFrom(
      this.#http.post(
        `${this.#apiUrl}/periods`,
        period,
        { headers }
      )
    );
  }
  
  /**
   * Проверить здоровье API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.#http.get<{ success: boolean }>(
          `${this.#apiUrl}/health`
        )
      );
      return response.success;
    } catch {
      return false;
    }
  }
  
  /**
   * Получить заголовки для запросов
   * Используем email пользователя для идентификации
   * (Chrome Extension уже проверил пользователя через Google OAuth)
   */
  async #getHeaders(): Promise<HttpHeaders> {
    const userInfo = this.#googleAuth.userInfo();
    
    if (!userInfo?.email) {
      throw new Error('User not authenticated');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Email': userInfo.email,
      'X-User-Name': userInfo.name || ''
    });
  }
}
```

#### Добавить в `src/modules/common/services/index.ts`

```typescript
export * from './backend-sync.service';
```

#### Использование в компоненте

```typescript
import { Component, inject } from '@angular/core';
import { BackendSyncService } from '@modules/common/services';

@Component({
  selector: 'dz-sync-button',
  template: `
    <button (click)="syncData()">
      @if (isSyncing()) {
        Синхронизация...
      } @else {
        Синхронизировать
      }
    </button>
  `
})
export class SyncButtonComponent {
  readonly #backendSync = inject(BackendSyncService);
  
  protected readonly isSyncing = signal(false);
  
  async syncData(): Promise<void> {
    this.isSyncing.set(true);
    
    try {
      // Проверить доступность API
      const isHealthy = await this.#backendSync.checkHealth();
      
      if (!isHealthy) {
        console.warn('Backend API is not available');
        return;
      }
      
      // Получить данные с сервера
      const serverPeriods = await this.#backendSync.pullPeriods();
      
      // Обновить локальное хранилище
      // ... ваша логика обновления
      
      console.log('Sync completed', serverPeriods);
      
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      this.isSyncing.set(false);
    }
  }
}
```

### 4. Тестирование (30 минут)

#### Тест 1: Проверка здоровья API

```bash
curl https://your-domain.com/api/v1/health
# Ожидаемый ответ: {"success":true,"data":{"status":"ok"}}
```

#### Тест 2: Авторизация

#### Тест 2: Авторизация

1. В Chrome Extension пользователь уже авторизован через Google
2. Extension получает email пользователя
3. Отправить запрос:

```bash
curl -X GET https://your-domain.com/api/v1/periods \
  -H "X-User-Email: user@gmail.com" \
  -H "X-User-Name: User Name"
# Должен вернуть список периодов (пустой массив для нового пользователя)
```

#### Тест 3: Создание периода

```bash
curl -X POST https://your-domain.com/api/v1/periods \
  -H "X-User-Email: user@gmail.com" \
  -H "X-User-Name: User Name" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-period-1",
    "name": "Тестовый период",
    "description": "Описание",
    "daysOfWeek": [1, 2, 3],
    "webSites": [],
    "focusedTimes": []
  }'
```

## 🔧 Устранение проблем

### Проблема: CORS ошибка

**Решение:**
1. Проверь, что в `.htaccess` указан правильный Extension ID
2. Убедись, что HTTPS работает
3. Проверь, что заголовки CORS установлены (включая X-User-Email, X-User-Name)

### Проблема: 401 Unauthorized

**Решение:**
1. Проверь, что заголовок X-User-Email отправляется
2. Убедись, что email имеет валидный формат
3. Проверь логи ошибок PHP

### Проблема: Database connection failed

**Решение:**
1. Проверь данные подключения в `config/database.php`
2. Убедись, что пользователь БД имеет права доступа
3. Проверь, что база данных создана

### Проблема: 500 Internal Server Error

**Решение:**
1. Включи отображение ошибок временно: `ini_set('display_errors', '1');`
2. Проверь логи ошибок в cPanel
3. Убедись, что все файлы загружены правильно

## 📊 Следующие шаги

После базовой настройки:

1. **Добавить UPDATE и DELETE эндпоинты**
2. **Реализовать конфликт-резолвинг** (что делать, если данные изменились на двух устройствах)
3. **Добавить кэширование** для улучшения производительности
4. **Настроить автоматическую синхронизацию** (каждые N минут)
5. **Добавить аналитику** (статистика использования)
6. **Настроить бэкапы** базы данных

## 💡 Полезные ссылки

- [Полная документация](./backend-research-hostinger-php.md)
- [Hostinger cPanel Guide](https://www.hostinger.com/tutorials/cpanel)
- [Chrome Extension OAuth](https://developer.chrome.com/docs/extensions/reference/identity/)
- [PHP PDO Documentation](https://www.php.net/manual/en/book.pdo.php)

---

**Время на внедрение:** ~4 часа  
**Сложность:** Средняя  
**Стоимость:** $3-4/месяц (Hostinger Premium)
