import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, BookOpen, ArrowLeft, Layers, Calendar, User, Info, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'

export default async function KelompokDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // 1. Ambil data kelompok dan anggota
  const { data: kelompok } = await supabase
    .from('kelompok')
    .select(`
      *,
      kelompok_anggota(
        profile_id,
        profiles(*)
      )
    `)
    .eq('id', params.id)
    .single()

  if (!kelompok) redirect('/penulis')

  // 2. Ambil artikel yang diterbitkan oleh kelompok ini
  const { data: artikel } = await supabase
    .from('artikel')
    .select(`
      id, judul, slug, abstrak, created_at, status,
      kategori(nama, warna)
    `)
    .eq('kelompok_id', params.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION DENGAN GRADIENT COKLAT KE PUTIH */}
      <div className="relative pt-[120px] pb-[80px] bg-gradient-to-b from-[#655348] via-[#655348] to-white">
        <div className="max-w-[1100px] mx-auto px-6 relative z-10">
          
          <Link 
            href="/penulis" 
            className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[#D9D9D9] hover:text-white transition-colors mb-10 group"
          >
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" /> Kembali ke Direktori
          </Link>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[11px] font-black uppercase tracking-widest">
                Kelompok Riset {kelompok.nomor}
              </span>
              <span className="text-white/40 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                <Users size={14} /> {kelompok.kelompok_anggota?.length || 0} Anggota
              </span>
            </div>
            
            <h1 className="font-display text-[42px] md:text-[72px] font-black text-white tracking-tighter leading-[0.95] mb-8">
              {kelompok.nama}
            </h1>
            
            {/* BIO DILETAKKAN DI SINI SUPAYA AREA TIDAK KOSONG */}
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[32px]">
              <p className="text-[18px] md:text-[20px] text-white/90 font-medium leading-relaxed italic">
                "{kelompok.deskripsi || "Berdedikasi untuk mengeksplorasi potensi pariwisata melalui riset mendalam dan inovasi digital yang berkelanjutan."}"
              </p>
            </div>
          </div>
        </div>

        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 p-20 opacity-10 text-white pointer-events-none overflow-hidden">
          <Layers size={400} strokeWidth={1} className="transform translate-x-1/4 -translate-y-1/4" />
        </div>
      </div>

      {/* 2. BODY SECTION (KONTEN UTAMA) */}
      <div className="max-w-[1100px] mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: ARTIKEL (LEBIH LEBAR) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-[#D9D9D9] rounded-[40px] p-8 md:p-10 shadow-xl shadow-[#655348]/5">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#655348] rounded-2xl flex items-center justify-center text-white">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="text-[28px] font-black text-[#655348] tracking-tighter">Publikasi Riset</h2>
                </div>
              </div>

              <div className="space-y-6">
                {artikel && artikel.length > 0 ? (
                  artikel.map((art) => (
                    <Link 
                      key={art.id} 
                      href={`/artikel/${art.slug}` as Route}
                      className="group block p-6 border-2 border-[#D9D9D9]/50 rounded-[28px] hover:border-[#655348] hover:bg-[#D9D9D9]/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#D9D9D9] text-[#655348] text-[10px] font-black uppercase tracking-widest rounded-md">
                          {(art.kategori as any)?.nama || 'General'}
                        </span>
                        <span className="text-[11px] font-bold text-[#655348]/40 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar size={12} /> {new Date(art.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-[20px] font-black text-[#655348] mb-3 group-hover:text-[#655348] leading-snug">
                        {art.judul}
                      </h3>
                      <p className="text-[14px] text-[#655348]/60 line-clamp-2 font-medium">
                        {art.abstrak}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-[#D9D9D9] rounded-[32px]">
                    <FileText size={40} className="mx-auto text-[#D9D9D9] mb-3" />
                    <p className="text-[14px] font-bold text-[#655348]/40 uppercase tracking-widest">Belum ada publikasi terbit.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: ANGGOTA (SIDEBAR) */}
          <div className="lg:col-span-4 sticky top-[100px]">
            <div className="bg-[#FFFFFF] border-2 border-[#655348] rounded-[40px] p-8 shadow-2xl shadow-[#655348]/10">
              <h3 className="text-[18px] font-black text-[#655348] uppercase tracking-widest mb-8 flex items-center gap-3">
                <Users size={18} /> Anggota Tim
              </h3>
              
              <div className="space-y-6">
                {kelompok.kelompok_anggota?.map((item: any) => {
                  // MENCEGAH ERROR JIKA PROFIL TERHAPUS DI DATABASE
                  if (!item.profiles) return null; 

                  return (
                    <Link 
                      key={item.profiles.id} 
                      href={`/penulis/${item.profiles.id}` as Route}
                      className="flex items-center gap-4 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D9D9D9]/30 border-2 border-[#D9D9D9] flex items-center justify-center text-[#655348] font-black text-sm group-hover:bg-[#655348] group-hover:text-white group-hover:border-[#655348] transition-all">
                        {item.profiles.nama_lengkap?.charAt(0) || 'U'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[14px] font-black text-[#655348] leading-tight group-hover:underline decoration-[#D9D9D9] underline-offset-4" title={item.profiles.nama_lengkap}>
                          {item.profiles.nama_lengkap}
                        </p>
                        <p className="truncate text-[11px] text-[#655348]/50 mt-1 font-bold uppercase tracking-wider">
                          {item.profiles.nim || 'Mahasiswa'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}