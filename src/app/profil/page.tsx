// src/app/profil/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Mail, Shield, Calendar, Edit3, FileText, ArrowRight, BookOpen } from 'lucide-react'
import type { ArtikelLengkap } from '@/types/database'

export default async function ProfilPage() {
  const supabase = await createClient()

  // 1. Cek Sesi User
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Ambil data profil terperinci dari tabel penulis/users jika ada
  const { data: profil } = await supabase
    .from('penulis')
    .select('*')
    .eq('id', user.id)
    .single()

  // Jika profil belum dilengkapi di database internal, arahkan ke halaman lengkapi
  if (!profil) {
    redirect('/profil/lengkapi')
  }

  // 3. Ambil riwayat artikel milik user tersebut
  const { data: artikelData } = await supabase
    .from('artikel_lengkap')
    .select('*')
    .eq('penulis_id', user.id)
    .order('created_at', { ascending: false })

  const listArtikel = (artikelData ?? []) as ArtikelLengkap[]

  return (
    <main className="min-h-screen bg-[#FDFBF7] pt-[120px] pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mb-12 bg-white p-8 md:p-10 rounded-[2.5rem] border border-[#D9D9D9]/30 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden bg-[#655348]/10 border-2 border-[#655348]/20 shrink-0">
              {profil.avatar_url ? (
                <Image 
                  src={profil.avatar_url} 
                  alt={profil.nama || 'Avatar'} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#655348]">
                  <User size={40} />
                </div>
              )}
            </div>

            {/* Nama & Role */}
            <div>
              <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight leading-none mb-2">
                {profil.nama || 'Pengguna JITP'}
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 bg-[#655348] text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5">
                  <Shield size={12} /> {profil.role || 'Author'}
                </span>
                {profil.instansi && (
                  <span className="px-3 py-1 bg-[#D9D9D9]/40 text-[#655348] text-[11px] font-bold rounded-md">
                    {profil.instansi}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tombol Edit */}
          <Link 
            href="/profil/lengkapi" 
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#D9D9D9] hover:border-[#655348] text-[#655348] rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95"
          >
            <Edit3 size={16} /> Edit Profil
          </Link>
        </div>

        {/* GRID KONTEN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* KOLOM KIRI: Informasi Detail */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#D9D9D9]/30 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h3 className="text-sm font-black text-[#655348] uppercase tracking-[0.2em] border-b border-[#D9D9D9]/50 pb-3">
              Informasi Akun
            </h3>

            {/* Email */}
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#655348]/5 text-[#655348] rounded-xl">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Alamat Email</p>
                <p className="text-sm font-semibold text-[#1A1A1A] break-all">{profil.email || user.email}</p>
              </div>
            </div>

            {/* NIM / Nomor Identitas */}
            {profil.nim && (
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-[#655348]/5 text-[#655348] rounded-xl">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">NIM / Identitas</p>
                  <p className="text-sm font-mono font-bold text-[#1A1A1A]">{profil.nim}</p>
                </div>
              </div>
            )}

            {/* Bergabung Sejak */}
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-[#655348]/5 text-[#655348] rounded-xl">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Bergabung Pada</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {profil.created_at ? new Date(profil.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
            </div>

            {/* Bio */}
            {profil.bio && (
              <div className="mt-2 pt-4 border-t border-[#D9D9D9]/50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tentang Saya</p>
                <p className="text-sm text-[#655348]/80 leading-relaxed font-medium bg-[#FDFBF7] p-4 rounded-2xl border border-[#D9D9D9]/20">
                  {profil.bio}
                </p>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: Riwayat Jurnal / Submisi */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-2 border-[#D9D9D9] pb-4">
              <h3 className="text-xl font-black text-[#655348] tracking-tight">
                Riwayat Publikasi Artikel
              </h3>
              <span className="text-[11px] font-black text-[#655348] bg-[#655348]/10 px-3 py-1 rounded-md uppercase tracking-wider">
                {listArtikel.length} Total
              </span>
            </div>

            {/* Daftar Artikel */}
            <div className="flex flex-col gap-4">
              {listArtikel.length > 0 ? (
                listArtikel.map((artikel) => (
                  <div 
                    key={artikel.id}
                    className="bg-white p-6 rounded-3xl border border-[#D9D9D9]/40 hover:border-[#655348]/40 shadow-[0_10px_30px_rgba(0,0,0,0.01)] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#D9D9D9]/50 text-[#655348]">
                          {artikel.kategori_nama || 'Umum'}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                          artikel.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {artikel.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-[#1A1A1A] group-hover:text-[#655348] transition-colors leading-snug">
                        {artikel.judul}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        Dibuat pada: {artikel.created_at ? new Date(artikel.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                    </div>

                    {artikel.status === 'published' && (
                      <Link 
                        href={`/artikel/${artikel.slug}`} 
                        className="p-3 bg-[#655348]/5 text-[#655348] hover:bg-[#655348] hover:text-white rounded-xl transition-all self-end md:self-center"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-[2.5rem] border border-[#D9D9D9]/30 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                  <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Belum Ada Artikel</p>
                  <p className="text-xs text-gray-400 mt-1">Anda belum pernah mengirimkan atau mempublikasikan artikel.</p>
                  <Link href="/editor/new" className="inline-block mt-4 text-xs font-black uppercase tracking-widest text-[#655348] hover:underline">
                    Tulis Artikel Sekarang &rarr;
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}