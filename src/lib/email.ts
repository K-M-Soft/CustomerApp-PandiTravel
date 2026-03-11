import path from 'path';
import nodemailer from 'nodemailer';

// Email configuration - production ready
let transporter: nodemailer.Transporter | null = null;
const EMAIL_LOGO_CID = 'pandi-travel-logo';
const EMAIL_LOGO_PATH = path.join(process.cwd(), 'public', 'logo.jpeg');

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
  attachments?: nodemailer.SendMailOptions['attachments'];
}

function formatDateHungarianDot(dateString?: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${year}.${month}.${day}`;
  }
  return dateString;
}

function getLogoHtml(className: string) {
  return `<img class="${className}" src="cid:${EMAIL_LOGO_CID}" alt="Pándi Travel logó" />`;
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
      attachments: [
        {
          filename: 'logo.jpeg',
          path: EMAIL_LOGO_PATH,
          cid: EMAIL_LOGO_CID,
        },
        ...(options.attachments || []),
      ],
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
    kilometers?: number | null;
    totalPrice: number;
    basePrice?: number;
    kmPrice?: number;
    bookingId: string;
    serviceType?: string;
    date?: string;
    passengers?: number;
    tripType?: string;
    luggageCount?: number;
    luggageSize?: string;
    notes?: string;
  }
): string {
  const formattedDate = formatDateHungarianDot(bookingDetails.date);
  const brandLogo = getLogoHtml('brand-logo');
  const footerLogo = getLogoHtml('footer-logo');

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .brand {
            display: inline-flex;
            align-items: center;
            gap: 14px;
          }
          .brand-logo {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            object-fit: cover;
            background-color: rgba(255, 255, 255, 0.16);
            padding: 4px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
          }
          .booking-details {
            background-color: #f0f4f8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e7ff;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #2563eb;
            min-width: 150px;
          }
          .detail-value {
            color: #333;
            text-align: right;
          }
          .pricing-section {
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #bfdbfe;
          }
          .price-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 16px;
          }
          .price-label {
            font-weight: 600;
            color: #1e40af;
          }
          .price-value {
            color: #1e40af;
            font-weight: 600;
          }
          .notes-section {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .notes-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
          }
          .notes-content {
            color: #78350f;
            font-size: 14px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 30px 20px;
            text-align: center;
            font-size: 13px;
          }
          .footer-logo {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            object-fit: cover;
            display: block;
            margin: 0 auto 12px;
            background-color: rgba(255, 255, 255, 0.08);
            padding: 4px;
          }
          .footer-title {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 15px;
          }
          .footer-section {
            margin: 10px 0;
          }
          .footer-contact {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #475569;
          }
          a {
            color: #60a5fa;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="brand">
              ${brandLogo}
              <h1>Pándi Travel</h1>
            </div>
            <p>Utazási foglalás megerősítése</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <p>Kedves <strong>${clientName}</strong>!</p>
              <p>Köszönjük a foglalásodat! Az alábbiak az utazás részletei:</p>
            </div>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Foglalási szám:</span>
                <span class="detail-value"><strong>${bookingDetails.bookingId}</strong></span>
              </div>
              ${formattedDate ? `
              <div class="detail-row">
                <span class="detail-label">Dátum:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Indulás:</span>
                <span class="detail-value">${bookingDetails.from}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Érkezés:</span>
                <span class="detail-value">${bookingDetails.to}</span>
              </div>
              ${bookingDetails.serviceType ? `
              <div class="detail-row">
                <span class="detail-label">Szolgáltatás:</span>
                <span class="detail-value">${bookingDetails.serviceType}</span>
              </div>
              ` : ''}
              ${bookingDetails.tripType ? `
              <div class="detail-row">
                <span class="detail-label">Utazás típusa:</span>
                <span class="detail-value">${bookingDetails.tripType === 'round-trip' ? 'Oda-vissza' : 'Csak oda'}</span>
              </div>
              ` : ''}
              ${bookingDetails.passengers ? `
              <div class="detail-row">
                <span class="detail-label">Utasok száma:</span>
                <span class="detail-value">${bookingDetails.passengers} fő</span>
              </div>
              ` : ''}
              ${bookingDetails.luggageCount ? `
              <div class="detail-row">
                <span class="detail-label">Csomagok száma:</span>
                <span class="detail-value">${bookingDetails.luggageCount}</span>
              </div>
              ` : ''}
              ${bookingDetails.luggageSize ? `
              <div class="detail-row">
                <span class="detail-label">Csomagok mérete:</span>
                <span class="detail-value">${bookingDetails.luggageSize}</span>
              </div>
              ` : ''}
            </div>

            <div class="pricing-section">
              ${bookingDetails.basePrice !== undefined ? `
              <div class="price-row">
                <span class="price-label">Alapdíj:</span>
                <span class="price-value">${bookingDetails.basePrice.toLocaleString('hu-HU')} Ft</span>
              </div>
              ` : ''}
              ${bookingDetails.kmPrice !== undefined ? `
              <div class="price-row">
                <span class="price-label">Km díj:</span>
                <span class="price-value">${bookingDetails.kmPrice.toLocaleString('hu-HU')} Ft/km</span>
              </div>
              ` : ''}
            </div>

            ${bookingDetails.notes ? `
            <div class="notes-section">
              <div class="notes-title">Megjegyzés</div>
              <div class="notes-content">${bookingDetails.notes}</div>
            </div>
            ` : ''}

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Hamarosan felvesszük veled a kapcsolatot. Ha bármilyen kérdésed van, keress minket bizalommal.
            </p>
          </div>

          <div class="footer">
            ${footerLogo}
            <div class="footer-title">Pándi Travel</div>
            <div class="footer-section">
              <strong>Prémium személyszállítás és privát transzfer</strong>
            </div>
            <div class="footer-contact">
              <p style="margin: 5px 0;">
                <a href="mailto:contact@pandi-travel.hu">contact@pandi-travel.hu</a>
              </p>
              <p style="margin: 5px 0;">
                <a href="tel:+36209282626">+36-20-928-2626</a>
              </p>
              <p style="margin: 5px 0;">
                2370 Dabas, Wesselényi utca
              </p>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #475569; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">© 2026 Pándi Travel. Minden jog fenntartva.</p>
            </div>
          </div>
        </div>
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
    kilometers?: number | null;
    totalPrice: number;
    basePrice?: number;
    kmPrice?: number;
    bookingId: string;
    serviceType?: string;
    phone?: string;
    notes?: string;
    date?: string;
    passengers?: number;
    tripType?: string;
    luggageCount?: number;
    luggageSize?: string;
  }
): string {
  const formattedDate = formatDateHungarianDot(bookingDetails.date);
  const brandLogo = getLogoHtml('brand-logo');
  const footerLogo = getLogoHtml('footer-logo');

  return `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .brand {
            display: inline-flex;
            align-items: center;
            gap: 14px;
          }
          .brand-logo {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            object-fit: cover;
            background-color: rgba(255, 255, 255, 0.16);
            padding: 4px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .booking-ref {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
            font-size: 14px;
          }
          .booking-ref-label {
            opacity: 0.9;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .booking-ref-number {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 2px;
          }
          .content {
            padding: 30px 20px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 10px;
            margin-top: 25px;
            margin-bottom: 15px;
          }
          .section-title:first-of-type {
            margin-top: 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e7ff;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #475569;
            min-width: 150px;
          }
          .detail-value {
            color: #333;
            text-align: right;
            font-weight: 500;
          }
          .pricing-section {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #f59e0b;
          }
          .price-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 16px;
          }
          .price-label {
            font-weight: 600;
            color: #92400e;
          }
          .price-value {
            color: #92400e;
            font-weight: 600;
          }
          .notes-section {
            background-color: #e0e7ff;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #4f46e5;
          }
          .notes-title {
            font-weight: 600;
            color: #3730a3;
            margin-bottom: 8px;
          }
          .notes-content {
            color: #3730a3;
            font-size: 14px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .alert {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            border-radius: 6px;
            color: #991b1b;
            margin: 20px 0;
          }
          .footer {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 30px 20px;
            text-align: center;
            font-size: 13px;
          }
          .footer-logo {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            object-fit: cover;
            display: block;
            margin: 0 auto 12px;
            background-color: rgba(255, 255, 255, 0.08);
            padding: 4px;
          }
          .footer-title {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 15px;
          }
          .footer-contact {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #475569;
          }
          a {
            color: #60a5fa;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="brand">
              ${brandLogo}
              <h1>Pándi Travel</h1>
            </div>
            <p>Új foglalás érkezett</p>
            <div class="booking-ref">
              <div class="booking-ref-label">Foglalási szám</div>
              <div class="booking-ref-number">${bookingDetails.bookingId}</div>
            </div>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>Figyelem:</strong> Ez egy admin értesítés. Kérjük, hamarosan vedd fel a kapcsolatot az ügyféllel.
            </div>

            <div class="section-title">Ügyfél adatai</div>
            <div class="detail-row">
              <span class="detail-label">Név:</span>
              <span class="detail-value"><strong>${clientName}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value"><a href="mailto:${clientEmail}">${clientEmail}</a></span>
            </div>
            ${bookingDetails.phone ? `
            <div class="detail-row">
              <span class="detail-label">Telefon:</span>
              <span class="detail-value">${bookingDetails.phone}</span>
            </div>
            ` : ''}

            <div class="section-title">Utazás részletei</div>
            ${formattedDate ? `
            <div class="detail-row">
              <span class="detail-label">Dátum:</span>
              <span class="detail-value"><strong>${formattedDate}</strong></span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Indulás:</span>
              <span class="detail-value">${bookingDetails.from}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Érkezés:</span>
              <span class="detail-value">${bookingDetails.to}</span>
            </div>
            ${bookingDetails.serviceType ? `
            <div class="detail-row">
              <span class="detail-label">Szolgáltatás:</span>
              <span class="detail-value"><strong>${bookingDetails.serviceType}</strong></span>
            </div>
            ` : ''}
            ${bookingDetails.tripType ? `
            <div class="detail-row">
              <span class="detail-label">Utazás típusa:</span>
              <span class="detail-value">${bookingDetails.tripType === 'round-trip' ? 'Oda-vissza' : 'Csak oda'}</span>
            </div>
            ` : ''}
            ${bookingDetails.passengers ? `
            <div class="detail-row">
              <span class="detail-label">Utasok száma:</span>
              <span class="detail-value">${bookingDetails.passengers} fő</span>
            </div>
            ` : ''}
            ${bookingDetails.luggageCount ? `
            <div class="detail-row">
              <span class="detail-label">Csomagok száma:</span>
              <span class="detail-value">${bookingDetails.luggageCount}</span>
            </div>
            ` : ''}
            ${bookingDetails.luggageSize ? `
            <div class="detail-row">
              <span class="detail-label">Csomagok mérete:</span>
              <span class="detail-value">${bookingDetails.luggageSize}</span>
            </div>
            ` : ''}

            <div class="section-title">Árazás</div>
            <div class="pricing-section">
              ${bookingDetails.basePrice !== undefined ? `
              <div class="price-row">
                <span class="price-label">Alapdíj:</span>
                <span class="price-value">${bookingDetails.basePrice.toLocaleString('hu-HU')} Ft</span>
              </div>
              ` : ''}
              ${bookingDetails.kmPrice !== undefined ? `
              <div class="price-row">
                <span class="price-label">Km díj:</span>
                <span class="price-value">${bookingDetails.kmPrice.toLocaleString('hu-HU')} Ft/km</span>
              </div>
              ` : ''}
            </div>

            ${bookingDetails.notes ? `
            <div class="section-title">Ügyfél megjegyzése</div>
            <div class="notes-section">
              <div class="notes-content">${bookingDetails.notes}</div>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            ${footerLogo}
            <div class="footer-title">Pándi Travel</div>
            <div class="footer-section">
              <strong>Prémium személyszállítás és privát transzfer</strong>
            </div>
            <div class="footer-contact">
              <p style="margin: 5px 0;">
                <a href="mailto:contact@pandi-travel.hu">contact@pandi-travel.hu</a>
              </p>
              <p style="margin: 5px 0;">
                <a href="tel:+36209282626">+36-20-928-2626</a>
              </p>
              <p style="margin: 5px 0;">
                2370 Dabas, Wesselényi utca
              </p>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #475569; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">© 2026 Pándi Travel. Minden jog fenntartva.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
