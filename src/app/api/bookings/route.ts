import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getDistance, calculatePrice } from '@/lib/data';
import { sendEmail, generateBookingConfirmationEmail, generateAdminNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  from_location: z.string().min(1),
  to_location: z.string().min(1),
  pricingId: z.number().positive(),
  date: z.string().optional(),
  passengers: z.number().int().min(1).max(4).optional(),
  tripType: z.enum(['one-way', 'round-trip']).optional(),
  luggageCount: z.number().int().min(0).optional(),
  luggageSize: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);

    const db = getDb();

    // Get distance information
    const distance = getDistance(validatedData.from_location, validatedData.to_location);
    if (!distance) {
      return NextResponse.json(
        { error: 'Distance not found for these locations' },
        { status: 404 }
      );
    }

    // Calculate price
    const priceInfo = calculatePrice(distance.kilometers, validatedData.pricingId);

    // Insert booking
    const stmt = db.prepare(`
      INSERT INTO bookings 
      (name, email, phone, from_location, to_location, kilometers, pricingId, totalPrice, date, passengers, tripType, luggageCount, luggageSize, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      validatedData.name,
      validatedData.email,
      validatedData.phone || null,
      validatedData.from_location,
      validatedData.to_location,
      distance.kilometers,
      validatedData.pricingId,
      priceInfo.totalPrice,
      validatedData.date || null,
      validatedData.passengers || 1,
      validatedData.tripType || 'one-way',
      validatedData.luggageCount || 0,
      validatedData.luggageSize || null,
      validatedData.notes || null
    );

    const bookingId = result.lastInsertRowid as number;

    // Send confirmation email to client
    try {
      await sendEmail({
        to: validatedData.email,
        subject: 'Utazási foglalás megerősítése - Pandi Travel',
        html: generateBookingConfirmationEmail(validatedData.name, {
          from: validatedData.from_location,
          to: validatedData.to_location,
          kilometers: distance.kilometers,
          totalPrice: priceInfo.totalPrice,
          bookingId: bookingId.toString(),          date: validatedData.date,
          passengers: validatedData.passengers,
          tripType: validatedData.tripType,
          luggageCount: validatedData.luggageCount,
          luggageSize: validatedData.luggageSize,        }),
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    // Send notification email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'contact@pandi-travel.hu';
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `Új foglalás - ${validatedData.name}`,
          html: generateAdminNotificationEmail(validatedData.name, validatedData.email, {
            from: validatedData.from_location,
            to: validatedData.to_location,
            kilometers: distance.kilometers,
            totalPrice: priceInfo.totalPrice,
            phone: validatedData.phone,
            notes: validatedData.notes,            date: validatedData.date,
            passengers: validatedData.passengers,
            tripType: validatedData.tripType,
            luggageCount: validatedData.luggageCount,
            luggageSize: validatedData.luggageSize,          }),
        });
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return NextResponse.json(
      {
        id: bookingId,
        ...validatedData,
        kilometers: distance.kilometers,
        totalPrice: priceInfo.totalPrice,
        status: 'pending',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid booking data', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY createdAt DESC').all();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
