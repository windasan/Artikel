'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, ArrowRight, Layers, Users, Search } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types/database'

export default function DirektoriPublikPage() {
  const supabase = createClient()
  const [groups, setGroups] = useState<any[]>([])
  const [individualAuthors, setIndividualAuthors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // 1. Ambil semua kelompok beserta profil anggotanya
      const { data: groupsData } = await supabase
        .from('kelompok')
        .select(`
          *,
          kelompok_anggota(
            profiles(*)
          )
        `)
        .order('nomor')

      // 2. Ambil semua profil aktif
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)

      // 3. Pisahkan penulis yang independen (tidak masuk kelompok mana pun)
      const memberIds = new Set()
      groupsData?.forEach(g => {
        g.kelompok_anggota?.forEach((m: any) => {
          if (m.profiles) memberIds.add(m.profiles.id)
        })
      })

      const solo = allProfiles?.filter(p => !memberIds.has(p.id)) || []

      setGroups(groupsData || [])
      setIndividualAuthors(solo)
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#D9D9D9] border-t-[#655348] rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      
      {/* 1. HERO SECTION GRADIENT (COKLAT -> PUTIH) */}
      <div className="relative pt-[160px] pb-[120px] bg-gradient-to-b from-[#655348] via-[#655348] to-white">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <Users size={16} className="text-white" />
            <span className="text-[11px] font-black uppercase tracking-[4px] text-white">Direktori Akademik</span>
          </div>
          
          <h1 className="font-display text-[48px] md:text-[72px] font-black text-white tracking-tighter leading-[1.1] mb-6">
            Kelompok &<br className="hidden md:block" /> Penulis Artikel
          </h1>
          
          <p className="text-[16px] md:text-[18px] text-white/80 max-w-2xl mx-auto font-medium leading-relaxed">
Jelajahi profil para kontributor yang berbagi wawasan melalui platform ini. Temukan kelompok dan penulis artikel mahasiswa.          </p>
        </div>

        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 p-10 opacity-10 text-white pointer-events-none overflow-hidden">
          <Layers size={300} strokeWidth={1} className="transform -translate-x-1/4 -translate-y-1/4" />
        </div>
      </div>

      {/* 2. BODY KONTEN (NAIK KE ATAS GRADIENT) */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-16 relative z-20 pb-24">
        
        {/* SECTION A: KELOMPOK RISET */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10 pl-4 border-l-4 border-[#655348]">
            <h2 className="text-[28px] font-black text-[#655348] tracking-tight uppercase">Kelompok Terdaftar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((klp) => (
              <Link 
                key={klp.id} 
                href={`/kelompok/${klp.id}`}
                className="group flex flex-col h-full bg-white border-2 border-[#D9D9D9]/50 rounded-[40px] p-8 hover:border-[#655348] hover:shadow-2xl hover:shadow-[#655348]/10 transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-8">
                  <span className="px-4 py-1.5 bg-[#D9D9D9]/50 text-[#655348] text-[11px] font-black uppercase tracking-widest rounded-full">
                    Group {klp.nomor}
                  </span>
                  <div className="w-10 h-10 rounded-full border-2 border-[#D9D9D9] flex items-center justify-center text-[#655348] group-hover:bg-[#655348] group-hover:text-white group-hover:border-[#655348] transition-all duration-300">
                    <ArrowRight size={16} className="transform group-hover:-rotate-45 transition-transform" />
                  </div>
                </div>

                <h3 className="text-[26px] font-black text-[#655348] mb-3 leading-tight group-hover:underline decoration-[#D9D9D9] underline-offset-4">
                  {klp.nama}
                </h3>
                <p className="text-[14px] text-[#655348]/60 mb-8 line-clamp-3 font-medium">
                  {klp.deskripsi || "Penelitian mendalam mengenai dinamika pariwisata global, budaya lokal, dan inovasi destinasi wisata."}
                </p>

                {/* Anggota Overlapping (Lebih Rapi untuk Card Direktori) */}
                <div className="mt-auto pt-6 border-t border-[#D9D9D9]/50">
                  <p className="text-[10px] font-black uppercase tracking-[2px] text-[#655348]/40 mb-3">Anggota Tim</p>
                  <div className="flex items-center">
                    <div className="flex -space-x-3 mr-4">
                      {klp.kelompok_anggota?.slice(0, 5).map((m: any) => (
                        <div 
                          key={m.profiles?.id} 
                          className="w-10 h-10 rounded-full border-[3px] border-white bg-[#D9D9D9] flex items-center justify-center text-[12px] font-black text-[#655348] shadow-sm relative hover:z-10 transition-transform hover:scale-110"
                          title={m.profiles?.nama_lengkap}
                        >
                          {m.profiles?.nama_lengkap?.charAt(0)}
                        </div>
                      ))}
                      {klp.kelompok_anggota?.length > 5 && (
                        <div className="w-10 h-10 rounded-full border-[3px] border-white bg-[#655348] flex items-center justify-center text-[11px] font-bold text-white shadow-sm z-0">
                          +{klp.kelompok_anggota.length - 5}
                        </div>
                      )}
                    </div>
                    {/* Teks jumlah anggota */}
                    <span className="text-[12px] font-bold text-[#655348]/50">
                      {klp.kelompok_anggota?.length || 0} Total
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SECTION B: PENULIS INDEPENDEN */}
        <div className="bg-[#D9D9D9]/20 rounded-[48px] p-10 md:p-14 border border-[#D9D9D9]">
          <div className="flex items-center gap-4 mb-10 pl-4 border-l-4 border-[#655348]">
            <div>
              <h2 className="text-[28px] font-black text-[#655348] tracking-tight uppercase">Penulis Independen</h2>
              <p className="text-[12px] text-[#655348]/50 font-bold uppercase tracking-[3px] mt-1">Kontributor Individu</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {individualAuthors.map((author) => (
              <Link 
                key={author.id} 
                href={`/penulis/${author.id}`}
                className="group bg-white border-2 border-transparent rounded-[32px] p-8 flex flex-col items-center text-center hover:border-[#655348] hover:shadow-xl transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-[#D9D9D9]/50 flex items-center justify-center text-[#655348] text-[32px] font-black mb-5 group-hover:bg-[#655348] group-hover:text-white transition-all duration-500 shadow-inner">
                  {author.nama_lengkap?.charAt(0)}
                </div>
                
              <h4 className="font-black text-[18px] text-[#655348] mb-1 line-clamp-1 w-full" 
    title={author.nama_lengkap ?? undefined}>
  {author.nama_lengkap}
</h4>
                <p className="text-[11px] text-[#655348]/40 font-black uppercase tracking-[2px] mb-6">
                  {author.nim || "Mahasiswa"}
                </p>
                
                <div className="mt-auto px-6 py-2 bg-[#D9D9D9]/40 rounded-full text-[10px] font-black text-[#655348] uppercase tracking-widest group-hover:bg-[#655348] group-hover:text-white transition-colors w-full">
                  Lihat Profil
                </div>
              </Link>
            ))}
            
            {individualAuthors.length === 0 && (
              <div className="col-span-full py-10 text-center">
                <p className="text-[14px] text-[#655348]/50 font-bold">Login dengan akun SSO UNY untuk melihat detail Penulis.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}