const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'pandi-travel.db');
const db = new Database(dbPath);

console.log('🌱 Adding services to database...');

// Check if services already exist
const existingServices = db.prepare('SELECT COUNT(*) as count FROM services').get();

if (existingServices.count > 0) {
  console.log('⚠️ Services already exist. Clearing old services...');
  db.prepare('DELETE FROM services').run();
}

// Insert services
const insert = db.prepare(`
  INSERT INTO services (title, description, sortOrder)
  VALUES (?, ?, ?)
`);

const services = [
  {
    title: 'Rugalmas és biztonságos utazási lehetőségek',
    description: 'Sofőrszolgáltatásunk a hét MINDEN NAPJÁN elérhető, akár előre egyeztetett - akár azonnali szükség esetén igénybevehető! Kérjük ügyfeleinket, lehetőség szerint e-mailben vagy telefonon előre egyeztetve keressék sofőr szolgáltatásunkat!',
    sortOrder: 1,
  },
  {
    title: 'VIP transzfer szolgáltatás',
    description: 'A Tesla transzfer lehetővé teszi, hogy környezetbarát módon utazhass és élvezhesd a modern technológia előnyeit, csendes környezetben és tisztaságban! A VIP transzfer szolgáltatás lehetővé teszi, hogy kényelmesen és stílusosan érkezzünk úti célunkhoz, akár várakozásról, akár oda-vissza útról legyen szó!',
    sortOrder: 2,
  },
  {
    title: 'Utazási tanácsadás Teslával',
    description: 'Kényelmes, csendes, biztonságos, mindent igényt kielégítő Tesla Model 3-as autóval utazva adjuk át Önnek az utazás élményét! BELFÖLDÖN és KÜLFÖLDÖN egyaránt vállalunk személyszállító sofőr szolgáltatást, előre megbeszélt áron és időben - vagy akár azonnali szükség esetén is!',
    sortOrder: 3,
  },
  {
    title: 'Árlista',
    description: 'Utazásaink árát előre meghatározott tarifán számoljuk, amiket feltüntetünk több fórumon is! Alapdíjból és Km/viteldíjból határozzuk meg a személyszállítási fuvar teljes költségét, amit már indulás előtt az Ügyfél tudtára adunk!',
    sortOrder: 4,
  },
];

services.forEach((service) => {
  insert.run(service.title, service.description, service.sortOrder);
  console.log(`✓ ${service.title}`);
});

console.log('\n✨ Successfully added 4 services!');

// Verify
const count = db.prepare('SELECT COUNT(*) as count FROM services').get();
console.log(`\nTotal services in database: ${count.count}`);

db.close();
