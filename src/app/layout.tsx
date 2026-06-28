import type { Metadata } from 'next'
import './globals.css'
import InstallBanner from './InstallBanner'

export const metadata: Metadata = {
  title: 'SafeScan — Your Silent Guardian',
  description: 'Emergency QR profile. One scan gives first responders everything they need.',
  openGraph: {
    title: 'SafeScan — Your Silent Guardian',
    description: 'Create a free emergency QR profile in 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e8302a" />

        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SafeScan" />
        <link rel="apple-touch-icon" href="/icon.svg" />

        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </head>
      <body>
        <InstallBanner />
        {children}
      </body>
    </html>
  )
}
