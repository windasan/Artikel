'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function HeroSearch() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Handle submit pencarian
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // PERBAIKAN: Gunakan parameter 'q=' agar dikenali oleh ArtikelFilter
      router.push(`/artikel?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Handle hapus teks
  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  // Efek keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative w-full group transition-all duration-500 rounded-[2.5rem] ${
        isFocused ? 'scale-[1.02] shadow-[0_0_40px_rgba(217,217,217,0.15)]' : 'shadow-2xl'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-[#D9D9D9]/0 via-[#D9D9D9]/10 to-[#D9D9D9]/0 rounded-[2.5rem] transition-opacity duration-500 pointer-events-none ${
        isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`} />

      <input
        ref={inputRef}
        type="text"
        placeholder="Ketik judul, topik, atau kata kunci (Tekan '/' untuk fokus)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full pl-8 pr-24 py-5 md:py-6 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border-2 border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/10 focus:border-[#D9D9D9]/60 transition-all duration-300 text-base md:text-lg font-medium"
      />

      <div className={`absolute right-[72px] top-1/2 -translate-y-1/2 transition-all duration-300 ${
        query.length > 0 ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-50 invisible'
      }`}>
        <button
          type="button"
          onClick={handleClear}
          className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Hapus teks"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      <button 
        type="submit"
        disabled={!query.trim()}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-3.5 md:p-4 rounded-full flex items-center justify-center transition-all duration-300 ${
          query.trim() 
            ? 'bg-[#D9D9D9] text-[#655348] hover:bg-white hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] cursor-pointer' 
            : 'bg-white/20 text-white/50 cursor-not-allowed'
        }`}
        aria-label="Cari Artikel"
      >
        <Search size={22} strokeWidth={2.5} className={query.trim() && isFocused ? 'animate-pulse' : ''} />
      </button>
    </form>
  )
}