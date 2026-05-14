'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Globe, Tag, Hash, BookOpen, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Kategori } from '@/types/database'

interface Props {
  article: any
  categories: Kategori[]
}

export function PublikasiActions({ article, categories }: Props) {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    kategori_id: article.kategori_id || '',
    kata_kunci: article.kata_kunci ? article.kata_kunci.join(', ') : '',
    volume: article.volume || '',
    nomor_edisi: article.nomor_edisi || ''
  })

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.kategori_id) return toast.error('Pilih kategori terlebih dahulu')
    
    setLoading(true)
const keywordsArray = formData.kata_kunci.split(',').map((k: string) => k.trim()).filter((k: string) => k !== '')
    const { error } = await supabase
      .from('artikel')
      .update({
        kategori_id: formData.kategori_id,
        kata_kunci: keywordsArray,
        volume: formData.volume,
        nomor_edisi: formData.nomor_edisi,
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', article.id)

    if (error) {
      toast.error('Gagal publikasi: ' + error.message)
    } else {
      toast.success('Artikel Berhasil Diterbitkan!')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="w-full">
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto px-6 py-2.5 bg-[var(--ink)] text-white rounded-xl text-[13px] font-bold hover:bg-[var(--coral)] transition-all flex items-center justify-center gap-2"
        >
          <Globe size={16} /> Kelola Metadata & Publish
        </button>
      ) : (
        <form onSubmit={handlePublish} className="mt-4 p-6 bg-[var(--paper)] rounded-2xl border border-[rgba(28,43,43,0.08)] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kategorisasi */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5 flex items-center gap-1.5">
                <Tag size={12} /> Kategori Artikel
              </label>
              <select 
                required
                value={formData.kategori_id}
                onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-[rgba(28,43,43,0.1)] bg-white text-sm focus:ring-2 focus:ring-[var(--coral)] outline-none"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nama}</option>
                ))}
              </select>
            </div>

            {/* SEO Keywords */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5 flex items-center gap-1.5">
                <Hash size={12} /> Kata Kunci (SEO)
              </label>
              <input 
                type="text"
                placeholder="wisata, budaya, yogyakarta..."
                value={formData.kata_kunci}
                onChange={(e) => setFormData({...formData, kata_kunci: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-[rgba(28,43,43,0.1)] bg-white text-sm focus:ring-2 focus:ring-[var(--coral)] outline-none"
              />
              <p className="text-[10px] text-[var(--ink-lt)] mt-1">*Pisahkan dengan koma</p>
            </div>

            {/* Volume & Edisi */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-1.5 flex items-center gap-1.5">
                <BookOpen size={12} /> Volume & Nomor
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Vol. 1"
                  value={formData.volume}
                  onChange={(e) => setFormData({...formData, volume: e.target.value})}
                  className="w-1/2 p-2.5 rounded-xl border border-[rgba(28,43,43,0.1)] bg-white text-sm focus:ring-2 focus:ring-[var(--coral)] outline-none"
                />
                <input 
                  type="text" placeholder="No. 2"
                  value={formData.nomor_edisi}
                  onChange={(e) => setFormData({...formData, nomor_edisi: e.target.value})}
                  className="w-1/2 p-2.5 rounded-xl border border-[rgba(28,43,43,0.1)] bg-white text-sm focus:ring-2 focus:ring-[var(--coral)] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-[13px] font-bold text-[var(--ink-lt)] hover:text-[var(--ink)]"
            >
              Batal
            </button>
            <button 
              disabled={loading}
              type="submit"
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-[13px] font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Terbitkan Sekarang
            </button>
          </div>
        </form>
      )}
    </div>
  )
}