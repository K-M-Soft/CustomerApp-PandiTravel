#!/usr/bin/env node
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'pandi-travel.db');

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
console.log('🌱 Initializing database schema...');

db.exec(`
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

db.exec(`
  CREATE TABLE IF NOT EXISTS distances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    kilometers REAL NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_location, to_location)
  );
`);

db.exec(`
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

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
  CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
  CREATE INDEX IF NOT EXISTS idx_distances_locations ON distances(from_location, to_location);
`);

console.log('✓ Schema initialized\n');

// Add pricing plans
console.log('📍 Adding pricing plans...');

const pricingData = [
  {
    name: 'Alap szállítás',
    pricePerKm: 400,
    basePrice: 1500,
    description: 'Alap szállítás szolgáltatás - 50 km-en belül',
  },
  {
    name: 'Prémium szállítás',
    pricePerKm: 400,
    basePrice: 3000,
    description: 'Prémium szállítás - 100 km felett',
  },
  {
    name: 'Reptéri transzfer',
    pricePerKm: 0,
    basePrice: 15000,
    description: '15 000 FT Reptéri transzfer',
  },
  {
    name: 'Egész napos bérlés',
    pricePerKm: 0,
    basePrice: 30000,
    description: '30 000 FT Egész napos bérlés',
  },
];

const insertPricing = db.prepare(
  'INSERT OR REPLACE INTO pricing (name, pricePerKm, basePrice, description) VALUES (?, ?, ?, ?)'
);

pricingData.forEach((pricing) => {
  try {
    insertPricing.run(
      pricing.name,
      pricing.pricePerKm,
      pricing.basePrice,
      pricing.description
    );
    console.log(`✓ ${pricing.name} pricing created`);
  } catch (error) {
    console.log(`⚠ ${pricing.name} already exists or error: ${error.message}`);
  }
});

console.log('');

// Add distances
console.log('📏 Adding distances...');

const distances = [
  {
    from_location: 'Budapest',
    to_location: 'Debrecen',
    kilometers: 220,
    description: 'Budapest - Debrecen útvonal',
  },
  {
    from_location: 'Budapest',
    to_location: 'Szeged',
    kilometers: 170,
    description: 'Budapest - Szeged útvonal',
  },
  {
    from_location: 'Budapest',
    to_location: 'Pécs',
    kilometers: 200,
    description: 'Budapest - Pécs útvonal',
  },
  {
    from_location: 'Budapest',
    to_location: 'Miskolc',
    kilometers: 150,
    description: 'Budapest - Miskolc útvonal',
  },
  {
    from_location: 'Budapest',
    to_location: 'Győr',
    kilometers: 120,
    description: 'Budapest - Győr útvonal',
  },
  {
    from_location: 'Budapest',
    to_location: 'Budapest Ferenc Liszt Airport',
    kilometers: 25,
    description: 'Budapest - Reptér',
  },
];

const insertDistance = db.prepare(
  'INSERT OR REPLACE INTO distances (from_location, to_location, kilometers, description) VALUES (?, ?, ?, ?)'
);

distances.forEach((distance) => {
  try {
    insertDistance.run(
      distance.from_location,
      distance.to_location,
      distance.kilometers,
      distance.description
    );
    console.log(`✓ ${distance.from_location} → ${distance.to_location}`);
  } catch (error) {
    console.log(
      `⚠ ${distance.from_location} → ${distance.to_location}: ${error.message}`
    );
  }
});

console.log('');
console.log('✅ Database seeded successfully!');

// Verify the data
const pricingCount = db.prepare('SELECT COUNT(*) as count FROM pricing').get();
const distanceCount = db.prepare('SELECT COUNT(*) as count FROM distances').get();

console.log(`\n📊 Database stats:`);
console.log(`   Pricing records: ${pricingCount.count}`);
console.log(`   Distance records: ${distanceCount.count}`);

db.close();
