import { createClient } from '@/lib/supabase/server'
import { PenulisCard } from '@/components/penulis/PenulisCard'

// Revalidasi data setiap 60 detik (ISR) agar halaman tetap cepat
export const revalidate = 60 

export default async function DaftarPenulisPage() {
  const supabase = createClient()
  
  // Mengambil profil yang aktif (atau filter berdasarkan role jika perlu)
  const { data: penulisList } = await supabase
    .from('profiles')
    .select('*')
    .order('nama_lengkap', { ascending: true })

  return (
    <main className="min-h-screen bg-[#FDFBF7] relative">
      
      {/* 1. HEADER DENGAN GRADIEN TIPIS */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        {/* Background Gradient (Cokelat tipis memudar ke Cream) */}
        <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-[#655348]/90 via-[#FDFBF7]/60 to-[#FDFBF7] pointer-events-none -z-0" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#655348]/10 bg-white/50 backdrop-blur-sm text-[11px] font-black tracking-[0.3em] uppercase mb-8 text-[#655348] shadow-sm">
            Tim Redaksi
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-6 leading-tight">
            <span className="text-[#655348]">Kontributor Pikiran</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
            "Mengenal para intelektual muda di balik layar yang menyusun narasi, riset, dan wawasan pariwisata masa depan."
          </p>
        </div>
      </section>

      {/* 2. GRID SECTION CARD PENULIS */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 pb-24">
        {penulisList && penulisList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 items-stretch">
            {penulisList.map((profil) => (
              <PenulisCard key={profil.id} profil={profil} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 max-w-3xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-[#655348]/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#655348]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <p className="text-gray-400 italic font-bold uppercase tracking-widest text-xs">Belum ada penulis terdaftar</p>
          </div>
        )}
      </section>

    </main>
  )
}