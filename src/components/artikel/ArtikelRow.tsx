'use client'
// src/components/artikel/ArtikelRow.tsx

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ArtikelLengkap } from '@/types/database'
import { formatDate } from '@/lib/utils'

export function ArtikelRow({ artikel, index }: { artikel: ArtikelLengkap; index: number }) {
  const router   = useRouter()
  const katColor = artikel.kategori_warna ?? '#F08060'

  const copyCitation = (e: React.MouseEvent) => {
    e.stopPropagation()
    const penulis = artikel.penulis_list?.map(p => p.nama).join(', ') ?? 'Anonim'
    const tahun   = artikel.published_at
      ? new Date(artikel.published_at).getFullYear()
      : new Date().getFullYear()
    const text = `${penulis}. (${tahun}). ${artikel.judul}. Jurnal Pariwisata UNY${artikel.volume ? ', ' + artikel.volume : ''}.`
    navigator.clipboard.writeText(text).then(() => {
      alert('Kutipan berhasil disalin!')
    })
  }

  return (
    <div
      onClick={() => router.push(`/artikel/${artikel.slug}`)}
      className="group bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5 flex gap-4 items-start hover:border-[var(--coral)] hover:shadow-sm transition-all cursor-pointer hover:translate-x-0.5"
    >
      {/* Index number */}
      <div className="font-display text-[24px] font-bold text-[rgba(28,43,43,0.08)] min-w-[36px] pt-1 select-none">
        {String(index).padStart(2, '0')}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-2"
          style={{ background: katColor + '22', color: katColor }}
        >
          {artikel.kategori_icon} {artikel.kategori_nama ?? 'Umum'}
        </span>

        <h3 className="font-display font-semibold text-[18px] text-[var(--ink)] leading-[1.4] mb-2 group-hover:text-[var(--coral)] transition-colors line-clamp-2">
          {artikel.judul}
        </h3>

        {artikel.abstrak && (
          <p className="text-[13px] text-[var(--ink-lt)] leading-[1.65] mb-3 line-clamp-2">
            {artikel.abstrak}
          </p>
        )}

        <div className="flex gap-4 flex-wrap">
          {[
            { icon: '👤', val: artikel.penulis_list?.map(p => p.nama).join(', ') ?? '—' },
            { icon: '📅', val: artikel.published_at ? formatDate(artikel.published_at) : '—' },
            { icon: '👁️', val: `${artikel.view_count} views` },
            ...(artikel.kelompok_nama ? [{ icon: '📁', val: artikel.kelompok_nama }] : []),
          ].map((m, i) => (
            <span key={i} className="flex items-center gap-1 text-[12px] text-[var(--ink-lt)]">
              {m.icon} {m.val}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex flex-col gap-2 flex-shrink-0 min-w-[100px] items-end"
        onClick={e => e.stopPropagation()}
      >
        <Link
          href={`/artikel/${artikel.slug}`}
          className="px-4 py-2 bg-[var(--ink)] text-white text-[12px] font-semibold rounded-lg hover:bg-[var(--coral)] transition-colors whitespace-nowrap"
        >
          Baca →
        </Link>
        <button
          onClick={copyCitation}
          className="px-4 py-1.5 border border-[rgba(28,43,43,0.12)] text-[var(--ink-lt)] text-[12px] font-medium rounded-lg hover:border-[var(--ink-lt)] transition-colors"
        >
          Kutip
        </button>
        <span className="text-[11px] text-[var(--ink-lt)]">{artikel.view_count} views</span>
      </div>
    </div>
  )
}
