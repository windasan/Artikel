'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { User, Save, Users, Shield, Layers, Loader2, PenLine } from 'lucide-react'

export default function ProfilPage() {
  const supabase  = createClient()
  const router    = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myKelompok, setMyKelompok] = useState<any[]>([])
  const [form, setForm] = useState({ nama_lengkap:'', nim:'', no_telepon:'', bio:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/profil'); return }
      
      const fetchProfile = supabase.from('profiles').select('*').eq('id', user.id).single()
      const fetchKelompok = supabase
        .from('kelompok_anggota')
        .select('kelompok(id, nama, nomor, deskripsi)')
        .eq('profile_id', user.id)

      Promise.all([fetchProfile, fetchKelompok]).then(([profRes, kelRes]) => {
        setProfile(profRes.data as Profile)
        if (profRes.data) {
          setForm({ 
            nama_lengkap: profRes.data.nama_lengkap ?? '', 
            nim: profRes.data.nim ?? '', 
            no_telepon: profRes.data.no_telepon ?? '', 
            bio: profRes.data.bio ?? '' 
          })
        }
        
        if (kelRes.data) {
          setMyKelompok(kelRes.data.map(k => k.kelompok).filter(Boolean))
        }
        setLoading(false)
      })
    })
  }, [supabase, router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)

    // PERBAIKAN: Mengubah dari 'penulis' menjadi 'profiles'
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
    
    if (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } else {
      toast.success('Profil berhasil diperbarui!')
      setProfile({ ...profile, ...form })
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 size={32} className="animate-spin text-[#655348]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION DENGAN GRADIENT COKLAT */}
      <div className="relative pt-[140px] pb-[100px] bg-gradient-to-b from-[#655348] via-[#655348] to-white">
        <div className="max-w-[1100px] mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 backdrop-blur-md border-4 border-white flex items-center justify-center text-[48px] md:text-[64px] font-black text-white shadow-2xl">
                {(profile?.nama_lengkap || profile?.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} /> {profile?.role?.replace('_', ' ') || 'Penulis'}
                </span>
              </div>
              <h1 className="font-display text-[36px] md:text-[56px] font-black text-white tracking-tighter leading-none mb-2">
                {profile?.nama_lengkap || 'Pengguna Baru'}
              </h1>
              <p className="text-[16px] text-white/70 font-medium tracking-wide">{profile?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-[1100px] mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FORM EDIT PROFIL */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#D9D9D9] rounded-[40px] p-8 md:p-10 shadow-xl shadow-[#655348]/5">
              <div className="flex items-center gap-4 mb-8 border-b border-[#D9D9D9] pb-6">
                <div className="w-12 h-12 bg-[#655348] rounded-2xl flex items-center justify-center text-white">
                  <User size={24} />
                </div>
                <h2 className="text-[24px] font-black text-[#655348] tracking-tighter">Informasi Data Diri</h2>
              </div>

              <form onSubmit={save} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#655348]/60 mb-2">Nama Lengkap</label>
                    <input 
                      type="text" required
                      value={form.nama_lengkap}
                      onChange={e => setForm({ ...form, nama_lengkap: e.target.value })}
                      className="w-full border-2 border-[#D9D9D9] bg-white rounded-[16px] px-4 py-3.5 text-[14px] font-medium text-[#655348] outline-none focus:border-[#655348] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#655348]/60 mb-2">NIM</label>
                    <input 
                      type="text" 
                      value={form.nim}
                      onChange={e => setForm({ ...form, nim: e.target.value })}
                      className="w-full border-2 border-[#D9D9D9] bg-white rounded-[16px] px-4 py-3.5 text-[14px] font-medium text-[#655348] outline-none focus:border-[#655348] transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#655348]/60 mb-2">No. Telepon</label>
                  <input 
                    type="tel" 
                    value={form.no_telepon}
                    onChange={e => setForm({ ...form, no_telepon: e.target.value })}
                    className="w-full border-2 border-[#D9D9D9] bg-white rounded-[16px] px-4 py-3.5 text-[14px] font-medium text-[#655348] outline-none focus:border-[#655348] transition-colors" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#655348]/60 mb-2">Biografi</label>
                  <textarea 
                    value={form.bio} 
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={4} 
                    className="w-full border-2 border-[#D9D9D9] bg-white rounded-[16px] px-4 py-3.5 text-[14px] font-medium text-[#655348] outline-none focus:border-[#655348] transition-colors resize-none" 
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" disabled={saving}
                    className="px-8 py-4 bg-[#655348] text-white text-[13px] font-black uppercase tracking-widest rounded-[16px] hover:bg-[#655348]/80 transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Simpan Profil
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* KELOMPOK RISET */}
          <div className="lg:col-span-5 sticky top-[100px]">
            <div className="bg-[#FFFFFF] border-2 border-[#655348] rounded-[40px] p-8 shadow-2xl shadow-[#655348]/10">
              <h3 className="text-[18px] font-black text-[#655348] uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-[#D9D9D9] pb-4">
                <Users size={20} /> Kelompok Riset Saya
              </h3>
              
              <div className="space-y-4">
                {myKelompok.length > 0 ? (
                  myKelompok.map((klp: any) => (
                    <div key={klp.id} className="p-5 border-2 border-[#D9D9D9] bg-[#FFFFFF] rounded-[24px]">
                      <span className="px-3 py-1 bg-[#D9D9D9]/50 rounded-full text-[#655348] text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                        Group {klp.nomor}
                      </span>
                      <h4 className="font-black text-[18px] text-[#655348] mb-2">{klp.nama}</h4>
                      <p className="text-[12px] text-[#655348]/60 font-medium line-clamp-2">{klp.deskripsi}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-[#D9D9D9] rounded-[24px]">
                    <Layers size={32} className="mx-auto text-[#D9D9D9] mb-3" />
                    <p className="text-[12px] font-black text-[#655348]/40 uppercase tracking-widest px-6">Anda terdaftar sebagai Penulis Independen.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}