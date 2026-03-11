import { getDb } from './db';

export interface Pricing {
  id: number;
  name: string;
  pricePerKm: number;
  basePrice: number;
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

// Calculate fixed price based on selected pricing package.
export function calculatePrice(
  pricingId: number
): { totalPrice: number; breakdown: { basePrice: number; kmPrice: number } } {
  const pricing = getPricingById(pricingId);
  if (!pricing) {
    throw new Error('Pricing not found');
  }

  const basePrice = pricing.basePrice;
  // Distance-based pricing is disabled; keep km fee as informational package value.
  const kmPrice = pricing.pricePerKm;
  const totalPrice = basePrice;

  return {
    totalPrice,
    breakdown: {
      basePrice,
      kmPrice,
    },
  };
}
