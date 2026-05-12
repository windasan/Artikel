// src/app/artikel/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ArtikelLengkap } from '@/types/database'
import { CitationBox } from '@/components/artikel/CitationBox'
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

  if (data) {
    // Increment view count (fire and forget)
    supabase.rpc('increment_view', { artikel_id: data.id }).then(() => {})
  }

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
      description: artikel.abstrak ?? undefined,
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
    <div className="pt-[72px]">
      {/* Cover image */}
      {artikel.foto_sampul_url && (
        <div className="relative h-[280px] sm:h-[360px] overflow-hidden bg-[var(--cream)]">
          <Image
            src={artikel.foto_sampul_url}
            alt={artikel.judul}
            fill className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="max-w-[1080px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start">
        {/* ─ Main Content ─ */}
        <article>
          {/* Breadcrumb */}
          <nav className="flex gap-2 text-[12px] text-[var(--ink-lt)] mb-7 flex-wrap">
            <Link href="/" className="hover:text-[var(--coral)] transition-colors">Beranda</Link>
            <span>›</span>
            <Link href="/artikel" className="hover:text-[var(--coral)] transition-colors">Artikel</Link>
            <span>›</span>
            <span className="text-[var(--ink)]">{artikel.kategori_nama}</span>
          </nav>

          {/* Badges */}
          <div className="flex gap-2 mb-5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
              style={{ background: katColor + '22', color: katColor }}>
              {artikel.kategori_icon} {artikel.kategori_nama}
            </span>
            {artikel.volume && (
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[rgba(28,43,43,0.07)] text-[var(--ink-md)]">
                {artikel.volume}
              </span>
            )}
            {artikel.pdf_url && (
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[rgba(28,43,43,0.07)] text-[var(--ink-md)]">
                📄 PDF Tersedia
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-[var(--ink)] leading-[1.2] mb-5 tracking-tight"
            style={{ fontSize: 'clamp(26px,3.5vw,40px)' }}>
            {artikel.judul}
          </h1>
          {artikel.subjudul && (
            <p className="text-[16px] text-[var(--ink-lt)] italic mb-5 font-display">{artikel.subjudul}</p>
          )}

          {/* Meta bar */}
          <div className="flex flex-wrap gap-6 py-4 border-t border-b border-[rgba(28,43,43,0.08)] mb-7">
            {[
              { label: 'Penulis', val: artikel.penulis_list?.map(p => p.nama).join(', ') ?? '-' },
              { label: 'Kelompok', val: artikel.kelompok_nama ?? '-' },
              { label: 'Diterbitkan', val: artikel.published_at ? formatDate(artikel.published_at) : '-' },
              { label: 'Dilihat', val: `${artikel.view_count} kali` },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-0.5">{label}</p>
                <p className="text-[14px] font-medium text-[var(--ink)]">{val}</p>
              </div>
            ))}
          </div>

          {/* Abstract */}
          {artikel.abstrak && (
            <div className="border-l-[3px] border-[var(--coral)] bg-[var(--cream)] pl-5 py-4 pr-5 rounded-r-xl mb-7">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--coral)] mb-2">Abstrak</p>
              <p className="text-[14px] text-[var(--ink-md)] leading-[1.75]">{artikel.abstrak}</p>
            </div>
          )}

          {/* Keywords */}
          {artikel.kata_kunci?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-7">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] flex items-center">
                Kata Kunci:
              </span>
              {artikel.kata_kunci.map(kw => (
                <span key={kw}
                  className="px-3 py-1 rounded-full text-[11px] font-medium bg-[rgba(28,43,43,0.07)] text-[var(--ink-md)]">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Article body */}
          <div
            className="prose prose-jurnal max-w-none"
            dangerouslySetInnerHTML={{ __html: artikel.konten ?? '<p>Konten tidak tersedia.</p>' }}
          />
        </article>

        {/* ─ Sidebar ─ */}
        <aside className="lg:sticky lg:top-[80px] flex flex-col gap-4">
          {/* Actions */}
          <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-4">Aksi</h4>
            {artikel.pdf_url ? (
              <a href={artikel.pdf_url} download target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[var(--ink)] text-white text-[13px] font-semibold rounded-xl hover:bg-[var(--coral)] transition-colors mb-2">
                ⬇ Unduh PDF
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[rgba(28,43,43,0.05)] text-[var(--ink-lt)] text-[13px] font-medium rounded-xl mb-2 cursor-not-allowed">
                📄 PDF Belum Tersedia
              </div>
            )}
            <CitationBox artikel={artikel} />
          </div>

          {/* Authors */}
          {artikel.penulis_list && artikel.penulis_list.length > 0 && (
            <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-4">Penulis</h4>
              <div className="flex flex-col gap-3">
                {artikel.penulis_list.map(p => (
                  <PenulisBadge key={p.id} penulis={p} />
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-lt)] mb-4">Detail</h4>
            <dl className="space-y-2.5">
              {[
                ['Kelompok',      artikel.kelompok_nama],
                ['Volume',        artikel.volume],
                ['Edisi',         artikel.nomor_edisi],
                ['Halaman',       artikel.halaman_mulai ? `${artikel.halaman_mulai}–${artikel.halaman_selesai}` : null],
                ['Kata Kunci',    artikel.kata_kunci?.join(', ')],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label as string} className="flex justify-between gap-2 text-[12px]">
                  <dt className="text-[var(--ink-lt)] flex-shrink-0">{label}</dt>
                  <dd className="text-[var(--ink)] font-medium text-right">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {/* Related Articles */}
      <RelatedArticles
        kategoriId={artikel.kategori_id}
        currentId={artikel.id}
      />
    </div>
  )
}
