'use client'
// src/components/admin/PendingTable.tsx
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ArtikelLengkap } from '@/types/database'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function PendingTable({ articles }: { articles: ArtikelLengkap[] }) {
  const supabase = createClient()
  const router   = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (id: string, status: 'published' | 'rejected', catatan?: string) => {
    setLoading(id)
    const payload: Record<string,unknown> = { status }
    if (status === 'published') payload.published_at = new Date().toISOString()
    if (catatan) payload.catatan_review = catatan
    const { error } = await supabase.from('artikel').update(payload).eq('id', id)
    if (error) {
      toast.error('Gagal: ' + error.message)
    } else {
      toast.success(status === 'published' ? '✅ Artikel diterbitkan!' : '❌ Artikel ditolak')
      router.refresh()
    }
    setLoading(null)
  }

  const handleReject = async (id: string) => {
    const catatan = window.prompt('Alasan penolakan (opsional):') ?? ''
    await updateStatus(id, 'rejected', catatan)
  }

  return (
    <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[rgba(28,43,43,0.025)]">
            {['Judul','Penulis','Kategori','Dikirim','Aksi'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {articles.map(a => (
            <tr key={a.id} className="border-t border-[rgba(28,43,43,0.06)] hover:bg-[rgba(28,43,43,0.015)]">
              <td className="px-4 py-3 max-w-[280px]">
                <p className="text-[13px] font-semibold text-[var(--ink)] line-clamp-2">{a.judul}</p>
                {a.kelompok_nama && <p className="text-[11px] text-[var(--ink-lt)] mt-0.5">📁 {a.kelompok_nama}</p>}
              </td>
              <td className="px-4 py-3 text-[13px] text-[var(--ink-md)] whitespace-nowrap">
                {a.penulis_list?.map(p => p.nama?.split(' ')[0]).join(', ') ?? '-'}
              </td>
              <td className="px-4 py-3">
                {a.kategori_nama && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: (a.kategori_warna ?? '#F08060') + '22', color: a.kategori_warna ?? '#F08060' }}>
                    {a.kategori_icon} {a.kategori_nama}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-[12px] text-[var(--ink-lt)] whitespace-nowrap">
                {formatDate(a.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  <button disabled={loading === a.id}
                    onClick={() => updateStatus(a.id, 'published')}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--sage-lt)] text-[var(--sage-dark)] hover:bg-[var(--sage)] hover:text-white transition-colors disabled:opacity-40">
                    ✓ Terbitkan
                  </button>
                  <a href={`/editor/${a.id}`}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--sky-lt)] text-[var(--sky-dark)] hover:bg-[var(--sky)] hover:text-white transition-colors">
                    ✏ Edit
                  </a>
                  <button disabled={loading === a.id}
                    onClick={() => handleReject(a.id)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--coral-lt)] text-[var(--coral-dark)] hover:bg-[var(--coral)] hover:text-white transition-colors disabled:opacity-40">
                    ✕ Tolak
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
