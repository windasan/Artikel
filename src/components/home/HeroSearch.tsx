'use client'

import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export function HeroSearch() {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Fokuskan input otomatis saat kolom terbuka
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleToggle = (e: React.MouseEvent) => {
    // Jika kolom tertutup, buka kolom
    if (!isExpanded) {
      e.preventDefault()
      setIsExpanded(true)
    } 
    // Jika kolom terbuka tapi input kosong, tutup kembali
    else if (isExpanded && !query.trim()) {
      setIsExpanded(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/artikel?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="relative flex items-center h-12">
      <form 
        onSubmit={handleSearch}
        className={`relative flex items-center h-12 transition-all duration-500 ease-in-out ${
          isExpanded ? 'w-full max-w-sm' : 'w-12'
        }`}
      >
        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari artikel..."
          className={`w-full h-full pl-12 pr-4 rounded-full bg-white border border-gray-100 shadow-sm outline-none text-sm font-medium transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Search Button (Klik untuk buka/cari) */}
        <button
          type={isExpanded && query.trim() ? "submit" : "button"}
          onClick={handleToggle}
          className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center bg-[#655348] text-white rounded-full shadow-lg hover:bg-[#1A1A1A] transition-colors z-20"
        >
          <Search size={18} strokeWidth={2.5} />
        </button>

        {/* Tombol Close (X) - Muncul hanya saat expanded */}
        {isExpanded && (
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false)
              setQuery('')
            }}
            className="absolute right-4 text-gray-400 hover:text-[#655348] transition-colors z-30"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Label "Cari" - Muncul hanya saat tertutup */}
      {!isExpanded && (
        <span className="absolute left-14 whitespace-nowrap text-[10px] font-black tracking-widest text-[#655348]/40 uppercase pointer-events-none transition-opacity">
          Cari
        </span>
      )}
    </div>
  )
}