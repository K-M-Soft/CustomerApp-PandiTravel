#!/usr/bin/env node

/**
 * Seed script for Pandi Travel database
 * Initializes with sample pricing and services
 * 
 * Run: npx ts-node scripts/seed.ts
 */

import { addService } from '../src/lib/data';
import { closeDb, initializeSchema, query } from '../src/lib/db';

async function seed() {
  console.log('🌱 Seeding database...');

  await initializeSchema();

  // Add pricing plans
  console.log('\n📍 Adding pricing plans...');
  const pricingRows = [
    ['Alap szállítás', 400, 1500, 'Alap szállítás szolgáltatás - 50 km-en belül'],
    ['Prémium szállítás', 400, 3000, 'Prémium szállítás - 100 km felett'],
    ['Reptéri transzfer', 0, 15000, '15 000 FT Reptéri transzfer'],
    ['Egész napos bérlés', 0, 30000, '30 000 FT Egész napos bérlés'],
  ] as const;

  for (const [name, pricePerKm, basePrice, description] of pricingRows) {
    await query(
      `
        INSERT INTO pricing (name, "pricePerKm", "basePrice", description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name)
        DO UPDATE SET
          "pricePerKm" = EXCLUDED."pricePerKm",
          "basePrice" = EXCLUDED."basePrice",
          description = EXCLUDED.description,
          "updatedAt" = NOW()
      `,
      [name, pricePerKm, basePrice, description]
    );

    console.log(`✓ ${name} díj létrehozva/frissítve`);
  }

  console.log('\n🧩 Adding services...');
  const serviceCountRow = (await query<{ count: string }>('SELECT COUNT(*)::text as count FROM services')).rows[0];
  const serviceCount = Number(serviceCountRow?.count || 0);

  if (serviceCount === 0) {
    await addService({
      title: 'Rugalmas és biztonságos utazási lehetőségek',
      description:
        'Sofőrszolgáltatásunk a hét MINDEN NAPJÁN elérhető, akár előre egyeztetett - akár azonnali szükség esetén igénybevehető! Kérjük ügyfeleinket, lehetőség szerint e-mailben vagy telefonon előre egyeztetve keressék sofőr szolgáltatásunkat!',
      sortOrder: 1,
    });

    await addService({
      title: 'VIP transzfer szolgáltatás',
      description:
        'A Tesla transzfer lehetővé teszi, hogy környezetbarát módon utazhass és élvezhesd a modern technológia előnyeit, csendes környezetben és tisztaságban! A VIP transzfer szolgáltatás lehetővé teszi, hogy kényelmesen és stílusosan érkezzünk úti célunkhoz, akár várakozásról, akár oda-vissza útról legyen szó!',
      sortOrder: 2,
    });

    await addService({
      title: 'Utazási tanácsadás Teslával',
      description:
        'Kényelmes, csendes, biztonságos, mindent igényt kielégítő Tesla Model 3-as autóval utazva adjuk át Önnek az utazás élményét! BELFÖLDÖN és KÜLFÖLDÖN egyaránt vállalunk személyszállító sofőr szolgáltatást, előre megbeszélt áron és időben - vagy akár azonnali szükség esetén is!',
      sortOrder: 3,
    });

    await addService({
      title: 'Árlista',
      description:
        'Utazásaink árát előre meghatározott tarifán számoljuk, amiket feltüntetünk több fórumon is! Alapdíjból és Km/viteldíjból határozzuk meg a személyszállítási fuvar teljes költségét, amit már indulás előtt az Ügyfél tudtára adunk!',
      sortOrder: 4,
    });

    console.log('✓ 4 szolgáltatás létrehozva');
  } else {
    console.log('⚠ Szolgáltatások már léteznek, kihagyva');
  }

  console.log('\n✨ Database seeding completed successfully!');
  console.log('\nSample data added:');
  console.log('- 4 pricing plans');
  console.log('- 4 services');
  console.log('\nYou can now start using the app!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });
