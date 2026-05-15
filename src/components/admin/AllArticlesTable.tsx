'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Loader2, 
  FileText,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export function AllArticlesTable() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  // Fungsi untuk mengambil semua artikel
  const fetchArticles = async () => {
    try {
      setLoading(true)
      // Menggunakan nama tabel 'artikel' dan kolom 'judul' sesuai schema.sql
      // Menggunakan !created_by untuk menghindari error ambiguitas foreign key
      const { data, error } = await supabase
        .from('artikel')
        .select(`
          id, 
          judul, 
          slug, 
          status, 
          created_at, 
          profiles!created_by (nama_lengkap)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (error: any) {
      toast.error('Gagal memuat artikel: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  // Fungsi Hapus Artikel
  const handleDelete = async (id: string, judul: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) {
      const tid = toast.loading('Menghapus artikel...')
      try {
        const { error } = await supabase
          .from('artikel')
          .delete()
          .eq('id', id)

        if (error) throw error

        toast.success('Artikel berhasil dihapus', { id: tid })
        setArticles(articles.filter(a => a.id !== id))
      } catch (error: any) {
        toast.error('Gagal menghapus: ' + error.message, { id: tid })
      }
    }
  }

  // Filter pencarian berdasarkan 'judul'
  const filteredArticles = articles.filter(art => 
    art.judul?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#655348]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold animate-pulse">Memuat Data Artikel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar Area */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#655348]/40" size={18} />
          <input 
            type="text" 
            placeholder="Cari judul artikel..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#D9D9D9] focus:ring-2 focus:ring-[#655348]/20 focus:border-[#655348] outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-[12px] font-bold text-[#655348]/60 uppercase tracking-widest">
          Total: {filteredArticles.length} Artikel
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-[#D9D9D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#D9D9D9]/10 border-b border-[#D9D9D9]">
                <th className="px-6 py-5 text-[11px] font-black text-[#655348] uppercase tracking-[2px]">Artikel & Penulis</th>
                <th className="px-6 py-5 text-[11px] font-black text-[#655348] uppercase tracking-[2px]">Status</th>
                <th className="px-6 py-5 text-[11px] font-black text-[#655348] uppercase tracking-[2px]">Tanggal</th>
                <th className="px-6 py-5 text-[11px] font-black text-[#655348] uppercase tracking-[2px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]/50">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-[#655348]/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#655348] line-clamp-1 group-hover:text-[#a67c52] transition-colors">
                          {article.judul}
                        </span>
                        <span className="text-[11px] text-[#655348]/60 mt-0.5">
                          Oleh: {article.profiles?.nama_lengkap || 'Tidak diketahui'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${article.status === 'published' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        {article.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-[#655348]/70 font-medium">
                        {new Date(article.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {/* View */}
                        <Link 
                          href={`/artikel/${article.slug}`} 
                          target="_blank"
                          className="p-2 text-[#655348]/60 hover:text-[#655348] hover:bg-white rounded-xl border border-transparent hover:border-[#D9D9D9] transition-all shadow-none hover:shadow-sm"
                          title="Lihat Artikel"
                        >
                          <Eye size={16} />
                        </Link>
                        {/* Edit */}
                        <Link 
                          href={`/editor/${article.id}`}
                          className="p-2 text-[#a67c52] hover:bg-[#a67c52] hover:text-white rounded-xl border border-transparent transition-all shadow-none hover:shadow-md"
                          title="Edit Artikel"
                        >
                          <Edit2 size={16} />
                        </Link>
                        {/* Delete */}
                        <button 
                          onClick={() => handleDelete(article.id, article.judul)}
                          className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-transparent transition-all shadow-none hover:shadow-md"
                          title="Hapus Artikel"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <FileText size={48} className="mb-2" />
                      <p className="text-sm font-bold">Tidak ada artikel ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Tip */}
      <div className="flex items-start gap-3 p-4 bg-[#655348]/5 rounded-2xl border border-[#655348]/10">
        <AlertCircle size={18} className="text-[#a67c52] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#655348]/80 leading-relaxed">
          <b>Tips Admin:</b> Gunakan tombol pensil cokelat untuk memperbaiki konten artikel atau mengganti kategori. Penghapusan artikel akan berakibat pada hilangnya data secara permanen dari basis data.
        </p>
      </div>
    </div>
  )
}