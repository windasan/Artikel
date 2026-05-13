import type { Metadata } from 'next'
import { Poppins, Montserrat } from 'next/font/google';
import "@/app/globals.css"
import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'
import { Footer } from '@/components/layout/Footer' // <--- Import Footer

// Konfigurasi Font
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '700', '900'],
  variable: '--font-poppins', // Nama variabel CSS
});

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat',
});
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
    <html lang="id" className={`${poppins.variable} ${montserrat.variable} grain`}>
      <body className="antialiased font-sans">
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-right" />
        <Footer />
      </body>
    </html>
  )
}