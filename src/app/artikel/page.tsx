// src/app/artikel/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ArtikelFilter } from '@/components/artikel/ArtikelFilter'
import { ArtikelRow } from '@/components/artikel/ArtikelRow'
import FeaturedSlider from '@/components/artikel/FeaturedSlider' 
import { BookOpen } from 'lucide-react'
import type { ArtikelLengkap, Kategori, ArtikelFilter as FilterType } from '@/types/database'

interface PageProps {
  searchParams: {
    q?: string
    kategori?: string
    tahun?: string
    urut?: string
    page?: string
  }
}

const PER_PAGE = 15

async function getArtikel(filters: FilterType) {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  let query = supabase
    .from('artikel_lengkap')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .range(from, to)

  if (filters.search) query = query.textSearch('search_vector', filters.search, { config: 'indonesian', type: 'websearch' })
  if (filters.kategori) query = query.eq('kategori_slug', filters.kategori)
  if (filters.tahun) query = query.gte('published_at', `${filters.tahun}-01-01`).lte('published_at', `${filters.tahun}-12-31`)

  switch (filters.orderBy) {
    case 'oldest': query = query.order('published_at', { ascending: true }); break
    case 'az': query = query.order('judul', { ascending: true }); break
    case 'za': query = query.order('judul', { ascending: false }); break
    default: query = query.order('published_at', { ascending: false })
  }

  const { data, count } = await query
  return {
    articles: (data ?? []) as ArtikelLengkap[],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / PER_PAGE),
  }
}

async function getKategori(): Promise<Kategori[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('kategori').select('*').order('nama')
  return data ?? []
}

export default async function ArtikelPage({ searchParams }: PageProps) {
  const filters: FilterType = {
    search: searchParams.q,
    kategori: searchParams.kategori,
    tahun: searchParams.tahun ? Number(searchParams.tahun) : undefined,
    orderBy: (searchParams.urut as FilterType['orderBy']) ?? 'newest',
    page: searchParams.page ? Number(searchParams.page) : 1,
  }

  const [{ articles, total, totalPages }, kategoriList] = await Promise.all([
    getArtikel(filters),
    getKategori(),
  ])

  // Pisahkan 5 artikel pertama untuk slider (hanya tampil jika tidak sedang search/filter)
  const isFiltering = filters.search || filters.kategori || filters.page !== 1
  const sliderArticles = !isFiltering ? articles.slice(0, 5) : []
  const listArticles = !isFiltering ? articles.slice(5) : articles

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      
      {/* HERO SECTION - GRADIENT PENDEK */}
      <div className="relative pt-[120px] pb-[60px] bg-gradient-to-b from-[#655348] via-[#655348] to-[#655348]/80">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
           
          
          <h1 className="font-display text-[42px] md:text-[56px] font-black text-[#FFFFFF] tracking-tighter leading-none mb-4 drop-shadow-sm">
            Koleksi Artikel
          </h1>
          <p className="text-[15px] md:text-[17px] text-[#FFFFFF]/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Kumpulan pemikiran, riset inovatif, dan publikasi terbaru mahasiswa pariwisata yang siap mengubah pandangan Anda.
          </p>
        </div>
      </div>

      {/* FILTER ARTIKEL */}
      <div className="relative z-20 max-w-[1200px] mx-auto px-6 -mt-6">
        <ArtikelFilter kategoriList={kategoriList} currentFilters={filters} />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* SLIDER 5 KONTEN (Featured) */}
        {sliderArticles.length > 0 && (
          <div className="mb-16">
             <FeaturedSlider articles={sliderArticles} />
          </div>
        )}

        {/* CONTAINER ARTIKEL BAWAH */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-[#D9D9D9] pb-4">
            <h3 className="text-[24px] font-black text-[#655348] tracking-tight">
              {filters.search ? `Hasil Pencarian: "${filters.search}"` : 'Artikel Terbaru'}
            </h3>
            <span className="text-[12px] font-black text-[#655348]/50 uppercase tracking-widest px-3 py-1 bg-[#D9D9D9]/30 rounded-lg">
              {total} Artikel
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {listArticles.map((artikel) => (
              <ArtikelRow key={artikel.id} artikel={artikel} />
            ))}
          </div>

          {/* EMPTY STATE PENCARIAN KOSONG */}
          {articles.length === 0 && (
            <div className="text-center py-24 bg-[#D9D9D9]/10 rounded-[32px] border-2 border-dashed border-[#D9D9D9]">
              <BookOpen size={48} className="mx-auto text-[#D9D9D9] mb-4" />
              <p className="text-[#655348]/50 font-black uppercase tracking-[2px] text-[14px]">Tidak ada artikel yang ditemukan.</p>
              <p className="text-[#655348]/40 text-[13px] mt-2 font-medium">Coba gunakan kata kunci atau kategori lain.</p>
            </div>
          )}
        </section>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-20">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?${new URLSearchParams({
                  ...(filters.search ? { q: filters.search } : {}),
                  ...(filters.kategori ? { kategori: filters.kategori } : {}),
                  ...(filters.tahun ? { tahun: String(filters.tahun) } : {}),
                  page: String(p),
                })}`}
                className={`w-12 h-12 flex items-center justify-center rounded-[16px] font-black text-[14px] transition-all duration-300 ${
                  p === filters.page
                    ? 'bg-[#655348] text-white shadow-lg shadow-[#655348]/20 -translate-y-1'
                    : 'bg-white text-[#655348] border-2 border-[#D9D9D9] hover:border-[#655348] hover:bg-[#D9D9D9]/10'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}