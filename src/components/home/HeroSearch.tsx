'use client'
// src/components/home/HeroSearch.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { label: 'Semua Topik',          value: '' },
  { label: '🏔️ Wisata Alam',        value: 'wisata-alam' },
  { label: '🏛️ Wisata Budaya',      value: 'wisata-budaya' },
  { label: '🍜 Wisata Kuliner',     value: 'wisata-kuliner' },
  { label: '📊 Manajemen',         value: 'manajemen-pariwisata' },
  { label: '🍃 Ekowisata',         value: 'ekowisata' },
  { label: '📱 Destinasi Digital',  value: 'destinasi-digital' },
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
      className="w-full bg-white/95 backdrop-blur-2xl rounded-xl flex items-center overflow-hidden shadow-inner">
      <select value={kat} onChange={e => setKat(e.target.value)}
        className="border-none outline-none bg-transparent px-5 py-4 text-[14px] font-semibold text-gray-800 cursor-pointer border-r border-gray-200 min-w-[160px] focus:ring-0">
        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="Cari riset, jurnal, atau destinasi..."
        className="flex-1 border-none outline-none bg-transparent px-5 py-4 text-[15px] text-gray-800 placeholder:text-gray-400 focus:ring-0" />
      <button type="submit"
        className="bg-gray-900 px-6 py-4 text-white text-[16px] font-medium hover:bg-amber-600 transition-colors duration-300 flex-shrink-0 flex items-center gap-2">
        <span>Cari</span>
        <span className="text-lg">🔍</span>
      </button>
    </form>
  )
}