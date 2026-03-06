import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Leads TEC360 – 100 Leads CDMX',
  description: 'Dashboard inteligente de prospección para TEC360Cloud en Ciudad de México',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={manrope.className}>{children}</body>
    </html>
  )
}
