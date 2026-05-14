// src/components/artikel/ArtikelRow.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import type { ArtikelLengkap } from '@/types/database'

export function ArtikelRow({ artikel }: { artikel: ArtikelLengkap; index?: number }) {
  return (
    <Link href={`/artikel/${artikel.slug}`} className="group block w-full">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 h-full md:h-56">
        
        {/* Gambar (Sisi Kiri) */}
        <div className="relative w-full md:w-[350px] h-52 md:h-full shrink-0 overflow-hidden">
          <Image 
            src={artikel.foto_sampul_url || '/Images/alt.jpg'} 
            alt={artikel.judul} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Konten (Sisi Kanan) */}
        <div className="p-6 md:p-8 flex flex-col justify-between w-full">
          <div>
            {/* Kategori (Hanya Warna / Tanpa Icon) */}
            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full mb-3 uppercase tracking-widest">
              {artikel.kategori_nama || 'Pariwisata'}
            </span>
            
            {/* Judul Artikel */}
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#655348] transition-colors line-clamp-2">
              {artikel.judul}
            </h3>
            
            {/* Deskripsi / Abstrak Singkat */}
            <p className="text-gray-500 text-sm md:text-base line-clamp-2">
              {artikel.abstrak || 'Baca selengkapnya untuk mengetahui pembahasan detail dari artikel ini.'}
            </p>
          </div>
          
          {/* Footer Metadata (Icon Lucide React) */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-50 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="font-medium">{artikel.penulis_list?.[0]?.nama || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="font-medium">
                {new Date(artikel.published_at!).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  )
}