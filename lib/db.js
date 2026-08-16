// lib/db.js
import mysql from 'mysql2/promise';
import { supabase, pgPool } from './supabaseClient.js';

let mysqlPool = null;

try {
  if (process.env.DB_HOST) {
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'genesis',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      charset: 'utf8mb4',
      timezone: '+00:00'
    });
  }
} catch (err) {
  console.warn('MySQL pool initialization warning:', err.message);
}

export async function testConnection() {
  // 1. Try Supabase Postgres
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      client.release();
      console.log('Supabase PostgreSQL connected successfully');
      import('./autoInitDb.js').then(m => m.autoInitializeDatabaseSchema()).catch(() => {});
      return true;
    } catch (err) {
      console.warn('Supabase Postgres connection warning:', err.message);
    }
  }

  // 2. Try Supabase REST Client
  if (supabase) {
    console.log('Supabase JS Client initialized');
    import('./autoInitDb.js').then(m => m.autoInitializeDatabaseSchema()).catch(() => {});
    return true;
  }

  // 3. Try MySQL
  if (mysqlPool) {
    try {
      const connection = await mysqlPool.getConnection();
      console.log('MySQL connected successfully');
      connection.release();
      import('./autoInitDb.js').then(m => m.autoInitializeDatabaseSchema()).catch(() => {});
      return true;
    } catch (error) {
      console.error('MySQL connection failed:', error.message);
    }
  }

  return false;
}

export async function executeQuery(query, params = []) {
  const cleanParams = (params || []).map(param => (param === undefined ? null : param));

  // A. Execute via Supabase Postgres Pool (if SUPABASE_DB_URL / DATABASE_URL configured)
  if (pgPool) {
    try {
      let pgParamCount = 0;
      const pgQuery = query.replace(/\?/g, () => {
        pgParamCount++;
        return `$${pgParamCount}`;
      });

      const res = await pgPool.query(pgQuery, cleanParams);
      return { success: true, data: res.rows, insertId: res.rows?.[0]?.id };
    } catch (pgErr) {
      console.warn('Supabase Postgres query error, attempting MySQL fallback:', pgErr.message);
    }
  }

  // B. Execute via MySQL Pool
  if (mysqlPool) {
    let connection;
    try {
      connection = await mysqlPool.getConnection();
      const [rows] = await connection.query(query, cleanParams);
      return { success: true, data: rows };
    } catch (error) {
      console.error('=== MYSQL QUERY ERROR ===', error.message);
      return { success: false, error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

  return { success: false, error: 'No active Database pool initialized' };
}

export async function executeQueryPrepared(query, params = []) {
  return executeQuery(query, params);
}

export async function getConnection() {
  if (pgPool) return await pgPool.connect();
  if (mysqlPool) return await mysqlPool.getConnection();
  throw new Error('Database pool not initialized');
}

export default mysqlPool || pgPool;