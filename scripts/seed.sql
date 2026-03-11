-- Pandi Travel seed script for PostgreSQL (Supabase)
-- Safe to run multiple times.

BEGIN;

-- Schema
CREATE TABLE IF NOT EXISTS pricing (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  "pricePerKm" DOUBLE PRECISION NOT NULL,
  "basePrice" DOUBLE PRECISION NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views_monthly (
  month TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services("sortOrder");

-- Pricing seed (upsert)
INSERT INTO pricing (name, "pricePerKm", "basePrice", description)
VALUES
  ('Alap szállítás', 400, 1500, 'Alap szállítás szolgáltatás - 50 km-en belül'),
  ('Prémium szállítás', 400, 3000, 'Prémium szállítás - 100 km felett'),
  ('Reptéri transzfer', 0, 15000, '15 000 FT Reptéri transzfer'),
  ('Egész napos bérlés', 0, 30000, '30 000 FT Egész napos bérlés')
ON CONFLICT (name)
DO UPDATE SET
  "pricePerKm" = EXCLUDED."pricePerKm",
  "basePrice" = EXCLUDED."basePrice",
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- Services seed (deterministic reset + insert)
TRUNCATE TABLE services RESTART IDENTITY;

INSERT INTO services (title, description, "sortOrder")
VALUES
  (
    'Rugalmas és biztonságos utazási lehetőségek',
    'Sofőrszolgáltatásunk a hét MINDEN NAPJÁN elérhető, akár előre egyeztetett - akár azonnali szükség esetén igénybevehető! Kérjük ügyfeleinket, lehetőség szerint e-mailben vagy telefonon előre egyeztetve keressék sofőr szolgáltatásunkat!',
    1
  ),
  (
    'VIP transzfer szolgáltatás',
    'A Tesla transzfer lehetővé teszi, hogy környezetbarát módon utazhass és élvezhesd a modern technológia előnyeit, csendes környezetben és tisztaságban! A VIP transzfer szolgáltatás lehetővé teszi, hogy kényelmesen és stílusosan érkezzünk úti célunkhoz, akár várakozásról, akár oda-vissza útról legyen szó!',
    2
  ),
  (
    'Utazási tanácsadás Teslával',
    'Kényelmes, csendes, biztonságos, mindent igényt kielégítő Tesla Model 3-as autóval utazva adjuk át Önnek az utazás élményét! BELFÖLDÖN és KÜLFÖLDÖN egyaránt vállalunk személyszállító sofőr szolgáltatást, előre megbeszélt áron és időben - vagy akár azonnali szükség esetén is!',
    3
  ),
  (
    'Árlista',
    'Utazásaink árát előre meghatározott tarifán számoljuk, amiket feltüntetünk több fórumon is! Alapdíjból és Km/viteldíjból határozzuk meg a személyszállítási fuvar teljes költségét, amit már indulás előtt az Ügyfél tudtára adunk!',
    4
  );

COMMIT;
