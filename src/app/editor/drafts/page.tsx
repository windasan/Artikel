'use client'
// src/app/editor/drafts/page.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Artikel } from '@/types/database'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  draft:              { label: 'Draft',                cls: 'bg-[rgba(28,43,43,0.07)] text-[var(--ink-lt)]' },
  pending_redaksi:    { label: 'Menunggu Redaksi',     cls: 'bg-amber-50 text-amber-700' },
  pending_publikasi:  { label: 'Menunggu Publikasi',   cls: 'bg-[var(--sky-lt)] text-[#2A7090]' },
  published:          { label: 'Terbit',               cls: 'bg-[var(--sage-lt)] text-[#3D7050]' },
  rejected:           { label: 'Perlu Revisi',         cls: 'bg-[var(--coral-lt)] text-[#C05030]' },
}

export default function DraftsPage() {
  const supabase  = createClient()
  const router    = useRouter()
  const [articles, setArticles] = useState<Artikel[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/editor/drafts'); return }
      supabase.from('artikel').select('*')
        .eq('created_by', user.id)
        .order('updated_at', { ascending: false })
        .then(({ data }) => { setArticles(data ?? []); setLoading(false) })
    })
  }, [supabase, router])

  const handleDelete = async (id: string, judul: string) => {
    if (!window.confirm(`Hapus "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) return
    const { error } = await supabase.from('artikel').delete().eq('id', id)
    if (error) toast.error('Gagal menghapus')
    else { toast.success('Artikel dihapus'); setArticles(a => a.filter(x => x.id !== id)) }
  }

  return (
    <div className="min-h-screen pt-[80px] bg-[var(--paper)]">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-7">
          <div>
            <h1 className="font-display text-[32px] font-bold text-[var(--ink)] tracking-tight">
              Artikel Saya
            </h1>
            <p className="text-[14px] text-[var(--ink-lt)] mt-1">
              Semua artikel yang pernah Anda upload
            </p>
          </div>
          <Link href="/editor/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors">
            ✏️ Upload Baru
          </Link>
        </div>

        {/* Alur status */}
        <div className="flex items-center gap-2 mb-6 text-[11px] text-[var(--ink-lt)] flex-wrap">
          {[
            { label: 'Draft', color: 'bg-[rgba(28,43,43,0.15)]' },
            { label: '→' },
            { label: 'Redaksi', color: 'bg-amber-400' },
            { label: '→' },
            { label: 'Publikasi', color: 'bg-[var(--sky)]' },
            { label: '→' },
            { label: 'Terbit', color: 'bg-[var(--sage)]' },
          ].map((s, i) =>
            s.color
              ? <span key={i} className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold ${s.color}`}>{s.label}</span>
              : <span key={i} className="font-bold">{s.label}</span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-[var(--ink-lt)]">Memuat...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[rgba(28,43,43,0.10)] rounded-xl">
            <div className="text-4xl mb-4">✍️</div>
            <p className="font-semibold text-[var(--ink)] mb-2">Belum ada artikel</p>
            <p className="text-[13px] text-[var(--ink-lt)] mb-5">Mulai upload artikel pertama Anda!</p>
            <Link href="/editor/new"
              className="px-5 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors inline-block">
              ✏️ Upload Artikel
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {articles.map(a => {
              const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.draft
              const canEdit = ['draft', 'rejected'].includes(a.status)
              return (
                <div key={a.id}
                  className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5 flex gap-4 items-start hover:border-[rgba(28,43,43,0.18)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-[var(--ink)] mb-1.5 line-clamp-2">
                      {a.judul || '(Tanpa judul)'}
                    </h3>
                    {a.abstrak && (
                      <p className="text-[13px] text-[var(--ink-lt)] line-clamp-1 mb-2">{a.abstrak}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${st.cls}`}>
                        {st.label}
                      </span>
                      <span className="text-[12px] text-[var(--ink-lt)]">
                        📅 {formatDate(a.updated_at)}
                      </span>
                      {a.status === 'rejected' && a.catatan_review && (
                        <span className="text-[12px] text-[#C05030]">
                          💬 {a.catatan_review}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {canEdit && (
                      <Link href={`/editor/${a.id}`}
                        className="px-3.5 py-1.5 bg-[var(--ink)] text-white text-[12px] font-semibold rounded-lg hover:bg-[var(--coral)] transition-colors">
                        ✏ Edit
                      </Link>
                    )}
                    {a.status === 'published' && (
                      <Link href={`/artikel/${a.slug}`}
                        className="px-3.5 py-1.5 bg-[var(--sage-lt)] text-[#3D7050] text-[12px] font-semibold rounded-lg hover:bg-[var(--sage)] hover:text-white transition-colors">
                        👁 Lihat
                      </Link>
                    )}
                    {canEdit && (
                      <button onClick={() => handleDelete(a.id, a.judul)}
                        className="px-3.5 py-1.5 bg-[var(--coral-lt)] text-[#C05030] text-[12px] font-semibold rounded-lg hover:bg-[var(--coral)] hover:text-white transition-colors">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}