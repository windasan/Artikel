'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { ArtikelCard } from '@/components/artikel/ArtikelCard'
import type { ArtikelLengkap } from '@/types/database'
import { HeroSearch } from '@/components/home/HeroSearch'


export default function ArticleSlider({ latestArtikel }: { latestArtikel: ArtikelLengkap[] | null }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      // Geser sejauh satu lebar kontainer atau kartu
      const scrollTo = direction === 'left' 
        ? scrollLeft - 400 
        : scrollLeft + 400

      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="w-full bg-[#FDFBF7] py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* SISI KIRI */}
            <div className="lg:w-1/3 w-full text-center lg:text-left lg:sticky lg:top-10 shrink-0 z-20 px-4 lg:px-12">            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#655348]/100 text-[90%] font-bold  tracking-[0.2em] uppercase mb-6 text-[#ffffff]">
              Ruang Baca
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#655348] uppercase tracking-tighter leading-[0.9] mb-6">
              Artikel <br className="hidden lg:block" /> Terbaru
            </h2>
            <p className='text-[#655348]'>
              Prodi S1 Pariwisata FISIPOL Universitas Negeri Yogyakarta (UNY) resmi dibuka pada 2023, berfokus pada manajemen, perhotelan, ekowisata, dan pemberdayaan destinasi. Berlokasi di Yogyakarta, prodi ini mencetak sarjana pariwisata (S.Par) yang kompeten dengan keahlian bahasa asing dan manajemen wisata.
            </p>
            
            <Link 
              href="/artikel" 
              className="group inline-flex items-center mt-8 gap-4 px-8 py-4 border-2 border-[#655348] text-[#655348] rounded-full font-black text-[12px] uppercase tracking-[0.15em] hover:bg-[#655348] hover:text-white transition-all"
            >
              Jelajahi Semua 
              <ArrowRight size={18} className="transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* SISI KANAN */}
          <div className="lg:w- w-full relative">
            {/* Tombol Navigasi Desktop */}
            <div className="absolute -top-20 pt-5 left-10 hidden lg:flex gap-10 z-30">
              <button 
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-[#655348] hover:border-[#655348] transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-[#655348] hover:border-[#655348] transition-all shadow-sm active:scale-95"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Viewport Slider */}
            <div className="overflow-visible">
              <div 
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto pb-12 pt-4 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory items-stretch"
              >
                {latestArtikel && latestArtikel.length > 0 ? (
                  latestArtikel.map((artikel) => (
                    <div key={artikel.id} className="snap-start shrink-0">
                      <ArtikelCard artikel={artikel} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 shrink-0">
                    <p className="text-gray-400 italic font-medium">Belum ada artikel terbaru.</p>
                  </div>
                )}
                {/* Spacer agar card terakhir tidak menempel ke pinggir */}
                <div className="w-[10vw] shrink-0 invisible" aria-hidden="true" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}