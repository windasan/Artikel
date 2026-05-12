'use client'
// src/components/artikel/ArtikelCard.tsx

import Link from 'next/link'
import Image from 'next/image'
import type { ArtikelLengkap } from '@/types/database'
import { formatDate } from '@/lib/utils'

const THUMB_EMOJI: Record<string, string> = {
  'wisata-alam':          '🌋',
  'wisata-budaya':        '🎭',
  'wisata-kuliner':       '🍜',
  'manajemen-pariwisata': '📊',
  'ekowisata':            '🌿',
  'destinasi-digital':    '💻',
}

export function ArtikelCard({ artikel }: { artikel: ArtikelLengkap }) {
  const katColor  = artikel.kategori_warna ?? '#F08060'
  const emoji     = THUMB_EMOJI[artikel.kategori_slug ?? ''] ?? '📄'
  const firstName = artikel.penulis_list?.[0]?.nama?.split(' ')[0] ?? 'Penulis'
  const initials  = (artikel.penulis_list?.[0]?.nama ?? 'U').slice(0, 2).toUpperCase()

  return (
    <Link href={`/artikel/${artikel.slug}`}
      className="group bg-white border border-[rgba(28,43,43,0.10)] rounded-xl overflow-hidden hover:-translate-y-1.5 hover:shadow-md hover:border-[rgba(28,43,43,0.18)] transition-all duration-300 block">
      <div className="h-[170px] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${katColor}18, ${katColor}30)` }}>
        {artikel.foto_sampul_url ? (
          <Image src={artikel.foto_sampul_url} alt={artikel.judul} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[44px]">{emoji}</div>
        )}
      </div>
      <div className="p-5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-2.5"
          style={{ background: katColor + '22', color: katColor }}>
          {artikel.kategori_icon} {artikel.kategori_nama ?? 'Umum'}
        </span>
        <h3 className="font-display font-semibold text-[17px] text-[var(--ink)] leading-[1.4] mb-3 line-clamp-3 group-hover:text-[var(--coral)] transition-colors">
          {artikel.judul}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-[12px] text-[var(--ink-lt)]">
            <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ background: katColor }}>
              {initials}
            </div>
            <span className="font-medium truncate max-w-[110px]">{firstName}</span>
          </div>
          <span className="text-[11px] text-[var(--ink-lt)]">
            {artikel.published_at ? formatDate(artikel.published_at) : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
