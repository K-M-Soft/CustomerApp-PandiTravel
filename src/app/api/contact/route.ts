import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
});

function generateContactEmail(name: string, email: string, message: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Új kapcsolatfelvétel</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Név:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Üzenet:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    const adminEmail = process.env.ADMIN_EMAIL || 'contact@pandi-travel.hu';

    await sendEmail({
      to: adminEmail,
      subject: `Új kapcsolatfelvétel - ${validatedData.name}`,
      html: generateContactEmail(
        validatedData.name,
        validatedData.email,
        validatedData.message
      ),
      replyTo: validatedData.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact message error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Hibás kapcsolatfelvételi adatok', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Nem sikerült elküldeni az üzenetet' },
      { status: 500 }
    );
  }
}
