-- Digital Zen Database Schema
-- This file creates tables for storing user data

-- Table for users
-- Stores basic user information (email and user ID)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    user_external_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (user_email),
    INDEX idx_user_external_id (user_external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for periods
-- Stores focus periods for each user
CREATE TABLE IF NOT EXISTS periods (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    period_name VARCHAR(255) NOT NULL,
    period_description TEXT,
    start_from DATETIME,
    end_to DATETIME,
    days_of_week JSON,
    is_focused BOOLEAN DEFAULT 0,
    session_start_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for websites
-- Stores blocked websites for each period
CREATE TABLE IF NOT EXISTS websites (
    id VARCHAR(255) PRIMARY KEY,
    period_id VARCHAR(255) NOT NULL,
    website_name VARCHAR(255) NOT NULL,
    website_description TEXT,
    website_url VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    icon_url VARCHAR(500),
    website_type VARCHAR(50) DEFAULT 'Default',
    is_blocked BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
    INDEX idx_period_id (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for focused times
-- Stores actual focus session history with full datetime stamps
CREATE TABLE IF NOT EXISTS focused_times (
    id VARCHAR(255) PRIMARY KEY,
    period_id VARCHAR(255) NOT NULL,
    start_from DATETIME,
    end_to DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
    INDEX idx_period_id (period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
