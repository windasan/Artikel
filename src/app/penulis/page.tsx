import { createClient } from '@/lib/supabase/server'
import { PenulisCard } from '@/components/penulis/PenulisCard'

export default async function DaftarPenulisPage() {
  const supabase = createClient()
  
  // Ambil data penulis (sesuaikan dengan tabel profil/penulis Anda)
  const { data: penulisList } = await supabase
    .from('profil_lengkap') // Pastikan view/tabel ini ada
    .select('*')
    .order('nama')

  return (
    <main className="min-h-screen bg-[#655348] pt-32 pb-24">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-20">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#d9d9d9]/30 bg-[#d9d8d7]/80 text-[12px] font-black tracking-[0.4em] uppercase mb-8 text-[#655348]">
          Tim Redaksi
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter mb-6 uppercase">
           <span className="text-[#d9d9d9]">Kontributor Pikiran</span>
        </h1>
        <p className="text-[#d9d9d9]/70 text-lg font-medium leading-relaxed italic">
          Mengenal para mahasiswa di balik layar yang menyusun narasi dan riset pariwisata berkelanjutan.
        </p>
      </section>

      {/* Grid Penulis */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {penulisList?.map((penulis) => (
            <PenulisCard key={penulis.id} penulis={penulis} />
          ))}
        </div>
      </div>
    </main>
  )
}