import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers'
import { SearchBar } from '@/components/layout/SearchBar'
import { ModernNavbar } from '@/components/layout/ModernNavbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Nor Chain Explorer',
  description: 'Real-time blockchain explorer and analytics for Nor Chain',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <SearchBar />
            <ModernNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
