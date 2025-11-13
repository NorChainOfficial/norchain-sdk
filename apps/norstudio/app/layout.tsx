import type { Metadata } from 'next'
import { Inter, Fira_Code } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
})

export const metadata: Metadata = {
  title: 'NorStudio - AI-Powered Smart Contract IDE',
  description: 'Build, test, and deploy smart contracts for NorChain with AI assistance',
  keywords: ['blockchain', 'smart contracts', 'IDE', 'NorChain', 'Solidity', 'AI'],
  authors: [{ name: 'NorChain Team' }],
  openGraph: {
    title: 'NorStudio - AI-Powered Smart Contract IDE',
    description: 'Build, test, and deploy smart contracts for NorChain with AI assistance',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
