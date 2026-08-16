-- ============================================================
-- Volunteer Keys & Event Attendance Scan Migration
-- Genesis QUIC Platform
-- ============================================================

-- 1. Volunteer Keys Table
CREATE TABLE IF NOT EXISTS `volunteer_keys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key_code` VARCHAR(100) NOT NULL UNIQUE,
  `role` VARCHAR(100) NOT NULL DEFAULT 'IN Gate Volunteer',
  `assigned_to` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_key_code` (`key_code`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Migration ALTER Statements for existing volunteer_keys table
ALTER TABLE `volunteer_keys`
  ADD COLUMN IF NOT EXISTS `expires_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`;

-- Initial Seed Data for Volunteer Keys
INSERT IGNORE INTO `volunteer_keys` (`id`, `key_code`, `role`, `assigned_to`, `is_active`, `expires_at`) VALUES
(1, 'VOL-2026', 'IN Gate Volunteer', 'Main Gate', 1, NULL),
(2, 'GATE-IN-2026', 'IN Gate Volunteer', 'Entry Gate 1', 1, NULL),
(3, 'GATE-OUT-2026', 'OUT Gate Volunteer', 'Exit Gate 1', 1, NULL),
(4, 'GENESIS-2026', 'Lead Volunteer', 'VIP Control', 1, NULL),
(5, 'QUIC-VOLUNTEER', 'IN Gate Volunteer', 'Campus Gate', 1, NULL),
(6, 'GENESIS-VOL', 'IN Gate Volunteer', 'Auditorium Gate', 1, NULL),
(7, 'VOLUNTEER-2026', 'IN Gate Volunteer', 'Concourse Gate', 1, NULL),
(8, 'ADMIN-123', 'Admin Supervisor', 'All Gates', 1, NULL),
(9, '123456', 'Test Volunteer', 'Testing Gate', 1, NULL),
(10, 'GATE-2026', 'IN/OUT Dual Volunteer', 'Main Gate 2', 1, NULL),
(11, 'VOL-IN-001', 'IN Gate Volunteer', 'Main Entry Scanner', 1, NULL),
(12, 'VOL-OUT-001', 'OUT Gate Volunteer', 'Main Exit Scanner', 1, NULL);

-- 2. Event Registrations Table Schema (with in_time, out_time, in_scanned_by, out_scanned_by)
CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `registration_data` LONGTEXT CHECK (json_valid(`registration_data`)),
  `status` ENUM('pending', 'confirmed', 'cancelled', 'checked_out') DEFAULT 'pending',
  `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` TIMESTAMP NULL DEFAULT NULL,
  `in_time` TIMESTAMP NULL DEFAULT NULL,
  `out_time` TIMESTAMP NULL DEFAULT NULL,
  `in_scanned_by` VARCHAR(255) DEFAULT NULL,
  `out_scanned_by` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_event_id` (`event_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Migration ALTER Statements for existing event_registrations table
ALTER TABLE `event_registrations` 
  ADD COLUMN IF NOT EXISTS `in_time` TIMESTAMP NULL DEFAULT NULL AFTER `confirmed_at`,
  ADD COLUMN IF NOT EXISTS `out_time` TIMESTAMP NULL DEFAULT NULL AFTER `in_time`,
  ADD COLUMN IF NOT EXISTS `in_scanned_by` VARCHAR(255) DEFAULT NULL AFTER `out_time`,
  ADD COLUMN IF NOT EXISTS `out_scanned_by` VARCHAR(255) DEFAULT NULL AFTER `in_scanned_by`;
