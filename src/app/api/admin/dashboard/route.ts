import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getMonthlyPageViews, getAllPricings, getAllServices } from '@/lib/data';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Nincs jogosultság.' }, { status: 401 });
  }

  try {
    const db = getDb();
    const bookings = db
      .prepare(`
        SELECT
          b.id,
          b.name,
          b.email,
          b.phone,
          b.from_location,
          b.to_location,
          b.tripType,
          b.date,
          b.passengers,
          p.name as serviceName,
          b.createdAt
        FROM bookings b
        LEFT JOIN pricing p ON p.id = b.pricingId
        ORDER BY b.createdAt DESC
        LIMIT 200
      `)
      .all();

    return NextResponse.json({
      monthlyViews: getMonthlyPageViews(),
      bookings,
      pricings: getAllPricings(),
      services: getAllServices(),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Admin adatok lekérése sikertelen.' }, { status: 500 });
  }
}
