import type { Metadata } from 'next'
import { Outfit, Cormorant_Garamond } from 'next/font/google' // Import font
import "@/app/globals.css"
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'

// Konfigurasi Font
const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: {
    default: 'Jurnal Pariwisata UNY',
    template: '%s — Jurnal Pariwisata UNY',
  },
  description: 'Portal publikasi kolaboratif mahasiswa Program Studi Pariwisata UNY.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${outfit.variable} ${cormorant.variable} grain`}>
      <body className="antialiased font-sans">
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}