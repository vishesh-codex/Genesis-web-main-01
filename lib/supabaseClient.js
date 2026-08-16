// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Direct PostgreSQL Connection Pool for Supabase DB
let pgPool = null;
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (dbUrl) {
  try {
    pgPool = new pg.Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
  } catch (err) {
    console.warn('Supabase Postgres pool initialization warning:', err.message);
  }
}

export { pgPool };
