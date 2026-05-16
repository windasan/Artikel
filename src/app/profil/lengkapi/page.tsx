// src/app/profil/lengkapi/page.tsx
'use strict'
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, User, Save, ArrowLeft, AlertCircle } from 'lucide-react'

export default function LengkapiProfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [nama, setNama] = useState('')
  const [nim, setNim] = useState('')
  const [instansi, setInstansi] = useState('Universitas Negeri Yogyakarta')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function loadProfil() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/login')
          return
        }

        setEmail(user.email || '')
        setNama(user.user_metadata?.full_name || '')
        setAvatarUrl(user.user_metadata?.avatar_url || '')

        // Tarik data profil dari tabel internal jika ada
        const { data: profil } = await supabase
          .from('penulis')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profil) {
          setNama(profil.nama || '')
          setNim(profil.nim || '')
          setInstansi(profil.instansi || 'Universitas Negeri Yogyakarta')
          setBio(profil.bio || '')
          if (profil.avatar_url) setAvatarUrl(profil.avatar_url)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfil()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi user tidak ditemukan.')

      const payload = {
        id: user.id,
        nama,
        nim: nim || null,
        instansi,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        email: email,
        updated_at: new Date().toISOString()
      }

      // Gunakan upsert untuk memasukkan data baru atau memperbarui data lama
      const { error: upsertError } = await supabase
        .from('penulis')
        .upsert(payload)

      if (upsertError) throw upsertError

      router.push('/profil')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="animate-spin text-[#655348]" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] px-6 pt-24 pb-12">
      <div className="w-full max-w-xl p-8 md:p-12 bg-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.03)] rounded-[3rem] border border-gray-100">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => router.push('/profil')}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-[#655348] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Kembali ke Profil
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-2 leading-none">
            Kelola Profil
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.15em]">
            Lengkapi data publikasi dan identitas internal Anda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium rounded-r-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Input Nama */}
          <div>
            <label className="block text-[11px] font-black text-[#655348] uppercase tracking-widest mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap beserta gelar"
              className="w-full bg-[#FDFBF7] border border-[#D9D9D9] rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-[#655348] focus:ring-4 focus:ring-[#655348]/5 transition-all text-[#1A1A1A]"
            />
          </div>

          {/* Grid NIM & Instansi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input NIM */}
            <div>
              <label className="block text-[11px] font-black text-[#655348] uppercase tracking-widest mb-2">
                NIM / Nomor Identitas
              </label>
              <input
                type="text"
                value={nim}
                onChange={e => setNim(e.target.value)}
                placeholder="Contoh: 2310XXXXXX"
                className="w-full bg-[#FDFBF7] border border-[#D9D9D9] rounded-2xl px-5 py-3.5 text-sm font-mono font-bold outline-none focus:border-[#655348] focus:ring-4 focus:ring-[#655348]/5 transition-all text-[#1A1A1A]"
              />
            </div>

            {/* Input Instansi */}
            <div>
              <label className="block text-[11px] font-black text-[#655348] uppercase tracking-widest mb-2">
                Asal Instansi / Universitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={instansi}
                onChange={e => setInstansi(e.target.value)}
                placeholder="Contoh: Universitas Negeri Yogyakarta"
                className="w-full bg-[#FDFBF7] border border-[#D9D9D9] rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-[#655348] focus:ring-4 focus:ring-[#655348]/5 transition-all text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Input Deskripsi Singkat / Bio */}
          <div>
            <label className="block text-[11px] font-black text-[#655348] uppercase tracking-widest mb-2">
              Biografi Ringkas / Tentang Penulis
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Ceritakan singkat mengenai fokus riset, minat akademik, atau deskripsi diri Anda..."
              className="w-full bg-[#FDFBF7] border border-[#D9D9D9] rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:border-[#655348] focus:ring-4 focus:ring-[#655348]/5 transition-all text-[#1A1A1A] resize-none leading-relaxed"
            />
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#655348] text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#4a3d35] transition-all shadow-xl shadow-[#655348]/10 active:scale-98 disabled:opacity-70 text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} /> Simpan Perubahan
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  )
}