-- ============================================================
-- Applications System Migration
-- Run this in your MySQL (Railway phpMyAdmin or CLI)
-- ============================================================

-- 1. Application Forms (like Google Forms)
CREATE TABLE IF NOT EXISTS `application_forms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` ENUM('active','draft','closed') DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Form Fields (questions on each form)
CREATE TABLE IF NOT EXISTS `application_form_fields` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `form_id` INT NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `field_type` ENUM('text','textarea','email','phone','number','select','radio','checkbox','date','url') NOT NULL DEFAULT 'text',
  `options` JSON,
  `required` TINYINT(1) NOT NULL DEFAULT 0,
  `placeholder` VARCHAR(255),
  `field_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`form_id`) REFERENCES `application_forms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Submissions
CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `form_id` INT NOT NULL,
  `applicant_name` VARCHAR(255),
  `applicant_email` VARCHAR(255),
  `status` ENUM('submitted','under_review','accepted','rejected') DEFAULT 'submitted',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`form_id`) REFERENCES `application_forms`(`id`) ON DELETE CASCADE,
  INDEX `idx_form_id` (`form_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_email` (`applicant_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Answers (EAV — one row per field per submission)
CREATE TABLE IF NOT EXISTS `application_answers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL,
  `field_id` INT NOT NULL,
  `answer` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`field_id`) REFERENCES `application_form_fields`(`id`) ON DELETE CASCADE,
  INDEX `idx_application_id` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
