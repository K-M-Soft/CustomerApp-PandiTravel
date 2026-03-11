import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;
let schemaInitPromise: Promise<void> | null = null;

function getPoolConfig(): PoolConfig {
  const connectionString = [
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value));

  if (connectionString) {
    return {
      connectionString,
      ssl: { rejectUnauthorized: false },
    };
  }

  const host = process.env.POSTGRES_HOST?.trim();
  const port = Number(process.env.POSTGRES_PORT || '5432');
  const database = process.env.POSTGRES_DB?.trim() || process.env.POSTGRES_DATABASE?.trim() || 'postgres';
  const user = process.env.POSTGRES_USER?.trim() || 'postgres';
  const password = process.env.POSTGRES_PASSWORD?.trim();

  if (!host || !password) {
    throw new Error(
      'Hiányzó PostgreSQL konfiguráció. Állítsd be a DATABASE_URL/POSTGRES_URL változót vagy a POSTGRES_HOST/POSTGRES_PORT/POSTGRES_DB/POSTGRES_DATABASE/POSTGRES_USER/POSTGRES_PASSWORD változókat.'
    );
  }

  return {
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
  };
}

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool(getPoolConfig());
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return getDb().query<T>(text, params);
}

export async function initializeSchema(): Promise<void> {
  if (schemaInitPromise) {
    return schemaInitPromise;
  }

  schemaInitPromise = (async () => {
    const db = getDb();

    await db.query(`
      CREATE TABLE IF NOT EXISTS pricing (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        "pricePerKm" DOUBLE PRECISION NOT NULL,
        "basePrice" DOUBLE PRECISION NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        from_location TEXT NOT NULL,
        to_location TEXT NOT NULL,
        kilometers DOUBLE PRECISION,
        "pricingId" INTEGER REFERENCES pricing(id) ON DELETE SET NULL,
        "totalPrice" DOUBLE PRECISION,
        date TEXT,
        passengers INTEGER DEFAULT 1,
        "tripType" TEXT DEFAULT 'one-way',
        "luggageCount" INTEGER DEFAULT 0,
        "luggageSize" TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS page_views_monthly (
        month TEXT PRIMARY KEY,
        views INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.query('CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services("sortOrder");');
  })().catch((error) => {
    schemaInitPromise = null;
    throw error;
  });

  return schemaInitPromise;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    schemaInitPromise = null;
  }
}
