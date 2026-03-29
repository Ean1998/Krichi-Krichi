import { neon } from '@neondatabase/serverless';

let initialized = false;

async function initializeDb() {
  if (initialized) return;
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS salons (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT,
      address TEXT,
      city TEXT,
      phone TEXT,
      email TEXT,
      cover_image TEXT,
      logo TEXT,
      opening_hours TEXT,
      is_approved INTEGER DEFAULT 1,
      rating DECIMAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL NOT NULL,
      duration INTEGER NOT NULL,
      category TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS salon_photos (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      caption TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL REFERENCES salons(id),
      service_id TEXT NOT NULL REFERENCES services(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      customer_user_id TEXT,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total_price DECIMAL NOT NULL,
      commission DECIMAL NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_user_id TEXT,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  initialized = true;
}

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

export async function getDbReady() {
  await initializeDb();
  return neon(process.env.DATABASE_URL!);
}

export type NeonQuery = ReturnType<typeof neon>;
