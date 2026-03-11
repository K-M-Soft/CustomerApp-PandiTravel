import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getMonthlyPageViews, getAllPricings, getAllServices } from '@/lib/data';
import { initializeSchema, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 401 });
  }

  try {
    await initializeSchema();
    const bookings = (
      await query(`
        SELECT
          b.id,
          b.name,
          b.email,
          b.phone,
          b.from_location,
          b.to_location,
          b."tripType" as "tripType",
          b.date,
          b.passengers,
          p.name as serviceName,
          b."createdAt" as "createdAt"
        FROM bookings b
        LEFT JOIN pricing p ON p.id = b."pricingId"
        ORDER BY b."createdAt" DESC
        LIMIT 200
      `)
    ).rows;

    return NextResponse.json({
      monthlyViews: await getMonthlyPageViews(),
      bookings,
      pricings: await getAllPricings(),
      services: await getAllServices(),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Admin adatok lekérése sikertelen.' }, { status: 500 });
  }
}
