import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import type { ArtikelLengkap } from '@/types/database'

export function ArtikelCard({ artikel }: { artikel: ArtikelLengkap }) {
  return (
    <Link href={`/artikel/${artikel.slug}`} className="group block h-full w-[300px] md:w-[380px] shrink-0">
      <div className="flex flex-col bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 h-full shadow-sm border border-gray-100">
        
        {/* Gambar */}
        <div className="relative w-full h-56 md:h-64 overflow-hidden bg-gray-50">
          <Image 
            src={artikel.foto_sampul_url || '/Images/alt.jpg'} 
            alt={artikel.judul} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Overlay shadow tipis saat dihover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>

        {/* Konten */}
        <div className="p-6 md:p-8 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Top Info: Kategori & Tanggal */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block px-3 py-1 bg-red-50 text-[#FF6B6B] text-[10px] font-black rounded-md uppercase tracking-[0.1em]">
                {artikel.kategori_nama || 'Pariwisata'}
              </span>
              <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(artikel.published_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            
            {/* Judul & Abstrak */}
            <h3 className="text-xl font-black text-gray-900 group-hover:text-[#655348] transition-colors mb-3 line-clamp-2 leading-snug">
              {artikel.judul}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
              {artikel.abstrak || 'Jelajahi analisis mendalam tentang topik ini di ruang baca kami.'}
            </p>
          </div>

          {/* Footer Card: Penulis & Tombol Baca */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-50">
            <div className="flex items-center gap-3">
              {/* Avatar Initial Penulis */}
              <div className="w-8 h-8 rounded-full bg-[#655348]/10 flex items-center justify-center text-[#655348] font-black text-xs">
                {artikel.penulis_list?.[0]?.nama?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-xs font-bold text-gray-700 max-w-[120px] truncate">
                {artikel.penulis_list?.[0]?.nama || 'Admin'}
              </span>
            </div>
            
            {/* Ikon Panah Kanan Bulat */}
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#655348] transition-colors duration-300">
              <ArrowRight size={14} className="text-gray-400 group-hover:text-white transform group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}