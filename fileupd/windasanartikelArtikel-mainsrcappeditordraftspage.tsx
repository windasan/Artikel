'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Artikel } from '@/types/database'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { FileText, Edit3, Eye, Trash2, ArrowRight, FileEdit, Calendar, Info } from 'lucide-react'

const STATUS_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  draft:              { label: 'Draft',                cls: 'bg-[#D9D9D9]/50 text-[#655348]', dot: 'bg-[#655348]/50' },
  pending_redaksi:    { label: 'Menunggu Redaksi',     cls: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  pending_publikasi:  { label: 'Menunggu Publikasi',   cls: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  published:          { label: 'Terbit',               cls: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  rejected:           { label: 'Perlu Revisi',         cls: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
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
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* HERO SECTION DENGAN GRADIENT */}
      <div className="relative pt-[140px] pb-[100px] bg-gradient-to-b from-[#655348] via-[#655348] to-[#FFFFFF]">
        <div className="max-w-[1000px] mx-auto px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <FileText size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-[3px] text-white">Manajemen Naskah</span>
          </div>
          
          <h1 className="font-display text-[42px] md:text-[56px] font-black text-[#FFFFFF] tracking-tighter leading-none mb-6 drop-shadow-sm">
            Artikel Saya
          </h1>
          <p className="text-[15px] md:text-[17px] text-[#FFFFFF]/80 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
            Kelola draft, pantau status review, dan publikasikan hasil riset pariwisata Anda ke seluruh dunia.
          </p>

          <Link href="/editor/new"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#FFFFFF] text-[#655348] text-[13px] font-black uppercase tracking-widest rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300">
            <FileEdit size={18} /> Tulis Artikel Baru
          </Link>

        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-[1000px] mx-auto px-6 -mt-8 relative z-20 pb-24">
        
        {/* PROGRESS ALUR STATUS */}
        <div className="bg-[#FFFFFF] border-2 border-[#D9D9D9]/50 rounded-3xl p-6 md:p-8 shadow-xl shadow-[#655348]/5 mb-10 overflow-hidden relative">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#655348]/50 mb-4 flex items-center gap-2">
            <Info size={14} /> Alur Publikasi
          </p>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[11px] text-[#655348]">
            <span className="px-3 py-1.5 rounded-full bg-[#D9D9D9]/40 font-bold">Draft</span>
            <ArrowRight size={14} className="text-[#655348]/40" />
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold">Menunggu Redaksi</span>
            <ArrowRight size={14} className="text-[#655348]/40" />
            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 font-bold">Menunggu Publikasi</span>
            <ArrowRight size={14} className="text-[#655348]/40" />
            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 font-bold">Terbit</span>
          </div>
        </div>

        {/* DAFTAR ARTIKEL */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#D9D9D9] border-t-[#655348] rounded-full animate-spin mb-4" />
            <p className="text-[13px] font-bold text-[#655348] uppercase tracking-widest">Memuat Artikel...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-[#D9D9D9]/10 border-2 border-dashed border-[#D9D9D9] rounded-[40px]">
            <FileText size={48} className="mx-auto text-[#D9D9D9] mb-4" />
            <p className="font-black text-[20px] text-[#655348] mb-2">Belum ada artikel</p>
            <p className="text-[14px] text-[#655348]/60 font-medium mb-6">Mulai kontribusi Anda dengan mengunggah artikel pertama.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {articles.map(a => {
              const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.draft
              const canEdit = ['draft', 'rejected'].includes(a.status)

              return (
                <div key={a.id}
                  className="group bg-[#FFFFFF] border-2 border-[#D9D9D9]/50 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start hover:border-[#655348] hover:shadow-[0_12px_30px_rgba(101,83,72,0.06)] transition-all duration-300">
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${st.cls}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                      <span className="text-[11px] font-bold text-[#655348]/40 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={12} /> {formatDate(a.updated_at)}
                      </span>
                    </div>

                    <h3 className="font-black text-[22px] text-[#655348] mb-3 line-clamp-2 leading-tight group-hover:text-[#655348]">
                      {a.judul || '(Tanpa judul)'}
                    </h3>
                    
                    {a.abstrak ? (
                      <p className="text-[14px] text-[#655348]/60 line-clamp-2 font-medium mb-4">{a.abstrak}</p>
                    ) : (
                      <p className="text-[14px] text-[#655348]/40 italic mb-4">Abstrak belum ditulis...</p>
                    )}

                    {a.status === 'rejected' && a.catatan_review && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-800 font-medium">
                        <strong className="font-black uppercase text-[10px] tracking-widest block mb-1">Catatan Revisi:</strong>
                        {a.catatan_review}
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex md:flex-col gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D9D9D9]/50 mt-4 md:mt-0">
                    {canEdit && (
                      <Link href={`/editor/${a.id}`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#655348] text-[#FFFFFF] text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-[#655348]/80 transition-colors shadow-md">
                        <Edit3 size={16} /> Edit
                      </Link>
                    )}
                    
                    {a.status === 'published' && (
                      <Link href={`/artikel/${a.slug}`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#D9D9D9]/30 text-[#655348] border-2 border-transparent text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-[#655348] hover:text-[#FFFFFF] transition-colors">
                        <Eye size={16} /> Lihat
                      </Link>
                    )}
                    
                    {canEdit && (
                      <button onClick={() => handleDelete(a.id, a.judul)}
                        className="flex-none flex items-center justify-center w-12 h-12 md:w-full md:h-auto md:px-6 md:py-3 bg-red-50 text-red-500 text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-[#FFFFFF] transition-colors">
                        <Trash2 size={16} className="md:mr-2" /> <span className="hidden md:inline">Hapus</span>
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
