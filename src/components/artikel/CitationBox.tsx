'use client'
// src/components/artikel/CitationBox.tsx

import { useState } from 'react'
import type { ArtikelLengkap } from '@/types/database'

export function CitationBox({ artikel }: { artikel: ArtikelLengkap }) {
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState<'apa' | 'mla' | 'chicago'>('apa')

  const penulis = artikel.penulis_list?.map(p => p.nama).join(', ') ?? 'Anonim'
  const tahun   = artikel.published_at
    ? new Date(artikel.published_at).getFullYear()
    : new Date().getFullYear()
  const jurnal  = `Jurnal Pariwisata UNY${artikel.volume ? ', ' + artikel.volume : ''}`

  const citations = {
    apa:     `${penulis}. (${tahun}). ${artikel.judul}. ${jurnal}.`,
    mla:     `${penulis}. "${artikel.judul}." ${jurnal}, ${tahun}.`,
    chicago: `${penulis}. "${artikel.judul}." ${jurnal} (${tahun}).`,
  }

  const copy = () => {
    navigator.clipboard.writeText(citations[format]).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-2">
      {/* Format selector */}
      <div className="flex gap-1 mb-2">
        {(['apa', 'mla', 'chicago'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
              format === f
                ? 'bg-[var(--ink)] text-white'
                : 'bg-[rgba(28,43,43,0.07)] text-[var(--ink-md)] hover:bg-[rgba(28,43,43,0.12)]'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Citation text */}
      <div className="bg-[var(--cream)] rounded-lg p-3 text-[12px] text-[var(--ink-md)] leading-relaxed mb-2 font-serif italic border border-[rgba(28,43,43,0.06)]">
        {citations[format]}
      </div>

      {/* Copy button */}
      <button
        onClick={copy}
        className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
          copied
            ? 'bg-[var(--sage-lt)] text-[#3D7050] border-[var(--sage)]'
            : 'border-[rgba(28,43,43,0.12)] text-[var(--ink-lt)] hover:border-[var(--ink-lt)] hover:text-[var(--ink)]'
        }`}
      >
        {copied ? '✓ Disalin!' : '📋 Salin Kutipan'}
      </button>
    </div>
  )
}
