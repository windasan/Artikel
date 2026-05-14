// src/app/artikel/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ArtikelLengkap } from '@/types/database'
import { PenulisBadge } from '@/components/artikel/PenulisBadge'
import { RelatedArticles } from '@/components/artikel/RelatedArticles'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

interface Props { params: { slug: string } }

async function getArtikel(slug: string): Promise<ArtikelLengkap | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('artikel_lengkap')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (data) supabase.rpc('increment_view', { artikel_id: data.id }).then(() => {})
  return data as ArtikelLengkap | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artikel = await getArtikel(params.slug)
  if (!artikel) return { title: 'Artikel Tidak Ditemukan' }
  return {
    title: artikel.judul,
    description: artikel.abstrak ?? undefined,
    keywords: artikel.kata_kunci,
    openGraph: {
      title: artikel.judul,
      images: artikel.foto_sampul_url ? [artikel.foto_sampul_url] : [],
      type: 'article',
    },
  }
}

export default async function ArtikelDetailPage({ params }: Props) {
  const artikel = await getArtikel(params.slug)
  if (!artikel) notFound()

  const katColor = artikel.kategori_warna ?? '#F08060'

  return (
    <div className="bg-[#FDFBF7] min-h-screen pb-24">
      
     {/* HEADER BANNER - Versi Super Cerah */}
      <div className="relative h-[400px] md:h-[550px] w-full overflow-hidden bg-white">
        <Image
          src={artikel.foto_sampul_url || '/Images/Alt.jpg'}
          alt={artikel.judul}
          fill 
          priority
          className="object-cover" 
        />
        
        {/* GRADIENT OVERLAY:
           - from-[#FDFBF7]: Menghaluskan transisi ke bawah (warna kertas/cream).
           - via-transparent: Area tengah benar-benar bening 100% tanpa warna penutup.
           - to-black/25: Sangat tipis, hanya untuk memberikan bayangan samar 
             agar teks Navbar tetap bisa terbaca jika gambar terlalu terang.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/60" />
      </div>
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 -mt-32 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
        
        {/* ─ Main Content ─ */}
        <article className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
          
          <nav className="flex gap-2 text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-6 flex-wrap">
            <Link href="/" className="hover:text-[#655348] transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/artikel" className="hover:text-[#655348] transition-colors">Artikel</Link>
            <span>/</span>
            <span className="text-[#655348]">{artikel.kategori_nama}</span>
          </nav>

          <div className="flex gap-2 mb-6 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: katColor + '22', color: katColor }}>
              {artikel.kategori_icon} {artikel.kategori_nama}
            </span>
            {artikel.volume && <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">{artikel.volume}</span>}
            {artikel.pdf_url && <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#655348]/10 text-[#655348]">📄 PDF Tersedia</span>}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
            {artikel.judul}
          </h1>
          {artikel.subjudul && <p className="text-lg text-gray-500 italic mb-8">{artikel.subjudul}</p>}

          <div className="flex flex-wrap gap-8 py-5 border-t border-b border-gray-100 mb-8 bg-gray-50/50 rounded-2xl px-6">
            {[
              { label: 'Kelompok', val: artikel.kelompok_nama ?? '-' },
              { label: 'Diterbitkan', val: artikel.published_at ? formatDate(artikel.published_at) : '-' },
              { label: 'Dilihat', val: `${artikel.view_count} kali` },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-800">{val}</p>
              </div>
            ))}
          </div>

          {artikel.abstrak && (
            <div className="border-l-4 border-[#655348] bg-[#655348]/5 p-6 rounded-r-2xl mb-10">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#655348] mb-3">Abstrak</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">{artikel.abstrak}</p>
            </div>
          )}

          <div
            className="prose prose-lg prose-headings:font-black prose-headings:tracking-tight prose-a:text-[#655348] prose-img:rounded-2xl max-w-none"
            dangerouslySetInnerHTML={{ __html: artikel.konten ?? '<p>Konten tidak tersedia.</p>' }}
          />
        </article>

        {/* ─ Sidebar ─ */}
        <aside className="lg:sticky lg:top-[100px] flex flex-col gap-6">
          
          {artikel.penulis_list && artikel.penulis_list.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-5">Tim Penulis</h4>
              <div className="flex flex-col gap-4">
                {artikel.penulis_list.map(p => (
                  <PenulisBadge key={p.id} penulis={p} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-5">Bacaan Terkait</h4>
            {/* Memanggil komponen RelatedArticles yang sudah kita perbarui di bawah */}
            <RelatedArticles kategoriId={artikel.kategori_id} currentId={artikel.id} />
          </div>

        </aside>
      </div>
    </div>
  )
}