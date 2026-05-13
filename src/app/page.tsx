/**
 * ==============================================================================
 * HALAMAN UTAMA - RUANG JELAJAH PARIWISATA
 * ==============================================================================
 * Deskripsi: 
 * Halaman utama yang menampilkan Hero Section, Statistik Platform, dan 
 * daftar artikel terbaru. 
 * * * PERBAIKAN FINAL:
 * 1. Menyesuaikan dengan schema View `artikel_lengkap` (kategori_nama & penulis_list).
 * 2. Memperbaiki UI Card Artikel agar teks tidak tenggelam/tersembunyi saat diam.
 * 3. Menggunakan warna utama #655348 dan sekunder #D9D9D9.
 * ==============================================================================
 */

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { HeroSearch } from '@/components/home/HeroSearch'
import { 
  FileText, 
  Users, 
  Layers, 
  Hash, 
  ArrowRight, 
  Calendar, 
  Tag
} from 'lucide-react'
import type { ArtikelLengkap } from '@/types/database' // Pastikan path ini sesuai
import BGTM from '@/Images/BGTM.jpeg'; // Menggunakan alias @ yang mengarah ke folder src



// Konfigurasi revalidasi untuk Incremental Static Regeneration (ISR)
export const revalidate = 60 

/**
 * Fungsi untuk mengambil data dari database Supabase.
 */
async function getHomeData() {
  const supabase = createClient()

  try {
    const [artikelRes, statsRes] = await Promise.all([
      // Menggunakan select('*') langsung pada view artikel_lengkap
      supabase
        .from('artikel_lengkap')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3),

      // Menjalankan query statistik secara paralel
      Promise.all([
        supabase.from('artikel').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('kelompok').select('id', { count: 'exact', head: true }),
        supabase.from('kategori').select('id', { count: 'exact', head: true }),
      ]),
    ])

    const [countArtikel, countPenulis, countKelompok, countKategori] = statsRes

    return {
      // Mapping respons ke interface ArtikelLengkap
      latestArtikel: (artikelRes.data ?? []) as ArtikelLengkap[],
      stats: {
        artikel: countArtikel.count ?? 0,
        penulis: countPenulis.count ?? 0,
        kelompok: countKelompok.count ?? 0,
        kategori: countKategori.count ?? 0,
      },
      error: null
    }
  } catch (error) {
    console.error('Data Fetching Error:', error)
    return {
      latestArtikel: [],
      stats: { artikel: 0, penulis: 0, kelompok: 0, kategori: 0 },
      error: 'Gagal memuat data dari server.'
    }
  }
}

export default async function HomePage() {
  const { latestArtikel, stats, error } = await getHomeData()

  return (
    <main className="bg-[#D9D9D9]/10 font-sans selection:bg-[#655348] selection:text-[#D9D9D9] min-h-screen">
      
      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO (EKSPLORASI VISUAL)
          ───────────────────────────────────────────────────────────────────────── */}
      <section 
        className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: `url(${BGTM.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
      {/* Overlay Lebih Halus dan Tipis */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-[#655348]/95 z-0" />

        {/* Container Teks */}
        <div className="relative z-10 max-w-[1000px] w-full mx-auto flex flex-col items-center text-[#EDEDED]">
          
          {/* <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#D9D9D9]/20 bg-[#D9D9D9]/10 backdrop-blur-md text-[10px] md:text-[12px] font-black tracking-[0.4em] uppercase mb-10 shadow-2xl">
            Jurnal Pariwisata Terpadu
          </div> */}

          <h1 className="font-display font-black text-white leading-[1.05] tracking-tighter mb-8 drop-shadow-2xl pt-8"
            style={{ fontSize: 'clamp(42px, 8vw, 90px)' }}>
            Ruang Jelajah Pariwisata
          </h1>

          <div className="relative max-w-5xl mx-auto mb-14">
            <p className="text-[18px] md:text-[24px] font-medium leading-relaxed  drop-shadow-md text-[#D9D9D9] px-4">
              "Ketimpangan lama tinggal wisatawan pada hotel berbintang menurut kelas di Bali dan NTB tidak terjadi secara kebetulan"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-20 w-full justify-center">
            <Link href="/artikel"
              className="group flex items-center justify-center gap-3 px-12 py-4 rounded-full bg-[#D9D9D9] text-[#454240] text-[15px] font-black uppercase tracking-widest hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_15px_40px_rgba(217,217,217,0.2)]">
              Mulai Eksplorasi
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Search Bar Wrapper */}
          <div className="w-full max-w-[850px] mx-auto text-left relative px-4">
            <div className="flex items-center gap-2 mb-3 ml-6 text-[#D9D9D9]/80">
              <Layers className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[3px] uppercase">Pencarian Cepat</span>
            </div>
            <div className="bg-[#D9D9D9]/10 backdrop-blur-2xl border border-[#D9D9D9]/20 rounded-[3rem] p-2 shadow-2xl">
               <HeroSearch />
            </div>
          </div>
        </div>
      </section>

   
      {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 3: ARTIKEL TERBARU (FIXED UI & BINDING DATABASE)
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 py-32 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b-2 border-[#655348]/10 pb-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-[#655348] tracking-tighter uppercase leading-tight mb-4">
              Publikasi <span className="text-[#655348]/50">Terbaru</span>
            </h2>
            <p className="text-[#655348]/70 font-medium text-lg leading-relaxed">
              Jelajahi karya riset komprehensif dari mahasiswa pariwisata.
            </p>
          </div>
          <Link href="/artikel"
            className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#655348]/5 text-[#655348] font-bold text-sm uppercase tracking-widest hover:bg-[#655348] hover:text-[#D9D9D9] transition-all duration-300">
            Lihat Semua
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {error ? (
          <div className="text-center py-20 text-red-500 font-bold bg-red-50 rounded-3xl">{error}</div>
        ) : latestArtikel.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {latestArtikel.map((artikel) => {
              
              // ==========================================
              // LOGIKA PENARIKAN DATA DARI VIEW DATABASE
              // ==========================================
              // 1. Kategori: Menggunakan field kategori_nama
              const namaKategori = artikel.kategori_nama || 'Pariwisata';
              
              // 2. Penulis: Diambil dari array penulis_list (Penulis Pertama/Utama)
              const penulisUtama = artikel.penulis_list && artikel.penulis_list.length > 0 
                ? artikel.penulis_list[0].nama 
                : 'Anonim';
                
              const inisialPenulis = typeof penulisUtama === 'string' 
                ? penulisUtama.charAt(0).toUpperCase() 
                : 'A';

              return (
                <Link 
                  href={`/artikel/${artikel.slug}`} 
                  key={artikel.id}
                  className="group block relative h-[550px] w-full rounded-[3rem] overflow-hidden shadow-xl hover:shadow-[0_20px_50px_rgba(101,83,72,0.3)] transition-all duration-500 hover:-translate-y-3"
                >
                  {/* Background Image Container */}
                  <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{ 
                      backgroundImage: `url(${artikel.foto_sampul_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop'})` 
                    }}
                  />
                  
                  {/* Overlay Gradasi - Disesuaikan agar lebih pekat di bawah */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#27201c] via-[#655348]/70 to-[#655348]/10 opacity-95 z-10" />

                  {/* Top Badge: Mengambil Kategori dari Database */}
                  <div className="absolute top-8 left-8 z-20">
                    <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#D9D9D9] text-[#655348] shadow-lg">
                      <Tag size={12} className="group-hover:rotate-12 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {namaKategori}
                      </span>
                    </div>
                  </div>

                  {/* Content Container - POSISI TETAP (Selalu terlihat) */}
                  <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-20">
                    {/* Pembungkus konten dengan sedikit efek hover naik */}
                    <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                      
                      {/* Judul Artikel */}
                      <h3 className="text-[28px] md:text-3xl font-black text-white leading-[1.3] mb-4 line-clamp-3 drop-shadow-md">
                        {artikel.judul}
                      </h3>
                      
                      {/* Abstrak - Dihilangkan class max-h-0 agar selalu tampil */}
                      <p className="text-[#D9D9D9]/90 text-[15px] line-clamp-2 mb-8 font-medium leading-relaxed">
                        {artikel.abstrak || 'Temukan ulasan mendalam, statistik, dan analisis mengenai isu ini di ruang baca kami.'}
                      </p>
                      
                      {/* Footer: Penulis & Tanggal (Mengambil dari penulis_list) */}
                      <div className="flex items-center justify-between pt-6 border-t border-[#D9D9D9]/20">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-[#D9D9D9] flex items-center justify-center text-[#655348] font-black text-lg border-2 border-transparent group-hover:border-white transition-colors">
                            {inisialPenulis}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white uppercase tracking-wider mb-1 line-clamp-1">
                              {penulisUtama}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[#D9D9D9]/70 uppercase tracking-widest">
                              <Calendar size={12} />
                              {new Date(artikel.published_at!).toLocaleDateString('id-ID', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Aksen Panah */}
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-[#D9D9D9] group-hover:text-[#655348] transition-all duration-300 shrink-0">
                          <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 px-6 bg-white/50 backdrop-blur-sm rounded-[3rem] border-[3px] border-dashed border-[#655348]/20 text-center">
            <div className="text-7xl mb-6 opacity-80">📭</div>
            <h3 className="text-3xl font-black text-[#655348] mb-3 tracking-tight">Ruang Masih Kosong</h3>
            <p className="text-lg text-[#655348]/60 font-medium max-w-md">
              Belum ada artikel yang dipublikasikan. Artikel terbaru akan segera muncul di sini.
            </p>
          </div>
        )}
      </section>

         {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 2: STATISTIK (VISUALISASI DATA)
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-gradient-to-b from-[#655348] to-[#55463d] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Stat Item */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2.5rem] text-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#D9D9D9]/10 flex items-center justify-center text-[#D9D9D9]">
                <FileText size={26} />
              </div>
              <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-md">
                {stats.artikel}
              </div>
              <div className="text-[#D9D9D9]/70 text-[11px] font-black uppercase tracking-[0.2em]">Total Artikel</div>
            </div>
            
            {/* Stat Item */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2.5rem] text-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#D9D9D9]/10 flex items-center justify-center text-[#D9D9D9]">
                <Users size={26} />
              </div>
              <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-md">
                {stats.penulis}
              </div>
              <div className="text-[#D9D9D9]/70 text-[11px] font-black uppercase tracking-[0.2em]">Penulis Aktif</div>
            </div>

            {/* Stat Item */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2.5rem] text-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#D9D9D9]/10 flex items-center justify-center text-[#D9D9D9]">
                <Layers size={26} />
              </div>
              <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-md">
                {stats.kelompok}
              </div>
              <div className="text-[#D9D9D9]/70 text-[11px] font-black uppercase tracking-[0.2em]">Kelompok Riset</div>
            </div>

            {/* Stat Item */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2.5rem] text-center hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#D9D9D9]/10 flex items-center justify-center text-[#D9D9D9]">
                <Hash size={26} />
              </div>
              <div className="text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-md">
                {stats.kategori}
              </div>
              <div className="text-[#D9D9D9]/70 text-[11px] font-black uppercase tracking-[0.2em]">Kategori Topik</div>
            </div>

          </div>
        </div>
      </section>


    </main>
  )
}