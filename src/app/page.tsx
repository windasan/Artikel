// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArtikelCard } from '@/components/artikel/ArtikelCard'
import { StatsStrip } from '@/components/home/StatsStrip'
import { HeroSearch } from '@/components/home/HeroSearch'
import type { ArtikelLengkap } from '@/types/database'

export const revalidate = 60 // ISR: revalidate setiap 60 detik

async function getHomeData() {
  const supabase = createClient()

  const [artikelRes, statsRes] = await Promise.all([
    // 3 artikel terbaru
    supabase
      .from('artikel_lengkap')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),

    // Stats counts
    Promise.all([
      supabase.from('artikel').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('kelompok').select('id', { count: 'exact', head: true }),
      supabase.from('kategori').select('id', { count: 'exact', head: true }),
    ]),
  ])

  const [countArtikel, countPenulis, countKelompok, countKategori] = statsRes

  return {
    latestArtikel: (artikelRes.data ?? []) as ArtikelLengkap[],
    stats: {
      artikel:  countArtikel.count  ?? 0,
      penulis:  countPenulis.count  ?? 0,
      kelompok: countKelompok.count ?? 0,
      kategori: countKategori.count ?? 0,
    },
  }
}

export default async function HomePage() {
  const { latestArtikel, stats } = await getHomeData()

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[94vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 20% 10%, rgba(240,128,96,0.13), transparent),
              radial-gradient(ellipse 50% 70% at 80% 20%, rgba(109,174,196,0.12), transparent),
              radial-gradient(ellipse 60% 50% at 50% 80%, rgba(123,166,138,0.10), transparent),
              var(--paper)
            `
          }}
        />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[var(--coral)] opacity-20 blur-[70px] -top-20 -left-20 -z-10" />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-[var(--sky)] opacity-20 blur-[60px] top-24 -right-16 -z-10" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[var(--sage)] opacity-15 blur-[50px] bottom-0 left-1/3 -z-10" />

        <div className="relative z-10 max-w-[780px] w-full mx-auto">
          {/* Kicker badge */}
          <div className="inline-flex items-center gap-2 bg-white/75 border border-[rgba(28,43,43,0.15)] rounded-full px-4 py-1.5 text-[12px] font-semibold text-[var(--ink)] mb-7 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Semester Genap 2024/2025 · Kelas A · UNY
          </div>

          {/* Main title */}
          <h1 className="font-display font-bold leading-[0.93] tracking-[-3px] text-[var(--ink)] mb-2"
            style={{ fontSize: 'clamp(64px,11vw,116px)' }}>
            JURNAL
          </h1>
          <h2 className="font-display font-normal italic leading-none tracking-[-1.5px] text-[var(--ink-lt)] mb-6"
            style={{ fontSize: 'clamp(32px,5.5vw,60px)' }}>
            Pariwisata
          </h2>

          <p className="text-[15px] text-[var(--ink-lt)] leading-[1.75] max-w-[520px] mx-auto mb-9">
            Portal publikasi kolaboratif mahasiswa Program Studi Pariwisata Kelas A,
            Universitas Negeri Yogyakarta. Menggabungkan rigor akademik dengan narasi humanis.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 justify-center mb-10">
            <Link href="/artikel"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--ink)] text-white text-[14px] font-semibold hover:bg-[var(--coral)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              Telusuri Artikel →
            </Link>
            <Link href="/tentang"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent border-[1.5px] border-[rgba(28,43,43,0.15)] text-[var(--ink)] text-[14px] font-semibold hover:border-[var(--ink)] transition-all hover:-translate-y-0.5">
              Tentang Kami
            </Link>
          </div>

          {/* Search Bar */}
          <HeroSearch />
        </div>
      </section>

      {/* ── STATS ── */}
      <StatsStrip stats={stats} />

      {/* ── ARTIKEL TERBARU ── */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-9">
          <div>
            <span className="text-[11px] font-bold tracking-[2px] uppercase text-[var(--coral)] block mb-2">
              Terbaru
            </span>
            <h2 className="font-display text-[36px] font-bold text-[var(--ink)] tracking-tight leading-tight">
              Artikel Terkini
            </h2>
          </div>
          <Link href="/artikel"
            className="px-5 py-2.5 border-[1.5px] border-[rgba(28,43,43,0.15)] rounded-xl text-[13px] font-semibold text-[var(--ink)] hover:border-[var(--ink)] transition-colors hidden sm:block">
            Lihat Semua →
          </Link>
        </div>

        {latestArtikel.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestArtikel.map(artikel => (
              <ArtikelCard key={artikel.id} artikel={artikel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[var(--ink-lt)]">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-[14px]">Belum ada artikel yang dipublikasikan</p>
          </div>
        )}
      </section>

      {/* ── INSTANSI FOOTER ── */}
      <div className="bg-gradient-to-br from-[#1C2B2B] to-[#2A3F3F] py-14 px-6 text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-white/90 mx-auto mb-5 flex items-center justify-center text-3xl shadow-xl">
          🏫
        </div>
        <p className="text-[17px] font-semibold text-white/92 mb-1.5">
          Kementerian Pendidikan Tinggi, Sains, dan Teknologi RI
        </p>
        <p className="text-[13px] text-white/45 mb-7">
          Universitas Negeri Yogyakarta · Program Studi Pariwisata · Kelas A
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-8">
          {['🔬 BRIN', '💰 LPDP', '🎓 UNY', '📚 FISIPOL'].map(p => (
            <div key={p} className="px-5 py-2 rounded-full bg-white/10 border border-white/15 text-white/80 text-[13px] font-semibold tracking-wide">
              {p}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/25 border-t border-white/8 pt-5">
          Hak Cipta © 2025 Program Studi Pariwisata Kelas A, Universitas Negeri Yogyakarta
        </p>
      </div>
    </>
  )
}
