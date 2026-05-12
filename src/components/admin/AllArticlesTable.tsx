'use client'
// src/components/admin/AllArticlesTable.tsx
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ArtikelLengkap } from '@/types/database'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function AllArticlesTable({ articles }: { articles: ArtikelLengkap[] }) {
  const supabase = createClient()
  const router   = useRouter()
  const [search, setSearch] = useState('')

  const filtered = articles.filter(a =>
    a.judul.toLowerCase().includes(search.toLowerCase()) ||
    (a.penulis_list?.some(p => p.nama?.toLowerCase().includes(search.toLowerCase())))
  )

  const handleDelete = async (id: string, judul: string) => {
    if (!window.confirm(`Hapus artikel "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) return
    const { error } = await supabase.from('artikel').delete().eq('id', id)
    if (error) toast.error('Gagal menghapus: ' + error.message)
    else { toast.success('Artikel dihapus'); router.refresh() }
  }

  const statusMap: Record<string, { label: string; cls: string }> = {
    published: { label: 'Terbit',   cls: 'bg-[var(--sage-lt)] text-[#3D7050]' },
    pending:   { label: 'Pending',  cls: 'bg-amber-50 text-amber-700' },
    draft:     { label: 'Draft',    cls: 'bg-[rgba(28,43,43,0.07)] text-[var(--ink-lt)]' },
    rejected:  { label: 'Ditolak', cls: 'bg-[var(--coral-lt)] text-[#C05030]' },
  }

  return (
    <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[rgba(28,43,43,0.07)] flex justify-between items-center gap-4">
        <h3 className="font-semibold text-[15px] text-[var(--ink)]">Semua Artikel ({articles.length})</h3>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari judul atau penulis..."
          className="border border-[rgba(28,43,43,0.12)] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[var(--coral)] max-w-[240px] w-full" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[rgba(28,43,43,0.025)]">
              {['Judul','Penulis','Kategori','Tanggal','Views','Status','Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const st = statusMap[a.status] ?? statusMap.draft
              return (
                <tr key={a.id} className="border-t border-[rgba(28,43,43,0.06)] hover:bg-[rgba(28,43,43,0.015)]">
                  <td className="px-4 py-3 max-w-[240px]">
                    <p className="text-[13px] font-semibold text-[var(--ink)] line-clamp-2">{a.judul}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--ink-md)] whitespace-nowrap">
                    {a.penulis_list?.map(p => p.nama?.split(' ')[0]).join(', ') ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold text-[var(--ink-lt)]">{a.kategori_nama ?? '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--ink-lt)] whitespace-nowrap">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ink-md)]">{a.view_count}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <a href={`/editor/${a.id}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--sky-lt)] text-[#2A7090] hover:bg-[var(--sky)] hover:text-white transition-colors">
                        ✏ Edit
                      </a>
                      <button onClick={() => handleDelete(a.id, a.judul)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--coral-lt)] text-[#C05030] hover:bg-[var(--coral)] hover:text-white transition-colors">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
