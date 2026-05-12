// src/app/artikel/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ArtikelFilter } from '@/components/artikel/ArtikelFilter'
import { ArtikelRow } from '@/components/artikel/ArtikelRow'
import type { ArtikelLengkap, Kategori, ArtikelFilter as FilterType } from '@/types/database'

interface PageProps {
  searchParams: {
    q?: string
    kategori?: string
    tahun?: string
    penulis?: string
    urut?: string
    page?: string
  }
}

const PER_PAGE = 10

async function getArtikel(filters: FilterType) {
  const supabase = createClient()
  const page     = filters.page ?? 1
  const from     = (page - 1) * PER_PAGE
  const to       = from + PER_PAGE - 1

  let query = supabase
    .from('artikel_lengkap')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .range(from, to)

  // Search full-text
  if (filters.search) {
    query = query.textSearch('search_vector', filters.search, {
      config: 'indonesian',
      type: 'websearch',
    })
  }

  // Filter kategori
  if (filters.kategori) {
    query = query.eq('kategori_slug', filters.kategori)
  }

  // Filter tahun
  if (filters.tahun) {
    query = query.gte('published_at', `${filters.tahun}-01-01`)
                 .lte('published_at', `${filters.tahun}-12-31`)
  }

  // Ordering
  switch (filters.orderBy) {
    case 'oldest': query = query.order('published_at', { ascending: true  }); break
    case 'az':     query = query.order('judul',         { ascending: true  }); break
    case 'za':     query = query.order('judul',         { ascending: false }); break
    case 'views':  query = query.order('view_count',    { ascending: false }); break
    default:       query = query.order('published_at',  { ascending: false })
  }

  const { data, count, error } = await query

  return {
    articles:   (data ?? []) as ArtikelLengkap[],
    total:      count ?? 0,
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
    search:  searchParams.q,
    kategori: searchParams.kategori,
    tahun:   searchParams.tahun ? Number(searchParams.tahun) : undefined,
    orderBy: (searchParams.urut as FilterType['orderBy']) ?? 'newest',
    page:    searchParams.page ? Number(searchParams.page) : 1,
  }

  const [{ articles, total, totalPages }, kategoriList] = await Promise.all([
    getArtikel(filters),
    getKategori(),
  ])

  const currentPage = filters.page ?? 1

  return (
    <>
      {/* Page Header */}
      <div className="pt-[90px] pb-10 px-6 bg-gradient-to-b from-[var(--cream)] to-[var(--paper)] border-b border-[rgba(28,43,43,0.08)]">
        <div className="max-w-[1100px] mx-auto">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--coral)] block mb-2">Koleksi</span>
          <h1 className="font-display text-[44px] font-bold text-[var(--ink)] tracking-tight mb-2">
            Daftar Artikel
          </h1>
          <p className="text-[15px] text-[var(--ink-lt)]">
            Seluruh karya riset mahasiswa Pariwisata Kelas A UNY
          </p>
        </div>
      </div>

      {/* Filter Bar (Client Component) */}
      <ArtikelFilter kategoriList={kategoriList} currentFilters={filters} />

      {/* Results Info */}
      <div className="px-6 py-3 bg-[var(--paper)] border-b border-[rgba(28,43,43,0.07)]">
        <div className="max-w-[1100px] mx-auto text-[13px] text-[var(--ink-lt)]">
          Menampilkan{' '}
          <strong className="text-[var(--ink)]">{articles.length}</strong>
          {' '}dari{' '}
          <strong className="text-[var(--ink)]">{total}</strong>
          {' '}artikel
          {filters.search && (
            <span> untuk <em>&ldquo;{filters.search}&rdquo;</em></span>
          )}
        </div>
      </div>

      {/* Article List */}
      <div className="max-w-[1100px] mx-auto px-6 py-6 flex flex-col gap-3">
        {articles.length > 0 ? (
          articles.map((artikel, idx) => (
            <ArtikelRow
              key={artikel.id}
              artikel={artikel}
              index={(currentPage - 1) * PER_PAGE + idx + 1}
            />
          ))
        ) : (
          <div className="text-center py-20 text-[var(--ink-lt)]">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-[15px] font-medium text-[var(--ink)] mb-2">Tidak ada artikel ditemukan</p>
            <p className="text-[13px]">Coba ubah kata kunci atau filter pencarian</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 px-6 pb-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`?${new URLSearchParams({
                ...(filters.search  ? { q:       filters.search        } : {}),
                ...(filters.kategori? { kategori: filters.kategori      } : {}),
                ...(filters.tahun  ? { tahun:    String(filters.tahun) } : {}),
                ...(filters.orderBy ? { urut:     filters.orderBy       } : {}),
                page: String(p),
              })}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-medium border-[1.5px] transition-colors ${
                p === currentPage
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                  : 'bg-white text-[var(--ink-md)] border-[rgba(28,43,43,0.12)] hover:border-[var(--ink-lt)]'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
