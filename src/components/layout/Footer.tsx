'use client'

import Link from 'next/link'
import { Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#655348] pt-24 pb-12 px-6 overflow-hidden relative font-sans text-[#D9D9D9]">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D9D9D9" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-[1.1]">
              Ruang Jelajah<br/><span className="text-[#D9D9D9]">Pariwisata</span>
            </h2>
            <p className="text-[11px] text-[#D9D9D9]/50 uppercase tracking-[2px] font-bold">
              Kelas A · Angkatan 2023
            </p>
            <p className="text-[#D9D9D9]/80 max-w-sm text-sm leading-relaxed border-l-2 border-[#D9D9D9]/30 pl-4 italic">
              Portal resmi publikasi artikel dan jurnal mahasiswa Program Studi Pariwisata Universitas Negeri Yogyakarta. Mengulas pesona destinasi, budaya, dan inovasi industri pariwisata berkelanjutan.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://www.instagram.com/pariwisata.uny/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#D9D9D9] hover:text-[#655348] transition-all hover:-translate-y-1 shadow-lg" target="_blank" rel="noopener noreferrer">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#D9D9D9] hover:text-[#655348] transition-all hover:-translate-y-1 shadow-lg" target="_blank" rel="noopener noreferrer">
                <Twitter size={18} />
              </a>
              <a href="https://www.youtube.com/@PariwisataUNY" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#D9D9D9] hover:text-[#655348] transition-all hover:-translate-y-1 shadow-lg" target="_blank" rel="noopener noreferrer">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Kontak Section */}
          <div className="space-y-6">
            <p className="text-[12px] font-black text-white uppercase tracking-[3px] flex items-center gap-2">
              Hubungi Kami
            </p>
            <ul className="space-y-4">
            {/* Alamat - Buka Google Maps */}
              <li className="flex gap-3 text-sm text-[#D9D9D9]/80 hover:text-white transition-colors">
                <MapPin size={18} className="shrink-0 mt-0.5 text-[#D9D9D9]" />
                <a 
                  href="https://maps.google.com/?q=Universitas+Negeri+Yogyakarta+Kampus+Karangmalang" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="leading-relaxed hover:underline"
                >
                  Kampus Karangmalang,<br/>Universitas Negeri Yogyakarta,<br/>Sleman, DIY 55281
                </a>
              </li>

              {/* Telepon - Langsung Panggil (Call) */}
              <li className="flex gap-3 text-sm text-[#D9D9D9]/80 hover:text-white transition-colors">
                <Phone size={18} className="shrink-0 text-[#D9D9D9]" />
                <a href="tel:+62274586168" className="hover:underline">
                  +62 274 586168
                </a>
              </li>

              {/* Email - Langsung Buka Aplikasi Email */}
              <li className="flex gap-3 text-sm text-[#D9D9D9]/80 hover:text-white transition-colors">
                <Mail size={18} className="shrink-0 text-[#D9D9D9]" />
                <a href="mailto:s1pariwisata@uny.ac.id" className="hover:underline">
                  s1pariwisata@uny.ac.id
                </a>
              </li>
            </ul>
          </div>

          {/* Links Section (Penulisan statis untuk TypedRoutes) */}
          <div className="space-y-6">
            <p className="text-[12px] font-black text-white uppercase tracking-[3px] flex items-center gap-2">
              Navigasi
            </p>
            <ul className="space-y-4">
              <li><Link href="/" className="text-[#D9D9D9]/70 hover:text-white font-bold text-[14px] hover:translate-x-2 transition-transform inline-block">Beranda</Link></li>
              <li><Link href="/artikel" className="text-[#D9D9D9]/70 hover:text-white font-bold text-[14px] hover:translate-x-2 transition-transform inline-block">Artikel</Link></li>
              <li><Link href="/penulis" className="text-[#D9D9D9]/70 hover:text-white font-bold text-[14px] hover:translate-x-2 transition-transform inline-block">Penulis</Link></li>
              <li><Link href="/tentang" className="text-[#D9D9D9]/70 hover:text-white font-bold text-[14px] hover:translate-x-2 transition-transform inline-block">Tentang</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-[#D9D9D9]/50 tracking-[0.1em] text-center md:text-left">
            © {currentYear} Ruang Jelajah Pariwisata UNY. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-6">
             <a href="#" className="text-[11px] font-bold text-[#D9D9D9]/50 hover:text-white uppercase tracking-widest">Kebijakan Privasi</a>
             <a href="#" className="text-[11px] font-bold text-[#D9D9D9]/50 hover:text-white uppercase tracking-widest">Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  )
}