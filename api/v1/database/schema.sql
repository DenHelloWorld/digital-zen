-- Digital Zen Database Schema
-- MySQL Database for storing users and their focus periods/websites (NO PASSWORDS)

-- Users table (no passwords, just email as identifier)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255),
  `picture` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Periods table
CREATE TABLE IF NOT EXISTS `periods` (
  `id` VARCHAR(255) PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `start_from` DATETIME,
  `end_to` DATETIME,
  `days_of_week` JSON,
  `is_focused` BOOLEAN DEFAULT FALSE,
  `session_start_time` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Websites table
CREATE TABLE IF NOT EXISTS `websites` (
  `id` VARCHAR(255) PRIMARY KEY,
  `period_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `url` TEXT NOT NULL,
  `image_url` TEXT,
  `icon_url` TEXT,
  `type` VARCHAR(50) DEFAULT 'Default',
  `is_blocked` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`period_id`) REFERENCES `periods`(`id`) ON DELETE CASCADE,
  INDEX `idx_period_id` (`period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Focused times table
CREATE TABLE IF NOT EXISTS `focused_times` (
  `id` VARCHAR(255) PRIMARY KEY,
  `period_id` VARCHAR(255) NOT NULL,
  `start_from` DATETIME,
  `end_to` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`period_id`) REFERENCES `periods`(`id`) ON DELETE CASCADE,
  INDEX `idx_period_id` (`period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
