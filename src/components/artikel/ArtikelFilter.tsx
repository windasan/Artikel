'use client'
// src/components/artikel/ArtikelFilter.tsx

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Route } from 'next'
import type { Kategori, ArtikelFilter as FilterType } from '@/types/database'

interface Props {
  kategoriList:   Kategori[]
  currentFilters: FilterType
}

export function ArtikelFilter({ kategoriList, currentFilters }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(currentFilters.search ?? '')

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
    // PERBAIKAN: Mengganti tanda kutip tunggal (') menjadi backtick (`) sebelum 'as Route'
    startTransition(() => router.push(`${pathname}?${buildParams(overrides)}` as Route))
  }

  const reset = () => {
    setSearch('')
    startTransition(() => router.push(pathname as Route)) // Menambahkan 'as Route' di sini juga untuk berjaga-jaga
  }

  const hasFilter = !!(currentFilters.search || currentFilters.kategori || currentFilters.tahun)

  return (
    <div className="sticky top-[60px] z-40 bg-white border-b border-[rgba(28,43,43,0.08)] px-6 py-3 flex gap-2.5 flex-wrap items-center shadow-[0_2px_12px_rgba(28,43,43,0.04)]">
      <select value={currentFilters.kategori ?? ''} onChange={e => push({ kategori: e.target.value })}
        className="border border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-2 text-[13px] bg-white outline-none cursor-pointer focus:border-[var(--coral)] text-[var(--ink)] transition-colors">
        <option value="">Semua Kategori</option>
        {kategoriList.map(k => <option key={k.id} value={k.slug}>{k.icon} {k.nama}</option>)}
      </select>

      <select value={currentFilters.tahun?.toString() ?? ''} onChange={e => push({ tahun: e.target.value })}
        className="border border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-2 text-[13px] bg-white outline-none cursor-pointer focus:border-[var(--coral)] transition-colors">
        <option value="">Semua Tahun</option>
        {[2025, 2024, 2023].map(y => <option key={y} value={String(y)}>{y}</option>)}
      </select>

      <select value={currentFilters.orderBy ?? 'newest'} onChange={e => push({ urut: e.target.value })}
        className="border border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-2 text-[13px] bg-white outline-none cursor-pointer focus:border-[var(--coral)] transition-colors">
        <option value="newest">Terbaru</option>
        <option value="oldest">Terlama</option>
        <option value="az">A–Z</option>
        <option value="za">Z–A</option>
        <option value="views">Paling Banyak Dilihat</option>
      </select>

      <input value={search} onChange={e => setSearch(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') push({ q: search }) }}
        placeholder="Cari judul, abstrak, kata kunci..."
        className="flex-1 min-w-[200px] border border-[rgba(28,43,43,0.12)] rounded-lg px-3.5 py-2 text-[13px] outline-none focus:border-[var(--coral)] transition-colors" />

      <button onClick={() => push({ q: search })}
        className="px-4 py-2 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-lg hover:bg-[var(--coral)] transition-colors">
        🔍 Cari
      </button>

      {hasFilter && (
        <button onClick={reset}
          className="px-3 py-2 text-[12px] text-[var(--ink-lt)] hover:text-[var(--coral)] transition-colors">
          ✕ Reset
        </button>
      )}
    </div>
  )
}