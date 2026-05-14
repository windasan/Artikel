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
import BTGM from 'public/Images/BTGM.jpeg'; // Menggunakan alias @ yang mengarah ke folder src
import { ArtikelCard } from '@/components/artikel/ArtikelCard'
import ArticleSlider from '@/components/home/ArticleSlider'



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
        .limit(5),

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
          backgroundImage: `url(${BTGM.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
      {/* Overlay Lebih Halus dan Tipis */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-[#000000]/95 z-0" />

        {/* Container Teks */}
        <div className="relative z-10 max-w-[1000px] w-full mx-auto flex flex-col items-center text-[#EDEDED]">
          
          {/* <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#D9D9D9]/20 bg-[#D9D9D9]/10 backdrop-blur-md text-[10px] md:text-[12px] font-black tracking-[0.4em] uppercase mb-10 shadow-2xl">
            Jurnal Pariwisata Terpadu
          </div> */}

          <h1 className="font-display font-black text-white leading-[1.05] tracking-tighter mb-8 drop-shadow-2xl pt-14"
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

          {/* Search Bar Wrapper
          <div className="w-full max-w-[850px] mx-auto text-left relative px-4">
            <div className="flex items-center gap-2 mb-3 ml-6 text-[#D9D9D9]/80">
              <Layers className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[3px] uppercase">Pencarian Cepat</span>
            </div>
            <div className="bg-[#D9D9D9]/10 backdrop-blur-2xl border border-[#D9D9D9]/20 rounded-[3rem] p-2 shadow-2xl">
               <HeroSearch />
            </div>
          </div> */}
        </div>
      </section>

     <section className="w-full max-w-[90%] sm:max-w-[80%] lg:max-w-[60%] mx-auto py-20 relative flex flex-col items-center text-center"> 
  
          {/* Badge "About" */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#655348]/100 text-[90%] font-bold  tracking-[0.2em] uppercase mb-6 text-[#ffffff]">
              Tentang Kami
            </div>

          {/* Judul Utama */}
          <h1 className="text-xl md:text-6xl font-black text-[#655348]/100 tracking-tight mb-4 leading-tight">
            Ruang Jelajah Pariwisata
          </h1>

          {/* Deskripsi - px-4 sudah bagus untuk memberi jarak di mobile */}
          <p className="text-[#655348]/70  font-medium leading-relaxed max-w-2xl mt-4">
        Prodi S1 Pariwisata FISIPOL Universitas Negeri Yogyakarta (UNY) resmi dibuka pada 2023, berfokus pada manajemen, perhotelan, ekowisata, dan pemberdayaan destinasi. Berlokasi di Yogyakarta, prodi ini mencetak sarjana pariwisata (S.Par) yang kompeten dengan keahlian bahasa asing dan manajemen wisata.  </p>

        <Link 
                      href="/artikel" 
                      className="group inline-flex items-center mt-8 gap-4 px-8 py-4 border-2 border-[#655348] text-[#655348] rounded-full font-black text-[12px] uppercase tracking-[0.15em] hover:bg-[#655348] hover:text-white transition-all"
                    >
                      Jelajahi Semua 
                      <ArrowRight size={18} className="transform group-hover:translate-x-2 transition-transform" />
                    </Link>

      </section>

   
    {/* ─────────────────────────────────────────────────────────────────────────
          SECTION ARTIKEL TERBARU (SLIDER + SEARCH BAR)
          ───────────────────────────────────────────────────────────────────────── */}
     {/* Pastikan variabel data artikel Anda namanya 'latestArtikel' */}
<ArticleSlider latestArtikel={latestArtikel} />
         {/* ─────────────────────────────────────────────────────────────────────────
          SECTION 2: STATISTIK (VISUALISASI DATA)
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#655348] text-[90%] font-bold tracking-[0.2em] uppercase mb-6 text-[#ffffff]">
Statistik            </div>
          </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  
  {/* Stat Item - Artikel */}
  <div className="group bg-white border border-gray-100 p-10 rounded-[2.5rem] text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
    <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#655348]/5 flex items-center justify-center text-[#655348]">
      <FileText size={26} />
    </div>
    <div className="text-5xl font-black text-[#655348] mb-3 tracking-tighter">
      {stats.artikel}
    </div>
    <div className="text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">
      Total Artikel
    </div>
  </div>
  
  {/* Stat Item - Penulis */}
  <div className="group bg-white border border-gray-100 p-10 rounded-[2.5rem] text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
    <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#655348]/5 flex items-center justify-center text-[#655348]">
      <Users size={26} />
    </div>
    <div className="text-5xl font-black text-[#655348] mb-3 tracking-tighter">
      {stats.penulis}
    </div>
    <div className="text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">
      Penulis Aktif
    </div>
  </div>

  {/* Stat Item - Kelompok */}
  <div className="group bg-white border border-gray-100 p-10 rounded-[2.5rem] text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
    <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#655348]/5 flex items-center justify-center text-[#655348]">
      <Layers size={26} />
    </div>
    <div className="text-5xl font-black text-[#655348] mb-3 tracking-tighter">
      {stats.kelompok}
    </div>
    <div className="text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">
      Kelompok Riset
    </div>
  </div>

  {/* Stat Item - Kategori */}
  <div className="group bg-white border border-gray-100 p-10 rounded-[2.5rem] text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
    <div className="mx-auto w-14 h-14 mb-6 rounded-2xl bg-[#655348]/5 flex items-center justify-center text-[#655348]">
      <Hash size={26} />
    </div>
    <div className="text-5xl font-black text-[#655348] mb-3 tracking-tighter">
      {stats.kategori}
    </div>
    <div className="text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">
      Kategori Topik
    </div>
  </div>




          </div>
        </div>
      </section>


    </main>
  )
}