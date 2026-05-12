'use client'
// src/components/artikel/ArtikelCard.tsx

import Link from 'next/link'
import type { ArtikelLengkap } from '@/types/database'
import { Calendar, Tag, ArrowRight } from 'lucide-react'

export function ArtikelCard({ artikel }: { artikel: ArtikelLengkap }) {
  const namaKategori = artikel.kategori_nama || 'Pariwisata'
  const penulisUtama = artikel.penulis_list && artikel.penulis_list.length > 0 
    ? artikel.penulis_list[0].nama 
    : 'Anonim'
  const inisialPenulis = typeof penulisUtama === 'string' 
    ? penulisUtama.charAt(0).toUpperCase() 
    : 'A'

  return (
    <Link 
      href={`/artikel/${artikel.slug}`} 
      className="group block relative h-[480px] w-full rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_20px_50px_rgba(101,83,72,0.25)] transition-all duration-500 hover:-translate-y-3 bg-[#655348]"
    >
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        style={{ 
          // PERBAIKAN: Menghapus artikel.cover_image karena tidak ada di schema database
          backgroundImage: `url(${artikel.foto_sampul_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop'})` 
        }}
      />
      
      {/* Overlay Gradasi */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#655348] via-[#655348]/70 to-[#655348]/10 opacity-95 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Top Badge: Mengambil Kategori dari Database */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D9D9D9] text-[#655348] shadow-lg">
          <Tag size={12} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {namaKategori}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
        <div className="transition-transform duration-500 ease-out group-hover:-translate-y-2">
          
          {/* Judul Artikel */}
          <h3 className="text-2xl font-black text-white leading-[1.3] mb-4 line-clamp-3 drop-shadow-md">
            {artikel.judul}
          </h3>
          
          {/* Abstrak */}
          <p className="text-[#D9D9D9]/90 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
            {/* PERBAIKAN: Menggunakan artikel.abstrak sesuai database */}
            {artikel.abstrak || 'Temukan ulasan mendalam, statistik, dan analisis mengenai isu ini di ruang baca kami.'}
          </p>
          
          {/* Footer: Penulis & Tanggal */}
          <div className="flex items-center justify-between pt-5 border-t border-[#D9D9D9]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D9D9D9] flex items-center justify-center text-[#655348] font-black text-base border-2 border-transparent group-hover:border-white transition-colors">
                {inisialPenulis}
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-1 line-clamp-1">
                  {penulisUtama}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#D9D9D9]/70 uppercase tracking-widest">
                  <Calendar size={10} />
                  {new Date(artikel.published_at!).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            {/* Aksen Panah */}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-[#D9D9D9] group-hover:text-[#655348] transition-all duration-300 shrink-0">
              <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  )
}