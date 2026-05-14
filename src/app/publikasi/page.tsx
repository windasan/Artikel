import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Globe, Clock, CheckCircle2 } from 'lucide-react'
import { PublikasiActions } from '@/components/publikasi/PublikasiActions'

export default async function PublikasiDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/publikasi')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'publikasi' && profile?.role !== 'admin') redirect('/')

  // Ambil artikel Approved dan data kategori
  const [articlesRes, categoriesRes] = await Promise.all([
    supabase
      .from('artikel')
      .select(`
        id, judul, subjudul, status, kategori_id, kata_kunci, volume, nomor_edisi, updated_at,
        profiles!artikel_created_by_fkey(nama_lengkap)
      `)
      .eq('status', 'pending_publikasi')
      .order('updated_at', { ascending: false }),
    supabase.from('kategori').select('*').order('nama')
  ])

  const approvedArticles = articlesRes.data || []
  const categories = categoriesRes.data || []

  return (
    <div className="min-h-screen pt-[100px] pb-20  bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/60">
      <div className="max-w-[1100px] mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-[32px] font-bold text-[var(--ink)] tracking-tight">Dashboard Publikasi</h1>
            <p className="text-[14px] text-[var(--ink-lt)] mt-1">Finalisasi SEO, kategori, dan peluncuran artikel ke publik.</p>
          </div>
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-2 text-[13px] font-bold">
            <CheckCircle2 size={16} /> {approvedArticles.length} Artikel Siap Terbit
          </div>
        </div>

        <div className="space-y-6">
          {approvedArticles.length > 0 ? (
            approvedArticles.map((art: any) => (
              <div key={art.id} className="bg-white border border-[rgba(28,43,43,0.08)] rounded-3xl p-8 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                        Approved by Redaksi
                      </span>
                      <span className="text-[11px] text-[var(--ink-lt)] flex items-center gap-1">
                        <Clock size={12} /> {new Date(art.updated_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <h2 className="text-[22px] font-bold text-[var(--ink)] leading-tight mb-2">{art.judul}</h2>
                    <p className="text-[14px] text-[var(--ink-lt)]">Penulis: <span className="text-[var(--ink)] font-semibold">{art.profiles?.nama_lengkap}</span></p>
                  </div>
                </div>

                {/* Komponen Form Metadata */}
                <PublikasiActions article={art} categories={categories} />
              </div>
            ))
          ) : (
            <div className="bg-white border border-dashed border-[rgba(28,43,43,0.15)] rounded-3xl p-20 text-center">
              <Globe size={48} className="mx-auto text-[var(--ink-lt)] opacity-10 mb-4" />
              <p className="text-[16px] text-[var(--ink-lt)] font-medium">Antrean publikasi kosong. Belum ada artikel baru yang lolos tahap redaksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}