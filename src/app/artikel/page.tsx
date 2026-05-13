// src/app/artikel/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ArtikelFilter } from '@/components/artikel/ArtikelFilter'
import { ArtikelRow } from '@/components/artikel/ArtikelRow'
import FeaturedSlider from '@/components/artikel/FeaturedSlider' // Import Slider
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

const PER_PAGE = 15 // Diperbesar karena 5 artikel masuk slider utama

async function getArtikel(filters: FilterType) {
  const supabase = createClient()
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
  const supabase = createClient()
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
    <main className="min-h-screen bg-gray-50/50">
      <div className="bg-[#655348] pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
          Koleksi Artikel
        </h1>
        <p className="text-[#D9D9D9]/80 max-w-2xl mx-auto italic">
          Kumpulan pemikiran, riset, dan berita terbaru seputar pariwisata.
        </p>
      </div>

      <ArtikelFilter kategoriList={kategoriList} currentFilters={filters} />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* SLIDER 5 KONTEN */}
        {sliderArticles.length > 0 && (
          <FeaturedSlider articles={sliderArticles} />
        )}

        {/* CONTAINER ARTIKEL BAWAH */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-4">
            <h3 className="text-2xl font-black text-[#655348] uppercase tracking-tight">
              {filters.search ? `Hasil Pencarian: ${filters.search}` : 'Artikel Terbaru'}
            </h3>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Total: {total} Artikel
            </span>
          </div>

          <div className="flex flex-col gap-6">
            {listArticles.map((artikel) => (
              <ArtikelRow key={artikel.id} artikel={artikel} />
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 font-medium italic">Tidak ada artikel yang ditemukan.</p>
            </div>
          )}
        </section>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-16">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?${new URLSearchParams({
                  ...(filters.search ? { q: filters.search } : {}),
                  ...(filters.kategori ? { kategori: filters.kategori } : {}),
                  ...(filters.tahun ? { tahun: String(filters.tahun) } : {}),
                  page: String(p),
                })}`}
                className={`w-12 h-12 flex items-center justify-center rounded-full font-bold transition-all ${
                  p === filters.page
                    ? 'bg-[#655348] text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
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