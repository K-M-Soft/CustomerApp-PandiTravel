import { initializeSchema, query } from './db';

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

type PricingRow = {
  id: number;
  name: string;
  pricePerKm: number;
  basePrice: number;
  description: string | null;
};

function mapPricing(row: PricingRow): Pricing {
  return {
    id: Number(row.id),
    name: row.name,
    pricePerKm: Number(row.pricePerKm),
    basePrice: Number(row.basePrice),
    description: row.description || undefined,
  };
}

async function ensureSchema() {
  await initializeSchema();
}

// Pricing operations
export async function getAllPricings(): Promise<Pricing[]> {
  await ensureSchema();
  const result = await query<PricingRow>(
    'SELECT id, name, "pricePerKm" as "pricePerKm", "basePrice" as "basePrice", description FROM pricing ORDER BY name'
  );
  return result.rows.map(mapPricing);
}

export async function getPricingById(id: number): Promise<Pricing | undefined> {
  await ensureSchema();
  const result = await query<PricingRow>(
    'SELECT id, name, "pricePerKm" as "pricePerKm", "basePrice" as "basePrice", description FROM pricing WHERE id = $1 LIMIT 1',
    [id]
  );
  if (!result.rows[0]) {
    return undefined;
  }
  return mapPricing(result.rows[0]);
}

export async function addPricing(pricing: Omit<Pricing, 'id'>): Promise<Pricing> {
  await ensureSchema();
  const result = await query<{ id: number }>(
    'INSERT INTO pricing (name, "pricePerKm", "basePrice", description) VALUES ($1, $2, $3, $4) RETURNING id',
    [pricing.name, pricing.pricePerKm, pricing.basePrice, pricing.description || null]
  );

  return {
    id: Number(result.rows[0].id),
    ...pricing,
  };
}

export async function updatePricing(id: number, pricing: Partial<Omit<Pricing, 'id'>>): Promise<void> {
  await ensureSchema();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (pricing.name !== undefined) {
    updates.push(`name = $${values.length + 1}`);
    values.push(pricing.name);
  }
  if (pricing.pricePerKm !== undefined) {
    updates.push(`"pricePerKm" = $${values.length + 1}`);
    values.push(pricing.pricePerKm);
  }
  if (pricing.basePrice !== undefined) {
    updates.push(`"basePrice" = $${values.length + 1}`);
    values.push(pricing.basePrice);
  }
  if (pricing.description !== undefined) {
    updates.push(`description = $${values.length + 1}`);
    values.push(pricing.description || null);
  }

  if (updates.length === 0) {
    return;
  }

  updates.push('"updatedAt" = NOW()');
  values.push(id);

  await query(`UPDATE pricing SET ${updates.join(', ')} WHERE id = $${values.length}`, values);
}

export async function deletePricing(id: number): Promise<void> {
  await ensureSchema();
  await query('DELETE FROM pricing WHERE id = $1', [id]);
}

// Service operations
export async function getAllServices(): Promise<Service[]> {
  await ensureSchema();
  const result = await query<Service>(
    'SELECT id, title, description, "sortOrder" as "sortOrder" FROM services ORDER BY "sortOrder" ASC, id ASC'
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    title: row.title,
    description: row.description,
    sortOrder: Number(row.sortOrder),
  }));
}

export async function addService(service: Omit<Service, 'id'>): Promise<Service> {
  await ensureSchema();
  const result = await query<{ id: number }>(
    'INSERT INTO services (title, description, "sortOrder") VALUES ($1, $2, $3) RETURNING id',
    [service.title, service.description, service.sortOrder]
  );

  return {
    id: Number(result.rows[0].id),
    ...service,
  };
}

export async function updateService(id: number, service: Partial<Omit<Service, 'id'>>): Promise<void> {
  await ensureSchema();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (service.title !== undefined) {
    updates.push(`title = $${values.length + 1}`);
    values.push(service.title);
  }
  if (service.description !== undefined) {
    updates.push(`description = $${values.length + 1}`);
    values.push(service.description);
  }
  if (service.sortOrder !== undefined) {
    updates.push(`"sortOrder" = $${values.length + 1}`);
    values.push(service.sortOrder);
  }

  if (updates.length === 0) {
    return;
  }

  updates.push('"updatedAt" = NOW()');
  values.push(id);

  await query(`UPDATE services SET ${updates.join(', ')} WHERE id = $${values.length}`, values);
}

export async function deleteService(id: number): Promise<void> {
  await ensureSchema();
  await query('DELETE FROM services WHERE id = $1', [id]);
}

// Analytics operations
export async function incrementMonthlyPageView(date: Date = new Date()): Promise<void> {
  await ensureSchema();
  const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

  await query(
    `
      INSERT INTO page_views_monthly (month, views, "updatedAt")
      VALUES ($1, 1, NOW())
      ON CONFLICT (month)
      DO UPDATE SET views = page_views_monthly.views + 1, "updatedAt" = NOW()
    `,
    [month]
  );
}

export async function getMonthlyPageViews(): Promise<MonthlyView[]> {
  await ensureSchema();
  const result = await query<MonthlyView>('SELECT month, views FROM page_views_monthly ORDER BY month DESC');
  return result.rows.map((row) => ({
    month: row.month,
    views: Number(row.views),
  }));
}

// Calculate fixed price based on selected pricing package.
export async function calculatePrice(
  pricingId: number
): Promise<{ totalPrice: number; breakdown: { basePrice: number; kmPrice: number } }> {
  const pricing = await getPricingById(pricingId);
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
