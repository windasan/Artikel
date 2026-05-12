'use client'
// src/components/artikel/ArtikelFilter.tsx

import { useState, useTransition, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Route } from 'next'
import type { Kategori, ArtikelFilter as FilterType } from '@/types/database'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface Props {
  kategoriList:   Kategori[]
  currentFilters: FilterType
}

export function ArtikelFilter({ kategoriList, currentFilters }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(currentFilters.search ?? '')
  
  // State untuk toggle filter pada tampilan mobile
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Sinkronisasi dengan URL Params (Terutama jika datang dari halaman Home)
  useEffect(() => {
    setSearch(currentFilters.search ?? '')
  }, [currentFilters.search])

  const buildParams = (overrides: Record<string, string>) => {
    const base: Record<string, string> = {
      q:       currentFilters.search   ?? '',
      kategori:currentFilters.kategori ?? '',
      tahun:   currentFilters.tahun    ? String(currentFilters.tahun) : '',
      urut:    currentFilters.orderBy  ?? '',
    }
    const merged = { ...base, ...overrides }
    const sp = new URLSearchParams()
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v) })
    return sp.toString()
  }

  const push = (overrides: Record<string, string>) => {
    startTransition(() => {
      router.push(`${pathname}?${buildParams(overrides)}` as Route)
      setIsMobileFilterOpen(false) // Tutup menu mobile setelah apply
    })
  }

  const reset = () => {
    setSearch('')
    startTransition(() => {
      router.push(pathname as Route)
      setIsMobileFilterOpen(false)
    })
  }

  const hasFilter = !!(currentFilters.search || currentFilters.kategori || currentFilters.tahun)

  return (
    <>
      {/* PERBAIKAN RONGGA KOSONG: 
        Ubah top-[64px] atau md:top-[72px] ini jika dirasa masih ada jarak/tumpang tindih dengan Navbar. 
        Angka ini harus persis mewakili tinggi Navbar Anda saat menyusut.
      */}
      <div className="sticky top-[64px] md:top-[64px] z-40 bg-white/90 backdrop-blur-2xl border-b border-[#D9D9D9]/50 shadow-[0_4px_30px_rgba(101,83,72,0.05)] transition-all">
        <div className="max-w-[1400px] mx-auto px-6 py-4">

          {/* 1. TAMPILAN MOBILE: Search Bar & Tombol Toggle Filter */}
          <div className="flex md:hidden items-center gap-3 w-full">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') push({ q: search }) }}
                placeholder="Cari judul atau topik..."
                className="w-full bg-white border border-[#D9D9D9] rounded-full pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-[#655348] focus:ring-4 focus:ring-[#655348]/10 transition-all text-[#655348] placeholder:text-[#D9D9D9]"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9D9D9] w-4 h-4" />
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className={`p-3 rounded-full transition-all ${
                isMobileFilterOpen 
                  ? 'bg-[#655348] text-white shadow-md' 
                  : 'bg-[#655348]/5 text-[#655348] hover:bg-[#655348]/10'
              }`}
            >
              {isMobileFilterOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
            </button>
          </div>

          {/* 2. AREA FILTER (Sembunyi di Mobile, Tampil di Desktop ATAU saat Mobile Di-Toggle) */}
          <div className={`mt-4 md:mt-0 flex-col md:flex-row gap-4 items-center justify-between ${isMobileFilterOpen ? 'flex' : 'hidden md:flex'}`}>

            {/* Dropdown Selects */}
            <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-3 w-full md:w-auto">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#655348]/5 rounded-full text-[#655348] font-bold text-xs uppercase tracking-widest mr-2">
                <SlidersHorizontal size={14} /> Filter
              </div>

              <select value={currentFilters.kategori ?? ''} onChange={e => push({ kategori: e.target.value })}
                className="w-full md:w-auto appearance-none bg-white border border-[#D9D9D9] rounded-full px-5 py-3 md:py-2.5 text-sm font-semibold text-[#655348] outline-none cursor-pointer focus:border-[#655348] focus:ring-2 focus:ring-[#655348]/10 transition-all hover:border-[#655348]/50 pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23655348%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_15px_center]">
                <option value="">Semua Kategori</option>
                {kategoriList.map(k => <option key={k.id} value={k.slug}>{k.nama}</option>)}
              </select>

              <select value={currentFilters.tahun?.toString() ?? ''} onChange={e => push({ tahun: e.target.value })}
                className="w-full md:w-auto appearance-none bg-white border border-[#D9D9D9] rounded-full px-5 py-3 md:py-2.5 text-sm font-semibold text-[#655348] outline-none cursor-pointer focus:border-[#655348] focus:ring-2 focus:ring-[#655348]/10 transition-all hover:border-[#655348]/50 pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23655348%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_15px_center]">
                <option value="">Semua Tahun</option>
                {[2026, 2025, 2024, 2023].map(y => <option key={y} value={String(y)}>{y}</option>)}
              </select>

              <select value={currentFilters.orderBy ?? 'newest'} onChange={e => push({ urut: e.target.value })}
                className="w-full md:w-auto appearance-none bg-white border border-[#D9D9D9] rounded-full px-5 py-3 md:py-2.5 text-sm font-semibold text-[#655348] outline-none cursor-pointer focus:border-[#655348] focus:ring-2 focus:ring-[#655348]/10 transition-all hover:border-[#655348]/50 pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23655348%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_15px_center]">
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="az">A–Z</option>
                <option value="za">Z–A</option>
                <option value="views">Terpopuler</option>
              </select>
            </div>

            {/* TAMPILAN DESKTOP: Search Bar & Buttons */}
            <div className="hidden md:flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-md">
              <div className="relative w-full">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') push({ q: search }) }}
                  placeholder="Cari judul, kata kunci..."
                  className="w-full bg-white border border-[#D9D9D9] rounded-full pl-11 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#655348] focus:ring-4 focus:ring-[#655348]/10 transition-all text-[#655348] placeholder:text-[#D9D9D9]"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9D9D9] w-4 h-4" />
              </div>

              <button onClick={() => push({ q: search })}
                className="px-6 py-2.5 bg-[#655348] text-[#D9D9D9] text-sm font-bold tracking-widest uppercase rounded-full hover:bg-[#655348]/90 hover:shadow-lg transition-all active:scale-95 shrink-0">
                Cari
              </button>

              {hasFilter && (
                <button onClick={reset} title="Reset Filter"
                  className="p-2.5 text-red-400 hover:text-white bg-red-50 hover:bg-red-500 rounded-full transition-colors shrink-0">
                  <X size={18} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* KHUSUS MOBILE: Tombol Terapkan & Reset (Muncul saat Filter Aktif) */}
            <div className="flex md:hidden w-full gap-3 mt-2 border-t border-[#D9D9D9]/30 pt-4">
               <button onClick={() => push({ q: search })} className="flex-1 py-3 bg-[#655348] text-white rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform">
                 Terapkan Filter
               </button>
               {hasFilter && (
                 <button onClick={reset} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full shrink-0 transition-colors">
                   <X size={20}/>
                 </button>
               )}
            </div>

          </div>

        </div>
      </div>
    </>
  )
}