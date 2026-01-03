# Backend Research: Hostinger PHP Integration for Digital Zen

## Оглавление / Table of Contents

1. [Executive Summary / Резюме](#executive-summary--резюме)
2. [Current Architecture Analysis / Анализ текущей архитектуры](#current-architecture-analysis--анализ-текущей-архитектуры)
3. [Hostinger Capabilities / Возможности Hostinger](#hostinger-capabilities--возможности-hostinger)
4. [Integration Feasibility / Возможность интеграции](#integration-feasibility--возможность-интеграции)
5. [Proposed Architecture / Предлагаемая архитектура](#proposed-architecture--предлагаемая-архитектура)
6. [PHP Backend Implementation / Реализация PHP бэкенда](#php-backend-implementation--реализация-php-бэкенда)
7. [Security Considerations / Вопросы безопасности](#security-considerations--вопросы-безопасности)
8. [Migration Strategy / Стратегия миграции](#migration-strategy--стратегия-миграции)
9. [Cost Analysis / Анализ затрат](#cost-analysis--анализ-затрат)
10. [Recommendations / Рекомендации](#recommendations--рекомендации)

---

## Executive Summary / Резюме

### 🇬🇧 English

**Yes, Hostinger can be used as a PHP backend for Digital Zen Chrome Extension.**

Hostinger provides all necessary features for implementing a backend API:
- ✅ PHP 7.4+ support (preferably 8.x)
- ✅ MySQL/MariaDB database
- ✅ HTTPS/SSL certificates (Let's Encrypt)
- ✅ REST API capabilities
- ✅ CORS configuration support
- ✅ cPanel for easy management

The integration is feasible and can significantly enhance the extension's capabilities by:
- Enabling cross-device synchronization
- Providing data backup and recovery
- Supporting analytics and insights
- Facilitating user management at scale
- Enabling future multi-platform expansion

### 🇷🇺 Русский

**Да, Hostinger можно использовать как PHP бэкенд для расширения Digital Zen.**

Hostinger предоставляет все необходимые возможности для создания API бэкенда:
- ✅ Поддержка PHP 7.4+ (желательно 8.x)
- ✅ База данных MySQL/MariaDB
- ✅ HTTPS/SSL сертификаты (Let's Encrypt)
- ✅ Возможности для создания REST API
- ✅ Поддержка настройки CORS
- ✅ cPanel для простого управления

Интеграция возможна и может значительно расширить возможности расширения:
- Синхронизация между устройствами
- Резервное копирование и восстановление данных
- Аналитика и статистика
- Управление пользователями в масштабе
- Будущее расширение на несколько платформ

---

## Current Architecture Analysis / Анализ текущей архитектуры

### Current State / Текущее состояние

Digital Zen is currently a **client-side Chrome Extension** built with:

**Technology Stack:**
- **Frontend:** Angular 21 (Standalone Components, Signals)
- **State Management:** Chrome Storage API + Angular Signals
- **Authentication:** Google OAuth 2.0 (Chrome Identity API)
- **Data Storage:** Local Chrome Storage (`chrome.storage.local`)
- **Architecture:** Service Worker (Manifest V3)

### Data Models / Модели данных

The extension manages the following key entities:

```typescript
IFocus.Period {
  id: string;
  name: string;
  description: string;
  startFrom: Date | null;
  endTo: Date | null;
  webSites: IFocus.WebSite[];
  daysOfWeek: DayOfWeekType[];
  focusedTimes: IFocus.FocusedTime[];
  isFocused: boolean;
  sessionStartTime: Date | null;
}

IFocus.WebSite {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  iconUrl: string;
  type: IWebSiteType;
  isBlocked: boolean;
}

IFocus.FocusedTime {
  id: string;
  periodId: string;
  startFrom: Date | null;
  endTo: Date | null;
}
```

### Current Limitations / Текущие ограничения

1. **No Cross-Device Sync** - Data is stored locally only on one browser
2. **No Backup** - Data loss if extension is uninstalled or browser data cleared
3. **No Analytics** - Cannot track usage patterns or generate insights
4. **Limited Scalability** - Storage quota limitations (chrome.storage.local has ~10MB limit)
5. **No Multi-User Features** - Cannot share periods or collaborate

---

## Hostinger Capabilities / Возможности Hostinger

### Standard Hostinger Features / Стандартные функции Hostinger

Hostinger shared hosting typically includes:

1. **PHP Support**
   - PHP 7.4, 8.0, 8.1, 8.2, 8.3 (check your plan)
   - PHP extensions: mysqli, PDO, json, curl, openssl
   - `.htaccess` support for URL rewriting

2. **Database**
   - MySQL 5.7+ or MariaDB 10.x
   - phpMyAdmin for database management
   - Remote MySQL access (may need to enable)

3. **Web Server**
   - Apache or LiteSpeed
   - HTTPS/SSL via Let's Encrypt (free)
   - HTTP/2 support

4. **Control Panel**
   - cPanel or hPanel
   - File Manager
   - Cron Jobs support
   - Error logs access

5. **Email**
   - Email accounts (for notifications)
   - SMTP support

### Performance Considerations / Вопросы производительности

**Shared Hosting Limitations:**
- Shared resources (CPU, RAM, bandwidth)
- Request rate limits (varies by plan)
- Concurrent connection limits
- No guaranteed uptime SLA on basic plans

**Recommendations:**
- Use Premium or Business plans for better performance
- Implement caching strategies
- Optimize database queries
- Consider CDN for static assets

---

## Integration Feasibility / Возможность интеграции

### ✅ Feasible Features / Реализуемые функции

1. **User Authentication & Management**
   - Chrome Extension obtains Google OAuth tokens via chrome.identity API
   - Backend validates OAuth tokens on every request for security
   - Create user profiles in MySQL database (indexed by google_id)
   - Secure token-based authentication

2. **Data Synchronization**
   - Store focus periods in MySQL
   - Store blocked websites
   - Store focus session history
   - Sync data across devices

3. **RESTful API**
   - CRUD operations for periods
   - CRUD operations for websites
   - Focus session tracking
   - User preferences

4. **Analytics & Reporting**
   - Track focus time statistics
   - Generate productivity reports
   - Export data in various formats (JSON, CSV)

5. **Backup & Recovery**
   - Automatic database backups
   - Data export functionality
   - Restore from backup

### ⚠️ Considerations / Что учесть

1. **CORS Configuration**
   - Chrome extensions require proper CORS headers
   - Configure `.htaccess` to allow extension origin

2. **Security**
   - HTTPS is mandatory for Chrome extensions
   - Implement proper authentication validation
   - Protect against SQL injection, XSS
   - Rate limiting to prevent abuse

3. **Performance**
   - Shared hosting may have latency
   - Implement caching (Redis/Memcached if available, or file-based)
   - Optimize database indexes

4. **Scalability**
   - Shared hosting has limits
   - May need to upgrade plan as user base grows
   - Consider VPS/Cloud migration path

---

## Proposed Architecture / Предлагаемая архитектура

### High-Level Architecture / Архитектура высокого уровня

```
┌─────────────────────────────────────────┐
│   Chrome Extension (Angular 21)          │
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Google OAuth   │  │ Local Storage  │ │
│  │ (Identity API) │  │ (Fallback)     │ │
│  └────────┬───────┘  └────────────────┘ │
│           │                              │
│           │ OAuth Access Token           │
│           ▼                              │
│  ┌────────────────────────────────────┐ │
│  │    ApiService (HttpClient)         │ │
│  │    - Sync Service                  │ │
│  │    - Period Service                │ │
│  │    - Analytics Service             │ │
│  └────────┬───────────────────────────┘ │
└───────────┼──────────────────────────────┘
            │
            │ HTTPS REST API
            │ (Authorization: ******
            ▼
┌─────────────────────────────────────────┐
│   Hostinger PHP Backend                  │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         .htaccess                   │ │
│  │  - CORS headers                     │ │
│  │  - URL rewriting                    │ │
│  │  - Security headers                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      index.php (Router)             │ │
│  └─────────┬──────────────────────────┘ │
│            │                             │
│  ┌─────────▼──────────────────────────┐ │
│  │      API Controllers                │ │
│  │  - AuthController                   │ │
│  │  - PeriodsController                │ │
│  │  - WebsitesController               │ │
│  │  - SessionsController               │ │
│  │  - AnalyticsController              │ │
│  └─────────┬──────────────────────────┘ │
│            │                             │
│  ┌─────────▼──────────────────────────┐ │
│  │      Services Layer                 │ │
│  │  - Authentication Service           │ │
│  │  - Database Service                 │ │
│  │  - Validation Service               │ │
│  └─────────┬──────────────────────────┘ │
│            │                             │
│  ┌─────────▼──────────────────────────┐ │
│  │      MySQL Database                 │ │
│  │  - users                            │ │
│  │  - periods                          │ │
│  │  - websites                         │ │
│  │  - focused_times                    │ │
│  │  - focus_sessions                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### API Endpoints / API эндпоинты

```
Base URL: https://your-domain.com/api/v1/

Authentication:
  POST   /auth/validate          - Validate Google OAuth token
  POST   /auth/refresh           - Refresh session

Periods:
  GET    /periods                - List all periods for user
  POST   /periods                - Create new period
  GET    /periods/{id}           - Get period details
  PUT    /periods/{id}           - Update period
  DELETE /periods/{id}           - Delete period

Websites:
  GET    /periods/{id}/websites  - List websites in period
  POST   /periods/{id}/websites  - Add website to period
  PUT    /websites/{id}          - Update website
  DELETE /websites/{id}          - Remove website

Focus Sessions:
  POST   /sessions/start         - Start focus session
  POST   /sessions/stop          - Stop focus session
  GET    /sessions               - Get session history
  GET    /sessions/stats         - Get statistics

Sync:
  GET    /sync/pull              - Pull all user data
  POST   /sync/push              - Push local changes
  GET    /sync/status            - Check sync status

Analytics:
  GET    /analytics/summary      - Get productivity summary
  GET    /analytics/trends       - Get trends over time
  GET    /analytics/export       - Export data (CSV/JSON)
```

---

## PHP Backend Implementation / Реализация PHP бэкенда

### Folder Structure / Структура папок

```
public_html/
├── api/
│   ├── v1/
│   │   ├── index.php           # Main router
│   │   ├── .htaccess           # Rewrite rules, CORS
│   │   ├── config/
│   │   │   ├── database.php    # Database connection
│   │   │   ├── config.php      # App configuration
│   │   ├── controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── PeriodsController.php
│   │   │   ├── WebsitesController.php
│   │   │   ├── SessionsController.php
│   │   │   ├── AnalyticsController.php
│   │   ├── models/
│   │   │   ├── User.php
│   │   │   ├── Period.php
│   │   │   ├── Website.php
│   │   │   ├── FocusSession.php
│   │   ├── services/
│   │   │   ├── AuthService.php
│   │   │   ├── DatabaseService.php
│   │   │   ├── ValidationService.php
│   │   │   ├── GoogleAuthService.php
│   │   ├── middleware/
│   │   │   ├── AuthMiddleware.php
│   │   │   ├── CorsMiddleware.php
│   │   │   ├── RateLimitMiddleware.php
│   │   ├── utils/
│   │   │   ├── Response.php
│   │   │   ├── Logger.php
│   │   │   ├── Validator.php
├── .env                        # Environment variables (not in public)
```

### Database Schema / Схема базы данных

```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_google_id (google_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Periods table
CREATE TABLE periods (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_from DATETIME NULL,
    end_to DATETIME NULL,
    days_of_week JSON,
    is_focused BOOLEAN DEFAULT FALSE,
    session_start_time DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_focused (is_focused)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Websites table
CREATE TABLE websites (
    id VARCHAR(36) PRIMARY KEY,
    period_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    image_url TEXT,
    icon_url TEXT,
    type VARCHAR(50) DEFAULT 'Default',
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
    INDEX idx_period_id (period_id),
    INDEX idx_is_blocked (is_blocked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Focused times table
CREATE TABLE focused_times (
    id VARCHAR(36) PRIMARY KEY,
    period_id VARCHAR(36) NOT NULL,
    start_from DATETIME NULL,
    end_to DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
    INDEX idx_period_id (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Focus sessions table (for analytics)
CREATE TABLE focus_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    period_id VARCHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    duration_seconds INT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_period_id (period_id),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sync metadata table
CREATE TABLE sync_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_version VARCHAR(50),
    device_info JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Core PHP Code Examples / Примеры PHP кода

#### 1. `.htaccess` Configuration

```apache
# Enable rewrite engine
RewriteEngine On

# CORS headers for Chrome Extension
# IMPORTANT: Replace {YOUR_EXTENSION_ID} with your actual Chrome Extension ID
# Find it at chrome://extensions/ in Developer Mode (looks like: abcdefghijklmnopqrstuvwxyz123456)
Header always set Access-Control-Allow-Origin "chrome-extension://{YOUR_EXTENSION_ID}"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
Header always set Access-Control-Allow-Credentials "true"
Header always set Access-Control-Max-Age "3600"

# Handle preflight OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Route all requests to index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Deny access to sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

#### 2. `config/database.php`

```php
<?php

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        $host = getenv('DB_HOST') ?: 'localhost';
        $dbname = getenv('DB_NAME') ?: 'digital_zen';
        $username = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: '';
        
        try {
            $this->connection = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
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

#### 3. `services/GoogleAuthService.php`

```php
<?php

class GoogleAuthService {
    private const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
    
    /**
     * Validate Google OAuth token
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
        
        // Validate token audience (your OAuth client ID)
        $expectedClientId = getenv('GOOGLE_CLIENT_ID');
        if (isset($tokenInfo['aud']) && $tokenInfo['aud'] === $expectedClientId) {
            return $tokenInfo;
        }
        
        return false;
    }
    
    /**
     * Get or create user from Google token info
     */
    public function getOrCreateUser($tokenInfo) {
        $db = Database::getInstance()->getConnection();
        
        // Check if user exists
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $tokenInfo['sub']]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Update last login
            $stmt = $db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = :id");
            $stmt->execute(['id' => $user['id']]);
            return $user;
        }
        
        // Create new user
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
        
        return $this->getUserByGoogleId($tokenInfo['sub']);
    }
    
    private function getUserByGoogleId($googleId) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = :google_id");
        $stmt->execute(['google_id' => $googleId]);
        return $stmt->fetch();
    }
}
```

#### 4. `middleware/AuthMiddleware.php`

```php
<?php

class AuthMiddleware {
    private $googleAuthService;
    
    public function __construct() {
        $this->googleAuthService = new GoogleAuthService();
    }
    
    /**
     * Validate request and return user
     */
    public function authenticate() {
        // Get Authorization header
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader)) {
            Response::unauthorized('Authorization header missing');
            exit;
        }
        
        // Extract Bearer token
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::unauthorized('Invalid authorization format');
            exit;
        }
        
        $token = $matches[1];
        
        // Validate token with Google
        $tokenInfo = $this->googleAuthService->validateToken($token);
        
        if (!$tokenInfo) {
            Response::unauthorized('Invalid or expired token');
            exit;
        }
        
        // Get or create user
        $user = $this->googleAuthService->getOrCreateUser($tokenInfo);
        
        if (!$user) {
            Response::error('User creation failed', 500);
            exit;
        }
        
        return $user;
    }
}
```

#### 5. `controllers/PeriodsController.php`

```php
<?php

class PeriodsController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Get all periods for user
     */
    public function index($userId) {
        $stmt = $this->db->prepare("
            SELECT p.*, 
                   GROUP_CONCAT(DISTINCT w.id) as website_ids
            FROM periods p
            LEFT JOIN websites w ON p.id = w.period_id
            WHERE p.user_id = :user_id AND p.deleted_at IS NULL
            GROUP BY p.id
            ORDER BY p.created_at DESC
        ");
        
        $stmt->execute(['user_id' => $userId]);
        $periods = $stmt->fetchAll();
        
        // Load websites and focused times for each period
        foreach ($periods as &$period) {
            $period['webSites'] = $this->getWebsitesForPeriod($period['id']);
            $period['focusedTimes'] = $this->getFocusedTimesForPeriod($period['id']);
            $period['daysOfWeek'] = json_decode($period['days_of_week'], true) ?? [];
        }
        
        Response::success($periods);
    }
    
    /**
     * Create new period
     */
    public function create($userId, $data) {
        // Validate input
        if (empty($data['name'])) {
            Response::badRequest('Period name is required');
            return;
        }
        
        $this->db->beginTransaction();
        
        try {
            // Insert period
            $periodId = $data['id'] ?? $this->generateUUID();
            
            $stmt = $this->db->prepare("
                INSERT INTO periods (
                    id, user_id, name, description, 
                    start_from, end_to, days_of_week, 
                    is_focused, session_start_time
                )
                VALUES (
                    :id, :user_id, :name, :description,
                    :start_from, :end_to, :days_of_week,
                    :is_focused, :session_start_time
                )
            ");
            
            $stmt->execute([
                'id' => $periodId,
                'user_id' => $userId,
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'start_from' => $data['startFrom'] ?? null,
                'end_to' => $data['endTo'] ?? null,
                'days_of_week' => json_encode($data['daysOfWeek'] ?? []),
                'is_focused' => $data['isFocused'] ?? false,
                'session_start_time' => $data['sessionStartTime'] ?? null
            ]);
            
            // Insert websites
            if (!empty($data['webSites'])) {
                foreach ($data['webSites'] as $website) {
                    $this->createWebsite($periodId, $website);
                }
            }
            
            // Insert focused times
            if (!empty($data['focusedTimes'])) {
                foreach ($data['focusedTimes'] as $time) {
                    $this->createFocusedTime($periodId, $time);
                }
            }
            
            $this->db->commit();
            
            // Return created period
            $period = $this->getPeriodById($periodId, $userId);
            Response::created($period);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Period creation failed: " . $e->getMessage());
            Response::error('Period creation failed', 500);
        }
    }
    
    /**
     * Update period
     */
    public function update($userId, $periodId, $data) {
        // Verify ownership
        if (!$this->verifyPeriodOwnership($periodId, $userId)) {
            Response::forbidden('You do not have permission to update this period');
            return;
        }
        
        $this->db->beginTransaction();
        
        try {
            $stmt = $this->db->prepare("
                UPDATE periods SET
                    name = :name,
                    description = :description,
                    start_from = :start_from,
                    end_to = :end_to,
                    days_of_week = :days_of_week,
                    is_focused = :is_focused,
                    session_start_time = :session_start_time
                WHERE id = :id AND user_id = :user_id
            ");
            
            $stmt->execute([
                'id' => $periodId,
                'user_id' => $userId,
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'start_from' => $data['startFrom'] ?? null,
                'end_to' => $data['endTo'] ?? null,
                'days_of_week' => json_encode($data['daysOfWeek'] ?? []),
                'is_focused' => $data['isFocused'] ?? false,
                'session_start_time' => $data['sessionStartTime'] ?? null
            ]);
            
            // Update websites (delete and recreate for simplicity)
            $this->db->prepare("DELETE FROM websites WHERE period_id = :period_id")
                     ->execute(['period_id' => $periodId]);
            
            if (!empty($data['webSites'])) {
                foreach ($data['webSites'] as $website) {
                    $this->createWebsite($periodId, $website);
                }
            }
            
            // Update focused times
            $this->db->prepare("DELETE FROM focused_times WHERE period_id = :period_id")
                     ->execute(['period_id' => $periodId]);
            
            if (!empty($data['focusedTimes'])) {
                foreach ($data['focusedTimes'] as $time) {
                    $this->createFocusedTime($periodId, $time);
                }
            }
            
            $this->db->commit();
            
            $period = $this->getPeriodById($periodId, $userId);
            Response::success($period);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Period update failed: " . $e->getMessage());
            Response::error('Period update failed', 500);
        }
    }
    
    /**
     * Delete period (soft delete)
     */
    public function delete($userId, $periodId) {
        if (!$this->verifyPeriodOwnership($periodId, $userId)) {
            Response::forbidden('You do not have permission to delete this period');
            return;
        }
        
        $stmt = $this->db->prepare("
            UPDATE periods SET deleted_at = NOW()
            WHERE id = :id AND user_id = :user_id
        ");
        
        $stmt->execute([
            'id' => $periodId,
            'user_id' => $userId
        ]);
        
        Response::success(['message' => 'Period deleted successfully']);
    }
    
    // Helper methods
    private function getWebsitesForPeriod($periodId) {
        $stmt = $this->db->prepare("SELECT * FROM websites WHERE period_id = :period_id");
        $stmt->execute(['period_id' => $periodId]);
        return $stmt->fetchAll();
    }
    
    private function getFocusedTimesForPeriod($periodId) {
        $stmt = $this->db->prepare("SELECT * FROM focused_times WHERE period_id = :period_id");
        $stmt->execute(['period_id' => $periodId]);
        return $stmt->fetchAll();
    }
    
    private function createWebsite($periodId, $website) {
        $stmt = $this->db->prepare("
            INSERT INTO websites (
                id, period_id, name, description, url,
                image_url, icon_url, type, is_blocked
            )
            VALUES (
                :id, :period_id, :name, :description, :url,
                :image_url, :icon_url, :type, :is_blocked
            )
        ");
        
        $stmt->execute([
            'id' => $website['id'] ?? $this->generateUUID(),
            'period_id' => $periodId,
            'name' => $website['name'],
            'description' => $website['description'] ?? '',
            'url' => $website['url'],
            'image_url' => $website['imageUrl'] ?? '',
            'icon_url' => $website['iconUrl'] ?? '',
            'type' => $website['type'] ?? 'Default',
            'is_blocked' => $website['isBlocked'] ?? false
        ]);
    }
    
    private function createFocusedTime($periodId, $time) {
        $stmt = $this->db->prepare("
            INSERT INTO focused_times (id, period_id, start_from, end_to)
            VALUES (:id, :period_id, :start_from, :end_to)
        ");
        
        $stmt->execute([
            'id' => $time['id'] ?? $this->generateUUID(),
            'period_id' => $periodId,
            'start_from' => $time['startFrom'] ?? null,
            'end_to' => $time['endTo'] ?? null
        ]);
    }
    
    private function getPeriodById($periodId, $userId) {
        $stmt = $this->db->prepare("
            SELECT * FROM periods 
            WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL
        ");
        $stmt->execute(['id' => $periodId, 'user_id' => $userId]);
        $period = $stmt->fetch();
        
        if ($period) {
            $period['webSites'] = $this->getWebsitesForPeriod($period['id']);
            $period['focusedTimes'] = $this->getFocusedTimesForPeriod($period['id']);
            $period['daysOfWeek'] = json_decode($period['days_of_week'], true) ?? [];
        }
        
        return $period;
    }
    
    private function verifyPeriodOwnership($periodId, $userId) {
        $stmt = $this->db->prepare("
            SELECT id FROM periods 
            WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL
        ");
        $stmt->execute(['id' => $periodId, 'user_id' => $userId]);
        return $stmt->fetch() !== false;
    }
    
    private function generateUUID() {
        // IMPORTANT: For production use, install ramsey/uuid via Composer:
        //   $ composer require ramsey/uuid
        //   return Uuid::uuid4()->toString();
        //
        // On basic shared hosting where Composer may not be available,
        // we generate a RFC 4122 version 4 UUID using cryptographically
        // secure random bytes.
        
        // Prefer PHP's built-in CSPRNG if available
        if (function_exists('random_bytes')) {
            $data = random_bytes(16);
        } elseif (function_exists('openssl_random_pseudo_bytes')) {
            $data = openssl_random_pseudo_bytes(16);
        } else {
            // No secure random source available; fail fast rather than
            // generating predictable identifiers.
            throw new RuntimeException('No secure random source available for UUID generation');
        }
        
        // Set version to 0100 (version 4)
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        // Set variant to 10xxxxxx
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        
        // Format as 8-4-4-4-12 hex digits
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
```

#### 6. `utils/Response.php`

```php
<?php

class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    public static function success($data, $message = 'Success') {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }
    
    public static function created($data, $message = 'Created successfully') {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 201);
    }
    
    public static function error($message, $statusCode = 500) {
        self::json([
            'success' => false,
            'error' => $message
        ], $statusCode);
    }
    
    public static function badRequest($message = 'Bad request') {
        self::error($message, 400);
    }
    
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
    
    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }
    
    public static function notFound($message = 'Not found') {
        self::error($message, 404);
    }
}
```

#### 7. `index.php` (Main Router)

```php
<?php

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Autoload classes
spl_autoload_register(function ($className) {
    $directories = ['controllers', 'models', 'services', 'middleware', 'utils'];
    foreach ($directories as $dir) {
        $file = __DIR__ . "/$dir/$className.php";
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Load configuration
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/config.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/v1', '', $path);
$pathParts = array_filter(explode('/', $path));
$pathParts = array_values($pathParts);

// Authenticate user for all requests except auth endpoints
$authMiddleware = new AuthMiddleware();
$user = null;

if (!in_array($pathParts[0] ?? '', ['health'])) {
    $user = $authMiddleware->authenticate();
}

// Route requests
try {
    switch ($pathParts[0] ?? '') {
        case 'health':
            Response::success(['status' => 'healthy', 'timestamp' => time()]);
            break;
            
        case 'auth':
            $authController = new AuthController();
            switch ($pathParts[1] ?? '') {
                case 'validate':
                    if ($method === 'POST') {
                        $data = json_decode(file_get_contents('php://input'), true);
                        $authController->validate($data);
                    }
                    break;
                default:
                    Response::notFound('Auth endpoint not found');
            }
            break;
            
        case 'periods':
            $periodsController = new PeriodsController();
            if (!isset($pathParts[1])) {
                // /periods
                if ($method === 'GET') {
                    $periodsController->index($user['id']);
                } elseif ($method === 'POST') {
                    $data = json_decode(file_get_contents('php://input'), true);
                    $periodsController->create($user['id'], $data);
                }
            } else {
                // /periods/{id}
                $periodId = $pathParts[1];
                if ($method === 'GET') {
                    $periodsController->show($user['id'], $periodId);
                } elseif ($method === 'PUT') {
                    $data = json_decode(file_get_contents('php://input'), true);
                    $periodsController->update($user['id'], $periodId, $data);
                } elseif ($method === 'DELETE') {
                    $periodsController->delete($user['id'], $periodId);
                }
            }
            break;
            
        case 'sessions':
            $sessionsController = new SessionsController();
            switch ($pathParts[1] ?? '') {
                case 'start':
                    if ($method === 'POST') {
                        $data = json_decode(file_get_contents('php://input'), true);
                        $sessionsController->start($user['id'], $data);
                    }
                    break;
                case 'stop':
                    if ($method === 'POST') {
                        $data = json_decode(file_get_contents('php://input'), true);
                        $sessionsController->stop($user['id'], $data);
                    }
                    break;
                case 'stats':
                    if ($method === 'GET') {
                        $sessionsController->stats($user['id']);
                    }
                    break;
                default:
                    if ($method === 'GET') {
                        $sessionsController->index($user['id']);
                    }
            }
            break;
            
        case 'sync':
            $syncController = new SyncController();
            switch ($pathParts[1] ?? '') {
                case 'pull':
                    if ($method === 'GET') {
                        $syncController->pull($user['id']);
                    }
                    break;
                case 'push':
                    if ($method === 'POST') {
                        $data = json_decode(file_get_contents('php://input'), true);
                        $syncController->push($user['id'], $data);
                    }
                    break;
                default:
                    Response::notFound('Sync endpoint not found');
            }
            break;
            
        default:
            Response::notFound('Endpoint not found');
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error', 500);
}
```

---

## Security Considerations / Вопросы безопасности

### Critical Security Measures / Критические меры безопасности

1. **HTTPS Only**
   - ✅ All API calls must use HTTPS
   - ✅ Chrome extensions require secure connections
   - ✅ Hostinger provides free Let's Encrypt SSL

2. **Authentication**
   - ✅ Validate Google OAuth tokens on every request
   - ✅ Never trust client-side data
   - ✅ Implement token expiration checking
   - ✅ Consider implementing JWT for session management

3. **SQL Injection Prevention**
   - ✅ Always use prepared statements with PDO
   - ✅ Never concatenate user input into SQL queries
   - ✅ Validate and sanitize all inputs

4. **XSS Prevention**
   - ✅ Escape output when necessary
   - ✅ Use Content-Security-Policy headers
   - ✅ Validate and sanitize URLs

5. **CORS Configuration**
   - ✅ Whitelist only your extension ID
   - ✅ Do not use wildcard (*) for Access-Control-Allow-Origin
   - ✅ Validate Origin header

6. **Rate Limiting**
   - ✅ Implement rate limiting to prevent abuse
   - ✅ Use IP-based or user-based throttling
   - ✅ Example: Max 100 requests per minute per user

7. **Data Privacy**
   - ✅ Store only necessary user data
   - ✅ Implement data retention policies
   - ✅ Provide data export/deletion capabilities (GDPR)
   - ✅ Encrypt sensitive data at rest

8. **Environment Variables**
   - ✅ Never commit credentials to git
   - ✅ Use `.env` file (outside public_html)
   - ✅ Use strong database passwords

### PHP Security Best Practices / Лучшие практики безопасности PHP

```php
// .env file (store OUTSIDE public_html for security)
// SECURITY WARNING: Never commit this file to version control
// Use strong, unique passwords generated with a password manager
DB_HOST=localhost
DB_NAME=digital_zen
DB_USER=dz_user
DB_PASSWORD={STRONG_PASSWORD_20_CHARS}  // Use password generator for 20+ character random password
GOOGLE_CLIENT_ID={YOUR_OAUTH_CLIENT_ID}.apps.googleusercontent.com  // From Google Cloud Console
EXTENSION_ID={YOUR_EXTENSION_ID}  // From chrome://extensions/ (32 char alphanumeric)
ENVIRONMENT=production

// Rate limiting example (file-based implementation for shared hosting)
class RateLimitMiddleware {
    private $cacheDir;
    
    public function __construct() {
        // Store rate limit data in temporary directory
        $this->cacheDir = sys_get_temp_dir() . '/rate_limits/';
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0700, true);
        }
    }
    
    public function check($userId, $limit = 100, $window = 60) {
        $key = "rate_limit:$userId:" . floor(time() / $window);
        $count = $this->getCount($key);
        
        if ($count >= $limit) {
            Response::error('Rate limit exceeded', 429);
            exit;
        }
        
        $this->increment($key, $window);
    }
    
    private function getCount($key) {
        $file = $this->cacheDir . md5($key) . '.txt';
        if (!file_exists($file)) {
            return 0;
        }
        $data = file_get_contents($file);
        return (int) $data;
    }
    
    private function increment($key, $ttl) {
        $file = $this->cacheDir . md5($key) . '.txt';
        $count = $this->getCount($key) + 1;
        file_put_contents($file, $count);
        
        // Clean up old files (basic implementation)
        $this->cleanupOldFiles($ttl);
    }
    
    private function cleanupOldFiles($maxAge) {
        $files = glob($this->cacheDir . '*.txt');
        $now = time();
        foreach ($files as $file) {
            if ($now - filemtime($file) > $maxAge * 2) {
                @unlink($file);
            }
        }
    }
}
```

---

## Migration Strategy / Стратегия миграции

### Phase 1: Backend Setup (Week 1-2) / Фаза 1: Настройка бэкенда

1. **Hostinger Configuration**
   - Set up MySQL database
   - Configure SSL certificate
   - Create database schema
   - Deploy initial PHP code

2. **API Development**
   - Implement core endpoints (auth, periods, sync)
   - Set up error logging
   - Test with Postman/Insomnia

3. **Security Setup**
   - Configure CORS for extension
   - Implement authentication
   - Set up rate limiting

### Phase 2: Extension Integration (Week 3-4) / Фаза 2: Интеграция с расширением

1. **Create Sync Service**
   ```typescript
   // src/modules/common/services/sync.service.ts
   @Injectable({ providedIn: 'root' })
   export class SyncService {
     readonly #chromeStorage = inject(ChromeStorageService);
     readonly #http = inject(HttpClient);
     
     readonly #baseUrl = 'https://your-domain.com/api/v1';
     
     async syncPeriods(): Promise<void> {
       const token = await this.#getAuthToken();
       
       // Pull data from backend
       // Note: Backend returns { success: boolean, data: T }
       const response = await firstValueFrom(
         this.#http.get<{ success: boolean; data: IFocus.Period[] }>(
           `${this.#baseUrl}/periods`,
           { 
             headers: new HttpHeaders({
               'Authorization': `Bearer ${token}`
             })
           }
         )
       );
       
       // Update local storage with the data array
       this.#chromeStorage.set(
         ChromeStorageKeyType.PERIODS,
         response.data
       );
     }
     
     async pushChanges(periods: IFocus.Period[]): Promise<void> {
       const token = await this.#getAuthToken();
       
       await firstValueFrom(
         this.#http.post(
           `${this.#baseUrl}/sync/push`,
           { periods },
           { 
             headers: new HttpHeaders({
               'Authorization': `Bearer ${token}`
             })
           }
         )
       );
     }
   }
   ```

2. **Update Environment Configuration**
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost/api/v1' // for development
   };
   
   // src/environments/environment.prod.ts
   export const environment = {
     production: true,
     apiUrl: 'https://your-domain.com/api/v1'
   };
   ```

3. **Hybrid Storage Strategy**
   - Keep Chrome Storage as primary (for offline use)
   - Sync with backend periodically
   - Handle conflicts (last-write-wins or merge strategies)

### Phase 3: Testing (Week 5) / Фаза 3: Тестирование

1. **Unit Tests**
   - Test API endpoints
   - Test sync logic
   - Test conflict resolution

2. **Integration Tests**
   - Test extension-to-backend communication
   - Test offline scenarios
   - Test multi-device sync

3. **Performance Tests**
   - Load testing on Hostinger
   - Measure sync latency
   - Optimize database queries

### Phase 4: Gradual Rollout (Week 6+) / Фаза 4: Постепенный запуск

1. **Beta Testing**
   - Release to small group of users
   - Monitor error logs
   - Gather feedback

2. **Feature Flag**
   - Make backend sync optional
   - Allow users to opt-in
   - Fallback to local storage if backend fails

3. **Full Release**
   - Enable by default
   - Monitor performance
   - Scale hosting if needed

---

## Cost Analysis / Анализ затрат

### Hostinger Pricing (Approximate) / Цены Hostinger (приблизительно)

| Plan | Price | Features | Suitable For |
|------|-------|----------|--------------|
| **Single Shared** | $2-3/month | 1 website, 30GB storage, 100GB bandwidth | Small testing |
| **Premium Shared** | $3-4/month | 100 websites, 100GB storage, unlimited bandwidth | **Recommended** |
| **Business Shared** | $4-5/month | 200GB storage, daily backups, CDN | Growing user base |
| **VPS** | $8-20/month | Dedicated resources, root access | High traffic |

**Recommendation:** Start with **Premium Shared** plan (~$3-4/month)

### Additional Costs / Дополнительные затраты

- Domain name: $10-15/year (if needed)
- SSL Certificate: Free (Let's Encrypt included)
- Email: Included
- Backups: Included in Business plan

### Scalability Path / Путь масштабирования

```
Users < 1,000: Premium Shared ($3-4/mo)
Users 1,000 - 10,000: Business Shared ($4-5/mo)
Users > 10,000: VPS ($8-20/mo)
Users > 50,000: Cloud/Dedicated ($50+/mo)
```

---

## Recommendations / Рекомендации

### ✅ Pros of Using Hostinger PHP Backend / Преимущества использования Hostinger PHP

1. **Cost-Effective** - Very affordable starting at $3-4/month
2. **Quick Setup** - Can be deployed in hours/days
3. **Familiar Technology** - PHP is well-documented and widely used
4. **Full Control** - You own the data and infrastructure
5. **Scalable** - Can upgrade hosting as user base grows
6. **HTTPS Included** - Free SSL certificates
7. **cPanel** - Easy management interface

### ⚠️ Cons and Limitations / Недостатки и ограничения

1. **Shared Resources** - Performance may vary on shared hosting
2. **Manual Scaling** - Need to upgrade plan manually as traffic grows
3. **Maintenance** - You're responsible for security updates and backups
4. **Limited Advanced Features** - No auto-scaling, load balancing on basic plans
5. **PHP Constraints** - Not ideal for real-time features (WebSockets)

### 📋 Final Recommendations / Финальные рекомендации

**For your use case, I recommend:**

1. **Start with Hostinger Premium Shared Hosting** ($3-4/month)
   - This is sufficient for MVP and initial user base
   - Easy to set up and manage
   - Can upgrade later if needed

2. **Implement Hybrid Storage Strategy**
   - Keep Chrome Storage as primary (for offline functionality)
   - Sync with backend periodically
   - Backend serves as backup and sync mechanism

3. **Phased Implementation**
   - Phase 1: Set up backend API
   - Phase 2: Integrate sync functionality
   - Phase 3: Add analytics and reporting
   - Phase 4: Consider advanced features (notifications, sharing)

4. **Monitor and Optimize**
   - Track API response times
   - Monitor database performance
   - Optimize queries with indexes
   - Consider caching for frequently accessed data

5. **Plan for Growth**
   - Design database schema for scalability
   - Write clean, maintainable code
   - Document API thoroughly
   - Keep migration path to VPS/Cloud in mind

### Alternative Considerations / Альтернативные варианты

If Hostinger shared hosting proves insufficient, consider:

1. **Hostinger VPS** - More control and resources
2. **DigitalOcean/Linode** - Similar pricing, more developer-friendly
3. **Firebase/Supabase** - Backend-as-a-Service (no PHP, but easier scaling)
4. **AWS Lambda** - Serverless (pay per use)

But for starting out, **Hostinger shared hosting with PHP is a solid choice** that balances cost, ease of use, and functionality.

---

## Conclusion / Заключение

### 🇬🇧 English Summary

Yes, you can absolutely use your Hostinger account as a PHP backend for Digital Zen. Hostinger provides all the necessary infrastructure (PHP, MySQL, HTTPS) to build a robust REST API that can:

- Sync user data across devices
- Provide backup and recovery
- Enable analytics and insights
- Support future feature expansion

The implementation is straightforward using PHP with PDO for database access, following MVC architecture patterns. The key is to start simple with core sync functionality and gradually add features as your user base grows.

**Next Steps:**
1. Set up Hostinger database and deploy initial PHP code
2. Implement authentication endpoint
3. Create periods sync endpoint
4. Integrate sync service in Angular extension
5. Test and iterate

### 🇷🇺 Русское резюме

Да, ты определенно можешь использовать свой аккаунт Hostinger как PHP бэкенд для Digital Zen. Hostinger предоставляет всю необходимую инфраструктуру (PHP, MySQL, HTTPS) для создания надежного REST API, который может:

- Синхронизировать данные пользователя между устройствами
- Обеспечивать резервное копирование и восстановление
- Включать аналитику и статистику
- Поддерживать будущее расширение функционала

Реализация проста с использованием PHP и PDO для доступа к базе данных, следуя паттернам MVC архитектуры. Ключевое - начать с простой функциональности синхронизации и постепенно добавлять возможности по мере роста базы пользователей.

**Следующие шаги:**
1. Настроить базу данных на Hostinger и развернуть начальный PHP код
2. Реализовать эндпоинт аутентификации
3. Создать эндпоинт синхронизации периодов
4. Интегрировать сервис синхронизации в Angular расширение
5. Тестировать и улучшать

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Research Complete - Ready for Implementation
