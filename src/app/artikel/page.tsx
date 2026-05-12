// src/app/artikel/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link' // <-- PERBAIKAN: Import Link ditambahkan di sini
import { ArtikelFilter } from '@/components/artikel/ArtikelFilter'
import { ArtikelCard } from '@/components/artikel/ArtikelCard'
import type { ArtikelLengkap, Kategori, ArtikelFilter as FilterType } from '@/types/database'
import { BookOpen } from 'lucide-react'

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

const PER_PAGE = 12 // Ditingkatkan menjadi 12 agar pas untuk Grid 3/4 kolom

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

  if (filters.search) {
    query = query.textSearch('search_vector', filters.search, {
      config: 'indonesian',
      type: 'websearch',
    })
  }

  if (filters.kategori) {
    query = query.eq('kategori_slug', filters.kategori)
  }

  if (filters.tahun) {
    query = query.gte('published_at', `${filters.tahun}-01-01`)
                 .lte('published_at', `${filters.tahun}-12-31`)
  }

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
    <main className="min-h-screen bg-[#D9D9D9]/10 font-sans selection:bg-[#655348] selection:text-[#D9D9D9]">
      
      {/* ─────────────────────────────────────────────────────────────────────────
          PAGE HEADER (Desain Elegan Terhubung dengan Home)
          ───────────────────────────────────────────────────────────────────────── */}
     <div 
        className="relative pt-36 pb-24 px-6 overflow-hidden text-center bg-[#655348]"
        style={{
          // SILAKAN GANTI URL GAMBAR DI BAWAH INI SESUAI KEINGINAN ANDA
          backgroundImage: 'url("https://images.trvl-media.com/place/6106384/80667e0d-94b4-4401-8104-b447db482014.jpg")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', // Memberikan efek parallax saat di-scroll
        }}
      >
        {/* Overlay Warna Utama agar gambar agak gelap dan teks putih tetap terbaca jelas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#655348]/80 via-[#655348]/70 to-[#655348]/80 z-0" />

        {/* Dekorasi Bulatan Cahaya */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D9D9D9]/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#D9D9D9]/10 rounded-full blur-[80px] pointer-events-none z-0" />
        <div className="relative z-10 max-w-[1000px] mx-auto flex flex-col items-center text-[#D9D9D9]">
          {/* <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#D9D9D9]/20 bg-[#D9D9D9]/10 backdrop-blur-sm text-[10px] font-black tracking-[0.3em] uppercase mb-8 shadow-xl">
            <BookOpen size={12} />
            Eksplorasi Jurnal
          </span> */}
          <h1 className="font-display text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 uppercase drop-shadow-lg">
            Koleksi <span className="text-[#D9D9D9]">Artikel</span>
          </h1>
          <p className="text-lg text-[#D9D9D9]/80 font-medium max-w-2xl leading-relaxed italic">
            Menyelami gagasan, riset, dan analisis komprehensif dari mahasiswa Pariwisata Kelas A UNY untuk industri pariwisata berkelanjutan.
          </p>
        </div>
      </div>

      {/* Filter Bar (Client Component) */}
      <ArtikelFilter kategoriList={kategoriList} currentFilters={filters} />

      {/* Results Info */}
      <div className="px-6 py-4 bg-[#D9D9D9]/20 border-b border-[#D9D9D9]/50">
        <div className="max-w-[1400px] mx-auto text-[13px] font-bold text-[#655348]/70 uppercase tracking-widest text-center md:text-left">
          Menampilkan <span className="text-[#655348]">{articles.length}</span> dari <span className="text-[#655348]">{total}</span> artikel
          {filters.search && (
            <span className="ml-1">untuk pencarian <span className="text-[#655348]">"{filters.search}"</span></span>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          ARTICLE GRID LIST (Menggunakan ArtikelCard)
          ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {articles.map((artikel) => (
              <ArtikelCard key={artikel.id} artikel={artikel} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-white/50 backdrop-blur-sm rounded-[3rem] border-[3px] border-dashed border-[#655348]/20 text-center max-w-3xl mx-auto">
            <div className="text-6xl mb-6 opacity-70">🔍</div>
            <h3 className="text-2xl font-black text-[#655348] mb-3 tracking-tight">Tidak Ditemukan</h3>
            <p className="text-[15px] text-[#655348]/60 font-medium mb-8">
              Tidak ada artikel yang sesuai dengan kriteria pencarian atau filter Anda.
            </p>
            <Link href="/artikel" className="px-8 py-3 rounded-full bg-[#655348] text-[#D9D9D9] font-bold text-sm uppercase tracking-widest hover:bg-[#655348]/90 hover:shadow-lg transition-all">
              Reset Semua Filter
            </Link>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          PAGINATION
          ───────────────────────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 px-6 pb-24">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`?${new URLSearchParams({
                ...(filters.search  ? { q:       filters.search        } : {}),
                ...(filters.kategori? { kategori: filters.kategori      } : {}),
                ...(filters.tahun   ? { tahun:    String(filters.tahun) } : {}),
                ...(filters.orderBy ? { urut:     filters.orderBy       } : {}),
                page: String(p),
              })}`}
              className={`w-11 h-11 flex items-center justify-center rounded-full text-[14px] font-black transition-all shadow-sm ${
                p === currentPage
                  ? 'bg-[#655348] text-white hover:bg-[#655348]/90 hover:shadow-md'
                  : 'bg-white text-[#655348]/70 border border-[#D9D9D9] hover:border-[#655348]/50 hover:text-[#655348]'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </main>
  )
}