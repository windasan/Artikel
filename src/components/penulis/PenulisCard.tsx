import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BookOpen } from 'lucide-react'

// Asumsikan data ini diambil dari tabel profiles
export function PenulisCard({ profil }: { profil: any }) {
  return (
    <Link href={`/penulis/${profil.username || profil.id}`} className="group relative block h-full">
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col items-center text-center">
        
        {/* Foto Profil */}
        <div className="relative w-32 h-32 mb-6 p-1 rounded-full bg-gradient-to-tr from-[#655348] to-[#D9D9D9] group-hover:rotate-6 transition-transform duration-500">
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white bg-[#D9D9D9]/20">
            <Image
              src={profil.foto_url || `https://ui-avatars.com/api/?name=${profil.nama_lengkap}&background=655348&color=fff`}
              alt={profil.nama_lengkap}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Informasi Profil */}
        <div className="mb-6 flex-1">
          <span className="inline-block px-3 py-1 bg-[#655348]/5 text-[#655348] text-[10px] font-black rounded-full mb-3 uppercase tracking-widest">
            {profil.role || 'Penulis'}
          </span>
          <h3 className="text-xl font-black text-gray-900 group-hover:text-[#655348] transition-colors mb-2">
            {profil.nama_lengkap}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 italic leading-relaxed">
            {profil.bio || 'Anggota Redaksi Pariwisata UNY.'}
          </p>
        </div>

        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#655348] group-hover:text-white transition-all mt-auto">
          <ArrowUpRight size={20} />
        </div>
      </div>
    </Link>
  )
}