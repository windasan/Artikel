'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Globe, Mail, Phone, MapPin, Youtube, Twitter } from 'lucide-react'
import type { Route } from 'next'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Branding & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 shadow-lg">
                 {/* Ganti dengan logo UNY atau Prodi */}
                 <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg leading-tight tracking-tight">
                  Ruang Jelajah <span className="text-amber-400">Pariwisata</span>
                </h3>
                <p className="text-[11px] text-white/50 uppercase tracking-[2px] font-semibold">
                  Kelas A · Angkatan 2023
                </p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Portal resmi publikasi artikel dan jurnal mahasiswa Program Studi Pariwisata Universitas Negeri Yogyakarta. Mengulas pesona destinasi, budaya, dan inovasi industri pariwisata.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 transition-all duration-300">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 transition-all duration-300">
                <Youtube size={18} />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-500 transition-all duration-300">
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[3px] text-amber-400">Eksplorasi</h4>
            <ul className="space-y-3">
              {[
                { label: 'Beranda Utama', href: '/' },
                { label: 'Daftar Artikel', href: '/artikel' },
                { label: 'Profil Penulis', href: '/penulis' },
                { label: 'Tentang Prodi', href: '/tentang' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href as Route} className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories / Topics */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[3px] text-amber-400">Topik Populer</h4>
            <div className="flex flex-wrap gap-2">
              {['Destinasi', 'Kultur', 'Ekonomi', 'Sustainable', 'Trend', 'Ekowisata', 'Manajemen'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[12px] text-white/70 hover:bg-white/10 cursor-default transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[3px] text-amber-400">Kontak Kami</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-white/60">
                <MapPin size={20} className="shrink-0 text-amber-400" />
                <span>Kampus Pusat UNY, Karangmalang, Yogyakarta, 55281</span>
              </li>
              <li className="flex gap-3 text-sm text-white/60">
                <Phone size={18} className="shrink-0 text-amber-400" />
                <span>+62 274 586168</span>
              </li>
              <li className="flex gap-3 text-sm text-white/60">
                <Mail size={18} className="shrink-0 text-amber-400" />
                <span>pariwisata@uny.ac.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Logos */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[13px] text-white/40 text-center md:text-left">
            <p>© {currentYear} Program Studi Pariwisata UNY. Dikembangkan oleh <span className="text-white/70">Mahasiswa Kelas A</span>.</p>
            <p className="mt-1 italic">Bagian dari Jaringan Publikasi Ilmiah Nasional.</p>
          </div>
          
          {/* Branding Logos (Gaya Wonderful Indonesia) */}
          <div className="flex items-center gap-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <div className="text-right">
                <p className="text-[10px] font-bold tracking-[2px] leading-none mb-1">SUPPORTED BY</p>
                <p className="text-[14px] font-display font-black italic">UNY EXCELLENCE</p>
             </div>
             <div className="h-10 w-[2px] bg-white/20 hidden md:block"></div>
             <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-tighter">RUANG JELAJAH<br/>PARIWISATA</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  )
}