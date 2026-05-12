'use client'
// src/components/home/HeroSearch.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { label: 'Semua Topik',          value: '' },
  { label: '🌋 Wisata Alam',        value: 'wisata-alam' },
  { label: '🎭 Wisata Budaya',      value: 'wisata-budaya' },
  { label: '🍜 Wisata Kuliner',     value: 'wisata-kuliner' },
  { label: '📊 Manajemen',         value: 'manajemen-pariwisata' },
  { label: '🌿 Ekowisata',         value: 'ekowisata' },
  { label: '💻 Destinasi Digital',  value: 'destinasi-digital' },
]

export function HeroSearch() {
  const router = useRouter()
  const [q,   setQ]   = useState('')
  const [kat, setKat] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (q)   sp.set('q', q)
    if (kat) sp.set('kategori', kat)
    router.push(`/artikel?${sp.toString()}`)
  }

  return (
    <form onSubmit={handleSearch}
      className="w-full max-w-[600px] bg-white/88 backdrop-blur-xl border-[1.5px] border-[rgba(28,43,43,0.14)] rounded-xl flex items-center overflow-hidden shadow-md mx-auto">
      <select value={kat} onChange={e => setKat(e.target.value)}
        className="border-none outline-none bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[var(--ink)] cursor-pointer border-r border-[rgba(28,43,43,0.1)] min-w-[155px]">
        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="Cari judul, penulis, atau kata kunci..."
        className="flex-1 border-none outline-none bg-transparent px-4 py-3.5 text-[14px] text-[var(--ink)] placeholder:text-[rgba(28,43,43,0.3)]" />
      <button type="submit"
        className="bg-[var(--ink)] px-4 py-3.5 text-white text-[16px] hover:bg-[var(--coral)] transition-colors flex-shrink-0">
        🔍
      </button>
    </form>
  )
}
