import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArtikelRow } from '@/components/artikel/ArtikelRow'
import { Calendar, BookOpen, Globe, Instagram } from 'lucide-react'

export default async function DetailPenulisPage({ params }: { params: { username: string } }) {
  const supabase = createClient()

  // 1. Fetch Data Penulis
  const { data: penulis } = await supabase
    .from('profil_lengkap')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!penulis) notFound()

  // 2. Fetch Artikel Karya Penulis Ini
  const { data: artikelList } = await supabase
    .from('artikel_lengkap')
    .select('*')
    .contains('penulis_ids', [penulis.id]) // Sesuaikan logika array penulis Anda
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <main className="min-h-screen bg-white">
      {/* Profil Hero */}
      <section className="bg-[#655348] pt-40 pb-24 px-6 relative overflow-hidden text-center text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Avatar Besar */}
          <div className="relative w-40 h-40 mx-auto mb-8 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl bg-white">
            <Image
              src={penulis.foto_url || `https://ui-avatars.com/api/?name=${penulis.nama}&background=d9d9d9&color=655348`}
              alt={penulis.nama}
              fill
              className="object-cover"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            {penulis.nama}
          </h1>
          <p className="text-[#D9D9D9] text-lg font-medium italic max-w-2xl mx-auto leading-relaxed mb-10">
            "{penulis.bio || 'Menulis untuk mengabadikan pemikiran dan riset pariwisata.'}"
          </p>

          {/* Profil Stats */}
          <div className="flex flex-wrap justify-center gap-10 border-t border-white/10 pt-10">
            <div className="text-center">
              <div className="text-3xl font-black mb-1">{artikelList?.length || 0}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9D9D9]/60">Artikel</div>
            </div>
            <div className="text-center border-l border-white/10 pl-10">
              <div className="text-3xl font-black mb-1">
                {penulis.total_views?.toLocaleString() || 0}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9D9D9]/60">Pembaca</div>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Artikel Penulis */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[2px] flex-1 bg-gray-100" />
          <h2 className="text-2xl font-black text-[#655348] uppercase tracking-tight px-4">
            Karya Tulisan
          </h2>
          <div className="h-[2px] flex-1 bg-gray-100" />
        </div>

        <div className="flex flex-col gap-8">
          {artikelList && artikelList.length > 0 ? (
            artikelList.map((artikel) => (
              <ArtikelRow key={artikel.id} artikel={artikel} />
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 italic font-medium">Belum ada artikel yang dipublikasikan.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}