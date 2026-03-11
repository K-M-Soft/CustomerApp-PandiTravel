import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

// Production-ready SQLite database
const dbPath = path.join(process.cwd(), 'data', 'pandi-travel.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dbDir = path.dirname(dbPath);
    mkdirSync(dbDir, { recursive: true });
    
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = db;

  // Legacy cleanup: distance-based pricing was removed.
  database.exec(`DROP TABLE IF EXISTS distances;`);

  // Pricing table
  database.exec(`
    CREATE TABLE IF NOT EXISTS pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      pricePerKm REAL NOT NULL,
      basePrice REAL NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Bookings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      from_location TEXT NOT NULL,
      to_location TEXT NOT NULL,
      kilometers REAL,
      pricingId INTEGER,
      totalPrice REAL,
      date TEXT,
      passengers INTEGER DEFAULT 1,
      tripType TEXT DEFAULT 'one-way',
      luggageCount INTEGER DEFAULT 0,
      luggageSize TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pricingId) REFERENCES pricing(id)
    );
  `);

  // Services table
  database.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      sortOrder INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Monthly page view analytics table
  database.exec(`
    CREATE TABLE IF NOT EXISTS page_views_monthly (
      month TEXT PRIMARY KEY,
      views INTEGER NOT NULL DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sortOrder);
  `);

}

export function closeDb() {
  if (db) {
    db.close();
  }
}
