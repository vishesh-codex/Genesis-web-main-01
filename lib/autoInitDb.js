// lib/autoInitDb.js
import { executeQuery } from './db.js';

let isAutoInitialized = false;

// SQL Table Schemas (12 Required Tables)
const TABLE_SCHEMAS = [
  {
    name: 'admin_roles',
    sql: `
      CREATE TABLE IF NOT EXISTS admin_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_super TINYINT(1) DEFAULT 0,
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'admin',
    sql: `
      CREATE TABLE IF NOT EXISTS admin (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(150),
        role_id INT,
        permissions JSON,
        status TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'events',
    sql: `
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        content LONGTEXT,
        date VARCHAR(100),
        time VARCHAR(100),
        location VARCHAR(255),
        category VARCHAR(100) DEFAULT 'Flagship',
        status VARCHAR(50) DEFAULT 'upcoming',
        max_attendees INT DEFAULT 500,
        current_registrations INT DEFAULT 0,
        registered_count INT DEFAULT 0,
        image_url TEXT,
        is_featured TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'event_registrations',
    sql: `
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        registration_data JSON,
        confirmation_token VARCHAR(100) UNIQUE,
        status VARCHAR(50) DEFAULT 'confirmed',
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'event_form_fields',
    sql: `
      CREATE TABLE IF NOT EXISTS event_form_fields (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        field_label VARCHAR(150) NOT NULL,
        field_type VARCHAR(50) DEFAULT 'text',
        required TINYINT(1) DEFAULT 1,
        placeholder VARCHAR(255),
        field_options JSON,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'volunteer_keys',
    sql: `
      CREATE TABLE IF NOT EXISTS volunteer_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_code VARCHAR(100) UNIQUE NOT NULL,
        key_type VARCHAR(20) DEFAULT 'in',
        label VARCHAR(150),
        event_id INT,
        status TINYINT(1) DEFAULT 1,
        expires_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'volunteer_scan_logs',
    sql: `
      CREATE TABLE IF NOT EXISTS volunteer_scan_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_code VARCHAR(100) NOT NULL,
        event_id INT,
        gate_role VARCHAR(50) DEFAULT 'IN_GATE',
        attendee_name VARCHAR(150),
        qu_id VARCHAR(100),
        ticket_ref VARCHAR(100),
        status VARCHAR(50) DEFAULT 'ENTRY_SUCCESS',
        scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'blog_categories',
    sql: `
      CREATE TABLE IF NOT EXISTS blog_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'blogs',
    sql: `
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        summary TEXT,
        excerpt TEXT,
        content LONGTEXT,
        author VARCHAR(100) DEFAULT 'Genesis Team',
        author_name VARCHAR(100) DEFAULT 'Genesis Team',
        author_role VARCHAR(100) DEFAULT 'Contributor',
        author_image VARCHAR(255) DEFAULT '/startup-teams.webp',
        category_id INT,
        image_url TEXT,
        read_time VARCHAR(50),
        featured TINYINT(1) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'published',
        views INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'portfolio',
    sql: `
      CREATE TABLE IF NOT EXISTS portfolio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        title VARCHAR(150),
        category VARCHAR(100),
        description TEXT,
        founders VARCHAR(255),
        funding_stage VARCHAR(100),
        funding VARCHAR(100),
        employees VARCHAR(100),
        founded VARCHAR(50),
        logo_url TEXT,
        image_url TEXT,
        image TEXT,
        website_url TEXT,
        link TEXT,
        status VARCHAR(50) DEFAULT 'active',
        tags JSON,
        date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'gallery',
    sql: `
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        type VARCHAR(50) DEFAULT 'image',
        description TEXT,
        url TEXT NOT NULL,
        size VARCHAR(50) DEFAULT '0 MB',
        dimensions VARCHAR(50) DEFAULT 'N/A',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'applications',
    sql: `
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        track VARCHAR(100) DEFAULT 'startup',
        startup_name VARCHAR(150),
        status VARCHAR(50) DEFAULT 'pending',
        application_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  },
  {
    name: 'system_settings',
    sql: `
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `
  }
];

export async function autoInitializeDatabaseSchema() {
  if (isAutoInitialized) {
    return { success: true, message: 'Already auto-initialized in this session' };
  }

  const createdTables = [];
  const errors = [];

  for (const table of TABLE_SCHEMAS) {
    try {
      const res = await executeQuery(table.sql);
      if (res.success) {
        createdTables.push(table.name);
      } else {
        errors.push(`${table.name}: ${res.error}`);
      }
    } catch (err) {
      errors.push(`${table.name}: ${err.message}`);
    }
  }

  // Seed default super_admin role if not exists
  try {
    await executeQuery(`
      INSERT IGNORE INTO admin_roles (id, name, slug, description, is_super, permissions)
      VALUES (1, 'Super Admin', 'super_admin', 'Full Unrestricted System Permissions', 1, '{"all": true}')
    `);
  } catch {}

  // Seed default settings if not exists
  try {
    await executeQuery(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value)
      VALUES ('groq_model', 'llama-3.3-70b-versatile')
    `);
  } catch {}

  isAutoInitialized = true;
  console.log(`Auto Database Schema initialized (${createdTables.length} tables verified).`);

  return {
    success: errors.length === 0,
    createdTables,
    errors
  };
}

export default autoInitializeDatabaseSchema;
