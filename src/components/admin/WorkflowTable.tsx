'use client'
// src/components/admin/WorkflowTable.tsx
// Handles both redaksi (pending_redaksi) and publikasi (pending_publikasi) stages

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ArtikelLengkap } from '@/types/database'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Props {
  articles: ArtikelLengkap[]
  stage: 'redaksi' | 'publikasi'
}

export function WorkflowTable({ articles, stage }: Props) {
  const supabase = createClient()
  const router   = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // ── Redaksi: approve → pending_publikasi | reject → rejected
  // ── Publikasi: approve → published | reject → rejected
  const handleApprove = async (article: ArtikelLengkap) => {
    setLoading(article.id)
    const nextStatus = stage === 'redaksi' ? 'pending_publikasi' : 'published'
    const payload: Record<string, unknown> = { status: nextStatus }
    if (nextStatus === 'published') payload.published_at = new Date().toISOString()

    const { error } = await supabase.from('artikel').update(payload).eq('id', article.id)

    if (error) {
      toast.error('Gagal: ' + error.message)
    } else {
      const msg = stage === 'redaksi'
        ? '✅ Artikel dikirim ke Tim Publikasi!'
        : '🚀 Artikel berhasil diterbitkan!'
      toast.success(msg)
      router.refresh()
    }
    setLoading(null)
  }

  const handleReject = async (id: string) => {
    const catatan = window.prompt(
      stage === 'redaksi'
        ? 'Alasan penolakan / catatan untuk penulis:'
        : 'Alasan penolakan / perlu revisi:'
    )
    if (catatan === null) return // user cancelled

    setLoading(id)
    const { error } = await supabase.from('artikel').update({
      status:         'rejected',
      catatan_review: catatan || null,
    }).eq('id', id)

    if (error) toast.error('Gagal: ' + error.message)
    else { toast.success('Artikel ditolak, penulis dapat merevisi'); router.refresh() }
    setLoading(null)
  }

  const approveLabel = stage === 'redaksi' ? '✓ Kirim ke Publikasi' : '🚀 Terbitkan'
  const approveStyle = stage === 'redaksi'
    ? 'bg-[var(--sky-lt)] text-[#2A7090] hover:bg-[var(--sky)] hover:text-white'
    : 'bg-[var(--sage-lt)] text-[#3D7050] hover:bg-[var(--sage)] hover:text-white'

  return (
    <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[rgba(28,43,43,0.025)]">
            {['Judul', 'Penulis', 'Kategori', 'Dikirim', 'Aksi'].map(h => (
              <th key={h}
                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {articles.map(a => (
            <tr key={a.id}
              className="border-t border-[rgba(28,43,43,0.06)] hover:bg-[rgba(28,43,43,0.015)]">
              <td className="px-4 py-3 max-w-[280px]">
                <p className="text-[13px] font-semibold text-[var(--ink)] line-clamp-2">{a.judul}</p>
                {a.kelompok_nama && (
                  <p className="text-[11px] text-[var(--ink-lt)] mt-0.5">📁 {a.kelompok_nama}</p>
                )}
                {a.author_type === 'group' && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--sage-lt)] text-[#3D7050] rounded-full text-[10px] font-bold">
                    Artikel Kelompok
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-[13px] text-[var(--ink-md)] whitespace-nowrap">
                {a.penulis_list?.map(p => p.nama?.split(' ')[0]).join(', ') ?? '-'}
              </td>
              <td className="px-4 py-3">
                {a.kategori_nama && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    style={{
                      background: (a.kategori_warna ?? '#F08060') + '22',
                      color: a.kategori_warna ?? '#F08060',
                    }}>
                    {a.kategori_icon} {a.kategori_nama}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-[12px] text-[var(--ink-lt)] whitespace-nowrap">
                {formatDate(a.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5 flex-wrap">
                  {/* Preview */}
                  <a
                    href={`/editor/${a.id}`}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[rgba(28,43,43,0.07)] text-[var(--ink-md)] hover:bg-[rgba(28,43,43,0.12)] transition-colors">
                    ✏ Edit
                  </a>
                  {/* Approve */}
                  <button
                    disabled={loading === a.id}
                    onClick={() => handleApprove(a)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-40 ${approveStyle}`}>
                    {loading === a.id ? '⏳' : approveLabel}
                  </button>
                  {/* Reject */}
                  <button
                    disabled={loading === a.id}
                    onClick={() => handleReject(a.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--coral-lt)] text-[#C05030] hover:bg-[var(--coral)] hover:text-white transition-colors disabled:opacity-40">
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