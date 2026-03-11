#!/usr/bin/env node

/**
 * Seed script for Pandi Travel database
 * Initializes with sample pricing and services
 * 
 * Run: npx ts-node scripts/seed.ts
 */

import { addPricing, addService } from '../src/lib/data';
import { getDb, closeDb } from '../src/lib/db';

try {
  console.log('🌱 Seeding database...');

  // Initialize database
  getDb();

  // Add pricing plans
  console.log('\n📍 Adding pricing plans...');
  
  addPricing({
    name: 'Alap szállítás',
    pricePerKm: 400,
    basePrice: 1500,
    description: 'Alap szállítás szolgáltatás - 50 km-en belül',
  });
  console.log('✓ Alap szállítás díj létrehozva');

  addPricing({
    name: 'Prémium szállítás',
    pricePerKm: 400,
    basePrice: 3000,
    description: 'Prémium szállítás - 100 km felett',
  });
  console.log('✓ Prémium szállítás díj létrehozva');

  addPricing({
    name: 'Reptéri transzfer',
    pricePerKm: 0,
    basePrice: 15000,
    description: '15 000 FT Reptéri transzfer',
  });
  console.log('✓ Reptéri transzfer díj létrehozva');

  addPricing({
    name: 'Egész napos bérlés',
    pricePerKm: 0,
    basePrice: 30000,
    description: '30 000 FT Egész napos bérlés',
  });
  console.log('✓ Egész napos bérlés díj létrehozva');

  console.log('\n🧩 Adding services...');
  const db = getDb();
  const serviceCountRow = db.prepare('SELECT COUNT(*) as count FROM services').get() as {
    count: number;
  };

  if (serviceCountRow.count === 0) {
    addService({
      title: 'Rugalmas és biztonságos utazási lehetőségek',
      description:
        'Sofőrszolgáltatásunk a hét MINDEN NAPJÁN elérhető, akár előre egyeztetett - akár azonnali szükség esetén igénybevehető! Kérjük ügyfeleinket, lehetőség szerint e-mailben vagy telefonon előre egyeztetve keressék sofőr szolgáltatásunkat!',
      sortOrder: 1,
    });

    addService({
      title: 'VIP transzfer szolgáltatás',
      description:
        'A Tesla transzfer lehetővé teszi, hogy környezetbarát módon utazhass és élvezhesd a modern technológia előnyeit, csendes környezetben és tisztaságban! A VIP transzfer szolgáltatás lehetővé teszi, hogy kényelmesen és stílusosan érkezzünk úti célunkhoz, akár várakozásról, akár oda-vissza útról legyen szó!',
      sortOrder: 2,
    });

    addService({
      title: 'Utazási tanácsadás Teslával',
      description:
        'Kényelmes, csendes, biztonságos, mindent igényt kielégítő Tesla Model 3-as autóval utazva adjuk át Önnek az utazás élményét! BELFÖLDÖN és KÜLFÖLDÖN egyaránt vállalunk személyszállító sofőr szolgáltatást, előre megbeszélt áron és időben - vagy akár azonnali szükség esetén is!',
      sortOrder: 3,
    });

    addService({
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

} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
} finally {
  closeDb();
}
