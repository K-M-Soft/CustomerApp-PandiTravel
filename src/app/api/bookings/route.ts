import { NextRequest, NextResponse } from 'next/server';
import { initializeSchema, query } from '@/lib/db';
import { calculatePrice, getPricingById } from '@/lib/data';
import { sendEmail, generateBookingConfirmationEmail, generateAdminNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'A név legalább 2 karakter legyen.' }),
  email: z.string().email({ message: 'Érvényes email címet adj meg.' }),
  phone: z.string().optional(),
  from_location: z.string().min(1, { message: 'Az indulási hely megadása kötelező.' }),
  to_location: z.string().min(1, { message: 'A célhely megadása kötelező.' }),
  pricingId: z.number().positive({ message: 'Válassz érvényes díjcsomagot.' }),
  date: z.string().optional(),
  passengers: z.number().int().min(1, { message: 'Az utasok száma minimum 1.' }).max(4, { message: 'Az utasok száma maximum 4.' }).optional(),
  tripType: z.enum(['one-way', 'round-trip']).optional(),
  luggageCount: z.number().int().min(0, { message: 'A csomagok száma nem lehet negatív.' }).optional(),
  luggageSize: z.string().optional(),
  notes: z.string().optional(),
});

function toFieldErrors(issues: z.ZodIssue[]) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of issues) {
    const key = String(issue.path[0] || 'form');
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);
    await initializeSchema();

    const pricing = await getPricingById(validatedData.pricingId);
    if (!pricing) {
      return NextResponse.json(
        {
          error: 'A kiválasztott díjcsomag nem található.',
          fieldErrors: {
            pricingId: 'Válassz érvényes díjcsomagot.',
          },
        },
        { status: 400 }
      );
    }

    // Calculate fixed package price
    const priceInfo = await calculatePrice(validatedData.pricingId);

    // Insert booking
    const result = await query<{ id: number }>(
      `
      INSERT INTO bookings
      (
        name,
        email,
        phone,
        from_location,
        to_location,
        kilometers,
        "pricingId",
        "totalPrice",
        date,
        passengers,
        "tripType",
        "luggageCount",
        "luggageSize",
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
      `,
      [
        validatedData.name,
        validatedData.email,
        validatedData.phone || null,
        validatedData.from_location,
        validatedData.to_location,
        null,
        validatedData.pricingId,
        priceInfo.totalPrice,
        validatedData.date || null,
        validatedData.passengers || 1,
        validatedData.tripType || 'one-way',
        validatedData.luggageCount || 0,
        validatedData.luggageSize || null,
        validatedData.notes || null,
      ]
    );

    const bookingId = Number(result.rows[0].id);

    // Send confirmation email to client
    try {
      await sendEmail({
        to: validatedData.email,
        subject: 'Utazási foglalás megerősítése - Pandi Travel',
        html: generateBookingConfirmationEmail(validatedData.name, {
          from: validatedData.from_location,
          to: validatedData.to_location,
          basePrice: priceInfo.breakdown.basePrice,
          kmPrice: priceInfo.breakdown.kmPrice,
          totalPrice: priceInfo.totalPrice,
          bookingId: bookingId.toString(),
          serviceType: pricing.name,
          date: validatedData.date,
          passengers: validatedData.passengers,
          tripType: validatedData.tripType,
          luggageCount: validatedData.luggageCount,
          luggageSize: validatedData.luggageSize,
          notes: validatedData.notes,
        }),
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
            basePrice: priceInfo.breakdown.basePrice,
            kmPrice: priceInfo.breakdown.kmPrice,
            totalPrice: priceInfo.totalPrice,
            bookingId: bookingId.toString(),
            serviceType: pricing.name,
            phone: validatedData.phone,
            notes: validatedData.notes,
            date: validatedData.date,
            passengers: validatedData.passengers,
            tripType: validatedData.tripType,
            luggageCount: validatedData.luggageCount,
            luggageSize: validatedData.luggageSize,
          }),
        });
      }
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return NextResponse.json(
      {
        id: bookingId,
        ...validatedData,
        kilometers: null,
        totalPrice: priceInfo.totalPrice,
        status: 'pending',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'A foglalási adatok hibásak.',
          fieldErrors: toFieldErrors(error.issues),
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Nem sikerült létrehozni a foglalást.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initializeSchema();
    const bookings = (await query('SELECT * FROM bookings ORDER BY "createdAt" DESC')).rows;
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Nem sikerült lekérni a foglalásokat.' }, { status: 500 });
  }
}
