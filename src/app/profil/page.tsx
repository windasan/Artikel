'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Users } from 'lucide-react' // Tambahkan icon

export default function ProfilPage() {
  const supabase  = createClient()
  const router    = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myKelompok, setMyKelompok] = useState<any[]>([]) // State untuk Kelompok
  const [form,    setForm]    = useState({ nama_lengkap:'', nim:'', no_telepon:'', bio:'' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/profil'); return }
      
      // Ambil Profil
      const fetchProfile = supabase.from('profiles').select('*').eq('id', user.id).single()
      
      // Ambil Data Kelompok
      const fetchKelompok = supabase
        .from('kelompok_anggota')
        .select('kelompok(id, nama, nomor, deskripsi)')
        .eq('profile_id', user.id)

      Promise.all([fetchProfile, fetchKelompok]).then(([profRes, kelRes]) => {
        setProfile(profRes.data as Profile)
        if (profRes.data) setForm({ nama_lengkap: profRes.data.nama_lengkap??'', nim: profRes.data.nim??'', no_telepon: profRes.data.no_telepon??'', bio: profRes.data.bio??'' })
        
        // Simpan data kelompok ke state
        if (kelRes.data) {
          // Flatten struktur data dari relasi
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
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)
    if (error) toast.error('Gagal menyimpan: ' + error.message)
    else toast.success('✅ Profil diperbarui!')
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen pt-[80px] flex items-center justify-center text-[var(--ink-lt)]">Memuat...</div>

  return (
    <div className="min-h-screen pt-[80px] bg-[var(--paper)] pb-20">
      <div className="max-w-[640px] mx-auto px-6 py-10">
        
        {/* Header Profil */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[var(--coral)] flex items-center justify-center text-[22px] font-bold text-white shadow-sm">
            {(profile?.nama_lengkap ?? 'U').slice(0,2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-[28px] font-bold text-[var(--ink)] tracking-tight">{profile?.nama_lengkap ?? 'Pengguna'}</h1>
            <p className="text-[13px] text-[var(--ink-lt)]">{profile?.email} · <span className="capitalize text-[var(--coral)] font-semibold">{profile?.role.replace('_', ' ')}</span></p>
          </div>
        </div>

        {/* Card Kelompok Riset */}
        <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-6 mb-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-[var(--coral)]" />
            <h2 className="font-semibold text-[16px] text-[var(--ink)]">Kelompok Riset Saya</h2>
          </div>
          
          {myKelompok.length > 0 ? (
            <div className="grid gap-3">
              {myKelompok.map((k: any) => (
                <div key={k.id} className="p-4 border border-[rgba(28,43,43,0.08)] rounded-xl bg-[var(--paper)] hover:border-[var(--coral)] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-[14px] text-[var(--ink)]">{k.nama}</h3>
                    {k.nomor && <span className="text-[11px] font-bold bg-[var(--coral)] text-white px-2 py-0.5 rounded-md tracking-wider">KLP {k.nomor}</span>}
                  </div>
                  {k.deskripsi && <p className="text-[13px] text-[var(--ink-lt)] line-clamp-2">{k.deskripsi}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-orange-50 text-orange-600 text-[13px] font-medium text-center border border-orange-100">
              Anda belum terdaftar dalam kelompok riset manapun.
            </div>
          )}
        </div>

        {/* Card Edit Profil (Form Lama) */}
        <div className="bg-white border border-[rgba(28,43,43,0.10)] rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h2 className="font-semibold text-[16px] text-[var(--ink)] mb-5">Informasi Dasar</h2>
          <form onSubmit={save} className="space-y-4">
             {/* ... (Isi form sama seperti file Anda sebelumnya) ... */}
          </form>
        </div>

      </div>
    </div>
  )
}