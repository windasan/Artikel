'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, User } from 'lucide-react'
import type { ArtikelLengkap } from '@/types/database'

export default function FeaturedSlider({ articles }: { articles: ArtikelLengkap[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Efek untuk auto-slide setiap 3 detik
  useEffect(() => {
    if (articles.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [articles.length])

  if (articles.length === 0) return null

  return (
    <div className="relative group w-full h-[450px] md:h-[550px] rounded-[2rem] overflow-hidden shadow-2xl bg-[#655348] mb-12">
      {articles.map((article, idx) => (
        <div
          key={article.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Gambar Background */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={article.foto_sampul_url || '/Images/alt.jpg'}
              alt={article.judul}
              fill
              className="object-cover"
              priority={idx === 0}
            />
          </div>
          
          {/* Overlay Gelap Agar Teks Terbaca */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Konten Teks */}
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
            <div className="max-w-3xl">
              {/* Badge Kategori Tanpa Icon (Hanya Warna) */}
              <span className="inline-block px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md mb-4 uppercase tracking-widest">
                {article.kategori_nama || 'Featured'}
              </span>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight line-clamp-3">
                {article.judul}
              </h2>
              
              <div className="flex flex-wrap items-center gap-6 text-[#D9D9D9] mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-white" />
                  <span className="font-semibold">{article.penulis_list?.[0]?.nama || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-white" />
                  <span>
                    {new Date(article.published_at!).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <Link 
                href={`/artikel/${article.slug}`}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-[#D9D9D9] transition-all transform hover:-translate-y-1 w-max"
              >
                Baca Selengkapnya
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Indikator Titik Slider (Dots) */}
      <div className="absolute bottom-6 right-8 z-20 flex gap-2">
        {articles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}