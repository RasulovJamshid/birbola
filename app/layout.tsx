import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Birbola - Bog\'chalar platformasi',
    template: '%s | Birbola'
  },
  description: 'Farzandingiz uchun eng yaxshi bog\'chani toping. Minglab ota-onalar ishongan platforma.',
  keywords: ['bog\'cha', 'maktabgacha ta\'lim', 'bolalar bog\'chasi', 'Toshkent', 'O\'zbekiston', 'birbola'],
  authors: [{ name: 'Birbola Team' }],
  creator: 'Birbola',
  publisher: 'Birbola',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://birbola.uz'),
  openGraph: {
    title: 'Birbola - Bog\'chalar platformasi',
    description: 'Farzandingiz uchun eng yaxshi bog\'chani toping',
    url: 'https://birbola.uz',
    siteName: 'Birbola',
    locale: 'uz_UZ',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Birbola - Bog\'chalar platformasi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birbola - Bog\'chalar platformasi',
    description: 'Farzandingiz uchun eng yaxshi bog\'chani toping',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <head>
        {/* Telegram Login Widget */}
        <script async src="https://telegram.org/js/telegram-widget.js"></script>
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
