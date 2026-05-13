'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BookOpen } from 'lucide-react'

interface PenulisCardProps {
  penulis: {
    id: string
    nama: string
    username: string
    foto_url?: string
    bio?: string
    total_artikel?: number
  }
}

export function PenulisCard({ penulis }: PenulisCardProps) {
  return (
    <Link href={`/penulis/${penulis.username}`} className="group relative">
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col items-center text-center">
        
        {/* Foto Profil dengan Border Gradient */}
        <div className="relative w-32 h-32 mb-6 p-1 rounded-full bg-gradient-to-tr from-[#655348] to-[#D9D9D9]/50 group-hover:rotate-6 transition-transform duration-500">
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white bg-gray-50">
            <Image
              src={penulis.foto_url || `https://ui-avatars.com/api/?name=${penulis.nama}&background=655348&color=fff`}
              alt={penulis.nama}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Informasi Penulis */}
        <div className="mb-6 flex-1">
          <span className="inline-block px-3 py-1 bg-[#655348]/5 text-[#655348] text-[10px] font-black rounded-full mb-3 uppercase tracking-widest">
            Penulis Redaksi
          </span>
          <h3 className="text-xl font-black text-gray-900 group-hover:text-[#655348] transition-colors mb-2">
            {penulis.nama}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 italic leading-relaxed">
            {penulis.bio || 'Mahasiswa Pariwisata Kelas A UNY yang berdedikasi dalam riset dan publikasi.'}
          </p>
        </div>

        {/* Stats & Link */}
        <div className="w-full pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{penulis.total_artikel || 0} Artikel</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#655348] group-hover:text-white transition-all">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  )
}