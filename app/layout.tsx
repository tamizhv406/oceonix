import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Rajdhani, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const _rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const _jetbrains = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ocean Intelligence Command',
  description:
    'Tactical Ocean Intelligence Dashboard — real-time sensor telemetry across the Indian Ocean, Arabian Sea, and Bay of Bengal.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b1020',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
