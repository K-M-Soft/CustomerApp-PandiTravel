import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Script from 'next/script';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://panditravel.hu'),
  title: {
    default: 'Pándi Travel - Prémium Tesla Személyszállítás | VIP Sofőrszolgálat',
    template: '%s | Pándi Travel'
  },
  description: 'Prémium Tesla Model 3 személyszállítás Magyarországon és külföldön. Kényelmes, környezetbarát VIP transzfer szolgáltatás.RepTéri transzfer, egész napos bérlés. Foglaljon most!',
  keywords: [
    'tesla transzfer',
    'személyszállítás',
    'sofőrszolgálat',
    'VIP transzfer',
    'reptéri transzfer',
    'Tesla Model 3',
    'prémium szállítás',
    'környezetbarát közlekedés',
    'elektromos autó bérlés',
    'sofőr szolgáltatás',
    'magyarország személyszállítás',
    'budapest transzfer',
    'nemzetközi személyszállítás'
  ],
  authors: [{ name: 'Pándi Travel' }],
  creator: 'Pándi Travel',
  publisher: 'Pándi Travel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Pándi Travel - Prémium Tesla Személyszállítás',
    description: 'Prémium Tesla Model 3 személyszállítás. Kényelmes, környezetbarát VIP transzfer szolgáltatás Magyarországon és külföldön.',
    url: 'https://panditravel.hu',
    siteName: 'Pándi Travel',
    locale: 'hu_HU',
    type: 'website',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Pándi Travel - Tesla Személyszállítás',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pándi Travel - Prémium Tesla Személyszállítás',
    description: 'Prémium Tesla Model 3 személyszállítás. Környezetbarát VIP transzfer szolgáltatás.',
    images: ['/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://panditravel.hu',
  },
  category: 'transportation',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Pándi Travel',
  description: 'Prémium Tesla Model 3 személyszállítás Magyarországon és külföldön',
  url: 'https://panditravel.hu',
  logo: 'https://panditravel.hu/logo.jpeg',
  image: 'https://panditravel.hu/logo.jpeg',
  '@id': 'https://panditravel.hu',
  telephone: '+36-XX-XXX-XXXX',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'HU',
    addressLocality: 'Budapest',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 47.4979,
    longitude: 19.0402,
  },
  areaServed: [
    {
      '@type': 'Country',
      name: 'Magyarország',
    },
    {
      '@type': 'City',
      name: 'Budapest',
    },
  ],
  serviceType: [
    'Személyszállítás',
    'VIP Transzfer',
    'Reptéri Transzfer',
    'Tesla Kölcsönzés Sofőrrel',
    'Nemzetközi Személyszállítás',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Szolgáltatások',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Alap szállítás',
          description: 'Alap szállítás szolgáltatás - 50 km-en belül',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Prémium szállítás',
          description: 'Prémium szállítás - 100 km felett',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Reptéri transzfer',
          description: 'Reptéri transzfer szolgáltatás',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Egész napos bérlés',
          description: 'Egész napos Tesla bérlés sofőrrel',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '10',
  },
  sameAs: [
    // Add social media links here when available
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
