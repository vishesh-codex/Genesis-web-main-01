// lib/db.js
import mysql from 'mysql2/promise';

let pool;

try {
  pool = mysql.createPool({
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
} catch (err) {
  console.warn('MySQL pool initialization warning:', err.message);
}

export async function testConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();

    // Auto-create any missing tables in background
    import('./autoInitDb.js').then(m => m.autoInitializeDatabaseSchema()).catch(err => {
      console.warn('Auto DB schema init background warning:', err.message);
    });

    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

export async function executeQuery(query, params = []) {
  if (!pool) {
    return { success: false, error: 'Database pool not initialized' };
  }
  let connection;
  try {
    const cleanParams = params.map(param => {
      if (param === undefined || param === null) {
        return null;
      }
      return param;
    });

    connection = await pool.getConnection();
    const [rows] = await connection.query(query, cleanParams);
    return { success: true, data: rows };
  } catch (error) {
    console.error('=== DB QUERY ERROR ===', error.message);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function executeQueryPrepared(query, params = []) {
  if (!pool) {
    return { success: false, error: 'Database pool not initialized' };
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const statement = await connection.prepare(query);
    const [rows] = await statement.execute(params);
    await statement.close();
    return { success: true, data: rows };
  } catch (error) {
    console.error('=== PREPARED STATEMENT ERROR ===', error.message);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function getConnection() {
  if (!pool) throw new Error('Database pool not initialized');
  return await pool.getConnection();
}

export default pool;