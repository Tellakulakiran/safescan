import type { Metadata } from 'next'
import './globals.css'

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
