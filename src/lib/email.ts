import nodemailer from 'nodemailer';

// Email configuration - production ready
let transporter: nodemailer.Transporter | null = null;

function getSanitizedEnvValue(value?: string) {
  if (!value) return '';
  return value.trim();
}

function getGmailPassword() {
  // Google app passwords are sometimes pasted with spaces every 4 chars.
  // Remove all whitespace to avoid auth issues.
  return getSanitizedEnvValue(process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, '');
}

function ensureEmailConfig(provider: string) {
  if (provider === 'gmail') {
    const gmailUser = getSanitizedEnvValue(process.env.GMAIL_EMAIL);
    const gmailPass = getGmailPassword();

    if (!gmailUser || !gmailPass) {
      throw new Error(
        'Hiányzó Gmail email konfiguráció: állítsd be a GMAIL_EMAIL és GMAIL_APP_PASSWORD változókat.'
      );
    }
    return;
  }

  const smtpUser = getSanitizedEnvValue(process.env.SMTP_USER);
  const smtpPass = getSanitizedEnvValue(process.env.SMTP_PASSWORD);

  // If one of them is present, require both.
  if ((smtpUser && !smtpPass) || (!smtpUser && smtpPass)) {
    throw new Error(
      'Hiányos SMTP auth konfiguráció: a SMTP_USER és SMTP_PASSWORD mezőket együtt kell beállítani.'
    );
  }
}

export function getEmailTransporter() {
  if (!transporter) {
    const emailProvider = getSanitizedEnvValue(process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
    ensureEmailConfig(emailProvider);

    if (emailProvider === 'gmail') {
      const gmailUser = getSanitizedEnvValue(process.env.GMAIL_EMAIL);
      const gmailPass = getGmailPassword();

      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
    } else {
      const smtpUser = getSanitizedEnvValue(process.env.SMTP_USER);
      const smtpPass = getSanitizedEnvValue(process.env.SMTP_PASSWORD);

      // Generic SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: smtpUser && smtpPass
          ? {
              user: smtpUser,
              pass: smtpPass,
            }
          : undefined,
      });
    }
  }

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = getEmailTransporter();
    const from = getSanitizedEnvValue(process.env.EMAIL_FROM) || 'contact@pandi-travel.hu';

    const result = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || from,
    });

    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

export function generateBookingConfirmationEmail(
  clientName: string,
  bookingDetails: {
    from: string;
    to: string;
    kilometers: number;
    totalPrice: number;
    bookingId: string;
    date?: string;
    passengers?: number;
    tripType?: string;
    luggageCount?: number;
    luggageSize?: string;
  }
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Utazási foglalás megerősítése</h2>
        <p>Kedves ${clientName}!</p>
        <p>Köszönjük a foglalásodért! Az alábbiak az utazási részleteid:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Foglalási szám:</strong> ${bookingDetails.bookingId}</p>
          ${bookingDetails.date ? `<p><strong>Dátum:</strong> ${bookingDetails.date}</p>` : ''}
          <p><strong>Indulás:</strong> ${bookingDetails.from}</p>
          <p><strong>Érkezés:</strong> ${bookingDetails.to}</p>
          ${bookingDetails.tripType ? `<p><strong>Típus:</strong> ${bookingDetails.tripType === 'round-trip' ? 'Oda-vissza' : 'Csak oda'}</p>` : ''}
          ${bookingDetails.passengers ? `<p><strong>Utasok száma:</strong> ${bookingDetails.passengers} fő</p>` : ''}
          <p><strong>Távolság:</strong> ${bookingDetails.kilometers} km</p>
          ${bookingDetails.luggageCount ? `<p><strong>Csomagok száma:</strong> ${bookingDetails.luggageCount}</p>` : ''}
          ${bookingDetails.luggageSize ? `<p><strong>Csomagok mérete:</strong> ${bookingDetails.luggageSize}</p>` : ''}
          <p><strong>Ár:</strong> ${bookingDetails.totalPrice.toLocaleString('hu-HU')} Ft</p>
        </div>

        <p>Hamarosan fel fogjuk venni veled a kapcsolatot!</p>
        
        <p>Üdvözlettel,<br/>Pandi Travel</p>
      </body>
    </html>
  `;
}

export function generateAdminNotificationEmail(
  clientName: string,
  clientEmail: string,
  bookingDetails: {
    from: string;
    to: string;
    kilometers: number;
    totalPrice: number;
    phone?: string;
    notes?: string;
    date?: string;
    passengers?: number;
    tripType?: string;
    luggageCount?: number;
    luggageSize?: string;
  }
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Új foglalás</h2>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ügyfél:</strong> ${clientName}</p>
          <p><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
          ${bookingDetails.phone ? `<p><strong>Telefon:</strong> ${bookingDetails.phone}</p>` : ''}
          ${bookingDetails.date ? `<p><strong>Dátum:</strong> ${bookingDetails.date}</p>` : ''}
          <p><strong>Indulás:</strong> ${bookingDetails.from}</p>
          <p><strong>Érkezés:</strong> ${bookingDetails.to}</p>
          ${bookingDetails.tripType ? `<p><strong>Típus:</strong> ${bookingDetails.tripType === 'round-trip' ? 'Oda-vissza' : 'Csak oda'}</p>` : ''}
          ${bookingDetails.passengers ? `<p><strong>Utasok száma:</strong> ${bookingDetails.passengers} fő</p>` : ''}
          <p><strong>Távolság:</strong> ${bookingDetails.kilometers} km</p>
          ${bookingDetails.luggageCount ? `<p><strong>Csomagok száma:</strong> ${bookingDetails.luggageCount}</p>` : ''}
          ${bookingDetails.luggageSize ? `<p><strong>Csomagok mérete:</strong> ${bookingDetails.luggageSize}</p>` : ''}
          <p><strong>Ár:</strong> ${bookingDetails.totalPrice.toLocaleString('hu-HU')} Ft</p>
          ${bookingDetails.notes ? `<p><strong>Megjegyzések:</strong> ${bookingDetails.notes}</p>` : ''}
        </div>
      </body>
    </html>
  `;
}
