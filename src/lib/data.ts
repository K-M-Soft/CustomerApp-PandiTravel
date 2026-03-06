import { getDb } from './db';

export interface Pricing {
  id: number;
  name: string;
  pricePerKm: number;
  basePrice: number;
  description?: string;
}

export interface Distance {
  id: number;
  from_location: string;
  to_location: string;
  kilometers: number;
  description?: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
}

export interface MonthlyView {
  month: string;
  views: number;
}

// Pricing operations
export function getAllPricings(): Pricing[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM pricing ORDER BY name');
  return stmt.all() as Pricing[];
}

export function getPricingById(id: number): Pricing | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM pricing WHERE id = ?');
  return stmt.get(id) as Pricing | undefined;
}

export function addPricing(pricing: Omit<Pricing, 'id'>): Pricing {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO pricing (name, pricePerKm, basePrice, description) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(pricing.name, pricing.pricePerKm, pricing.basePrice, pricing.description);
  
  return {
    id: result.lastInsertRowid as number,
    ...pricing,
  };
}

export function updatePricing(id: number, pricing: Partial<Omit<Pricing, 'id'>>): void {
  const db = getDb();
  const updates: string[] = [];
  const values: (string | number | undefined)[] = [];

  if (pricing.name !== undefined) {
    updates.push('name = ?');
    values.push(pricing.name);
  }
  if (pricing.pricePerKm !== undefined) {
    updates.push('pricePerKm = ?');
    values.push(pricing.pricePerKm);
  }
  if (pricing.basePrice !== undefined) {
    updates.push('basePrice = ?');
    values.push(pricing.basePrice);
  }
  if (pricing.description !== undefined) {
    updates.push('description = ?');
    values.push(pricing.description);
  }

  if (updates.length === 0) return;

  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE pricing SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deletePricing(id: number): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM pricing WHERE id = ?');
  stmt.run(id);
}

// Distance operations
export function getAllDistances(): Distance[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM distances ORDER BY from_location, to_location');
  return stmt.all() as Distance[];
}

export function getDistance(fromLocation: string, toLocation: string): Distance | undefined {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT * FROM distances WHERE from_location = ? AND to_location = ?'
  );
  return stmt.get(fromLocation, toLocation) as Distance | undefined;
}

export function addDistance(distance: Omit<Distance, 'id'>): Distance {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO distances (from_location, to_location, kilometers, description) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(
    distance.from_location,
    distance.to_location,
    distance.kilometers,
    distance.description
  );

  return {
    id: result.lastInsertRowid as number,
    ...distance,
  };
}

export function updateDistance(id: number, distance: Partial<Omit<Distance, 'id'>>): void {
  const db = getDb();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (distance.kilometers !== undefined) {
    updates.push('kilometers = ?');
    values.push(distance.kilometers);
  }
  if (distance.description !== undefined) {
    updates.push('description = ?');
    values.push(distance.description);
  }

  if (updates.length === 0) return;

  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE distances SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteDistance(id: number): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM distances WHERE id = ?');
  stmt.run(id);
}

// Service operations
export function getAllServices(): Service[] {
  const db = getDb();
  const stmt = db.prepare('SELECT id, title, description, sortOrder FROM services ORDER BY sortOrder ASC, id ASC');
  return stmt.all() as Service[];
}

export function addService(service: Omit<Service, 'id'>): Service {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO services (title, description, sortOrder) VALUES (?, ?, ?)'
  );
  const result = stmt.run(service.title, service.description, service.sortOrder);

  return {
    id: result.lastInsertRowid as number,
    ...service,
  };
}

export function updateService(id: number, service: Partial<Omit<Service, 'id'>>): void {
  const db = getDb();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (service.title !== undefined) {
    updates.push('title = ?');
    values.push(service.title);
  }
  if (service.description !== undefined) {
    updates.push('description = ?');
    values.push(service.description);
  }
  if (service.sortOrder !== undefined) {
    updates.push('sortOrder = ?');
    values.push(service.sortOrder);
  }

  if (updates.length === 0) {
    return;
  }

  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteService(id: number): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  stmt.run(id);
}

// Analytics operations
export function incrementMonthlyPageView(date: Date = new Date()): void {
  const db = getDb();
  const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

  const stmt = db.prepare(`
    INSERT INTO page_views_monthly (month, views, updatedAt)
    VALUES (?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(month)
    DO UPDATE SET views = views + 1, updatedAt = CURRENT_TIMESTAMP
  `);

  stmt.run(month);
}

export function getMonthlyPageViews(): MonthlyView[] {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT month, views FROM page_views_monthly ORDER BY month DESC'
  );
  return stmt.all() as MonthlyView[];
}

// Calculate price based on pricing and distance
export function calculatePrice(
  kilometers: number,
  pricingId: number
): { totalPrice: number; breakdown: { basePrice: number; kmPrice: number } } {
  const pricing = getPricingById(pricingId);
  if (!pricing) {
    throw new Error('Pricing not found');
  }

  const basePrice = pricing.basePrice;
  const kmPrice = kilometers * pricing.pricePerKm;
  const totalPrice = basePrice + kmPrice;

  return {
    totalPrice,
    breakdown: {
      basePrice,
      kmPrice,
    },
  };
}
